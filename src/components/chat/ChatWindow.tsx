import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, User, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack: () => void;
}

const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(conversation?.id || null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const { error } = await sendMessage(newMessage.trim());
    if (!error) {
      setNewMessage("");
    }
    setSending(false);
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-secondary/30">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">Selecione uma conversa</h3>
        <p className="text-sm text-muted-foreground">
          Escolha uma conversa para começar a trocar mensagens
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {conversation.other_user.avatar_url ? (
          <img
            src={conversation.other_user.avatar_url}
            alt={conversation.other_user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {conversation.other_user.name}
          </h3>
          {conversation.product_title && (
            <p className="text-xs text-muted-foreground truncate">
              {conversation.product_title}
            </p>
          )}
        </div>
      </div>

      {/* Product Info */}
      {conversation.product_image && (
        <div className="flex items-center gap-3 p-3 bg-secondary/50 border-b border-border">
          <img
            src={conversation.product_image}
            alt={conversation.product_title || "Produto"}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {conversation.product_title}
            </p>
            {conversation.product_price && (
              <p className="text-sm font-bold text-primary">
                {new Intl.NumberFormat("pt-MZ", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                }).format(conversation.product_price)} MZN
              </p>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-muted-foreground">
              Nenhuma mensagem ainda. Comece a conversa!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">
                      {format(new Date(message.created_at), "HH:mm", { locale: ptBR })}
                    </span>
                    {isOwn && (
                      message.is_read ? (
                        <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            className="gradient-primary text-primary-foreground border-0"
            disabled={!newMessage.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
