import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gadget, AISuggestion, AIResponse, AIAlternative } from '@/types/gadget';
import { fetchAISuggestion, saveAISuggestion } from '@/lib/supabase-helpers';
import { useProfile } from '@/hooks/useProfile';
import { getCurrencySymbol } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  TrendingUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  DollarSign,
  Target,
  Zap,
  User,
} from 'lucide-react';

interface AISuggestionsProps {
  gadget: Gadget;
  cachedSuggestion: AISuggestion | null;
  onSuggestionUpdate: () => void;
}

export const AISuggestions = ({ 
  gadget, 
  cachedSuggestion, 
  onSuggestionUpdate 
}: AISuggestionsProps) => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(
    cachedSuggestion?.response_json || null
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    cachedSuggestion?.created_at || null
  );

  const purchaseYear = new Date(gadget.purchase_date).getFullYear();

  const fetchSuggestions = async () => {
    setLoading(true);
    
    try {
      // Get user's preferred currency
      const currency = profile?.currency || 'USD';
      const currencySymbol = getCurrencySymbol(currency);
      
      // Build personalized context from user profile
      const userContext = profile?.full_name && profile?.age 
        ? `The user is ${profile.full_name}, aged ${profile.age}. Consider their age group when making recommendations (e.g., younger users may prefer gaming/social features, older users may prefer simplicity/accessibility).`
        : '';

      const prompt = `${userContext}

Given this gadget: ${gadget.brand} ${gadget.model || gadget.name} (${gadget.category}), purchased in ${purchaseYear}, suggest best upgrade alternatives available now. Consider current market offerings and value for money. Use ${currency} (${currencySymbol}) for all prices. Return JSON only with this exact structure:
{
  "verdict": "Upgrade Now" or "Wait" or "Keep",
  "summary": "Brief explanation of the verdict${profile?.full_name ? `, addressing ${profile.full_name.split(' ')[0]} personally` : ''}",
  "alternatives": [
    {
      "name": "Product Name",
      "priceRange": "${currencySymbol}XXX - ${currencySymbol}XXX",
      "whyBetter": ["reason1", "reason2"],
      "bestFor": ["use case 1", "use case 2"],
      "upgradeScore": 0-100
    }
  ]
}
Provide 3-5 realistic alternatives with prices in ${currency}.`;

      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a tech expert helping users decide on gadget upgrades. Always respond with valid JSON only, no markdown formatting.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await res.json();
      let content = data.choices[0]?.message?.content || '';
      
      // Clean up response - remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const aiResponse: AIResponse = JSON.parse(content);
      
      // Validate response structure
      if (!aiResponse.verdict || !aiResponse.summary || !Array.isArray(aiResponse.alternatives)) {
        throw new Error('Invalid AI response structure');
      }

      // Save to database
      await saveAISuggestion(gadget.id, aiResponse);
      
      setResponse(aiResponse);
      setLastUpdated(new Date().toISOString());
      onSuggestionUpdate();
      toast.success('AI suggestions updated!');
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast.error('Failed to get AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'Upgrade Now':
        return { 
          icon: TrendingUp, 
          color: 'text-green-400',
          bg: 'bg-green-500/20 border-green-500/30',
        };
      case 'Wait':
        return { 
          icon: Clock, 
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20 border-yellow-500/30',
        };
      case 'Keep':
        return { 
          icon: ThumbsUp, 
          color: 'text-blue-400',
          bg: 'bg-blue-500/20 border-blue-500/30',
        };
      default:
        return { 
          icon: Minus, 
          color: 'text-muted-foreground',
          bg: 'bg-secondary',
        };
    }
  };

  const getCacheAge = () => {
    if (!lastUpdated) return null;
    const minutes = differenceInMinutes(new Date(), parseISO(lastUpdated));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">AI Upgrade Advisor</h3>
            <p className="text-sm text-muted-foreground">
              {lastUpdated ? `Updated ${getCacheAge()}` : 'Get personalized recommendations'}
            </p>
          </div>
        </div>

        <Button
          onClick={fetchSuggestions}
          disabled={loading}
          variant={response ? 'outline' : 'default'}
          className={!response ? 'btn-gradient text-primary-foreground' : ''}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : response ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Find Alternatives
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Verdict Card */}
            <Card className={`p-6 border-2 ${getVerdictConfig(response.verdict).bg}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getVerdictConfig(response.verdict).bg}`}>
                  {(() => {
                    const Icon = getVerdictConfig(response.verdict).icon;
                    return <Icon className={`w-6 h-6 ${getVerdictConfig(response.verdict).color}`} />;
                  })()}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xl font-bold ${getVerdictConfig(response.verdict).color}`}>
                    {response.verdict}
                  </h4>
                  <p className="text-muted-foreground mt-1">{response.summary}</p>
                </div>
              </div>
            </Card>

            {/* Alternatives */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Recommended Alternatives</h4>
              
              <div className="grid gap-4">
                {response.alternatives.map((alt, index) => (
                  <AlternativeCard key={index} alternative={alt} rank={index + 1} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!response && !loading && (
        <Card className="p-8 text-center bg-secondary/30 border-dashed">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/50" />
          <h4 className="font-semibold mb-2">No recommendations yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Click "Find Alternatives" to get AI-powered upgrade suggestions for your {gadget.name}
          </p>
        </Card>
      )}
    </div>
  );
};

interface AlternativeCardProps {
  alternative: AIAlternative;
  rank: number;
}

const AlternativeCard = ({ alternative, rank }: AlternativeCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <Card className="p-4 bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-colors">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">#{rank}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h5 className="font-semibold">{alternative.name}</h5>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{alternative.priceRange}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(alternative.upgradeScore)}`}>
                  {alternative.upgradeScore}
                </div>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>

            {/* Progress bar */}
            <Progress 
              value={alternative.upgradeScore} 
              className="h-1.5 mt-3"
            />

            {/* Why Better */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium">Why Better:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                {alternative.whyBetter.map((reason, i) => (
                  <li key={i} className="list-disc">{reason}</li>
                ))}
              </ul>
            </div>

            {/* Best For */}
            <div className="flex flex-wrap gap-2 mt-3">
              {alternative.bestFor.map((use, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {use}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
