'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camper } from '@/models/supabaseClient';
import { fetchMySecureCampers, addCamper } from '@/controllers/dashboardController';
import { Plus, User, Calendar, Loader2, AlertCircle, CheckCircle2, Tent } from 'lucide-react';
import Link from 'next/link';

export function ParentDashboard() {
  const [campers, setCampers] = useState<Camper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadCampers() {
      const { campers: data, error } = await fetchMySecureCampers();
      if (data) setCampers(data);
      setLoading(false);
    }
    loadCampers();
  }, []);

  const handleAddCamper = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setAddResult(null);

    const formData = new FormData(e.currentTarget);
    const result = await addCamper(formData);
    
    setAddResult(result);
    setAdding(false);

    if (result.success) {
      // Reload campers
      const { campers: data } = await fetchMySecureCampers();
      if (data) setCampers(data);
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowAddModal(false);
        setAddResult(null);
      }, 2000);
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
      >
        <div>
          <h1 className="font-headline text-5xl font-extrabold text-on-surface mb-2 tracking-tight">Parent Dashboard</h1>
          <p className="font-body text-xl text-on-surface-variant">Manage your campers and their adventures.</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 rough-edge border border-primary/40"
        >
          <Plus size={20} /> Add Camper
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : campers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-container-low border-2 border-dashed border-surface-variant rounded-[3rem] p-16 text-center flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-primary-container/30 text-primary rounded-full flex items-center justify-center mb-6">
            <Tent size={48} strokeWidth={1.5} />
          </div>
          <h3 className="font-headline text-3xl font-bold text-on-surface mb-4">No Campers Yet</h3>
          <p className="font-body text-lg text-on-surface-variant max-w-md mb-8">
            Add your children to your profile so you can start registering them for exciting Vismaya Camp workshops!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-bold shadow-md hover:bg-secondary-container/80 transition-colors"
          >
            Add Your First Camper
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {campers.map((camper) => (
              <motion.div
                key={camper.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-surface-container-lowest relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
                
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                  <User size={32} />
                </div>
                
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">{camper.full_name}</h3>
                
                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex items-center gap-3 text-on-surface-variant font-body">
                    <Calendar size={18} className="text-secondary" />
                    <span>DOB: {new Date(camper.date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold bg-secondary-container/30 text-secondary px-4 py-2 rounded-xl border border-secondary/20">
                      Category: {camper.age_category}
                    </span>
                    <Link href={`/catalog`} className="text-primary font-bold text-sm hover:underline decoration-wavy underline-offset-4 decoration-primary/40">
                      Browse Workshops →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Camper Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative z-10 border-2 border-surface-container-lowest rough-edge"
            >
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6">Add Camper</h2>
              
              <form onSubmit={handleAddCamper} className="space-y-5">
                <div>
                  <label className="block font-body font-bold text-on-surface text-sm mb-2">Camper Full Name</label>
                  <input 
                    required
                    name="full_name"
                    type="text" 
                    placeholder="Timmy Tester"
                    className="w-full bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-5 py-3 font-body text-on-surface focus:outline-none focus:border-primary transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-body font-bold text-on-surface text-sm mb-2">Date of Birth</label>
                  <input 
                    required
                    name="dob"
                    type="date" 
                    className="w-full bg-surface-container-lowest border-2 border-surface-variant rounded-2xl px-5 py-3 font-body text-on-surface focus:outline-none focus:border-primary transition-all font-semibold"
                  />
                  <p className="text-xs text-on-surface-variant mt-2">Age category is calculated automatically.</p>
                </div>

                <AnimatePresence mode="wait">
                  {addResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl flex items-start gap-3 border ${
                        addResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {addResult.success ? <CheckCircle2 className="shrink-0 mt-0.5" /> : <AlertCircle className="shrink-0 mt-0.5" />}
                      <p className="font-body text-sm font-semibold">{addResult.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-2xl font-bold text-on-surface bg-surface-container-low hover:bg-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={adding || addResult?.success}
                    className="flex-1 py-3 rounded-2xl font-bold text-white bg-primary shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {adding ? <Loader2 className="animate-spin" /> : 'Save Camper'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
