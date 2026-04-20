'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, signup } from '@/controllers/authController';
import { Sun, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    let result;

    if (isLogin) {
      result = await login(formData);
    } else {
      result = await signup(formData);
    }

    if (result?.success === false) {
      setError(result.message);
      setLoading(false);
    }
    // If success, the controller will redirect, so no need to set loading to false here
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-surface-container-low">
      {/* Radiant Horizon Inspiration - Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-primary mx-auto w-fit"
            >
              <Sun size={48} strokeWidth={2.5} />
            </motion.div>
          </Link>
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Begin the Journey'}
          </h1>
          <p className="font-body text-on-surface-variant text-lg">
            Enter the horizon of your next adventure.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border-2 border-white/50 rough-edge relative">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-error-container/20 text-error p-4 rounded-2xl flex items-start gap-3 border border-error/20"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p className="font-body text-sm font-semibold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block font-body font-bold text-on-surface text-sm mb-2">Full Name</label>
                    <input 
                      required={!isLogin}
                      name="full_name"
                      type="text" 
                      placeholder="Jane Doe"
                      className="w-full bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-5 py-3 font-body text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-semibold placeholder:text-on-surface-variant/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-body font-bold text-on-surface text-sm mb-2">Phone</label>
                      <input 
                        required={!isLogin}
                        name="phone_number"
                        type="tel" 
                        placeholder="555-0100"
                        className="w-full bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-5 py-3 font-body text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-semibold placeholder:text-on-surface-variant/50"
                      />
                    </div>
                    <div>
                      <label className="block font-body font-bold text-on-surface text-sm mb-2">Emergency</label>
                      <input 
                        required={!isLogin}
                        name="emergency_contact"
                        type="tel" 
                        placeholder="555-0199"
                        className="w-full bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-5 py-3 font-body text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-semibold placeholder:text-on-surface-variant/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block font-body font-bold text-on-surface text-sm mb-2">Email Address</label>
              <input 
                required
                name="email"
                type="email" 
                placeholder="jane@example.com"
                className="w-full bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-5 py-3 font-body text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-semibold placeholder:text-on-surface-variant/50"
              />
            </div>
            
            <div>
              <label className="block font-body font-bold text-on-surface text-sm mb-2">Password</label>
              <input 
                required
                name="password"
                type="password" 
                placeholder="••••••••"
                className="w-full bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-5 py-3 font-body text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-semibold placeholder:text-on-surface-variant/50"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 mt-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-primary to-primary-container shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 rough-edge disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>

          <div className="mt-8 text-center font-body text-on-surface-variant">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-bold text-primary hover:text-primary/80 transition-colors underline decoration-wavy underline-offset-4 decoration-primary/30"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm font-body text-on-surface-variant/60 mt-8">
          © 2026 Vismaya Camp. Guided by Light.<br/>
          <span className="space-x-3 mt-2 inline-block">
            <a href="#" className="hover:text-primary">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-primary">Support</a>
          </span>
        </p>
      </motion.div>
    </section>
  );
}
