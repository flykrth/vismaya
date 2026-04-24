"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarRange, Target, Users } from 'lucide-react';
import { Camper, Workshop } from '@/models/supabaseClient';
import { fetchCatalog } from '@/controllers/catalogController';
import { fetchMyCampers } from '@/controllers/registrationController';
import Link from 'next/link';
import { CatalogSkeleton } from './CatalogSkeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function WorkshopCatalog() {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() || '';
  const initialCamperId = searchParams?.get('camperId') || '';

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [campers, setCampers] = useState<Camper[]>([]);
  const [selectedCamperId, setSelectedCamperId] = useState<string>(initialCamperId);
  const [loading, setLoading] = useState(true);
  const [campersLoading, setCampersLoading] = useState(true);

  const loadCatalog = useCallback(async () => {
    const data = await fetchCatalog();
    if (!isMountedRef.current) {
      return;
    }

    setWorkshops(data);
    setLoading(false);
  }, []);

  const loadCampers = useCallback(async () => {
    try {
      const data = await fetchMyCampers();
      if (!isMountedRef.current) {
        return;
      }

      setCampers(data);

      if (data.length === 1) {
        const singleCamperId = data[0].id;
        setSelectedCamperId(singleCamperId);

        const params = new URLSearchParams(queryString);
        if (params.get('camperId') !== singleCamperId) {
          params.set('camperId', singleCamperId);
          router.replace(`/catalog?${params.toString()}`);
        }
        return;
      }

      if (initialCamperId && data.some((camper) => camper.id === initialCamperId)) {
        setSelectedCamperId(initialCamperId);
      } else {
        setSelectedCamperId('');
      }
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      toast.error('Unable to load campers for catalog filtering.');
      console.error('Error loading campers for catalog:', error);
    } finally {
      if (isMountedRef.current) {
        setCampersLoading(false);
      }
    }
  }, [initialCamperId, queryString, router]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCatalog();
      void loadCampers();
    });
  }, [loadCatalog, loadCampers]);

  const handleCamperSelection = (camperId: string) => {
    setSelectedCamperId(camperId);
    const params = new URLSearchParams(queryString);
    params.set('camperId', camperId);
    router.replace(`/catalog?${params.toString()}`);
  };

  const selectedCamper = useMemo(
    () => campers.find((camper) => camper.id === selectedCamperId) || null,
    [campers, selectedCamperId]
  );

  const eligibleWorkshops = selectedCamper
    ? workshops.filter((workshop) => workshop.allowed_age_categories.includes(selectedCamper.age_category))
    : [];

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface mb-6">Register now</h1>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/15 bg-surface-container-low/80 backdrop-blur-md shadow-[0_20px_70px_rgba(145,71,0,0.08)] px-6 py-8 md:px-8 md:py-10 text-left rough-edge">
          <div className="absolute -top-10 right-8 h-32 w-32 rounded-full bg-primary-container/20 blur-3xl" />
          <div className="absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-secondary-container/20 blur-3xl" />

          <div className="relative space-y-6 font-body text-lg md:text-xl text-on-surface-variant leading-relaxed">
            <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-primary/30 bg-surface-container-lowest px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-primary shadow-sm">
              Registration guidelines
            </div>

            <p className="max-w-2xl">
              To provide a focused and equitable experience for all campers, registration for Vismaya 2026 is governed by the following constraints:
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest/80 p-5 shadow-sm">
                <p className="font-headline text-lg font-bold text-on-surface mb-2">Maximum number of registrations</p>
                <p>Students can register for a maximum of five workshops.</p>
              </div>

              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest/80 p-5 shadow-sm">
                <p className="font-headline text-lg font-bold text-on-surface mb-2">One workshop per slot</p>
                <p>Students may select only one workshop per standard time slot (A, B, C, D and F) to prevent overlapping.</p>
              </div>

              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest/80 p-5 shadow-sm">
                <p className="font-headline text-lg font-bold text-on-surface mb-2">Ongoing sessions (Slot G)</p>
                <p>Registering for an &quot;Ongoing&quot; workshop acts as a total schedule blocker for the entire duration of the camp.</p>
              </div>

              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest/80 p-5 shadow-sm">
                <p className="font-headline text-lg font-bold text-on-surface mb-2">Age category filtering</p>
                <p>Available workshops are automatically filtered based on the camper&apos;s registered age to ensure developmental appropriateness.</p>
              </div>

              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest/80 p-5 shadow-sm md:col-span-2">
                <p className="font-headline text-lg font-bold text-on-surface mb-2">Real-time capacity</p>
                <p>All selections are subject to real-time seat availability and capacity limits.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {loading || campersLoading ? (
        <CatalogSkeleton />
      ) : campers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-container-low border-2 border-dashed border-surface-variant rounded-[3rem] p-16 text-center"
        >
          <h3 className="font-headline text-3xl font-bold text-on-surface mb-4">No Campers Added</h3>
          <p className="font-body text-lg text-on-surface-variant max-w-md mx-auto mb-8">
            Please add a camper from your dashboard before browsing workshops.
          </p>
          <Link href="/dashboard" className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-md hover:opacity-90 transition-opacity inline-block">
            Go to Dashboard
          </Link>
        </motion.div>
      ) : campers.length > 1 && !selectedCamper ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border-4 border-surface-container-lowest"
        >
          <h3 className="font-headline text-3xl font-bold text-on-surface mb-3">Choose a Camper</h3>
          <p className="font-body text-on-surface-variant mb-8">Select a camper to view workshops available for their age group.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campers.map((camper) => (
              <button
                key={camper.id}
                onClick={() => handleCamperSelection(camper.id)}
                className="text-left bg-surface-container-low border-2 border-surface-variant rounded-2xl p-5 hover:border-primary/40 transition-colors"
              >
                <p className="font-headline text-2xl font-bold text-on-surface">{camper.full_name}</p>
                <p className="font-body text-on-surface-variant mt-1">Age Category: {camper.age_category}</p>
                <p className="font-body text-on-surface-variant mt-1">Gender: {camper.gender.replaceAll('_', ' ')}</p>
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <>
          <div className="mb-8">
            <span className="inline-flex px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold border border-primary/20">
              Showing workshops for {selectedCamper?.full_name}
            </span>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {eligibleWorkshops.map((workshop) => {
                const totalCapacity = (workshop.schedules || []).reduce((sum, schedule) => sum + schedule.max_capacity, 0);
                const totalBooked = (workshop.schedules || []).reduce((sum, schedule) => sum + schedule.current_enrollment, 0);
                const remainingSpots = Math.max(totalCapacity - totalBooked, 0);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={workshop.id}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-surface-container-lowest relative group overflow-hidden hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full"
                  >
                    {/* Decorative Tape */}
                    <div className="absolute -top-3 -right-3 w-16 h-6 bg-secondary-container/50 backdrop-blur-md rotate-[30deg] z-20 shadow-sm border border-secondary-container/80"></div>

                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-primary-container/20 text-primary rounded-2xl flex items-center justify-center border border-dashed border-primary/40">
                          <Target size={28} />
                        </div>
                      </div>

                      <h3 className="font-headline text-2xl font-bold text-on-surface mb-3 line-clamp-2">{workshop.title}</h3>
                      <p className="font-body text-on-surface-variant mb-6 line-clamp-3">{workshop.description}</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-dashed border-surface-variant mt-auto">
                      <div className="flex items-center gap-2 font-body text-sm font-bold">
                        <Users size={16} className={remainingSpots === 0 ? 'text-error' : 'text-green-600'} />
                        <span className={remainingSpots === 0 ? 'text-error' : 'text-green-600'}>
                          Remaining spots {remainingSpots}/{totalCapacity}
                        </span>
                      </div>
                      <Link 
                        href={workshop.id ? `/catalog/${workshop.id}?camperId=${selectedCamperId}` : '#'} 
                        className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-primary font-bold py-3 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        View details & schedules <CalendarRange size={18} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </section>
  );
}