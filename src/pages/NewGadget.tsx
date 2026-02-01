import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { GadgetImageUpload } from '@/components/gadgets/GadgetImageUpload';
import { createGadget, searchGadgetImage, uploadGadgetImage } from '@/lib/supabase-helpers';
import {
  GadgetCategory,
  GadgetCondition,
  getCategoryLabel,
  getConditionLabel,
  getCategoryIcon,
} from '@/types/gadget';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarIcon,
  Save,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES: GadgetCategory[] = [
  'phone', 'laptop', 'tablet', 'watch', 'headphones',
  'tv', 'gaming', 'camera', 'speaker', 'wearable',
  'vehicle', 'real_estate', 'furniture', 'appliance',
  'valuable', 'collectible', 'other'
];

const CONDITIONS: GadgetCondition[] = ['excellent', 'good', 'okay', 'bad'];

const NewGadget = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GadgetCategory>('phone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [pricePaid, setPricePaid] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState<Date>();
  const [condition, setCondition] = useState<GadgetCondition>('good');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validation
    if (!name.trim()) {
      toast.error('Please enter an asset name');
      return;
    }
    if (!brand.trim()) {
      toast.error('Please enter a brand/manufacturer');
      return;
    }
    if (!purchaseDate) {
      toast.error('Please select a purchase date');
      return;
    }

    setSaving(true);

    try {
      // Create the gadget (asset) first (without image)
      const gadget = await createGadget({
        user_id: user.id,
        name: name.trim(),
        category,
        brand: brand.trim(),
        model: model.trim() || null,
        purchase_date: format(purchaseDate, 'yyyy-MM-dd'),
        price_paid: pricePaid ? parseFloat(pricePaid) : null,
        vendor_name: vendorName.trim() || null,
        order_id: orderId.trim() || null,
        warranty_expiry: warrantyExpiry ? format(warrantyExpiry, 'yyyy-MM-dd') : null,
        condition,
        serial_number: serialNumber.trim() || null,
        notes: notes.trim() || null,
        image_url: null,
      });

      // Handle image: custom upload or auto-fetch
      let imageUrl: string | null = null;

      if (customImageFile) {
        // Upload custom image
        try {
          imageUrl = await uploadGadgetImage(gadget.id, customImageFile, user.id);
        } catch (err) {
          console.error('Failed to upload custom image:', err);
          toast.error('Failed to upload image, but asset was created');
        }
      } else {
        // Auto-fetch from Google
        imageUrl = await searchGadgetImage(name.trim(), brand.trim(), category);
      }

      // Update gadget with image URL if we got one
      if (imageUrl) {
        const { updateGadget } = await import('@/lib/supabase-helpers');
        await updateGadget(gadget.id, { image_url: imageUrl });
      }

      toast.success('Asset added successfully!');
      navigate(`/assets/${gadget.id}`);
    } catch (error) {
      console.error('Error creating asset:', error);
      toast.error('Failed to create asset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <Card className="glass-card p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Add New Asset</h1>
            <p className="text-muted-foreground mt-1">
              Fill in the details of your new asset
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Asset Image</Label>
              <GadgetImageUpload
                currentImageUrl={null}
                categoryIcon={getCategoryIcon(category)}
                onImageChange={setCustomImageFile}
              />
              <p className="text-xs text-muted-foreground">
                Upload a custom image or leave empty to auto-fetch from the web
              </p>
            </div>
            {/* Category & Condition Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as GadgetCategory)}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-2">
                          <span>{getCategoryIcon(cat)}</span>
                          {getCategoryLabel(cat)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as GadgetCondition)}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {getConditionLabel(cond)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Tesla Model 3, Eames Chair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Apple, Tesla, Herman Miller"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., Long Range, Aeron"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {/* Purchase Date & Warranty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-secondary/50',
                        !purchaseDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? format(purchaseDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={purchaseDate}
                      onSelect={setPurchaseDate}
                      initialFocus
                      disabled={(date) => date > new Date()}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Warranty Expiry</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-secondary/50',
                        !warrantyExpiry && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {warrantyExpiry ? format(warrantyExpiry, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={warrantyExpiry}
                      onSelect={setWarrantyExpiry}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear() + 20}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Price & Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price Paid</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={pricePaid}
                  onChange={(e) => setPricePaid(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Store</Label>
                <Input
                  id="vendor"
                  placeholder="e.g., Apple Store, Dealership"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {/* Order ID & Serial */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  placeholder="Optional"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number/VIN</Label>
                <Input
                  id="serial"
                  placeholder="Optional"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this asset..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary/50 min-h-[100px]"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full btn-gradient text-primary-foreground h-12"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Asset
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default NewGadget;
