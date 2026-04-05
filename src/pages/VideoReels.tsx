import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Heart, MessageCircle, Share2, Volume2, VolumeX,
  Play, ShoppingBag, User, Trash2, Edit
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  likes_count?: number;
  is_liked?: boolean;
}

const VideoReels = () => {
  const [videos, setVideos] = useState<VideoReel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, [user]);

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

      const sellerIds = [...new Set(data.map((v) => v.seller_id))];
      const { data: profiles } = await supabase
        .from("public_profiles" as any)
        .select("user_id, name, avatar_url")
        .in("user_id", sellerIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      // Fetch likes counts
      const videoIds = data.map((v) => v.id);
      const { data: likesData } = await supabase
        .from("video_likes")
        .select("video_id")
        .in("video_id", videoIds);

      const likesCountMap = new Map<string, number>();
      (likesData || []).forEach((l: any) => {
        likesCountMap.set(l.video_id, (likesCountMap.get(l.video_id) || 0) + 1);
      });

      // Fetch user's likes
      let userLikes = new Set<string>();
      if (user) {
        const { data: userLikesData } = await supabase
          .from("video_likes")
          .select("video_id")
          .eq("user_id", user.id)
          .in("video_id", videoIds);
        userLikes = new Set((userLikesData || []).map((l: any) => l.video_id));
      }

      const enriched = data.map((v) => {
        const profile = profileMap.get(v.seller_id);
        return {
          ...v,
          seller_name: (profile as any)?.name || "Vendedor",
          seller_avatar: (profile as any)?.avatar_url,
          likes_count: likesCountMap.get(v.id) || 0,
          is_liked: userLikes.has(v.id),
        };
      });

      setVideos(enriched);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    // Optimistic update
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              is_liked: !v.is_liked,
              likes_count: (v.likes_count || 0) + (v.is_liked ? -1 : 1),
            }
          : v
      )
    );

    try {
      if (video.is_liked) {
        await supabase
          .from("video_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("video_id", videoId);
      } else {
        await supabase
          .from("video_likes")
          .insert({ user_id: user.id, video_id: videoId });
      }
    } catch {
      // Revert on error
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                is_liked: video.is_liked,
                likes_count: video.likes_count,
              }
            : v
        )
      );
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete || !user) return;
    try {
      const { error } = await supabase
        .from("product_videos")
        .delete()
        .eq("id", videoToDelete)
        .eq("seller_id", user.id);

      if (error) throw error;
      setVideos((prev) => prev.filter((v) => v.id !== videoToDelete));
      toast({ title: "Vídeo eliminado com sucesso!" });
    } catch {
      toast({ title: "Erro ao eliminar vídeo", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
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

              {/* Like */}
              <button
                className="flex flex-col items-center gap-1"
                onClick={() => handleLike(video.id)}
              >
                <Heart
                  className={`h-7 w-7 transition-colors ${
                    video.is_liked ? "text-red-500 fill-red-500" : "text-white"
                  }`}
                />
                <span className="text-white text-[10px]">{video.likes_count || 0}</span>
              </button>

              <button className="flex flex-col items-center gap-1" onClick={() => {
                if (!user) {
                  toast({ title: "Faça login para enviar mensagens", variant: "destructive" });
                  navigate("/auth");
                  return;
                }
                navigate("/messages");
              }}>
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

              {/* Owner actions */}
              {user && video.seller_id === user.id && (
                <>
                  <button
                    className="flex flex-col items-center gap-1"
                    onClick={() => {
                      setVideoToDelete(video.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-6 w-6 text-red-400" />
                    <span className="text-white text-[10px]">Eliminar</span>
                  </button>
                </>
              )}
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

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vídeo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O vídeo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default VideoReels;
