"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Users } from 'lucide-react';
import { Camper, Workshop } from '@/models/supabaseClient';
import { supabase } from '@/models/supabaseClient';
import { fetchCatalog } from '@/controllers/catalogController';
import { fetchMyCampers } from '@/controllers/registrationController';
import Link from 'next/link';
import { CatalogSkeleton } from './CatalogSkeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function WorkshopCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() || '';
  const initialCamperId = searchParams?.get('camperId') || '';

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [campers, setCampers] = useState<Camper[]>([]);
  const [selectedCamperId, setSelectedCamperId] = useState<string>(initialCamperId);
  const [loading, setLoading] = useState(true);
  const [campersLoading, setCampersLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sub-junior' | 'junior' | 'senior'>('all');
  const ageFilters: Array<'all' | 'sub-junior' | 'junior' | 'senior'> = ['all', 'sub-junior', 'junior', 'senior'];

  const loadCatalog = useCallback(async () => {
    const data = await fetchCatalog();
    setWorkshops(data);
    setLoading(false);
  }, []);

  const loadCampers = useCallback(async () => {
    try {
      const data = await fetchMyCampers();
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
      toast.error('Unable to load campers for catalog filtering.');
      console.error('Error loading campers for catalog:', error);
    } finally {
      setCampersLoading(false);
    }
  }, [initialCamperId, queryString, router]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCatalog();
      void loadCampers();
    });

    const channel = supabase
      .channel('catalog-live-schedules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
        loadCatalog();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const filteredWorkshops = eligibleWorkshops.filter((workshop) =>
    filter === 'all' || workshop.allowed_age_categories.includes(filter)
  );

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface mb-6">Discover Our Expeditions</h1>
        <p className="font-body text-xl text-on-surface-variant leading-relaxed">
          From wilderness survival to mindful artistry, find the perfect journey for your camper&apos;s spirit.
        </p>

        {/* Filter Badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {ageFilters.map((ageFilter) => (
            <button
              key={ageFilter}
              onClick={() => setFilter(ageFilter)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 border-dashed rough-edge ${
                filter === ageFilter 
                  ? 'bg-primary text-white border-primary/20 scale-105 shadow-md' 
                  : 'bg-surface-container text-on-surface-variant border-surface-variant hover:border-primary/50'
              }`}
            >
              {ageFilter.charAt(0).toUpperCase() + ageFilter.slice(1).replace('-', ' ')}
            </button>
          ))}
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
              Showing workshops for {selectedCamper?.full_name} ({selectedCamper?.age_category}, {selectedCamper?.gender.replaceAll('_', ' ')})
            </span>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredWorkshops.map((workshop) => {
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
                          <Compass size={28} />
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end max-w-[50%]">
                          {workshop.allowed_age_categories.map((age) => (
                            <span key={age} className="text-xs font-bold bg-secondary-container/20 text-secondary px-3 py-1 rounded-full border border-secondary/20">
                              {age}
                            </span>
                          ))}
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
                        View Details & Schedules <Compass size={18} />
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
