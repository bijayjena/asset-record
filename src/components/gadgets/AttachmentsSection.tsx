import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Attachment, AttachmentType } from '@/types/gadget';
import { uploadAttachment, deleteAttachment } from '@/lib/supabase-helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Image, 
  Shield, 
  File,
  Download,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';

interface AttachmentsSectionProps {
  gadgetId: string;
  userId: string;
  attachments: Attachment[];
  onAttachmentChange: () => void;
}

const ATTACHMENT_TYPES: { value: AttachmentType; label: string; icon: typeof FileText }[] = [
  { value: 'bill', label: 'Bill/Receipt', icon: FileText },
  { value: 'warranty', label: 'Warranty Card', icon: Shield },
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'other', label: 'Other', icon: File },
];

const getFileIcon = (type: AttachmentType, mimeType?: string | null) => {
  if (mimeType?.startsWith('image/')) return Image;
  switch (type) {
    case 'bill': return FileText;
    case 'warranty': return Shield;
    case 'photo': return Image;
    default: return File;
  }
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentsSection = ({ 
  gadgetId, 
  userId, 
  attachments, 
  onAttachmentChange 
}: AttachmentsSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<AttachmentType>('bill');
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    try {
      await uploadAttachment(gadgetId, file, selectedType, userId);
      toast.success('Attachment uploaded successfully!');
      onAttachmentChange();
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Failed to upload attachment. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    try {
      await deleteAttachment(deleteTarget, userId);
      toast.success('Attachment deleted successfully!');
      onAttachmentChange();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (mimeType?: string | null) => mimeType?.startsWith('image/');

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedType} onValueChange={(v) => setSelectedType(v as AttachmentType)}>
          <SelectTrigger className="w-full sm:w-48 bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ATTACHMENT_TYPES.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
          variant="outline"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload File
            </>
          )}
        </Button>
      </div>

      {/* Attachments Grid */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.type, attachment.mime_type);
              const typeLabel = ATTACHMENT_TYPES.find(t => t.value === attachment.type)?.label || 'Other';
              
              return (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-3 bg-secondary/30 border-border/50 group hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Preview/Icon */}
                      {isImage(attachment.mime_type) ? (
                        <button
                          onClick={() => setPreviewImage(attachment.file_url)}
                          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 ring-primary transition-all"
                        >
                          <img
                            src={attachment.file_url}
                            alt={attachment.file_name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{attachment.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{typeLabel}</span>
                          <span>•</span>
                          <span>{formatFileSize(attachment.file_size)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(attachment)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => setDeleteTarget(attachment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Upload className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No attachments yet</p>
          <p className="text-xs mt-1">Upload bills, warranty cards, or photos</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-white hover:bg-white/20"
                onClick={() => setPreviewImage(null)}
              >
                <X className="w-6 h-6" />
              </Button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
