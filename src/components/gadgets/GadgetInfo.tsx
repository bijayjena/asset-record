import { Gadget, formatAge, getCategoryLabel, getCategoryIcon, getConditionLabel, getWarrantyStatus } from '@/types/gadget';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { 
  Calendar,
  DollarSign,
  Store,
  Hash,
  Shield,
  Tag,
  FileText,
  Clock,
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { formatPrice } from '@/lib/currency';

interface GadgetInfoProps {
  gadget: Gadget;
}

export const GadgetInfo = ({ gadget }: GadgetInfoProps) => {
  const { profile } = useProfile();
  const currency = profile?.currency || 'INR';
  const warrantyStatus = getWarrantyStatus(gadget.warranty_expiry);
  
  const getWarrantyBadge = () => {
    switch (warrantyStatus) {
      case 'active':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>;
      case 'expiring':
        return <Badge className="bg-accent/20 text-accent-foreground border-accent/30">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">No Warranty</Badge>;
    }
  };

  const getConditionBadge = () => {
    const colors: Record<string, string> = {
      excellent: 'bg-primary/20 text-primary border-primary/30',
      good: 'bg-secondary text-secondary-foreground border-border',
      okay: 'bg-accent/20 text-accent-foreground border-accent/30',
      bad: 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return <Badge className={colors[gadget.condition]}>{getConditionLabel(gadget.condition)}</Badge>;
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium mt-0.5">{value || <span className="text-muted-foreground">—</span>}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-1">
      <InfoRow 
        icon={Tag} 
        label="Category" 
        value={
          <span className="flex items-center gap-2">
            <span>{getCategoryIcon(gadget.category)}</span>
            {getCategoryLabel(gadget.category)}
          </span>
        } 
      />
      <InfoRow 
        icon={Clock} 
        label="Age" 
        value={formatAge(gadget.purchase_date)} 
      />
      <InfoRow 
        icon={Calendar} 
        label="Purchase Date" 
        value={format(parseISO(gadget.purchase_date), 'MMMM d, yyyy')} 
      />
      <InfoRow 
        icon={DollarSign} 
        label="Price Paid" 
        value={gadget.price_paid ? formatPrice(gadget.price_paid, currency) : null} 
      />
      <InfoRow 
        icon={Store} 
        label="Vendor" 
        value={gadget.vendor_name} 
      />
      <InfoRow 
        icon={Hash} 
        label="Order ID" 
        value={gadget.order_id} 
      />
      <InfoRow 
        icon={Hash} 
        label="Serial Number" 
        value={gadget.serial_number} 
      />
      <InfoRow 
        icon={Shield} 
        label="Warranty" 
        value={
          <div className="flex items-center gap-2">
            {getWarrantyBadge()}
            {gadget.warranty_expiry && (
              <span className="text-sm text-muted-foreground">
                (Expires {format(parseISO(gadget.warranty_expiry), 'MMM d, yyyy')})
              </span>
            )}
          </div>
        } 
      />
      <InfoRow 
        icon={Tag} 
        label="Condition" 
        value={getConditionBadge()} 
      />
      {gadget.notes && (
        <InfoRow 
          icon={FileText} 
          label="Notes" 
          value={<p className="text-sm whitespace-pre-wrap">{gadget.notes}</p>} 
        />
      )}
    </div>
  );
};
