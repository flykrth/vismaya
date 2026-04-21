'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Workshop, Schedule } from '@/models/supabaseClient';
import { fetchWorkshopById, fetchSchedulesForWorkshop } from '@/controllers/catalogController';
import { Calendar, Clock, MapPin, Users, ArrowLeft, BookOpen, User, NotepadText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkshopDetailsSkeleton } from './WorkshopDetailsSkeleton';
import { toast } from 'sonner';

export function WorkshopDetails({ workshopId, selectedCamperId }: { workshopId: string; selectedCamperId?: string }) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const hasValidWorkshopId = Boolean(workshopId && workshopId !== 'undefined');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!hasValidWorkshopId) {
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
    }

    try {
      const [workshopData, scheduleData] = await Promise.all([
        fetchWorkshopById(workshopId),
        fetchSchedulesForWorkshop(workshopId)
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setWorkshop(workshopData);
      setSchedules(scheduleData);

      if (!workshopData) {
        toast.error('Workshop not found');
      }
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      toast.error('Failed to load workshop details');
      console.error('Error loading workshop:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [hasValidWorkshopId, workshopId]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasValidWorkshopId) {
      return;
    }

    queueMicrotask(() => {
      void loadData();
    });
  }, [workshopId, hasValidWorkshopId, loadData]);

  if (hasValidWorkshopId && loading) {
    return <WorkshopDetailsSkeleton />;
  }

  if (!workshopId || workshopId === 'undefined' || !workshop) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-3xl font-headline font-bold">Workshop not found</h1>
        <button onClick={() => router.back()} className="mt-4 text-primary underline">Go Back</button>
      </div>
    );
  }

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold mb-8 group"
      >
        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Workshops
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-headline text-5xl md:text-6xl font-black text-on-surface tracking-tight mb-6"
            >
              {workshop.title}
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg prose-headings:font-headline prose-a:text-primary max-w-none text-on-surface-variant font-body"
          >
            <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2 border-b-2 border-surface-variant pb-2 inline-flex">
              <NotepadText className="text-primary" /> Details
            </h2>
            <p className="mt-4 text-lg leading-relaxed">
              {workshop.description || "No description provided for this workshop."}
            </p>

            <div className="mt-12 bg-surface-container-low p-8 rounded-[2rem] border border-surface-variant rough-edge relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none"></div>
              <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2 mb-6 mt-0">
                <BookOpen className="text-secondary" /> What you&apos;ll learn
              </h2>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                {workshop.learning_outcome}
              </p>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="w-20 h-20 bg-surface-variant rounded-full flex items-center justify-center text-on-surface shrink-0">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface m-0">{workshop.speaker_name}</h2>
                <p className="text-primary font-bold text-sm tracking-widest uppercase m-0 mt-1">{workshop.speaker_title}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Schedules */}
        <div className="lg:col-span-1">
          <div className="sticky top-32">
            <h3 className="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <Calendar className="text-primary" /> Available Slots
            </h3>
            
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-variant text-center">
                  <p className="font-body text-on-surface-variant">No schedules available right now.</p>
                </div>
              ) : (
                schedules.map((schedule, i) => {
                  const startTime = new Date(schedule.start_time);
                  const endTime = new Date(schedule.end_time);
                  const remainingSpots = Math.max(schedule.max_capacity - schedule.current_enrollment, 0);
                  const isFull = remainingSpots === 0;
                  
                  return (
                    <motion.div 
                      key={schedule.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-surface-container-lowest rough-edge relative overflow-hidden group hover:border-primary/30 transition-colors"
                    >
                      <div className="space-y-3 mb-6 relative z-10">
                        <div className="flex items-center gap-2 font-bold text-on-surface">
                          <Calendar size={18} className="text-primary" />
                          {startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 font-body text-on-surface-variant">
                          <Clock size={18} />
                          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2 font-body text-on-surface-variant">
                          <MapPin size={18} />
                          {schedule.venue}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-variant">
                          <div className="flex items-center gap-2 font-body text-sm font-bold">
                            <Users size={16} className={isFull ? 'text-error' : 'text-green-600'} />
                            <span className={isFull ? 'text-error' : 'text-green-600'}>
                              Remaining spots {remainingSpots}/{schedule.max_capacity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link 
                        href={selectedCamperId
                          ? `/register?scheduleId=${schedule.id}&workshopTitle=${encodeURIComponent(workshop.title)}&camperId=${selectedCamperId}`
                          : `/register?scheduleId=${schedule.id}&workshopTitle=${encodeURIComponent(workshop.title)}`}
                        className={`block text-center py-3 rounded-xl font-bold transition-all relative z-10 ${
                          isFull 
                            ? 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80' 
                            : 'bg-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5'
                        }`}
                      >
                        {isFull ? 'Join Waitlist' : 'Book Spot'}
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
