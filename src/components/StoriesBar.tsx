import { Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
}

const StoriesBar = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("public_profiles" as any)
        .select("user_id, name, avatar_url")
        .order("created_at" as any, { ascending: false })
        .limit(20) as { data: Array<{user_id: string; name: string; avatar_url: string | null}> | null };
      if (data) setProfiles(data.map((p, i) => ({ id: p.user_id, user_id: p.user_id, name: p.name, avatar_url: p.avatar_url })));
    };
    fetchProfiles();
  }, []);

  const currentUserProfile = profiles.find((p) => p.user_id === user?.id);
  const otherProfiles = profiles.filter((p) => p.user_id !== user?.id);

  const allStories = [
    ...(currentUserProfile
      ? [{ ...currentUserProfile, isOwn: true }]
      : user
      ? [{ id: "own", user_id: user.id, name: "Seu story", avatar_url: null, isOwn: true }]
      : []),
    ...otherProfiles.map((p) => ({ ...p, isOwn: false })),
  ];

  if (allStories.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          {allStories.map((story) => (
            <button
              key={story.id}
              className="flex flex-col items-center gap-1.5 min-w-fit group"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full p-[2px] transition-transform group-hover:scale-105 gradient-story">
                <div className="relative h-full w-full rounded-full bg-background p-[2px]">
                  {story.avatar_url ? (
                    <img
                      src={story.avatar_url}
                      alt={story.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {story.isOwn && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground ring-2 ring-background shadow-soft">
                      <Plus className="h-3 w-3" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground max-w-[64px] truncate">
                {story.isOwn ? "Seu story" : story.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesBar;
