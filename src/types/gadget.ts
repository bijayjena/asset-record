export type GadgetCategory =
  | 'phone'
  | 'laptop'
  | 'tablet'
  | 'watch'
  | 'headphones'
  | 'tv'
  | 'gaming'
  | 'camera'
  | 'speaker'
  | 'wearable'
  | 'vehicle'
  | 'real_estate'
  | 'furniture'
  | 'appliance'
  | 'valuable'
  | 'collectible'
  | 'other';

export type GadgetCondition = 'excellent' | 'good' | 'okay' | 'bad';

export type AttachmentType = 'bill' | 'warranty' | 'photo' | 'other';

export interface Gadget {
  id: string;
  user_id: string;
  name: string;
  category: GadgetCategory;
  brand: string;
  model: string | null;
  purchase_date: string;
  price_paid: number | null;
  vendor_name: string | null;
  order_id: string | null;
  warranty_expiry: string | null;
  condition: GadgetCondition;
  serial_number: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  gadget_id: string;
  type: AttachmentType;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export interface AISuggestion {
  id: string;
  gadget_id: string;
  response_json: AIResponse;
  created_at: string;
}

export interface AIResponse {
  verdict: 'Upgrade Now' | 'Wait' | 'Keep';
  summary: string;
  alternatives: AIAlternative[];
}

export interface AIAlternative {
  name: string;
  priceRange: string;
  whyBetter: string[];
  bestFor: string[];
  upgradeScore: number;
}

export interface CategoryStats {
  category: GadgetCategory;
  count: number;
  averageAge: number;
}

// Helper to calculate gadget age
export const calculateAge = (purchaseDate: string): { years: number; months: number; totalMonths: number } => {
  const purchase = new Date(purchaseDate);
  const now = new Date();

  let years = now.getFullYear() - purchase.getFullYear();
  let months = now.getMonth() - purchase.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, totalMonths: years * 12 + months };
};

export const formatAge = (purchaseDate: string): string => {
  const { years, months } = calculateAge(purchaseDate);

  if (years === 0 && months === 0) return 'Brand new';
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''} old`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''} old`;

  return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} old`;
};

export const getCategoryIcon = (category: GadgetCategory): string => {
  const icons: Record<GadgetCategory, string> = {
    phone: '📱',
    laptop: '💻',
    tablet: '📲',
    watch: '⌚',
    headphones: '🎧',
    tv: '📺',
    gaming: '🎮',
    camera: '📷',
    speaker: '🔊',
    wearable: '⌚',
    vehicle: '🚗',
    real_estate: '🏠',
    furniture: '🪑',
    appliance: '🧺',
    valuable: '💎',
    collectible: '🏺',
    other: '📦',
  };
  return icons[category] || '📦';
};

export const getCategoryLabel = (category: GadgetCategory): string => {
  const labels: Record<GadgetCategory, string> = {
    phone: 'Phone',
    laptop: 'Laptop',
    tablet: 'Tablet',
    watch: 'Watch',
    headphones: 'Headphones',
    tv: 'TV',
    gaming: 'Gaming',
    camera: 'Camera',
    speaker: 'Speaker',
    wearable: 'Wearable',
    vehicle: 'Vehicle',
    real_estate: 'Real Estate',
    furniture: 'Furniture',
    appliance: 'Appliance',
    valuable: 'Valuable',
    collectible: 'Collectible',
    other: 'Other',
  };
  return labels[category] || 'Other';
};

export const getConditionLabel = (condition: GadgetCondition): string => {
  const labels: Record<GadgetCondition, string> = {
    excellent: 'Excellent',
    good: 'Good',
    okay: 'Okay',
    bad: 'Bad',
  };
  return labels[condition];
};

export const getWarrantyStatus = (warrantyExpiry: string | null): 'active' | 'expired' | 'expiring' | 'none' => {
  if (!warrantyExpiry) return 'none';

  const expiry = new Date(warrantyExpiry);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (expiry < now) return 'expired';
  if (expiry <= thirtyDaysFromNow) return 'expiring';
  return 'active';
};
