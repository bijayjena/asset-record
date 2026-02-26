import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Gadget,
  calculateAge,
  getCategoryIcon,
  getCategoryLabel,
  getWarrantyStatus,
  GadgetCategory,
} from '@/types/gadget';
import {
  Cpu,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';

interface DashboardStatsProps {
  gadgets: Gadget[];
  globalAverages?: Record<GadgetCategory, number>;
}

const DashboardStats = ({ gadgets, globalAverages }: DashboardStatsProps) => {
  const stats = useMemo(() => {
    if (gadgets.length === 0) {
      return {
        totalGadgets: 0,
        averageAge: 0,
        oldestGadget: null as Gadget | null,
        expiringWarranties: [] as Gadget[],
        categoryData: [] as { category: string; count: number; avgAge: number }[],
        deviceAgeData: [] as { name: string; actualAge: number; averageAge: number; category: GadgetCategory }[],
      };
    }

    // Calculate ages
    const gadgetsWithAge = gadgets.map((g) => ({
      ...g,
      ageMonths: calculateAge(g.purchase_date).totalMonths,
    }));

    // Average age
    const totalAge = gadgetsWithAge.reduce((sum, g) => sum + g.ageMonths, 0);
    const averageAge = totalAge / gadgets.length;

    // Oldest gadget
    const oldestGadget = gadgetsWithAge.reduce((oldest, g) =>
      g.ageMonths > (oldest?.ageMonths || 0) ? g : oldest
      , gadgetsWithAge[0]);

    // Warranties expiring soon
    const expiringWarranties = gadgets.filter(
      (g) => getWarrantyStatus(g.warranty_expiry) === 'expiring'
    );

    // Category breakdown
    const categoryMap = new Map<GadgetCategory, { count: number; totalAge: number }>();
    gadgetsWithAge.forEach((g) => {
      const current = categoryMap.get(g.category) || { count: 0, totalAge: 0 };
      categoryMap.set(g.category, {
        count: current.count + 1,
        totalAge: current.totalAge + g.ageMonths,
      });
    });

    const categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category: getCategoryLabel(category),
        icon: getCategoryIcon(category),
        count: data.count,
        avgAge: Math.round(data.totalAge / data.count),
      }))
      .sort((a, b) => b.count - a.count);

    // Device age data for the chart (individual devices with actual vs average age)
    const deviceAgeData = gadgetsWithAge
      .map((g) => ({
        name: g.name,
        actualAge: g.ageMonths,
        averageAge: globalAverages?.[g.category] || 0,
        category: g.category,
      }))
      .sort((a, b) => b.actualAge - a.actualAge)
      .slice(0, 10); // Show top 10 devices

    return {
      totalGadgets: gadgets.length,
      averageAge: Math.round(averageAge),
      oldestGadget,
      expiringWarranties,
      categoryData,
      deviceAgeData,
    };
  }, [gadgets, globalAverages]);

  const formatAgeDisplay = (months: number) => {
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years}y`;
    return `${years}y ${remainingMonths}mo`;
  };

  const chartColors = [
    'hsl(var(--primary))',
    'hsl(var(--gv-info))',
    'hsl(var(--gv-success))',
    'hsl(var(--gv-warning))',
    'hsl(173 60% 35%)',
    'hsl(199 70% 40%)',
  ];

  return (
    <div className="space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="h-full"
        >
          <Card className="stat-card h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Assets</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalGadgets}</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="h-full"
        >
          <Card className="stat-card h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gv-info/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gv-info" />
              </div>
              <span className="text-sm text-muted-foreground">Average Age</span>
            </div>
            <div className="text-3xl font-bold">
              {stats.averageAge > 0 ? formatAgeDisplay(stats.averageAge) : '-'}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <Card className="stat-card h-full flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gv-warning/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gv-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Oldest Asset</span>
            </div>
            <div>
              <div className="text-lg font-bold truncate">
                {stats.oldestGadget?.name || '-'}
              </div>
              {stats.oldestGadget && (
                <div className="text-sm text-muted-foreground">
                  {formatAgeDisplay(calculateAge(stats.oldestGadget.purchase_date).totalMonths)}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="h-full"
        >
          <Card className={`stat-card h-full flex flex-col justify-between ${stats.expiringWarranties.length > 0 ? 'border-gv-warning/50' : ''}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.expiringWarranties.length > 0 ? 'bg-gv-warning/20' : 'bg-gv-success/20'
                }`}>
                <AlertTriangle className={`w-5 h-5 ${stats.expiringWarranties.length > 0 ? 'text-gv-warning' : 'text-gv-success'
                  }`} />
              </div>
              <span className="text-sm text-muted-foreground">Warranties Expiring</span>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {stats.expiringWarranties.length}
              </div>
              {stats.expiringWarranties.length > 0 && (
                <div className="text-sm text-gv-warning mt-1 truncate">
                  {stats.expiringWarranties.map(g => g.name).slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Device age comparison chart */}
      {stats.deviceAgeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Asset Age Comparison</h3>
                <p className="text-sm text-muted-foreground">Actual age vs. typical ownership duration</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
                <span className="text-muted-foreground">Your Asset Age</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--gv-info))' }}></div>
                <span className="text-muted-foreground">Typical Ownership</span>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.deviceAgeData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => formatAgeDisplay(value)}
                    label={{ 
                      value: 'Age', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-card rounded-lg px-3 py-2 text-sm">
                            <p className="font-medium mb-1">{data.name}</p>
                            <p className="text-primary">
                              Your Asset: {formatAgeDisplay(data.actualAge)}
                            </p>
                            <p className="text-gv-info">
                              Typical: {formatAgeDisplay(data.averageAge)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="actualAge" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="averageAge" fill="hsl(var(--gv-info))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardStats;
