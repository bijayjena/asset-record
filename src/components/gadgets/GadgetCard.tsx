import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Gadget, 
  formatAge, 
  getCategoryIcon, 
  getCategoryLabel,
  getConditionLabel,
  getWarrantyStatus,
  calculateAge,
} from '@/types/gadget';
import { Calendar, ChevronRight, Shield, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface GadgetCardProps {
  gadget: Gadget;
  categoryAverageAge?: number;
  index?: number;
}

const GadgetCard = ({ gadget, categoryAverageAge, index = 0 }: GadgetCardProps) => {
  const navigate = useNavigate();
  const warrantyStatus = getWarrantyStatus(gadget.warranty_expiry);
  const { totalMonths } = calculateAge(gadget.purchase_date);
  
  // Age comparison
  let ageComparison: 'younger' | 'average' | 'older' = 'average';
  if (categoryAverageAge !== undefined) {
    const diff = totalMonths - categoryAverageAge;
    if (diff < -3) ageComparison = 'younger';
    else if (diff > 3) ageComparison = 'older';
  }

  const conditionClass = `condition-${gadget.condition}`;
  const warrantyClass = warrantyStatus !== 'none' ? `warranty-${warrantyStatus}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card 
        className="glass-card p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
        onClick={() => navigate(`/gadgets/${gadget.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {gadget.image_url ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/50 flex-shrink-0">
                <img 
                  src={gadget.image_url} 
                  alt={gadget.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">${getCategoryIcon(gadget.category)}</div>`;
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {getCategoryIcon(gadget.category)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {gadget.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {gadget.brand} {gadget.model && `• ${gadget.model}`}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getCategoryLabel(gadget.category)}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Age with comparison */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatAge(gadget.purchase_date)}</span>
            </div>
            {categoryAverageAge !== undefined && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full age-${ageComparison}`}>
                {ageComparison === 'younger' && <TrendingDown className="w-3 h-3" />}
                {ageComparison === 'average' && <Minus className="w-3 h-3" />}
                {ageComparison === 'older' && <TrendingUp className="w-3 h-3" />}
                <span>
                  {ageComparison === 'younger' && 'Below avg'}
                  {ageComparison === 'average' && 'Average'}
                  {ageComparison === 'older' && 'Above avg'}
                </span>
              </div>
            )}
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${conditionClass} text-xs`}>
              {getConditionLabel(gadget.condition)}
            </Badge>
            
            {warrantyStatus !== 'none' && (
              <Badge variant="outline" className={`${warrantyClass} text-xs`}>
                <Shield className="w-3 h-3 mr-1" />
                {warrantyStatus === 'active' && 'Warranty Active'}
                {warrantyStatus === 'expiring' && 'Expiring Soon'}
                {warrantyStatus === 'expired' && 'Warranty Expired'}
              </Badge>
            )}
          </div>

          {/* View details button */}
          <Button 
            variant="ghost" 
            className="w-full mt-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default GadgetCard;
