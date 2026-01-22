import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, Conversation } from "@/hooks/useConversations";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading: conversationsLoading } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || conversationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Mensagens</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Conversation List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 border-r border-border bg-card flex-shrink-0",
            showChat && "hidden md:block"
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Chat Window */}
        <div
          className={cn(
            "flex-1",
            !showChat && "hidden md:block"
          )}
        >
          <ChatWindow
            conversation={selectedConversation}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
