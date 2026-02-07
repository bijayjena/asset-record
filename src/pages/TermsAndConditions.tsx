
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-xl gradient-text">AssetRecord</span>
                    </Link>
                    <Button variant="ghost" asChild>
                        <Link to="/" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                    </Button>
                </div>
            </nav>

            {/* Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

                <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
                        <p>
                            By accessing and using AssetRecord ("the Application"), you agree to be bound by these Terms and Conditions.
                            If you disagree with any meaningful part of the terms, then you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                        <p>
                            AssetRecord provides tools for tracking and managing personal assets, including details such as purchase dates, warranty information, and cost.
                            We reserve the right to modify or discontinue the service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                        <p>
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                        <p>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
                        <p>
                            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of AssetRecord and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Limitation of Liability</h2>
                        <p>
                            In no event shall AssetRecord, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">6. Changes to Terms</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                            What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-border/50 bg-background/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} AssetRecord. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default TermsAndConditions;
