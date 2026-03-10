import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Send, Clock, MessageSquare, Pencil, Trash2, X, Check } from "lucide-react";
import ImageAttachments from "@/components/shared/ImageAttachments";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface TicketDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: {
    id: string;
    ticket_number: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    category: string | null;
    equipment_type: string | null;
    operating_system: string | null;
    created_at: string;
    updated_at: string;
    assigned_to: string | null;
    tags: string[];
  } | null;
  profiles: { user_id: string; full_name: string | null; email: string | null }[];
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_tratamento: "Em Tratamento",
  resolvido: "Resolvido",
  concluido: "Concluído",
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
    case "high": return "bg-orange-500/10 text-orange-700 border-orange-500/30";
    case "medium": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
    case "low": return "bg-green-500/10 text-green-700 border-green-500/30";
    default: return "bg-secondary text-secondary-foreground";
  }
};

const TicketDetailDialog = ({ open, onOpenChange, ticket, profiles }: TicketDetailDialogProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = async () => {
    if (!ticket) return;
    setLoadingComments(true);
    const { data } = await supabase
      .from("ticket_comments")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
    setLoadingComments(false);
  };

  useEffect(() => {
    if (open && ticket) fetchComments();
    if (!open) { setComments([]); setNewComment(""); }
  }, [open, ticket?.id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !ticket) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("ticket_comments").insert({
        ticket_id: ticket.id,
        user_id: user.id,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");
      fetchComments();
      toast.success("Comentário adicionado");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const { error } = await supabase.from("ticket_comments").update({ content: editContent.trim() }).eq("id", commentId);
      if (error) throw error;
      setEditingId(null);
      fetchComments();
      toast.success("Comentário atualizado");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from("ticket_comments").delete().eq("id", commentId);
      if (error) throw error;
      fetchComments();
      toast.success("Comentário eliminado");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getProfileName = (userId: string) => {
    const p = profiles.find((pr) => pr.user_id === userId);
    return p?.full_name || p?.email || "Utilizador";
  };

  const getInitials = (userId: string) => {
    const name = getProfileName(userId);
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!ticket) return null;

  const assignedName = ticket.assigned_to ? getProfileName(ticket.assigned_to) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">#{ticket.ticket_number}</span>
            {ticket.title}
          </DialogTitle>
        </DialogHeader>

        {/* Ticket Info */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
          <Badge variant="secondary">{statusLabels[ticket.status] || ticket.status}</Badge>
          {ticket.category && <Badge variant="outline">{ticket.category}</Badge>}
          {ticket.equipment_type && <Badge variant="outline">🖥️ {ticket.equipment_type}</Badge>}
          {ticket.operating_system && <Badge variant="outline">💻 {ticket.operating_system}</Badge>}
        </div>

        {ticket.description && (
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
        )}

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Criado: {new Date(ticket.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          {assignedName && <span>Atribuído: {assignedName}</span>}
        </div>

        {ticket.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.tags.map((tag) => (
              <span key={tag} className="bg-secondary px-2 py-0.5 rounded text-xs">{tag}</span>
            ))}
          </div>
        )}

        <Separator />

        {/* Comments Section */}
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Comentários ({comments.length})</h3>
        </div>

        <ScrollArea className="flex-1 max-h-[300px] pr-2">
          {loadingComments ? (
            <p className="text-sm text-muted-foreground text-center py-4">A carregar...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem comentários ainda</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const isOwn = comment.user_id === user?.id;
                const isEditing = editingId === comment.id;
                return (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(comment.user_id)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{getProfileName(comment.user_id)}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(comment.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isOwn && !isEditing && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-auto">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="flex gap-2 mt-1">
                        <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="flex-1 text-sm" />
                        <div className="flex flex-col gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEditComment(comment.id)}><Check className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Add Comment */}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escrever comentário..."
            rows={2}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <Button
            size="icon"
            className="shrink-0 self-end"
            onClick={handleAddComment}
            disabled={submitting || !newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailDialog;
