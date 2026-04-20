'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camper, RegistrationWithDetails } from '@/models/supabaseClient';
import { fetchMySecureCampers, addCamper, fetchMyRegistrations, cancelRegistration } from '@/controllers/dashboardController';
import { Plus, User, Calendar, Loader2, AlertCircle, CheckCircle2, Tent, BookOpen, Clock, MapPin, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function ParentDashboard() {
  const [campers, setCampers] = useState<Camper[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cancellingRegistrationId, setCancellingRegistrationId] = useState<string | null>(null);
  const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      const [{ campers: camperData }, { registrations: registrationData, error: registrationError }] = await Promise.all([
        fetchMySecureCampers(),
        fetchMyRegistrations(),
      ]);

      if (camperData) setCampers(camperData);
      if (registrationData) setRegistrations(registrationData);
      if (registrationError) {
        toast.error(registrationError);
      }

      setLoading(false);
    }
    loadDashboardData();
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
      const [{ campers: data }, { registrations: registrationData }] = await Promise.all([
        fetchMySecureCampers(),
        fetchMyRegistrations(),
      ]);

      if (data) setCampers(data);
      if (registrationData) setRegistrations(registrationData);

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowAddModal(false);
        setAddResult(null);
      }, 2000);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    setCancellingRegistrationId(registrationId);

    const result = await cancelRegistration(registrationId);

    if (!result.success) {
      toast.error(result.message || 'Unable to cancel registration.');
      setCancellingRegistrationId(null);
      return;
    }

    const { registrations: registrationData } = await fetchMyRegistrations();
    setRegistrations(registrationData);
    toast.success(result.message || 'Registration cancelled successfully.');
    setCancellingRegistrationId(null);
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

      <div className="mt-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="font-headline text-3xl font-bold text-on-surface">Registered Workshops</h2>
            <p className="font-body text-on-surface-variant">View and manage all active workshop bookings.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-surface-container-low border-2 border-dashed border-surface-variant rounded-[2.5rem] p-10 text-center">
            <p className="font-body text-on-surface-variant">No active workshop registrations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => {
              const startTime = new Date(registration.schedule.start_time);
              const endTime = new Date(registration.schedule.end_time);
              const remainingSpots = Math.max(registration.schedule.max_capacity - registration.schedule.current_enrollment, 0);

              return (
                <motion.div
                  key={registration.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-6 md:p-8 shadow-lg border-2 border-surface-container-lowest"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="space-y-3">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">{registration.workshop.title}</h3>
                      <p className="font-body text-on-surface-variant text-sm">
                        Camper: <span className="font-bold text-on-surface">{registration.camper.full_name}</span>
                      </p>

                      <div className="flex flex-col gap-2 text-sm font-body text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-primary" />
                          {startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary" />
                          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-primary" />
                          {registration.schedule.venue}
                        </div>
                      </div>

                      <span className={`inline-flex mt-2 px-4 py-1.5 rounded-xl text-xs font-bold border ${remainingSpots === 0 ? 'text-error border-error/30 bg-error-container/30' : 'text-green-700 border-green-200 bg-green-50'}`}>
                        Remaining spots {remainingSpots}/{registration.schedule.max_capacity}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCancelRegistration(registration.id)}
                      disabled={cancellingRegistrationId === registration.id}
                      className="h-fit w-full md:w-auto bg-error text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {cancellingRegistrationId === registration.id ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle size={18} />
                          Cancel Registration
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

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
