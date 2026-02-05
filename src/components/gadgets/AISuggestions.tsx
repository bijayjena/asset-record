import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gadget, AISuggestion, AIResponse, AIAlternative } from '@/types/gadget';
import { saveAISuggestion } from '@/lib/supabase-helpers';
import { useProfile } from '@/hooks/useProfile';
import { getCurrencySymbol } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { parseISO, differenceInMinutes } from 'date-fns';
import {
  Sparkles,
  RefreshCw,
  Loader2,
  TrendingUp,
  Clock,
  ThumbsUp,
  Minus,
  DollarSign,
  Target,
  Zap,
  Settings,
  ExternalLink,
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

  // Configuration State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const [gender, setGender] = useState<string>('');
  const [tempAge, setTempAge] = useState<string>('');

  // New Filter States
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [issues, setIssues] = useState<string>('');

  useEffect(() => {
    // Pre-fill age if available
    if (profile?.age) setTempAge(profile.age.toString());
  }, [profile]);

  const handleStartAnalysis = () => {
    // Check for API Key in env
    if (!apiKey) {
      toast.error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    // Always show config modal to confirm budget/issues
    setShowConfigModal(true);
  };

  const handleConfigSubmit = () => {
    if (!gender) {
      toast.error('Please select your gender');
      return;
    }
    if (!tempAge || parseInt(tempAge) < 13) {
      toast.error('Please enter a valid age');
      return;
    }
    if (!budgetMax) {
      toast.error('Please enter a maximum budget');
      return;
    }

    setShowConfigModal(false);
    fetchSuggestions();
  };

  const fetchSuggestions = async () => {
    if (!apiKey) {
      toast.error('Gemini API Key is missing.');
      return;
    }

    setLoading(true);

    try {
      const currency = profile?.currency || 'INR';
      const currencySymbol = getCurrencySymbol(currency);
      const purchaseYear = new Date(gadget.purchase_date).getFullYear();

      const userContext = `The user is ${profile?.full_name || 'a tech enthusiast'}, aged ${tempAge}, gender: ${gender}.`;

      let constraintText = `Budget Range: ${budgetMin ? currencySymbol + budgetMin + ' - ' : ''}${currencySymbol}${budgetMax}.`;
      if (issues) {
        constraintText += `\nCurrent Issues Faced: ${issues}. Prioritize alternatives that solve these issues.`;
      }

      const prompt = `${userContext}

Given this gadget: ${gadget.brand} ${gadget.model || gadget.name} (${gadget.category}), purchased in ${purchaseYear}, suggest best upgrade alternatives available now. 
${constraintText}

Consider the user's age and gender for tailored recommendations (e.g., style preferences, ease of use, technical depth).
Consider current market offerings and value for money within the budget. 
Use ${currency} (${currencySymbol}) for all prices.

Return JSON only with this exact structure:
{
  "verdict": "Upgrade Now" or "Wait" or "Keep",
  "summary": "Brief explanation of the verdict, addressing the user personally.",
  "alternatives": [
    {
      "name": "Product Name",
      "priceRange": "${currencySymbol}XXX - ${currencySymbol}XXX",
      "whyBetter": ["reason1", "reason2"],
      "bestFor": ["use case 1", "use case 2"],
      "upgradeScore": 0-100,
      "url": "https://www.google.com/search?q=Product+Name+buy" 
    }
  ]
}
For the "url" field, generate a valid Google Search URL for buying the product (e.g., https://www.google.com/search?q=iPhone+15+buy).
Provide 3-5 realistic alternatives.`;

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
        console.error('Gemini API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to get AI response');
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) throw new Error('No content received from AI');

      const aiResponse: AIResponse = JSON.parse(textContent);

      // Validate response structure
      if (!aiResponse.verdict || !Array.isArray(aiResponse.alternatives)) {
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
      toast.error(error instanceof Error ? error.message : 'Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'Upgrade Now': return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' };
      case 'Wait': return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' };
      case 'Keep': return { icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
      default: return { icon: Minus, color: 'text-muted-foreground', bg: 'bg-secondary' };
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

        <div className="flex gap-2">
          {response && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfigModal(true)}
              title="Update Preferences"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={handleStartAnalysis}
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
      </div>

      <AnimatePresence mode="wait">
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className={`p-6 border-2 ${getVerdictConfig(response.verdict).bg}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-background/50`}>
                  {(() => {
                    const Icon = getVerdictConfig(response.verdict).icon;
                    return <Icon className={`w-6 h-6 ${getVerdictConfig(response.verdict).color}`} />;
                  })()}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xl font-bold ${getVerdictConfig(response.verdict).color}`}>
                    {response.verdict}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{response.summary}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Recommended Alternatives
              </h4>

              <div className="grid gap-4">
                {response.alternatives.map((alt, index) => (
                  <AlternativeCard key={index} alternative={alt} rank={index + 1} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!response && !loading && (
        <Card className="p-8 text-center bg-secondary/30 border-dashed">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/50" />
          <h4 className="font-semibold mb-2">No recommendations yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Click "Find Alternatives" to get AI-powered upgrade suggestions based on your profile and device.
          </p>
        </Card>
      )}

      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customize Recommendations</DialogTitle>
            <DialogDescription>
              Help the AI find the best upgrade for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={13}
                  max={120}
                  value={tempAge}
                  onChange={(e) => setTempAge(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Budget Range ({getCurrencySymbol(profile?.currency || 'INR')})</Label>
              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <Input
                    type="number"
                    placeholder="Min (Optional)"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Input
                    type="number"
                    placeholder="Max (Required)"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues">Current Issues (Optional)</Label>
              <Textarea
                id="issues"
                placeholder="e.g. Battery drains too fast, camera is blurry..."
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                className="h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>Cancel</Button>
            <Button onClick={handleConfigSubmit} className="btn-gradient text-primary-foreground">
              Analyze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface AlternativeCardProps {
  alternative: AIAlternative;
  rank: number;
}

const AlternativeCard = ({ alternative, rank }: AlternativeCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <Card className="p-4 bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">#{rank}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div>
                <h5 className="font-semibold text-lg hover:underline cursor-pointer" onClick={() => alternative.url && window.open(alternative.url, '_blank')}>
                  {alternative.name}
                  {alternative.url && <ExternalLink className="w-3 h-3 inline-block ml-1 opacity-50" />}
                </h5>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground">{alternative.priceRange}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:block sm:text-right">
                <div className="flex items-center gap-2 sm:block">
                  <div className={`text-xl font-bold ${getScoreColor(alternative.upgradeScore)}`}>
                    {alternative.upgradeScore}
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">Match Score</p>
                </div>
                <div className="sm:hidden text-xs text-muted-foreground">Match Score</div>
              </div>
            </div>

            <Progress
              value={alternative.upgradeScore}
              className="h-1.5 mt-3 mb-4"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Zap className="w-3.5 h-3.5" />
                  Why Better?
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-1.5 border-l-2 border-primary/20 pl-3">
                  {alternative.whyBetter.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {alternative.bestFor.map((use, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-background/50">
                    <Target className="w-3 h-3 mr-1 opacity-70" />
                    {use}
                  </Badge>
                ))}
              </div>

              {alternative.url && (
                <div className="pt-2">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => window.open(alternative.url, '_blank')}
                  >
                    View Product <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
