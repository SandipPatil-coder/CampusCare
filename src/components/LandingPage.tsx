/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Mic, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Building2, 
  Users, 
  BarChart3, 
  Smartphone,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface LandingPageProps {
  onEnterPortal: () => void;
  darkMode: boolean;
}

export default function LandingPage({ onEnterPortal, darkMode }: LandingPageProps) {
  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header / Nav */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg block">CampusCare</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-500 block -mt-1">University Portal</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Features</a>
            <a href="#about" className={`text-sm font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>About</a>
            <a href="#benefits" className={`text-sm font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Benefits</a>
            <a href="#contact" className={`text-sm font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Contact</a>
          </nav>
          <button 
            id="btn_hero_portal_nav"
            onClick={onEnterPortal}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-98"
          >
            Access Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-pink-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-semibold text-xs tracking-wide uppercase mb-6"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Next-Gen Facilities Maintenance System
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-8"
          >
            Smart Campus Care, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600">
              Resolved in Real-Time.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Empower students, faculty, and administrative teams to report, inspect, and track educational infrastructure health. Built-in instant reminders, multiple image uploads, and voice notes.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              id="btn_hero_portal_primary"
              onClick={onEnterPortal}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 group hover:translate-y-[-2px] active:translate-y-0"
            >
              Sign In to Portal
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a 
              href="#features"
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base transition-all text-center border ${
                darkMode 
                  ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900 hover:text-white' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Explore Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* Trust & Key Stats Bar */}
      <section className={`border-y transition-colors ${darkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/50 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-500 tracking-tight">1,450+</p>
              <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Resolved This Term</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-500 tracking-tight">18 Min</p>
              <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Avg Emergency Response</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-500 tracking-tight">98.4%</p>
              <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Student Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-500 tracking-tight">12 Blocks</p>
              <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Coverage Network</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Screenshots Showcase */}
      <section id="screenshots" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Enterprise-Grade Architecture</h2>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              CampusCare leverages advanced state mechanics, high-fidelity dashboards, and seamless interactive forms built for students and admins alike.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border transition-all ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-1">Student Mobile-First Submission</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Submit electrical, plumbing, HVAC, or IT network complaints instantly. Log building blocks, classrooms, record high-fidelity voice notes, and preview multiple photo uploads in real-time.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-1">Interactive Admin Analytics</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Monitor active tickets via custom bento-grid stats. Filter by building, export structured logs to PDF/Excel, and dispatch specialized taskforces in seconds.
                </p>
              </div>
            </div>

            {/* Interactive Simulated UI */}
            <div className={`p-4 rounded-3xl border transition-all overflow-hidden shadow-2xl relative group ${
              darkMode ? 'bg-slate-900 border-slate-800 shadow-indigo-950/20' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}>
              {/* Header mockup */}
              <div className={`flex items-center justify-between px-4 pb-4 border-b mb-4 ${
                darkMode ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-mono ${
                  darkMode ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-indigo-600'
                }`}>
                  https://campuscare.pccoe.edu/dashboard
                </div>
              </div>

              {/* Grid Mock */}
              <div className="space-y-4 font-mono text-[10px]">
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-slate-500 block">PENDING</span>
                    <span className="text-lg font-bold text-indigo-500 block mt-1">12</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-slate-500 block">IN PROGRESS</span>
                    <span className="text-lg font-bold text-amber-500 block mt-1">04</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-slate-500 block">RESOLVED</span>
                    <span className="text-lg font-bold text-emerald-500 block mt-1">284</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border text-left ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">EMERGENCY</span>
                    <span className="text-slate-500">Newton Block, Room 204</span>
                  </div>
                  <p className="text-xs font-sans font-bold mb-1">Ceiling Water Leakage</p>
                  <p className="text-slate-400 font-sans leading-relaxed text-[11px] line-clamp-2">Significant water dripping from the ceiling plaster near the central servers. Threatens electrical cabinets.</p>
                  <div className="flex gap-2 mt-3">
                    <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full text-[9px]">4 Days Pending</span>
                    <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full text-[9px]">Plumbing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className={`py-24 px-6 border-t transition-colors ${
        darkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Engineered for Quick Response</h2>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              Campus facilities run at peak productivity when communication channels are direct, accountable, and digitized.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Voice Recording Memo</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Students can record, pause, listen, and attach verbal details to complaints. Useful for tracing rattling noises or acoustic issues.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Multi-Image Upload</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Take multiple photos of cracks, leaks, or hardware issues. View crisp grid previews before submitting for visual evidence.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">3-Day Smart Reminders</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                If action stalls on complaints, students can alert facilities with an automated nudge. Keeps administration accountable.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI-Ready Pipeline</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Structured data schemas built for automated transcription, visual classification, and priority prediction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Optimized for Campus Dynamics</h2>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              CampusCare transforms campus administration by creating a single, cohesive channel of operational excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl border relative ${
              darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="text-xs uppercase font-extrabold text-indigo-500 tracking-wider mb-2">For Students</div>
              <h3 className="text-xl font-bold mb-4">Seamless Reporting</h3>
              <ul className={`space-y-3 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <li className="flex items-center gap-2">✓ Report in seconds from lectures</li>
                <li className="flex items-center gap-2">✓ Attach high-res snaps and voice</li>
                <li className="flex items-center gap-2">✓ Real-time progress notifications</li>
              </ul>
            </div>

            <div className={`p-8 rounded-2xl border relative ${
              darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="text-xs uppercase font-extrabold text-indigo-500 tracking-wider mb-2">For Facility Teams</div>
              <h3 className="text-xl font-bold mb-4">Actionable Analytics</h3>
              <ul className={`space-y-3 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <li className="flex items-center gap-2">✓ Direct filtering by block & category</li>
                <li className="flex items-center gap-2">✓ Detailed admin notes & logs</li>
                <li className="flex items-center gap-2">✓ Export maintenance schedules instantly</li>
              </ul>
            </div>

            <div className={`p-8 rounded-2xl border relative ${
              darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="text-xs uppercase font-extrabold text-indigo-500 tracking-wider mb-2">For Leadership</div>
              <h3 className="text-xl font-bold mb-4">Institutional Visibility</h3>
              <ul className={`space-y-3 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <li className="flex items-center gap-2">✓ Trace unresolved high-priority risks</li>
                <li className="flex items-center gap-2">✓ Detailed metrics per building</li>
                <li className="flex items-center gap-2">✓ Streamline capital expenditures</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-24 px-6 border-t transition-colors ${
        darkMode ? 'bg-slate-900/10 border-slate-900' : 'bg-slate-100/30 border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-6">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">Modernizing Campus Operations</h2>
          <p className={`text-base sm:text-lg leading-relaxed mb-8 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            CampusCare is designed as an enterprise facilities operations dashboard. We enable educational institutions to elevate their environment, giving facilities teams clear diagnostic tools to resolve plumbing, IT networking, HVAC, and classroom concerns with unprecedented speed and structure.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold">
            <span className="flex items-center gap-2 text-indigo-500"><Users className="h-4 w-4" /> 10,000+ Enrolled Students served</span>
            <span className="flex items-center gap-2 text-indigo-500"><Building2 className="h-4 w-4" /> Compatible with multi-block campuses</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight">Need Operations Assistance?</h2>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                Reach out to the University Central Estates & Engineering Office directly for emergency line issues, high-voltage concerns, or portal enrollment permissions.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3.5">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-white border-slate-200 text-indigo-600'
                  }`}>
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono">EMERGENCY LINE</p>
                    <p className="text-sm font-bold">+1 (555) 019-2831</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-white border-slate-200 text-indigo-600'
                  }`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono">SUPPORT EMAIL</p>
                    <p className="text-sm font-bold">facilities-support@pccoe.edu</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-white border-slate-200 text-indigo-600'
                  }`}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono">OFFICE LOCATION</p>
                    <p className="text-sm font-bold">Block 3, Estates Wing, Ground Floor</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form 
                id="form_contact"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for contacting CampusCare. Our facilities administrator has been notified.');
                  e.currentTarget.reset();
                }}
                className={`p-8 rounded-3xl border ${
                  darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                } space-y-5`}
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-slate-500">Full Name</label>
                    <input 
                      id="input_contact_name"
                      type="text" 
                      required
                      placeholder="Jane Doe" 
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-slate-500">Institutional Email</label>
                    <input 
                      id="input_contact_email"
                      type="email" 
                      required
                      placeholder="jane.doe@pccoe.edu" 
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-slate-500">Subject</label>
                  <input 
                    id="input_contact_subject"
                    type="text" 
                    required
                    placeholder="Portal registration query" 
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-slate-500">Your Message</label>
                  <textarea 
                    id="textarea_contact_message"
                    rows={4}
                    required
                    placeholder="Describe how we can assist..." 
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <button 
                  id="btn_contact_submit"
                  type="submit"
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20"
                >
                  Send Inquiry Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t transition-colors ${
        darkMode ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
              <Wrench className="h-3.5 w-3.5 text-white" />
            </div>
            <span className={`font-bold text-sm tracking-tight ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>CampusCare</span>
          </div>
          <p className="text-xs text-center">
            © 2026 CampusCare Operations Portal. Educational Facilities & Real Estate Management. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <span className="hover:underline cursor-pointer">Security Protocol</span>
            <span className="hover:underline cursor-pointer">Estates Bylaws</span>
          </div>
        </div>
      </footer>
    </div>
  );
}