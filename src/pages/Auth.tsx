import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="relative">
            <Shield size={28} className="text-danger" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full animate-pulse-danger" />
          </div>
          <span className="font-mono text-lg font-bold tracking-wider text-foreground">
            SAFE<span className="text-danger">KARACHI</span>
          </span>
        </Link>

        {signupSuccess ? (
          <div className="bg-card border border-safe/30 rounded-md p-6 text-center">
            <div className="text-4xl mb-3">✉️</div>
            <h2 className="text-foreground font-semibold mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => { setIsLogin(true); setSignupSuccess(false); }}>
              Back to Login
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-md overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
                  isLogin ? 'text-foreground bg-secondary' : 'text-muted-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${
                  !isLogin ? 'text-foreground bg-secondary' : 'text-muted-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    maxLength={50}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground"
                />
              </div>

              {error && (
                <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-danger hover:bg-danger/90 text-danger-foreground"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
