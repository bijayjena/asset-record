import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { GadgetForm, GadgetFormData } from '@/components/gadgets/GadgetForm';
import { GadgetInfo } from '@/components/gadgets/GadgetInfo';
import { AttachmentsSection } from '@/components/gadgets/AttachmentsSection';
import { AISuggestions } from '@/components/gadgets/AISuggestions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  fetchGadgetById,
  updateGadget,
  deleteGadget,
  fetchAttachments,
  fetchAISuggestion,
  uploadGadgetImage,
  deleteGadgetImage,
  searchGadgetImage,
} from '@/lib/supabase-helpers';
import { getCategoryIcon, formatAge } from '@/types/gadget';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Paperclip,
  Sparkles,
  Info,
  Loader2,
  X,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { GadgetImageUpload } from '@/components/gadgets/GadgetImageUpload';

const GadgetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Fetch gadget
  const { data: gadget, isLoading: gadgetLoading, error: gadgetError } = useQuery({
    queryKey: ['gadget', id],
    queryFn: () => fetchGadgetById(id!),
    enabled: !!id && !!user,
  });

  // Fetch attachments
  const { data: attachments = [], refetch: refetchAttachments } = useQuery({
    queryKey: ['attachments', id],
    queryFn: () => fetchAttachments(id!),
    enabled: !!id && !!user,
  });

  // Fetch AI suggestion
  const { data: aiSuggestion, refetch: refetchAISuggestion } = useQuery({
    queryKey: ['ai-suggestion', id],
    queryFn: () => fetchAISuggestion(id!),
    enabled: !!id && !!user,
  });

  const handleSave = async (formData: GadgetFormData) => {
    if (!id || !user) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter an asset name');
      return;
    }
    if (!formData.brand.trim()) {
      toast.error('Please enter a brand');
      return;
    }
    if (!formData.purchaseDate) {
      toast.error('Please select a purchase date');
      return;
    }

    setSaving(true);
    try {
      await updateGadget(id, {
        name: formData.name.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        model: formData.model.trim() || null,
        purchase_date: format(formData.purchaseDate, 'yyyy-MM-dd'),
        price_paid: formData.pricePaid ? parseFloat(formData.pricePaid) : null,
        vendor_name: formData.vendorName.trim() || null,
        order_id: formData.orderId.trim() || null,
        warranty_expiry: formData.warrantyExpiry ? format(formData.warrantyExpiry, 'yyyy-MM-dd') : null,
        condition: formData.condition,
        ownership_type: formData.ownershipType,
        vehicle_type: formData.vehicleType,
        manufacturing_date: formData.manufacturingDate ? format(formData.manufacturingDate, 'yyyy-MM-dd') : null,
        serial_number: formData.serialNumber.trim() || null,
        notes: formData.notes.trim() || null,
      });

      toast.success('Asset updated successfully!');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['gadget', id] });
      queryClient.invalidateQueries({ queryKey: ['gadgets'] });
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleting(true);
    try {
      await deleteGadget(id);
      toast.success('Asset deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['gadgets'] });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file || !gadget || !user) return;

    setUploadingImage(true);
    try {
      // Delete old image if it's a custom upload
      if (gadget.image_url && gadget.image_url.includes('gadget-attachments')) {
        await deleteGadgetImage(gadget.image_url);
      }

      const imageUrl = await uploadGadgetImage(gadget.id, file, user.id);
      await updateGadget(gadget.id, { image_url: imageUrl });

      toast.success('Image updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['gadget', id] });
      queryClient.invalidateQueries({ queryKey: ['gadgets'] });
      setShowImageEditor(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRefetchImage = async () => {
    if (!gadget) return;

    setUploadingImage(true);
    try {
      const imageUrl = await searchGadgetImage(gadget.name, gadget.brand, gadget.category);
      if (imageUrl) {
        // Delete old custom image if exists
        if (gadget.image_url && gadget.image_url.includes('gadget-attachments')) {
          await deleteGadgetImage(gadget.image_url);
        }

        await updateGadget(gadget.id, { image_url: imageUrl });
        toast.success('Image refreshed from web!');
        queryClient.invalidateQueries({ queryKey: ['gadget', id] });
        queryClient.invalidateQueries({ queryKey: ['gadgets'] });
      } else {
        toast.error('No image found for this asset');
      }
      setShowImageEditor(false);
    } catch (error) {
      console.error('Error fetching image:', error);
      toast.error('Failed to fetch image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!gadget) return;

    setUploadingImage(true);
    try {
      if (gadget.image_url && gadget.image_url.includes('gadget-attachments')) {
        await deleteGadgetImage(gadget.image_url);
      }

      await updateGadget(gadget.id, { image_url: null });
      toast.success('Image removed!');
      queryClient.invalidateQueries({ queryKey: ['gadget', id] });
      queryClient.invalidateQueries({ queryKey: ['gadgets'] });
      setShowImageEditor(false);
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (authLoading || gadgetLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return null;
  }

  if (gadgetError || !gadget) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Asset not found</h2>
          <p className="text-muted-foreground mb-4">
            The asset you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Gadget Title with Image */}
        <Card className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Gadget Image */}
            <div className="relative group">
              <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-secondary/80 to-secondary/40 flex items-center justify-center">
                {gadget.image_url ? (
                  <img
                    src={gadget.image_url}
                    alt={gadget.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-4xl">${getCategoryIcon(gadget.category)}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-4xl">{getCategoryIcon(gadget.category)}</span>
                )}
              </div>
              {/* Edit overlay */}
              <button
                onClick={() => setShowImageEditor(!showImageEditor)}
                className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{gadget.name}</h1>
              <p className="text-muted-foreground">
                {gadget.brand} {gadget.model && `• ${gadget.model}`}
              </p>
              <p className="text-sm text-primary mt-1">{formatAge(gadget.purchase_date)}</p>
            </div>
          </div>

          {/* Image Editor Panel */}
          {showImageEditor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="space-y-4">
                <GadgetImageUpload
                  currentImageUrl={gadget.image_url}
                  categoryIcon={getCategoryIcon(gadget.category)}
                  onImageChange={handleImageUpload}
                  onImageRemove={handleRemoveImage}
                  isUploading={uploadingImage}
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefetchImage}
                    disabled={uploadingImage}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Fetch from Web
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageEditor(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Edit Asset</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <GadgetForm
                  initialData={gadget}
                  onSubmit={handleSave}
                  submitLabel="Save Changes"
                  isLoading={saving}
                />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Tabs defaultValue="info" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                  <TabsTrigger value="info" className="gap-2">
                    <Info className="w-4 h-4" />
                    <span className="hidden sm:inline">Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span className="hidden sm:inline">Attachments</span>
                    {attachments.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 rounded-full">
                        {attachments.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Advisor</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <Card className="glass-card p-6">
                    <GadgetInfo gadget={gadget} />
                  </Card>
                </TabsContent>

                <TabsContent value="attachments">
                  <Card className="glass-card p-6">
                    <h3 className="font-semibold mb-4">Attachments</h3>
                    <AttachmentsSection
                      gadgetId={gadget.id}
                      userId={user.id}
                      attachments={attachments}
                      onAttachmentChange={refetchAttachments}
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="ai">
                  <Card className="glass-card p-6">
                    <AISuggestions
                      gadget={gadget}
                      cachedSuggestion={aiSuggestion || null}
                      onSuggestionUpdate={refetchAISuggestion}
                    />
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{gadget.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this asset and all its attachments. This action cannot be undone.
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
                  'Delete Asset'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default GadgetDetails;
