"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-container-low w-full mt-32 relative pt-24 pb-16 px-6 md:px-12 z-10 overflow-hidden">
      {/* Wavy divider for footer top */}
      <svg className="absolute -top-1 left-0 w-full h-16 text-surface-container-low fill-current" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
      
      {/* Footer tree doodle */}
      <motion.svg 
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute bottom-10 right-10 md:right-20 w-24 h-32 text-primary/10 pointer-events-none" 
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
        <path d="M12 22v-4"></path>
      </motion.svg>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 font-body text-sm tracking-wide text-on-surface transition-colors duration-200 z-10 relative">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="text-2xl font-extrabold text-secondary font-headline flex items-center gap-2">
            <Sun className="w-6 h-6 text-secondary" />
            Vismaya Camp
          </div>
          <p className="text-on-surface-variant font-handdrawn text-xl">© 2026 Vismaya Camp. Embody the Radiant Horizon.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {['Privacy Policy', 'Terms of Adventure', 'Contact Us', 'Careers'].map((link) => (
            <Link 
              key={link} 
              href="#" 
              className="text-on-surface-variant hover:text-secondary underline decoration-secondary/30 decoration-wavy underline-offset-8 transition-all font-medium hover:scale-105 inline-block"
            >
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
