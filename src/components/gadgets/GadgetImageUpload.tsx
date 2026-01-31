import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Camera, Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface GadgetImageUploadProps {
  currentImageUrl: string | null;
  categoryIcon: string;
  onImageChange: (file: File | null) => void;
  onImageRemove?: () => void;
  isUploading?: boolean;
  className?: string;
}

export const GadgetImageUpload = ({
  currentImageUrl,
  categoryIcon,
  onImageChange,
  onImageRemove,
  isUploading = false,
  className,
}: GadgetImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageError(false);
    onImageChange(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setImageError(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onImageChange(null);
    onImageRemove?.();
  };

  const displayUrl = previewUrl || currentImageUrl;
  const showImage = displayUrl && !imageError;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative group">
        <div
          className={cn(
            'w-full aspect-video rounded-xl overflow-hidden',
            'bg-gradient-to-br from-secondary/80 to-secondary/40',
            'border-2 border-dashed border-border/50',
            'flex items-center justify-center',
            'transition-all duration-200',
            !showImage && 'hover:border-primary/50 hover:bg-secondary/60'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : showImage ? (
            <img
              src={displayUrl}
              alt="Gadget"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-4xl">{categoryIcon}</span>
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Overlay actions */}
        {!isUploading && (
          <div
            className={cn(
              'absolute inset-0 rounded-xl',
              'bg-black/50 opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200',
              'flex items-center justify-center gap-2'
            )}
          >
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              {showImage ? (
                <>
                  <Camera className="w-4 h-4" />
                  Change
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </Button>
            {showImage && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center">
        <ImageIcon className="w-3 h-3 inline mr-1" />
        Click to upload a custom image (max 5MB)
      </p>
    </div>
  );
};
