import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Loader2, Download, X, ZoomIn, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
}

interface ImageAttachmentsProps {
  entityId: string;
  entityType: "ticket" | "document" | "inventory";
  readOnly?: boolean;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

const ImageAttachments = ({ entityId, entityType, readOnly = false }: ImageAttachmentsProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("attachments")
      .select("id, file_name, file_path, file_size, content_type")
      .eq("entity_id", entityId)
      .eq("entity_type", entityType);

    const imageFiles = (data || []).filter(
      (a) => a.content_type && IMAGE_TYPES.includes(a.content_type)
    );
    setImages(imageFiles);

    // Generate signed URLs for all images
    const urls: Record<string, string> = {};
    for (const img of imageFiles) {
      const { data: urlData } = await supabase.storage
        .from("attachments")
        .createSignedUrl(img.file_path, 3600);
      if (urlData?.signedUrl) {
        urls[img.id] = urlData.signedUrl;
      }
    }
    setImageUrls(urls);
    setLoading(false);
  };

  useEffect(() => {
    if (entityId) fetchImages();
  }, [entityId]);

  const processFiles = async (files: File[]) => {
    if (!user) return;
    setUploading(true);

    try {
      for (const file of files) {
        if (!IMAGE_TYPES.includes(file.type)) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} excede 5MB`);
          continue;
        }

        const filePath = `${user.id}/${entityId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Erro ao carregar ${file.name}`);
          continue;
        }

        await supabase.from("attachments").insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
          entity_type: entityType,
          entity_id: entityId,
          uploaded_by: user.id,
        });
      }

      toast.success("Imagem(ns) adicionada(s)");
      fetchImages();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await processFiles(Array.from(e.target.files));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.error("Nenhuma imagem detectada");
      return;
    }
    await processFiles(files);
  }, [user, entityId]);

  const handleDelete = async (img: ImageAttachment) => {
    if (!confirm("Eliminar esta imagem?")) return;
    try {
      await supabase.storage.from("attachments").remove([img.file_path]);
      await supabase.from("attachments").delete().eq("id", img.id);
      toast.success("Imagem eliminada");
      fetchImages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDownload = async (img: ImageAttachment) => {
    const { data, error } = await supabase.storage.from("attachments").download(img.file_path);
    if (error) { toast.error("Erro ao descarregar"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = img.file_name; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" /> A carregar imagens...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <ImagePlus className="h-4 w-4 text-muted-foreground" />
          Imagens ({images.length})
        </h4>
        {!readOnly && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {uploading ? "A carregar..." : "Adicionar"}
            </Button>
          </>
        )}
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Sem imagens anexadas</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-square">
              {imageUrls[img.id] ? (
                <img
                  src={imageUrls[img.id]}
                  alt={img.file_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                  onClick={() => setPreviewUrl(imageUrls[img.id] || null)}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                  onClick={() => handleDownload(img)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/20"
                    onClick={() => handleDelete(img)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate">
                {img.file_name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Full-size preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl p-2">
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageAttachments;
