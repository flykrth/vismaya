"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, Tent, Sun, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Adventures', href: '/catalog', icon: Compass },
    { name: 'Camp Life', href: '/#camp-life', icon: Tent },
    { name: 'Spiritual Path', href: '/#spiritual', icon: Sun },
    { name: 'Gallery', href: '/#gallery', icon: ImageIcon },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-surface/80 backdrop-blur-2xl shadow-lg shadow-primary/5 py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="group flex items-center gap-3 relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-primary"
            >
              <Sun size={32} strokeWidth={2.5} />
            </motion.div>
            <span className="font-headline text-2xl font-black text-on-surface tracking-tighter uppercase relative z-10">
              Vismaya <span className="text-primary">Camp</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-body font-medium">
            {navLinks.map((link, i) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="group relative px-2 py-1 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="relative z-10">{link.name}</span>
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-lg -z-10 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all"
                  layoutId="hover-bg"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/catalog">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-container text-surface-container-lowest px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 rough-edge border border-primary/40 group inline-block"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Register Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-on-surface p-2 relative z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X size={28} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-3xl pt-24 px-6 md:hidden flex flex-col"
          >
            <nav className="flex flex-col gap-6 text-2xl font-headline font-bold">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 text-on-surface hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="text-primary/50" />
                  {link.name}
                </motion.a>
              ))}
            </nav>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-auto mb-12 bg-gradient-to-r from-primary to-primary-container text-white p-4 rounded-2xl font-bold text-xl shadow-xl rough-edge flex justify-center w-full"
            >
              Register Now
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
