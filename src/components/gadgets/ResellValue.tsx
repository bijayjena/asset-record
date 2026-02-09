
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gadget, ResellInfo, AISuggestion } from '@/types/gadget';
import { saveAISuggestion, fetchAISuggestion } from '@/lib/supabase-helpers';
import { useProfile } from '@/hooks/useProfile';
import { getCurrencySymbol } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
    DollarSign,
    TrendingUp,
    RefreshCw,
    Loader2,
    ExternalLink,
    Info,
} from 'lucide-react';

interface ResellValueProps {
    gadget: Gadget;
    cachedSuggestion: AISuggestion | null;
    onSuggestionUpdate: () => void;
}

export const ResellValue = ({
    gadget,
    cachedSuggestion,
    onSuggestionUpdate
}: ResellValueProps) => {
    const { profile } = useProfile();
    const [loading, setLoading] = useState(false);
    const [resellInfo, setResellInfo] = useState<ResellInfo | null>(
        cachedSuggestion?.response_json?.resellInfo || null
    );

    useEffect(() => {
        if (cachedSuggestion?.response_json?.resellInfo) {
            setResellInfo(cachedSuggestion.response_json.resellInfo);
        }
    }, [cachedSuggestion]);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const fetchResellValue = async () => {
        if (!apiKey) {
            toast.error('Gemini API Key is missing.');
            return;
        }

        setLoading(true);

        try {
            const currency = profile?.currency || 'INR';
            const currencySymbol = getCurrencySymbol(currency);
            const purchaseYear = new Date(gadget.purchase_date).getFullYear();

            const prompt = `
Given this gadget: ${gadget.brand} ${gadget.model || gadget.name} (${gadget.category}), purchased in ${purchaseYear}, condition: ${gadget.condition}.
Estimate its current resell value in ${currency}.

Return JSON only with this exact structure:
{
  "estimatedValue": {
    "min": number,
    "max": number,
    "currency": "${currency}"
  },
  "confidence": number, // 0-100 based on data availability
  "platforms": [
    {
      "name": "Platform Name (e.g., eBay, Swappa, Cashify)",
      "estimatedPrice": number,
      "url": "https://www.google.com/search?q=...",
      "notes": "Brief note on fees or speed"
    }
  ],
  "lastUpdated": "${new Date().toISOString()}"
}
Provide 3 realistic platform options.
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
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) throw new Error('No content received from AI');

            const result: ResellInfo = JSON.parse(textContent);

            // Validate structure basics
            if (!result.estimatedValue || !Array.isArray(result.platforms)) {
                throw new Error('Invalid AI response structure');
            }

            // Merge with existing data
            const existingData = await fetchAISuggestion(gadget.id);
            const newResponseJson = {
                ...(existingData?.response_json || {}),
                resellInfo: result
            };

            await saveAISuggestion(gadget.id, newResponseJson);

            setResellInfo(result);
            onSuggestionUpdate();
            toast.success('Resell value updated!');
        } catch (error) {
            console.error('Error fetching resell value:', error);
            toast.error('Failed to estimate resell value');
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const currencySymbol = getCurrencySymbol(profile?.currency || 'INR');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Resell Value Estimator</h3>
                        <p className="text-sm text-muted-foreground">
                            AI-powered price estimation
                        </p>
                    </div>
                </div>

                <Button
                    onClick={fetchResellValue}
                    disabled={loading}
                    variant={resellInfo ? 'outline' : 'default'}
                    className={!resellInfo ? 'btn-gradient text-primary-foreground' : ''}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Estimating...
                        </>
                    ) : resellInfo ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Update
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Get Estimate
                        </>
                    )}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {resellInfo ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Estimated Value Range</p>
                                    <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {currencySymbol}{resellInfo.estimatedValue.min.toLocaleString()} - {currencySymbol}{resellInfo.estimatedValue.max.toLocaleString()}
                                    </h2>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Confidence:</span>
                                        <span className={`font-semibold ${getConfidenceColor(resellInfo.confidence)}`}>
                                            {resellInfo.confidence}%
                                        </span>
                                    </div>
                                    <Progress value={resellInfo.confidence} className="h-1.5 mt-2 max-w-[120px] mx-auto" />
                                </div>
                            </Card>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Top Platforms</h4>
                                {resellInfo.platforms.map((platform, idx) => (
                                    <Card key={idx} className="p-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                                        <div>
                                            <h5 className="font-medium">{platform.name}</h5>
                                            <p className="text-xs text-muted-foreground">{platform.notes}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary">
                                                ~{currencySymbol}{platform.estimatedPrice.toLocaleString()}
                                            </div>
                                            {platform.url && (
                                                <a
                                                    href={platform.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-500 hover:underline flex items-center justify-end gap-1 mt-0.5"
                                                >
                                                    Check <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                            <Info className="w-4 h-4 text-blue-500" />
                            <p>
                                Estimates are based on current market listings for devices in {gadget.condition} condition.
                                Actual value may vary based on local demand and specific buyer preferences.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    !loading && (
                        <Card className="p-8 text-center bg-secondary/30 border-dashed">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                            <h4 className="font-semibold mb-2">What is this asset worth?</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Get an instant AI-powered valuation estimate based on current market data from top reselling platforms.
                            </p>
                        </Card>
                    )
                )}
            </AnimatePresence>
        </div>
    );
};
