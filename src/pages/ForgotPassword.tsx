
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, ArrowRight, Cpu, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const { resetPassword } = useAuth();

    const validateForm = () => {
        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) {
            setError(result.error.errors[0].message);
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const { error } = await resetPassword(email);
            if (error) {
                toast.error(error.message);
            } else {
                setSubmitted(true);
                toast.success('Password reset link sent to your email');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Cpu className="w-7 h-7 text-primary" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">AssetRecord</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl font-bold leading-tight">
                        Recover Your <br />
                        <span className="gradient-text">Access</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-md">
                        Don't worry, it happens. We'll help you get back to tracking your assets in no time.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-muted-foreground flex gap-4">
                    <span>© {new Date().getFullYear()} AssetRecord.</span>
                    <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                    <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Cpu className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold gradient-text">AssetRecord</span>
                    </div>

                    <div className="glass-card rounded-2xl p-8">
                        <div className="mb-8">
                            <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to login
                            </Link>
                            <h2 className="text-2xl font-bold mb-2">
                                Forgot Password?
                            </h2>
                            <p className="text-muted-foreground">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {submitted ? (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-lg">Check your email</h3>
                                <p className="text-muted-foreground text-sm">
                                    We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => setSubmitted(false)}
                                >
                                    Try another email
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-12 bg-secondary/50 border-border/50"
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-sm text-destructive">{error}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 btn-gradient text-primary-foreground font-semibold"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
