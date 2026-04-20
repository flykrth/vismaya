"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Compass, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { fetchMyCampers, submitRegistration } from '@/controllers/registrationController';
import { Camper } from '@/models/supabaseClient';
import Link from 'next/link';
import { toast } from 'sonner';

export function RegistrationForm() {
  const searchParams = useSearchParams();
  const scheduleId = searchParams?.get('scheduleId') || '';
  const workshopTitle = searchParams?.get('workshopTitle') || 'Selected Workshop';

  const [campers, setCampers] = useState<Camper[]>([]);
  const [selectedCamper, setSelectedCamper] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  useEffect(() => {
    async function loadCampers() {
      try {
        const data = await fetchMyCampers();
        setCampers(data);
        if (data.length > 0) setSelectedCamper(data[0].id);
      } catch (error) {
        toast.error('Failed to load your campers');
        console.error('Error loading campers:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCampers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamper || !scheduleId) return;

    setSubmitting(true);
    setResult(null);

    const res = await submitRegistration(selectedCamper, scheduleId);
    setResult(res);
    setSubmitting(false);
    
    if (res.success) {
      toast.success(res.message || 'Successfully registered!');
    } else {
      toast.error(res.message || 'Failed to register.');
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden bg-surface-container-low z-10">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary-container/30 rounded-full blur-[80px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary-container/30 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl border-[6px] border-surface-container-lowest relative rough-edge"
      >
        {/* Tape */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-yellow-200/80 backdrop-blur-md rotate-[-3deg] z-20 shadow-sm border border-yellow-300/50"></div>

        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-primary-container/20 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-primary/30">
            <Compass size={32} />
          </div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface">Secure Your Spot</h2>
          <p className="font-body text-on-surface-variant mt-2">Registering for: <strong className="text-primary">{workshopTitle}</strong></p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : campers.length === 0 ? (
          <div className="text-center p-6 bg-error-container/20 rounded-2xl border border-error/20">
            <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
            <p className="text-error font-bold font-body">No campers found for your account.</p>
            <p className="text-sm text-error/80 mt-1">Please add a camper to your profile first.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-headline font-bold text-on-surface text-lg">Select Camper</label>
              <div className="relative">
                <select 
                  value={selectedCamper}
                  onChange={(e) => setSelectedCamper(e.target.value)}
                  disabled={submitting || result?.success}
                  className="w-full appearance-none bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-6 py-4 font-body text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {campers.map(camper => (
                    <option key={camper.id} value={camper.id}>
                      {camper.full_name} ({camper.age_category})
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  ▼
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-2xl flex items-start gap-3 border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {result.success ? <CheckCircle2 className="shrink-0 mt-0.5" /> : <AlertCircle className="shrink-0 mt-0.5" />}
                  <div className="font-body text-sm font-semibold">
                    {result.message || (result.success ? 'Successfully registered!' : 'Failed to register.')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting || result?.success}
              className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2 rough-edge ${
                result?.success 
                  ? 'bg-green-600 shadow-green-600/30' 
                  : submitting 
                    ? 'bg-primary/70 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-primary-container shadow-primary/30 hover:shadow-primary/50'
              }`}
            >
              {submitting ? (
                <><Loader2 className="animate-spin" /> Processing...</>
              ) : result?.success ? (
                <><CheckCircle2 /> Registered</>
              ) : (
                'Confirm Registration'
              )}
            </motion.button>
            
            <div className="text-center pt-2">
              <Link href="/catalog" className="text-on-surface-variant text-sm font-bold hover:text-primary transition-colors underline decoration-wavy underline-offset-4 decoration-primary/30">
                ← Back to Catalog
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
}
