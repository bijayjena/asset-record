import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import GadgetCard from '@/components/gadgets/GadgetCard';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { fetchGadgets } from '@/lib/supabase-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Gadget,
  calculateAge,
  GadgetCategory,
  getCategoryLabel,
} from '@/types/gadget';
import { Currency } from '@/lib/currency';
import { exportGadgetsToCSV, downloadCSV } from '@/lib/csv-export';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ToggleLeft,
  ToggleRight,
  Download,
} from 'lucide-react';

const CATEGORY_OPTIONS: GadgetCategory[] = [
  'phone', 'laptop', 'tablet', 'watch', 'headphones',
  'tv', 'gaming', 'camera', 'speaker', 'wearable',
  'vehicle', 'real_estate', 'furniture', 'appliance',
  'valuable', 'collectible', 'other'
];

// Static global averages (hardcoded for demo)
const GLOBAL_AVERAGES: Record<GadgetCategory, number> = {
  phone: 24,
  laptop: 36,
  tablet: 30,
  watch: 24,
  headphones: 18,
  tv: 48,
  gaming: 36,
  camera: 42,
  speaker: 30,
  wearable: 18,
  vehicle: 120, // 10 years
  real_estate: 360, // 30 years
  furniture: 120, // 10 years
  appliance: 84, // 7 years
  valuable: 120,
  collectible: 120,
  other: 24,
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [warrantyFilter, setWarrantyFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [useGlobalAvg, setUseGlobalAvg] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const { data: gadgets = [], isLoading, error } = useQuery({
    queryKey: ['gadgets'],
    queryFn: fetchGadgets,
    enabled: !!user,
  });

  const handleExportCSV = () => {
    if (gadgets.length === 0) {
      toast.error('No assets to export');
      return;
    }
    const currency = (profile?.currency as Currency) || 'USD';
    const csvContent = exportGadgetsToCSV(gadgets, currency);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `asset-record-export-${date}.csv`);
    toast.success(`Exported ${gadgets.length} asset${gadgets.length !== 1 ? 's' : ''} to CSV`);
  };

  // Calculate category averages from user's data
  const userCategoryAverages = gadgets.reduce((acc, gadget) => {
    const { totalMonths } = calculateAge(gadget.purchase_date);
    if (!acc[gadget.category]) {
      acc[gadget.category] = { total: 0, count: 0 };
    }
    acc[gadget.category].total += totalMonths;
    acc[gadget.category].count += 1;
    return acc;
  }, {} as Record<GadgetCategory, { total: number; count: number }>);

  const getCategoryAverage = (category: GadgetCategory): number | undefined => {
    if (useGlobalAvg) {
      return GLOBAL_AVERAGES[category];
    }
    const data = userCategoryAverages[category];
    if (!data || data.count < 2) return undefined; // Need at least 2 for meaningful average
    return Math.round(data.total / data.count);
  };

  // Filter and sort gadgets
  const filteredGadgets = gadgets
    .filter((gadget) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          gadget.name.toLowerCase().includes(query) ||
          gadget.brand.toLowerCase().includes(query) ||
          (gadget.model?.toLowerCase().includes(query) || false);
        if (!matches) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && gadget.category !== categoryFilter) {
        return false;
      }

      // Warranty filter
      if (warrantyFilter !== 'all') {
        const hasWarranty = !!gadget.warranty_expiry;
        const isExpired = hasWarranty && new Date(gadget.warranty_expiry!) < new Date();

        if (warrantyFilter === 'active' && (!hasWarranty || isExpired)) return false;
        if (warrantyFilter === 'expired' && !isExpired) return false;
        if (warrantyFilter === 'none' && hasWarranty) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.purchase_date).getTime();
      const dateB = new Date(b.purchase_date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  if (authLoading || isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your entire asset collection
          </p>
        </div>

        {/* Stats */}
        <DashboardStats gadgets={gadgets} />

        {/* Gadgets Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Assets</h2>

            <div className="flex items-center gap-4">
              {/* Export button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={gadgets.length === 0}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>

              {/* Average toggle */}
              <button
                onClick={() => setUseGlobalAvg(!useGlobalAvg)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {useGlobalAvg ? (
                  <ToggleRight className="w-5 h-5 text-primary" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                <span>{useGlobalAvg ? 'Global Avg' : 'My Data'}</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-secondary/50 border-border/50">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={warrantyFilter} onValueChange={setWarrantyFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-secondary/50 border-border/50">
                <SelectValue placeholder="Warranty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warranties</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="none">No Warranty</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="gap-2 bg-secondary/50 border-border/50"
            >
              {sortOrder === 'newest' ? (
                <SortDesc className="w-4 h-4" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
          </div>

          {/* Gadgets Grid */}
          {filteredGadgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGadgets.map((gadget, index) => (
                <GadgetCard
                  key={gadget.id}
                  gadget={gadget}
                  categoryAverageAge={getCategoryAverage(gadget.category)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              {gadgets.length === 0 ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your inventory by adding your first asset
                  </p>
                  <Button
                    onClick={() => navigate('/assets/new')}
                    className="btn-gradient text-primary-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Asset
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No matching assets</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
