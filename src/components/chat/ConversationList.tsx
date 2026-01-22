import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User } from "lucide-react";
import { Conversation } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ConversationList = ({ conversations, selectedId, onSelect }: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">Nenhuma conversa</h3>
        <p className="text-sm text-muted-foreground">
          Inicie uma conversa com um vendedor
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={cn(
            "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/50",
            selectedId === conversation.id && "bg-secondary"
          )}
        >
          {conversation.other_user.avatar_url ? (
            <img
              src={conversation.other_user.avatar_url}
              alt={conversation.other_user.name}
              className="h-12 w-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground truncate">
                {conversation.other_user.name}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(conversation.last_message_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            {conversation.product_title && (
              <p className="text-xs text-primary truncate mb-1">
                {conversation.product_title}
              </p>
            )}
            <p className="text-sm text-muted-foreground truncate">
              {conversation.last_message || "Nenhuma mensagem ainda"}
            </p>
          </div>
          {(conversation.unread_count ?? 0) > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5">
              {conversation.unread_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ConversationList;
