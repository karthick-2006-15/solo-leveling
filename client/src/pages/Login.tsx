import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { SystemWindow } from '../components/ui/SystemWindow';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '../api/fetchHelper';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };
      
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    login({
      id: 'mock-google-123',
      name: 'Google Hunter',
      email: 'google@sololeveling.com',
    }, 'mock-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Massive Dungeon Gate Background */}
      <div className="absolute inset-0 overflow-hidden z-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="w-[120vw] h-[120vw] max-w-[1000px] max-h-[1000px] rounded-full opacity-20"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, var(--color-system-blue) 90deg, transparent 180deg, var(--color-system-purple) 270deg, transparent 360deg)',
            filter: 'blur(40px)'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        {/* Core glow */}
        <div className="absolute w-[40vw] h-[40vw] max-w-[300px] max-h-[300px] rounded-full bg-[var(--color-system-blue)] opacity-10 blur-[60px]" />
      </div>

      <div className="w-full max-w-md relative z-10 px-4">
        <SystemWindow 
          variant={isLogin ? 'default' : 'purple'} 
          className="w-full"
          innerClassName="p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-[28px] font-display font-bold text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {isLogin ? 'System Login' : 'Awakening'}
              </h2>
              <p className="font-mono text-[11px] text-[var(--color-system-text-dim)] uppercase tracking-widest mt-2">
                {isLogin ? 'Enter your credentials' : 'Register your presence'}
              </p>
            </div>

            {error && (
              <div className="bg-[rgba(255,51,102,0.1)] border border-[var(--color-system-red)] text-[var(--color-system-red)] text-[12px] font-mono p-3 rounded-[2px] mb-6 text-center uppercase tracking-wider">
                ERROR: {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-[10px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-widest mb-1.5">Hunter Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-[2px] px-4 py-3 text-white font-body text-[14px] focus:outline-none focus:border-[var(--color-system-purple)] focus:bg-[rgba(168,85,247,0.05)] transition-colors"
                    placeholder="Sung Jin-Woo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  className={`w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-[2px] px-4 py-3 text-white font-body text-[14px] focus:outline-none transition-colors ${isLogin ? 'focus:border-[var(--color-system-blue)] focus:bg-[rgba(0,212,255,0.05)]' : 'focus:border-[var(--color-system-purple)] focus:bg-[rgba(168,85,247,0.05)]'}`}
                  placeholder="hunter@system.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-widest mb-1.5">Access Key</label>
                <input 
                  type="password" 
                  className={`w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-[2px] px-4 py-3 text-white font-body text-[14px] tracking-widest focus:outline-none transition-colors ${isLogin ? 'focus:border-[var(--color-system-blue)] focus:bg-[rgba(0,212,255,0.05)]' : 'focus:border-[var(--color-system-purple)] focus:bg-[rgba(168,85,247,0.05)]'}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <PrimaryButton type="submit" fullWidth variant={isLogin ? 'primary' : 'purple'} disabled={isLoading}>
                  {isLoading ? 'PROCESSING...' : (isLogin ? 'ENTER SYSTEM' : 'AWAKEN')}
                </PrimaryButton>
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="h-[1px] flex-grow bg-[rgba(255,255,255,0.1)]"></div>
              <span className="font-mono text-[10px] text-[var(--color-system-text-dim)] uppercase">Or</span>
              <div className="h-[1px] flex-grow bg-[rgba(255,255,255,0.1)]"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full mt-6 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-display uppercase tracking-widest text-[12px] font-bold rounded-[3px] px-6 py-3 flex items-center justify-center gap-3 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              CONTINUE WITH GOOGLE
            </button>

            <div className="mt-8 text-center flex flex-col gap-2">
              <span className="font-mono text-[10px] text-[var(--color-system-text-dim)] uppercase tracking-wider">
                {isLogin ? "Not awakened yet?" : "Already a Hunter?"}
              </span>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className={`font-display text-[14px] font-bold uppercase tracking-widest transition-colors ${isLogin ? 'text-[var(--color-system-purple)] hover:text-white' : 'text-[var(--color-system-blue)] hover:text-white'}`}
              >
                {isLogin ? 'INITIATE AWAKENING' : 'RETURN TO SYSTEM'}
              </button>
            </div>
          </motion.div>
        </SystemWindow>
      </div>
    </div>
  );
};
