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
  OwnershipType,
  VehicleType,
  getCategoryLabel,
  getConditionLabel,
  getCategoryIcon,
} from '@/types/gadget';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Save, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CATEGORIES: GadgetCategory[] = [
  'phone', 'laptop', 'tablet', 'watch', 'headphones',
  'tv', 'gaming', 'camera', 'speaker', 'wearable',
  'vehicle', 'real_estate', 'furniture', 'appliance',
  'valuable', 'collectible', 'other'
];

const CONDITIONS: GadgetCondition[] = ['excellent', 'good', 'okay', 'bad'];
const OWNERSHIP_TYPES: OwnershipType[] = ['first_hand', 'second_hand', 'third_hand'];
const VEHICLE_TYPES: VehicleType[] = ['car', 'bike', 'scooty', 'other'];

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
  ownershipType?: OwnershipType;
  vehicleType?: VehicleType;
  manufacturingDate?: Date | undefined;
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

  // New Fields
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(
    initialData?.ownership_type || 'first_hand'
  );
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    initialData?.vehicle_type || 'car'
  );
  const [manufacturingDate, setManufacturingDate] = useState<Date | undefined>(
    initialData?.manufacturing_date ? parseISO(initialData.manufacturing_date) : undefined
  );

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
      ownershipType,
      vehicleType: category === 'vehicle' ? vehicleType : undefined,
      manufacturingDate,
      serialNumber,
      notes,
    });
  };

  const getOwnershipLabel = (type: OwnershipType) => {
    switch (type) {
      case 'first_hand': return 'First Hand (New)';
      case 'second_hand': return 'Second Hand';
      case 'third_hand': return 'Third Hand+';
      default: return type;
    }
  };

  const getVehicleLabel = (type: VehicleType) => {
    switch (type) {
      case 'car': return 'Car';
      case 'bike': return 'Bike / Motorcycle';
      case 'scooty': return 'Scooter / Scooty';
      case 'other': return 'Other Vehicle';
      default: return type;
    }
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
          <Label>Ownership Type *</Label>
          <Select value={ownershipType} onValueChange={(v) => setOwnershipType(v as OwnershipType)}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OWNERSHIP_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getOwnershipLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vehicle Specific Field */}
      {category === 'vehicle' && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-2">
            <Label>Vehicle Type *</Label>
            <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getVehicleLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

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

      {/* Dates Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            {ownershipType === 'first_hand' ? 'Purchase Date *' : 'Your Purchase Date *'}
          </Label>
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

        {/* Manufacturing Date - Required for Second Hand OR Vehicles */}
        {(ownershipType !== 'first_hand' || category === 'vehicle') && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
            <Label>
              Manufacturing Date
              {(ownershipType !== 'first_hand' || category === 'vehicle') && ' *'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-secondary/50',
                    !manufacturingDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {manufacturingDate ? format(manufacturingDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={manufacturingDate}
                  onSelect={setManufacturingDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

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

      {/* Helper Text for Second Hand Items */}
      {ownershipType !== 'first_hand' && (
        <Alert className="bg-primary/10 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs text-primary/80">
            For pre-owned items, the warranty is often determined by the manufacturing date or original purchase date, not your purchase date.
          </AlertDescription>
        </Alert>
      )}

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
          <Label htmlFor="vendor">{ownershipType === 'first_hand' ? 'Vendor/Store' : 'Seller/Source'}</Label>
          <Input
            id="vendor"
            placeholder={ownershipType === 'first_hand' ? "e.g., Apple Store, Dealership" : "e.g., eBay, Friend"}
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
