import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertTriangle,
    TrendingUp,
    DollarSign,
    PiggyBank,
    ShieldCheck,
    Building,
    Bitcoin,
    Sparkles,
    Loader2,
    PieChart,
    Target,
    ArrowRight
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

interface Allocation {
    category: string;
    percentage: string;
    reason: string;
    actionable_steps: string[];
}

interface InvestmentPlanResponse {
    summary: string;
    allocations: Allocation[];
    risk_analysis: string;
}

const InvestmentPlan = () => {
    const [monthlySavings, setMonthlySavings] = useState('');
    const [riskTolerance, setRiskTolerance] = useState('Medium');
    const [financialGoal, setFinancialGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<InvestmentPlanResponse | null>(null);

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

    const generateAIPlan = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            toast.error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
            return;
        }

        if (!monthlySavings || !financialGoal) {
            toast.error('Please fill in all fields.');
            return;
        }

        setLoading(true);
        // Reset previous plan to allow re-generation animation
        setPlan(null);

        try {
            const prompt = `
                Act as a professional financial advisor. Create a personalized monthly investment plan for a user with the following profile:
                - Monthly Investable Amount: ${monthlySavings}
                - Risk Tolerance: ${riskTolerance}
                - Primary Financial Goal: ${financialGoal}

                Provide a structured plan with specific asset allocations.
                
                Return ONLY valid JSON with this exact structure:
                {
                    "summary": "A brief, encouraging summary of this strategy (2-3 sentences).",
                    "allocations": [
                        {
                            "category": "Asset Class Name (e.g., Index Funds, Gold, etc.)",
                            "percentage": "Allocated % (e.g., 40%)",
                            "reason": "Why this fits the profile",
                            "actionable_steps": ["Step 1", "Step 2"]
                        }
                    ],
                    "risk_analysis": "A brief analysis of the risks involved in this specific plan."
                }
            `;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: "application/json"
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get AI response');
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textContent) throw new Error('No content received from AI');

            const aiResponse: InvestmentPlanResponse = JSON.parse(textContent);
            setPlan(aiResponse);
            toast.success('Your personalized plan is ready!');

        } catch (error) {
            console.error('Error generating plan:', error);
            toast.error('Failed to generate plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <SEO title="Investment Plan" description="AI-powered investment advice and planning." />
            <div className="space-y-8 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-bold gradient-text">Smart Investment & Savings Plan</h1>
                    <p className="text-muted-foreground text-lg">
                        Strategic wealth creation powered by AI and market trends.
                    </p>
                </motion.div>

                {/* AI Planner Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
                        <CardHeader className="border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/20">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>AI Wealth Planner</CardTitle>
                                    <CardDescription>Get a personalized monthly investment strategy in seconds.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Monthly Savings</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Eg. 5000"
                                            className="pl-9"
                                            value={monthlySavings}
                                            onChange={(e) => setMonthlySavings(e.target.value)}
                                            type="number"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Risk Tolerance</Label>
                                    <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low - Safety First</SelectItem>
                                            <SelectItem value="Medium">Medium - Balanced</SelectItem>
                                            <SelectItem value="High">High - Growth Dependent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Financial Goal</Label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Eg. Buy a house in 5 years"
                                            className="pl-9"
                                            value={financialGoal}
                                            onChange={(e) => setFinancialGoal(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={generateAIPlan}
                                disabled={loading}
                                className="w-full md:w-auto btn-gradient text-primary-foreground min-w-[200px]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing Market Data...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate My Plan
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* AI Results Display */}
                <AnimatePresence>
                    {plan && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <PieChart className="w-5 h-5 text-primary" />
                                                    Your Recommended Portfolio
                                                </h3>
                                                <p className="text-muted-foreground mt-2">{plan.summary}</p>
                                            </div>

                                            <div className="space-y-3">
                                                {plan.allocations.map((alloc, idx) => (
                                                    <div key={idx} className="bg-card/50 p-4 rounded-lg border border-border/50">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-semibold text-foreground">{alloc.category}</span>
                                                            <Badge variant="outline" className="text-primary border-primary/30 font-bold">
                                                                {alloc.percentage}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-3">{alloc.reason}</p>
                                                        <div className="space-y-1">
                                                            {alloc.actionable_steps.map((step, stepIdx) => (
                                                                <div key={stepIdx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <ArrowRight className="w-3 h-3 text-primary/70" />
                                                                    {step}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                                                <h4 className="text-sm font-semibold text-yellow-600 mb-1 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> Risk Analysis
                                                </h4>
                                                <p className="text-xs text-muted-foreground">{plan.risk_analysis}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                <div className="flex items-center gap-4 py-4">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-sm font-medium text-muted-foreground">General Market Strategies</span>
                    <div className="h-px bg-border flex-1" />
                </div>

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
