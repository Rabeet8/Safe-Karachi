import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background noise-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center">
              <Shield size={20} className="text-danger" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full animate-pulse-danger" />
          </div>
          <div>
            <span className="font-mono text-lg font-bold tracking-wider text-foreground">
              SAFE<span className="text-danger">KARACHI</span>
            </span>
            <div className="text-[10px] text-muted-foreground tracking-wide">Community Safety Network</div>
          </div>
        </Link>

        {signupSuccess ? (
          <div className="bg-card border border-safe/20 rounded-xl p-8 text-center shadow-lg">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-foreground font-semibold text-lg mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
            </p>
            <Button variant="outline" className="mt-5 rounded-lg" onClick={() => { setIsLogin(true); setSignupSuccess(false); }}>
              <ArrowLeft size={14} className="mr-1.5" /> Back to Login
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg shadow-black/30">
            <div className="flex border-b border-border">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-medium transition-all duration-200 ${
                  isLogin ? 'text-foreground bg-secondary/60' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-medium transition-all duration-200 ${
                  !isLogin ? 'text-foreground bg-secondary/60' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    maxLength={50}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-all"
                />
              </div>

              {error && (
                <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-danger hover:bg-danger/90 text-danger-foreground rounded-lg shadow-lg shadow-danger/20 h-11"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Map
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
