import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, PiggyBank, ShieldCheck, Building, Bitcoin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const InvestmentPlan = () => {
    const strategies = [
        {
            title: "Index Funds & ETFs",
            description: "Low-cost funds that track a market index like NIFTY 50 or S&P 500.",
            risk: "Medium",
            return: "8-12%",
            trend: "up",
            icon: TrendingUp,
            details: "Historically one of the most consistent ways to build wealth over the long term. Ideal for beginners and passive investors."
        },
        {
            title: "Gold & Precious Metals",
            description: "A traditional hedge against inflation and economic uncertainty.",
            risk: "Low-Medium",
            return: "6-10%",
            trend: "stable",
            icon: ShieldCheck,
            details: "Recent trends show increased central bank buying, making gold a stable store of value during volatile times."
        },
        {
            title: "Direct Equity (Stocks)",
            description: "Buying shares of individual companies.",
            risk: "High",
            return: "12-18%+",
            trend: "up",
            icon: DollarSign,
            details: "Requires research and active monitoring. Recent market highs suggest caution and focusing on undervalued quality stocks."
        },
        {
            title: "Real Estate (REITs)",
            description: "Invest in commercial real estate without buying property.",
            risk: "Medium",
            return: "8-10%",
            trend: "stable",
            icon: Building,
            details: "Real Estate Investment Trusts (REITs) offer steady dividend income and potential for capital appreciation."
        },
        {
            title: "Cryptocurrency",
            description: "Digital currencies like Bitcoin and Ethereum.",
            risk: "Very High",
            return: "Volatile",
            trend: "down",
            icon: Bitcoin,
            details: "High risk, high reward. Recent regulatory changes globally make this a volatile but potentially lucrative asset class. Invest only what you can afford to lose."
        },
        {
            title: "Fixed Deposits & Govt Bonds",
            description: "Safe and guaranteed returns.",
            risk: "Very Low",
            return: "6-7.5%",
            trend: "stable",
            icon: PiggyBank,
            details: "Ideal for emergency funds or short-term goals where capital protection is priority over high growth."
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-bold gradient-text">Smart Investment & Savings Plan</h1>
                    <p className="text-muted-foreground text-lg">
                        Strategic wealth creation based on current market trends and personalized goals.
                    </p>
                </motion.div>

                {/* Disclaimer Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important Disclaimer</AlertTitle>
                        <AlertDescription>
                            All investments carry risks. Past performance is not indicative of future results.
                            We provide these recommendations based on general market trends, but we are
                            <strong> not liable</strong> for any capital loss incurred. Please consult a
                            certified financial advisor before making significant investment decisions.
                        </AlertDescription>
                    </Alert>
                </motion.div>

                {/* Market Trends Section */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {strategies.map((strategy, index) => (
                        <motion.div
                            key={strategy.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index + 0.3 }}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow border-primary/10 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <strategy.icon className="w-6 h-6" />
                                        </div>
                                        {strategy.trend === 'up' && <Badge variant="default" className="bg-green-500/15 text-green-600 border-green-200">Bullish</Badge>}
                                        {strategy.trend === 'down' && <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-red-200">Bearish</Badge>}
                                        {strategy.trend === 'stable' && <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 border-blue-200">Stable</Badge>}
                                    </div>
                                    <CardTitle className="pt-4 text-xl">{strategy.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <CardDescription className="text-sm font-medium">
                                        {strategy.description}
                                    </CardDescription>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs">Risk Level</span>
                                            <span className={`font-semibold ${strategy.risk.includes('High') ? 'text-destructive' :
                                                    strategy.risk.includes('Medium') ? 'text-yellow-600' : 'text-green-600'
                                                }`}>
                                                {strategy.risk}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs">Exp. Return</span>
                                            <span className="font-semibold text-primary">{strategy.return}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {strategy.details}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Action Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Start Your Wealth Journey</h3>
                            <p className="text-muted-foreground max-w-2xl">
                                The best time to start investing was yesterday. The second best time is today.
                                Begin by creating an emergency fund, then diversify based on your risk appetite.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default InvestmentPlan;
