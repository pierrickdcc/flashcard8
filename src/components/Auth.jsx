import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'reset'

  const handleAuthAction = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    let error;
    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    } else if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        console.error('Supabase sign-up error:', signUpError);
        error = signUpError;
      } else {
        // With email confirmation disabled, Supabase logs the user in automatically.
      }
    } else if (mode === 'reset') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Or a specific password reset page
      });
      if (resetError) {
        error = resetError;
      } else {
        setMessage('Un email de réinitialisation a été envoyé à votre adresse.');
      }
    }

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0E1116 0%, #161b22 100%)', // Dark theme background
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="auth-container z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(30, 35, 43, 0.8)', // bg-card with opacity
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)', // border color
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 className="logo-text" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#f0f6fc' }}>
              {mode === 'reset' ? 'Réinitialiser' : 'Flash'}
            </h1>
            <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>
              {mode === 'reset' ? 'Entrez votre email pour recevoir un lien.' : 'Apprenez plus intelligemment'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAuthAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" className="label" style={{ color: '#f0f6fc', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Adresse email</label>
            <input
              id="email"
              type="email"
              placeholder="vous@email.com"
              className="input"
              style={{
                width: '100%',
                background: '#0E1116',
                border: '1px solid #30363d',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: '#f0f6fc'
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {mode !== 'reset' && (
            <>
              <div>
                <label htmlFor="password" className="label" style={{ color: '#f0f6fc', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input"
                    style={{
                        width: '100%',
                        background: '#0E1116',
                        border: '1px solid #30363d',
                        borderRadius: '10px',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        color: '#f0f6fc'
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="icon-btn"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#8b949e',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirm-password" className="label" style={{ color: '#f0f6fc', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Confirmer le mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input"
                      style={{
                        width: '100%',
                        background: '#0E1116',
                        border: '1px solid #30363d',
                        borderRadius: '10px',
                        padding: '0.75rem 1rem',
                        color: '#f0f6fc'
                      }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div style={{ textAlign: 'right', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '-0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {error}
            </motion.div>
          )}
          
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '0.75rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                color: '#22c55e',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {message}
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '10px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
            }}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            {loading
              ? (mode === 'reset' ? 'Envoi...' : (mode === 'login' ? 'Connexion...' : 'Inscription...'))
              : (mode === 'reset' ? 'Envoyer le lien' : (mode === 'login' ? 'Se connecter' : "S'inscrire"))
            }
          </motion.button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' || mode === 'reset' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: '500' }}
          >
            {mode === 'login'
              ? "Pas encore de compte ? S'inscrire"
              : mode === 'signup'
                ? "Déjà un compte ? Se connecter"
                : "Retour à la connexion"
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
