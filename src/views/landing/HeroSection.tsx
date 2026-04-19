"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pb-24 pt-12 min-h-[90vh] flex items-center">
      {/* Decorative blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] -z-10"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[120px] -z-10"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 z-10 space-y-8 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-primary text-sm font-semibold tracking-wide border border-dashed border-primary/30 transform -rotate-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Embody the Radiant Horizon</span>
          </div>

          <h1 className="font-headline text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-on-surface leading-[1.05] tracking-tight relative">
            Discover Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary relative inline-block">
              Wild Spirit.
              <motion.svg 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="absolute -bottom-4 left-0 w-full h-6 text-secondary" 
                preserveAspectRatio="none" 
                viewBox="0 0 100 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="3"></path>
              </motion.svg>
            </span>
          </h1>

          <p className="font-body text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-lg">
            Join us for an unforgettable summer retreat where adventure meets mindfulness. Explore sun-drenched landscapes and reconnect with your inner compass.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-primary-container text-surface-container-lowest px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_10px_40px_rgba(145,71,0,0.3)] transition-all w-full sm:w-auto text-center rough-edge relative overflow-hidden group border border-white/20"
            >
              <span className="relative z-10">Start the Adventure</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,238,225,0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl font-bold text-lg text-secondary border-2 border-dashed border-secondary/40 backdrop-blur-sm transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2 rough-edge"
            >
              <Play className="fill-secondary/20 stroke-secondary" size={24} />
              Watch the Video
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          style={{ y: y1 }}
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 2 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="lg:col-span-6 relative z-10"
        >
          <div className="relative w-full aspect-[4/5] md:aspect-square rounded-[3rem] rounded-tr-[8rem] rounded-bl-[6rem] overflow-hidden shadow-[0_32px_80px_rgba(145,71,0,0.15)] group border-[8px] border-surface-container-lowest/80 backdrop-blur-md">
            {/* Tape doodle */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-yellow-100/80 backdrop-blur-xl rotate-[-5deg] z-20 shadow-md border border-yellow-200/50"></div>
            
            <Image 
              src="/hero_campfire_premium_1776617054168.png" 
              alt="Friends laughing around a sunlit campfire near a lake" 
              fill
              className="object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Floating Pinned Note Card */}
            <motion.div 
              style={{ y: y2 }}
              className="absolute bottom-6 left-6 right-6 bg-[#fffae8]/95 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl border-t-4 border-primary/40 transform -rotate-2 rough-edge"
            >
              {/* Pushpin */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 shadow-lg border-2 border-red-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="w-14 h-14 rounded-full bg-primary-container/20 border-2 border-dashed border-primary flex items-center justify-center text-primary relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/10 animate-spin-slow"></div>
                   <span className="font-handdrawn text-2xl font-bold">15</span>
                </div>
                <div>
                  <h3 className="font-handdrawn text-3xl font-bold text-on-surface">Next Retreat</h3>
                  <p className="text-sm text-on-surface-variant font-bold tracking-wider uppercase font-body">July 15-22 • Sierra Nevada</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
