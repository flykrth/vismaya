"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, MapPin, Users, Info } from 'lucide-react';
import { Workshop } from '@/models/supabaseClient';
import { fetchCatalog } from '@/controllers/catalogController';
import Link from 'next/link';

export function WorkshopCatalog() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sub-junior' | 'junior' | 'senior'>('all');

  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchCatalog();
      setWorkshops(data);
      setLoading(false);
    }
    loadCatalog();
  }, []);

  const filteredWorkshops = workshops.filter(w => 
    filter === 'all' || w.allowed_age_categories.includes(filter)
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
          From wilderness survival to mindful artistry, find the perfect journey for your camper's spirit.
        </p>

        {/* Filter Badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {['all', 'sub-junior', 'junior', 'senior'].map((ageFilter) => (
            <button
              key={ageFilter}
              onClick={() => setFilter(ageFilter as any)}
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-96 rounded-3xl bg-surface-container-low animate-pulse border-2 border-surface-variant"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredWorkshops.map((workshop) => (
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
                      {workshop.allowed_age_categories.map(age => (
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
                  <Link 
                    href={`/catalog/${workshop.id}`} 
                    className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-primary font-bold py-3 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    View Details & Schedules <Compass size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
