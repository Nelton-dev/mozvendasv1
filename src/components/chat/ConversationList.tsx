import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Trash2 } from "lucide-react";
import { Conversation } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete?: () => void;
}

const ConversationList = ({ conversations, selectedId, onSelect, onDelete }: ConversationListProps) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      // Delete messages first, then conversation
      await supabase.from("messages").delete().eq("conversation_id", deleteId);
      const { error } = await supabase.from("conversations").delete().eq("id", deleteId);
      if (error) throw error;
      toast({ title: "Conversa eliminada!" });
      onDelete?.();
    } catch {
      toast({ title: "Erro ao eliminar conversa", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

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
    <>
      <div className="divide-y divide-border">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={cn(
              "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/50 relative group",
              selectedId === conversation.id && "bg-secondary"
            )}
          >
            <button
              className="flex-1 flex items-start gap-3 text-left"
              onClick={() => onSelect(conversation.id)}
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
            </button>
            {(conversation.unread_count ?? 0) > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5 mt-1">
                {conversation.unread_count}
              </span>
            )}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(conversation.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as mensagens desta conversa serão removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationList;
