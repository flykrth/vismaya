"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Compass, Sparkles, Users } from 'lucide-react';
import Image from 'next/image';

export function MissionGrid() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <section className="py-32 bg-surface-container-low relative mt-10 overflow-hidden">
      {/* Torn paper top */}
      <div className="absolute -top-5 left-0 w-full h-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1200 40\\' preserveAspectRatio=\\'none\\'%3E%3Cpath d=\\'M0,40 C150,20 300,60 450,20 C600,-20 750,60 900,20 C1050,-20 1200,40 1200,40 L1200,40 L0,40 Z\\' fill=\\'%23ffeee1\\'/%3E%3C/svg%3E')] z-10 bg-[length:100%_100%]"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20 max-w-2xl mx-auto relative"
        >
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-6">Our Philosophy</h2>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed">We believe in the transformative power of nature, community, and intentional living. Every moment is designed to awaken your spirit.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(250px,auto)]"
        >
          {/* Large Feature Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, rotate: 0 }}
            className="md:col-span-2 bg-gradient-to-br from-[#fffdf5] to-[#fffaf0] rounded-3xl p-8 flex flex-col md:flex-row gap-8 transition-all relative overflow-hidden rough-edge transform rotate-1 shadow-xl border-l-8 border-l-primary/40 group"
          >
            {/* Tape */}
            <div className="absolute -top-3 -left-3 w-20 h-8 bg-orange-200/60 backdrop-blur-md rotate-[-45deg] z-20 shadow-sm border border-orange-300/50"></div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary mb-6 border border-dashed border-primary/50 group-hover:scale-110 transition-transform duration-300">
                <Compass size={32} />
              </div>
              <h3 className="font-headline text-3xl font-bold text-on-surface mb-4">Guided Expeditions</h3>
              <p className="text-on-surface-variant leading-relaxed mb-6 font-body text-lg">Traverse unseen trails with expert guides who weave local folklore and mindfulness practices into every hike.</p>
              <a className="text-primary font-bold hover:text-primary-container inline-flex items-center gap-2 mt-auto w-fit font-handdrawn text-2xl group/link" href="#">
                Learn More 
                <span className="group-hover/link:translate-x-2 transition-transform">→</span>
              </a>
            </div>
            <div className="flex-1 rounded-[2rem] rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden hidden md:block border-4 border-white shadow-lg transform rotate-[-2deg] relative group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
              <Image 
                src="/hikers_sunrise_premium_1776617080705.png"
                alt="Hikers on a mountain trail at sunrise" 
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Small Card 1 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, rotate: 0 }}
            className="bg-gradient-to-br from-[#fcf8ff] to-white rounded-3xl p-8 flex flex-col justify-between shadow-lg border border-secondary-container/50 rough-edge transform rotate-[-2deg] duration-300 relative group"
          >
            <div>
              <div className="w-16 h-16 bg-secondary-container/30 text-secondary rounded-2xl flex items-center justify-center mb-6 border border-dashed border-secondary/50 group-hover:rotate-12 transition-transform duration-300">
                <Sparkles size={32} />
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">Spiritual Grounding</h3>
              <p className="text-on-surface-variant text-base leading-relaxed font-body">Daily meditation and yoga sessions led by seasoned practitioners in serene settings.</p>
            </div>
          </motion.div>

          {/* Small Card 2 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, rotate: 0 }}
            className="bg-gradient-to-br from-[#f0fbff] to-white rounded-3xl p-8 flex flex-col justify-between shadow-lg border border-tertiary-container/50 rough-edge transform rotate-[2deg] duration-300 relative group"
          >
            <div>
              <div className="w-16 h-16 bg-tertiary-container/30 text-tertiary rounded-2xl flex items-center justify-center mb-6 border border-dashed border-tertiary/50 group-hover:-rotate-12 transition-transform duration-300">
                <Users size={32} />
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">Community Bonding</h3>
              <p className="text-on-surface-variant text-base leading-relaxed font-body">Forge lifelong friendships around the campfire through shared stories and songs.</p>
            </div>
          </motion.div>

          {/* Large Image Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, rotate: 0 }}
            className="md:col-span-2 relative rounded-[3rem] rounded-bl-[6rem] rounded-tr-[5rem] overflow-hidden group min-h-[350px] border-8 border-white shadow-2xl transform rotate-[-1deg] duration-500"
          >
            <Image 
              src="/nightly_fire_premium_1776617099683.png"
              alt="Campers gathered around a fire at dusk" 
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-10 w-full transform group-hover:translate-y-[-10px] transition-transform duration-500">
              <h3 className="font-handdrawn text-5xl font-bold text-white mb-2 tracking-wide drop-shadow-md">The Nightly Fire</h3>
              <p className="text-white/90 max-w-md font-body text-lg drop-shadow-md">Where the day's adventures turn into tomorrow's legends.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Torn paper bottom */}
      <div className="absolute -bottom-5 left-0 w-full h-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1200 40\\' preserveAspectRatio=\\'none\\'%3E%3Cpath d=\\'M0,0 C150,20 300,-20 450,20 600,60 750,-20 900,20 C1050,60 1200,0 1200,0 L1200,0 L0,0 Z\\' fill=\\'%23ffeee1\\'/%3E%3C/svg%3E')] z-10 bg-[length:100%_100%]"></div>
    </section>
  );
}
