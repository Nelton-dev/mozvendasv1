import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, MessageCircle, Share2, Volume2, VolumeX, Play, ShoppingBag, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface VideoReel {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  views_count: number;
  created_at: string;
  seller_name?: string;
  seller_avatar?: string;
}

const VideoReels = () => {
  const [videos, setVideos] = useState<VideoReel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("product_videos")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch seller profiles
      const sellerIds = [...new Set(data.map((v) => v.seller_id))];
      const { data: profiles } = await supabase
        .from("public_profiles" as any)
        .select("user_id, name, avatar_url")
        .in("user_id", sellerIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      const enriched = data.map((v) => {
        const profile = profileMap.get(v.seller_id);
        return {
          ...v,
          seller_name: (profile as any)?.name || "Vendedor",
          seller_avatar: (profile as any)?.avatar_url,
        };
      });

      setVideos(enriched);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);

  useEffect(() => {
    // Play current, pause others
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === currentIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex]);

  const handleShare = async (video: VideoReel) => {
    if (navigator.share) {
      await navigator.share({
        title: video.title,
        text: `Confira ${video.title} no MOZ VENDAS!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Play className="h-12 w-12 text-primary" />
          <p className="text-sm text-muted-foreground">Carregando vídeos...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-4">
        <Play className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Nenhum vídeo ainda</h2>
        <p className="text-sm text-muted-foreground text-center">
          Os vendedores ainda não publicaram vídeos de produtos.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-white font-bold text-lg">Reels</h1>
        <div className="w-10" />
      </div>

      {/* Video feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {videos.map((video, index) => (
          <div key={video.id} className="h-screen w-full snap-start relative flex items-center justify-center">
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={video.video_url}
              className="h-full w-full object-cover"
              loop
              playsInline
              muted={muted}
              poster={video.thumbnail_url || undefined}
              onClick={() => {
                const v = videoRefs.current[index];
                if (v) v.paused ? v.play() : v.pause();
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            {/* Right sidebar actions */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
              {/* Seller avatar */}
              <button className="relative" onClick={() => {}}>
                {video.seller_avatar ? (
                  <img src={video.seller_avatar} className="h-11 w-11 rounded-full border-2 border-white object-cover" alt="" />
                ) : (
                  <div className="h-11 w-11 rounded-full border-2 border-white bg-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </button>

              <button className="flex flex-col items-center gap-1">
                <Heart className="h-7 w-7 text-white" />
                <span className="text-white text-[10px]">{video.views_count}</span>
              </button>

              <button className="flex flex-col items-center gap-1" onClick={() => user ? navigate("/messages") : navigate("/auth")}>
                <MessageCircle className="h-7 w-7 text-white" />
                <span className="text-white text-[10px]">Chat</span>
              </button>

              <button className="flex flex-col items-center gap-1" onClick={() => handleShare(video)}>
                <Share2 className="h-7 w-7 text-white" />
                <span className="text-white text-[10px]">Partilhar</span>
              </button>

              <button className="flex flex-col items-center gap-1" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-20 left-4 right-16">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-bold text-sm">@{video.seller_name}</span>
              </div>
              <p className="text-white text-sm font-semibold mb-1">{video.title}</p>
              {video.description && (
                <p className="text-white/80 text-xs line-clamp-2">{video.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold">Ver produto</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default VideoReels;
