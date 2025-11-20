import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    let error;
    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    } else if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
    } else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (resetError) error = resetError;
        else setMessage('Email de réinitialisation envoyé.');
    }

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-body)] overflow-hidden relative font-sans">
      <AnimatedBackground variant="default" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-[420px] bg-[var(--bg-card)]/60 backdrop-blur-2xl border border-white/10 rounded-[24px] p-10 shadow-2xl z-10 relative overflow-hidden"
      >
        {/* Subtle shine effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-gradient)] flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6 rotate-3 hover:rotate-6 transition-transform duration-300">
             <Zap className="text-white" size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight text-center">Flash</h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm text-center font-medium">Votre mémoire, superchargée.</p>
        </div>

        <form onSubmit={handleAuthAction} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-body)]/50 border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-sm font-medium"
              placeholder="nom@exemple.com"
            />
          </div>

          {mode !== 'reset' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-body)]/50 border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all pr-12 text-sm font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-4 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium text-center border border-red-500/20 leading-relaxed"
            >
              {error}
            </motion.div>
          )}
          
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium text-center border border-emerald-500/20 leading-relaxed"
            >
              {message}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -5px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-4 rounded-xl bg-[var(--primary-gradient)] text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">
              {loading ? 'Chargement...' : (mode === 'reset' ? 'Envoyer le lien' : (mode === 'login' ? 'Se connecter' : "Créer un compte"))}
            </span>
          </motion.button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center">
            {mode === 'login' && (
                 <button
                    onClick={() => setMode('reset')}
                    className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                 >
                    Mot de passe oublié ?
                 </button>
            )}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-[var(--text-main)] font-semibold hover:text-[var(--primary)] transition-colors"
          >
            {mode === 'login' ? (
                <span>Pas de compte ? <span className="text-indigo-400">Créer un profil</span></span>
            ) : (
                <span>Déjà membre ? <span className="text-indigo-400">Se connecter</span></span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
