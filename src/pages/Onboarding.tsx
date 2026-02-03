import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { seedDemoGadgets } from '@/lib/supabase-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, User, Sparkles, BookOpen, Package, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'welcome' | 'profile' | 'tutorial' | 'demo-data' | 'complete';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('welcome');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [wantsTutorial, setWantsTutorial] = useState(false);
  const [wantsDemoData, setWantsDemoData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSubmit = () => {
    if (!fullName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
      toast.error('Please enter a valid age (13-120)');
      return;
    }
    setStep('tutorial');
  };

  const handleTutorialChoice = (wants: boolean) => {
    setWantsTutorial(wants);
    setStep('demo-data');
  };

  const handleDemoDataChoice = (wants: boolean) => {
    setWantsDemoData(wants);
    setStep('complete');
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Update profile with collected info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          age: parseInt(age),
          wants_tutorial: wantsTutorial,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Seed demo gadgets if user wants them
      if (wantsDemoData) {
        await seedDemoGadgets(user.id);
      }

      // Invalidate profile cache so ProtectedRoute sees the update
      await queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast.success('Welcome to AssetRecord!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Cpu className="w-7 h-7 text-primary" />
          </div>
          <span className="text-2xl font-bold gradient-text">AssetRecord</span>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {['welcome', 'profile', 'tutorial', 'demo-data', 'complete'].map((s, i) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${['welcome', 'profile', 'tutorial', 'demo-data', 'complete'].indexOf(step) >= i
                ? 'bg-primary'
                : 'bg-secondary'
                }`}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Welcome to AssetRecord!</h1>
                  <p className="text-muted-foreground">
                    Let's set up your personal asset record in just a few steps.
                  </p>
                </div>
                <Button
                  onClick={() => setStep('profile')}
                  className="btn-gradient text-primary-foreground w-full h-12"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 'profile' && (
              <motion.div
                key="profile"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">Tell us about yourself</h2>
                  <p className="text-sm text-muted-foreground">
                    This helps us personalize your experience and recommendations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      min={13}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for age-appropriate upgrade recommendations
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleProfileSubmit}
                  className="btn-gradient text-primary-foreground w-full h-12"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 'tutorial' && (
              <motion.div
                key="tutorial"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">Would you like a quick tour?</h2>
                  <p className="text-sm text-muted-foreground">
                    We can show you around AssetRecord's key features.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleTutorialChoice(false)}
                    className="h-16 flex flex-col gap-1"
                  >
                    <span>Skip for now</span>
                    <span className="text-xs text-muted-foreground">I'll explore myself</span>
                  </Button>
                  <Button
                    onClick={() => handleTutorialChoice(true)}
                    className="btn-gradient text-primary-foreground h-16 flex flex-col gap-1"
                  >
                    <span>Show me around</span>
                    <span className="text-xs opacity-80">Quick 2-min tour</span>
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'demo-data' && (
              <motion.div
                key="demo-data"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">Add sample assets?</h2>
                  <p className="text-sm text-muted-foreground">
                    We can add a few example assets so you can see how the dashboard looks.
                  </p>
                </div>

                <div className="glass-card p-4 space-y-2 text-sm">
                  <p className="font-medium">Sample assets include:</p>
                  <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>iPhone 13 (Phone)</li>
                    <li>MacBook Pro 14" (Laptop)</li>
                    <li>AirPods Pro 2 (Headphones)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDemoDataChoice(false)}
                    className="h-12"
                  >
                    Start empty
                  </Button>
                  <Button
                    onClick={() => handleDemoDataChoice(true)}
                    className="btn-gradient text-primary-foreground h-12"
                  >
                    Add samples
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                key="complete"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">You're all set, {fullName.split(' ')[0]}!</h2>
                  <p className="text-sm text-muted-foreground">
                    Your AssetRecord is ready. Let's start tracking your assets!
                  </p>
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="btn-gradient text-primary-foreground w-full h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Enter AssetRecord
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
