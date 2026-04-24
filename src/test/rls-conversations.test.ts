/**
 * Integration tests for conversation/message RLS + Realtime authorization.
 *
 * These tests spin up THREE Supabase clients:
 *   - buyerClient    (participant A)
 *   - sellerClient   (participant B)
 *   - outsiderClient (a third user who is NOT in the conversation)
 *
 * They verify:
 *   1. Only participants can SELECT a conversation row.
 *   2. Only participants can SELECT messages in that conversation.
 *   3. Outsiders cannot INSERT messages into someone else's conversation.
 *   4. Realtime postgres_changes subscriptions only deliver INSERT events
 *      to participants — outsiders never receive the payload.
 *
 * Requirements to run:
 *   - VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in env (already in .env)
 *   - Three pre-seeded test users with known credentials, exposed via env:
 *       TEST_BUYER_EMAIL / TEST_BUYER_PASSWORD
 *       TEST_SELLER_EMAIL / TEST_SELLER_PASSWORD
 *       TEST_OUTSIDER_EMAIL / TEST_OUTSIDER_PASSWORD
 *
 * If those credentials are not present the suite is SKIPPED (not failed),
 * so CI without secrets stays green.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const buyerEmail = import.meta.env.TEST_BUYER_EMAIL as string | undefined;
const buyerPass = import.meta.env.TEST_BUYER_PASSWORD as string | undefined;
const sellerEmail = import.meta.env.TEST_SELLER_EMAIL as string | undefined;
const sellerPass = import.meta.env.TEST_SELLER_PASSWORD as string | undefined;
const outsiderEmail = import.meta.env.TEST_OUTSIDER_EMAIL as string | undefined;
const outsiderPass = import.meta.env.TEST_OUTSIDER_PASSWORD as string | undefined;

const haveCreds =
  !!SUPABASE_URL &&
  !!SUPABASE_KEY &&
  !!buyerEmail &&
  !!buyerPass &&
  !!sellerEmail &&
  !!sellerPass &&
  !!outsiderEmail &&
  !!outsiderPass;

const d = haveCreds ? describe : describe.skip;

const newClient = () =>
  createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });

const signIn = async (client: SupabaseClient, email: string, password: string) => {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user!;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

d("Conversations & Messages RLS + Realtime", () => {
  let buyer: SupabaseClient;
  let seller: SupabaseClient;
  let outsider: SupabaseClient;
  let buyerId: string;
  let sellerId: string;
  let conversationId: string;

  beforeAll(async () => {
    buyer = newClient();
    seller = newClient();
    outsider = newClient();

    const [b, s] = await Promise.all([
      signIn(buyer, buyerEmail!, buyerPass!),
      signIn(seller, sellerEmail!, sellerPass!),
      signIn(outsider, outsiderEmail!, outsiderPass!),
    ]);
    buyerId = b.id;
    sellerId = s.id;

    // Create the conversation as the buyer (only buyer can insert per RLS).
    const { data, error } = await buyer
      .from("conversations")
      .insert({ buyer_id: buyerId, seller_id: sellerId })
      .select("id")
      .single();
    if (error) throw error;
    conversationId = data.id;
  }, 30_000);

  afterAll(async () => {
    if (conversationId) {
      // Participants can delete; clean up.
      await buyer.from("conversations").delete().eq("id", conversationId);
    }
    await Promise.all([
      buyer?.auth.signOut(),
      seller?.auth.signOut(),
      outsider?.auth.signOut(),
    ]);
  });

  it("buyer can read their own conversation", async () => {
    const { data, error } = await buyer
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.id).toBe(conversationId);
  });

  it("seller can read the conversation they are part of", async () => {
    const { data, error } = await seller
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.id).toBe(conversationId);
  });

  it("outsider cannot read someone else's conversation", async () => {
    const { data, error } = await outsider
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();
    // RLS hides rows: no error, but no row returned.
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("outsider cannot insert a message into someone else's conversation", async () => {
    const { error } = await outsider.from("messages").insert({
      conversation_id: conversationId,
      sender_id: (await outsider.auth.getUser()).data.user!.id,
      content: "i should not be able to send this",
    });
    expect(error).not.toBeNull(); // RLS rejects with an error on INSERT
  });

  it("participant can insert and the other participant can read it; outsider cannot", async () => {
    const { error: insertErr } = await buyer.from("messages").insert({
      conversation_id: conversationId,
      sender_id: buyerId,
      content: "hello from buyer",
    });
    expect(insertErr).toBeNull();

    const { data: sellerView, error: sellerErr } = await seller
      .from("messages")
      .select("content")
      .eq("conversation_id", conversationId);
    expect(sellerErr).toBeNull();
    expect(sellerView?.some((m) => m.content === "hello from buyer")).toBe(true);

    const { data: outsiderView, error: outsiderErr } = await outsider
      .from("messages")
      .select("content")
      .eq("conversation_id", conversationId);
    expect(outsiderErr).toBeNull();
    expect(outsiderView ?? []).toEqual([]);
  });

  it(
    "Realtime: only participants receive INSERT payloads for the conversation",
    async () => {
      const sellerReceived: string[] = [];
      const outsiderReceived: string[] = [];

      const sellerChannel = seller
        .channel(`test-msgs-seller-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            sellerReceived.push((payload.new as { content: string }).content);
          },
        );

      const outsiderChannel = outsider
        .channel(`test-msgs-outsider-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            outsiderReceived.push((payload.new as { content: string }).content);
          },
        );

      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("seller subscribe timeout")), 10_000);
        sellerChannel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(t);
            resolve();
          }
        });
      });
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("outsider subscribe timeout")), 10_000);
        outsiderChannel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(t);
            resolve();
          }
        });
      });

      const marker = `realtime-probe-${Date.now()}`;
      const { error } = await buyer.from("messages").insert({
        conversation_id: conversationId,
        sender_id: buyerId,
        content: marker,
      });
      expect(error).toBeNull();

      // Give realtime time to deliver.
      await wait(3000);

      await seller.removeChannel(sellerChannel);
      await outsider.removeChannel(outsiderChannel);

      expect(sellerReceived).toContain(marker);
      expect(outsiderReceived).not.toContain(marker);
    },
    30_000,
  );
});
