import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Gadget,
  GadgetCategory,
  GadgetCondition,
  getCategoryLabel,
  getConditionLabel,
  getCategoryIcon,
} from '@/types/gadget';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES: GadgetCategory[] = [
  'phone', 'laptop', 'tablet', 'watch', 'headphones',
  'tv', 'gaming', 'camera', 'speaker', 'wearable',
  'vehicle', 'real_estate', 'furniture', 'appliance',
  'valuable', 'collectible', 'other'
];

const CONDITIONS: GadgetCondition[] = ['excellent', 'good', 'okay', 'bad'];

export interface GadgetFormData {
  name: string;
  category: GadgetCategory;
  brand: string;
  model: string;
  purchaseDate: Date | undefined;
  pricePaid: string;
  vendorName: string;
  orderId: string;
  warrantyExpiry: Date | undefined;
  condition: GadgetCondition;
  serialNumber: string;
  notes: string;
}

interface GadgetFormProps {
  initialData?: Gadget;
  onSubmit: (data: GadgetFormData) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export const GadgetForm = ({
  initialData,
  onSubmit,
  submitLabel = 'Save Asset',
  isLoading = false
}: GadgetFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<GadgetCategory>(initialData?.category || 'phone');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    initialData?.purchase_date ? parseISO(initialData.purchase_date) : undefined
  );
  const [pricePaid, setPricePaid] = useState(initialData?.price_paid?.toString() || '');
  const [vendorName, setVendorName] = useState(initialData?.vendor_name || '');
  const [orderId, setOrderId] = useState(initialData?.order_id || '');
  const [warrantyExpiry, setWarrantyExpiry] = useState<Date | undefined>(
    initialData?.warranty_expiry ? parseISO(initialData.warranty_expiry) : undefined
  );
  const [condition, setCondition] = useState<GadgetCondition>(initialData?.condition || 'good');
  const [serialNumber, setSerialNumber] = useState(initialData?.serial_number || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      category,
      brand,
      model,
      purchaseDate,
      pricePaid,
      vendorName,
      orderId,
      warrantyExpiry,
      condition,
      serialNumber,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          placeholder="e.g., iPhone 15 Pro, Tesla Model 3"
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
            placeholder="e.g., Apple, Tesla"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bg-secondary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            placeholder="e.g., A3096, Long Range"
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
        disabled={isLoading}
        className="w-full btn-gradient text-primary-foreground h-12"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {submitLabel}
          </>
        )}
      </Button>
    </form>
  );
};
