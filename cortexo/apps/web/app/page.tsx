'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  GitBranch,
  Bug,
  Search,
  Brain,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Server,
  Code,
  Terminal,
  Activity,
  Lock,
  BarChart3,
  Layers,
  RefreshCw,
  CheckCircle2,
  Monitor,
  Cpu,
} from 'lucide-react';
import { useState, useMemo } from 'react';

/* ========================================
   ANIMATION VARIANTS
   ======================================== */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ========================================
   MAIN LANDING PAGE
   ======================================== */
export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = useMemo(() => {
    if (shouldReduceMotion) {
      return { initial: undefined, animate: undefined, whileInView: undefined };
    }
    return {};
  }, [shouldReduceMotion]);

  return (
    <div className="min-h-screen bg-[#060918] text-white overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] backdrop-blur-2xl bg-[#060918]/80">
        {/* Nav glow effect */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="relative">
              <img src="/logo.png" alt="Logimax Bullion" className="h-10 transition-all duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {['Features', 'How It Works', 'Stack', 'FAQ'].map((item, idx) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="relative px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer group"
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute inset-x-4 bottom-0 h-px scale-x-0 group-hover:scale-x-100 bg-gradient-to-r from-indigo-500 to-violet-500 transition-transform duration-300" />
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="group relative rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 no-underline cursor-pointer"
            >
              <span>Log in</span>
              <span className="absolute inset-0 rounded-lg bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            <Link
              href="/register"
              id="nav-cta"
              className="group relative rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 animated-grid" style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite',
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="absolute right-1/5 bottom-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[100px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Floating code brackets */}
          <div className="absolute left-[10%] top-[20%] text-indigo-500/20 animate-float-slow" style={{ animationDuration: '20s' }}>
            <span className="text-6xl font-mono">{'{'}</span>
          </div>
          <div className="absolute right-[15%] top-[30%] text-cyan-500/20 animate-float-medium" style={{ animationDuration: '25s' }}>
            <span className="text-5xl font-mono">&lt;/&gt;</span>
          </div>
          <div className="absolute left-[20%] bottom-[25%] text-violet-500/20 animate-float-fast" style={{ animationDuration: '18s' }}>
            <span className="text-4xl font-mono">[]</span>
          </div>
          <div className="absolute right-[10%] bottom-[20%] text-indigo-500/20 animate-float-medium" style={{ animationDuration: '22s' }}>
            <span className="text-5xl font-mono">{'()'}</span>
          </div>

          {/* Animated floating dots */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 4) * 20}%`,
                width: 4 + (i % 3) * 2,
                height: 4 + (i % 3) * 2,
                background: i % 2 === 0 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(139, 92, 246, 0.4)',
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Connection lines (decorative) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path
              d="M 100 200 Q 200 100 300 200 T 500 200 T 700 200 T 900 200"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} {...motionProps}>
            {/* Badge with shimmer */}
            <motion.div
              variants={fadeUp}
              className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 backdrop-blur-sm overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-400/20 to-indigo-500/0 animate-shimmer" />
              <Sparkles className="relative z-10 h-4 w-4 animate-pulse" />
              <span className="relative z-10">AI-Powered DevOps Platform</span>
            </motion.div>

            {/* Headline with animated gradient */}
            <motion.h1
              variants={fadeUp}
              className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              <span className="text-slate-100">Deploy.</span>{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  Detect.
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent blur-xl opacity-50 animate-pulse" />
              </span>{' '}
              <span className="text-slate-100">Debug.</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                All in one platform.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg lg:text-xl leading-relaxed text-slate-400"
            >
              The only DevOps tool that deploys your code, catches bugs automatically,
              and tells you <span className="font-semibold text-white">WHY</span> they
              happened — powered by AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                id="hero-cta-primary"
                className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-base font-semibold text-white no-underline shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <a
                href="#how-it-works"
                id="hero-cta-secondary"
                className="group flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-3.5 text-base font-medium text-slate-300 no-underline hover:border-indigo-500/50 hover:text-white hover:bg-white/[0.04] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                See How It Works
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div variants={fadeUp} className="mt-12 flex justify-center">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors">
                  <span className="text-xs uppercase tracking-widest">Scroll</span>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-4">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-600">
                Trusted by teams managing 70+ client deployments
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
                {[
                  { icon: Server, label: 'SSH/SFTP First' },
                  { icon: Code, label: 'PHP + Node.js' },
                  { icon: Shield, label: 'Production-Safe AI' },
                  { icon: Activity, label: '90+ API Endpoints' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-slate-500">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Core Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Everything you need to ship with confidence
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              From CI/CD pipelines to AI-powered debugging — Logimax Bullion DevOps covers your entire deployment lifecycle.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            {...motionProps}
          >
            <FeatureCard
              icon={GitBranch}
              title="CI/CD Pipeline Builder"
              description="Visual + YAML config with GitHub Actions templates. One-click SSH/SFTP deploys to 70+ servers."
              gradient="from-indigo-500 to-blue-500"
              glowColor="indigo"
            />
            <FeatureCard
              icon={Bug}
              title="Auto Bug Detection"
              description="SDKs capture PHP/JS/Node errors in real-time. AI groups, prioritizes, and links them to deploys."
              gradient="from-rose-500 to-pink-500"
              glowColor="rose"
            />
            <FeatureCard
              icon={Search}
              title="AI Root Cause Analysis"
              description="Error → Deploy correlation → AI explains WHY + suggests fix. One-click PR creation."
              gradient="from-cyan-500 to-blue-500"
              glowColor="cyan"
            />
            <FeatureCard
              icon={Brain}
              title="Agent Intelligence"
              description="Autonomous AI agents review code, detect anomalies, and learn from your deployment patterns."
              gradient="from-violet-500 to-purple-500"
              glowColor="violet"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
          <div className="absolute left-0 bottom-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16"
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-3">
              Why Choose Logimax
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Built for modern DevOps teams
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Faster Deploys', desc: 'Reduce deployment time by 70% with automated pipelines', icon: Zap, color: 'indigo' },
              { title: 'Smarter Debugging', desc: 'AI-powered root cause analysis cuts MTTR by 80%', icon: Search, color: 'cyan' },
              { title: 'Better Collaboration', desc: 'Unified platform for devs, ops, and security teams', icon: Globe, color: 'violet' },
            ].map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${benefit.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative inline-flex rounded-xl bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-600 p-4 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="relative text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">{benefit.title}</h3>
                <p className="relative text-slate-400">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative py-24 lg:py-32">
        {/* Gradient Divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Simple Workflow
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Three steps to smarter DevOps
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-16 relative"
            {...motionProps}
          >
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                step="01"
                icon={Terminal}
                title="Connect"
                description="Link your GitHub repo. Logimax auto-detects your stack (PHP, Node, Flutter) and suggests the optimal pipeline."
              />
              <StepCard
                step="02"
                icon={Zap}
                title="Deploy"
                description="Push to main → pipeline runs → code deploys via SSH/SFTP to your servers. Live logs streaming in real-time."
              />
              <StepCard
                step="03"
                icon={Brain}
                title="Detect & Fix"
                description="SDKs monitor your app. When bugs appear, AI instantly correlates them to your last deploy and suggests fixes."
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Terminal Preview Section ── */}
      <section className="relative py-24 lg:py-32 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-12"
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              See It In Action
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Watch Logimax DevOps in action
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            {...motionProps}
          >
            {/* Terminal Window with glowing border */}
            <div className="relative rounded-2xl border border-white/[0.15] bg-[#0a0a12]/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-indigo-500/20 group">
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Terminal Header */}
              <div className="relative flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80 group-hover:bg-red-500 transition-colors" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80 group-hover:bg-yellow-500 transition-colors" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80 group-hover:bg-green-500 transition-colors" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-500 font-mono group-hover:text-slate-400 transition-colors">Logimax DevOps Terminal</span>
                </div>
                {/* Minimize/maximize buttons */}
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-slate-700/50 group-hover:bg-slate-600/50 transition-colors" />
                  <div className="h-3 w-3 rounded-full bg-slate-700/50 group-hover:bg-slate-600/50 transition-colors" />
                </div>
              </div>

              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">➜</span>
                    <span className="text-slate-400">Running deployment pipeline...</span>
                  </div>
                  <div className="pl-4 text-slate-500 text-xs">
                    <span>→ Cloning repository</span>
                    <span className="typing-cursor">_</span>
                  </div>
                  <div className="pl-4 text-slate-500 text-xs mt-2">
                    <span>→ Installing dependencies</span>
                  </div>
                  <div className="pl-4 text-slate-500 text-xs mt-2">
                    <span>→ Running tests</span>
                  </div>
                  <div className="pl-4 text-green-400 text-xs mt-2">
                    <span>✓ All tests passed (42/42)</span>
                  </div>
                  <div className="pl-4 text-slate-500 text-xs mt-2">
                    <span>→ Building production bundle</span>
                  </div>
                  <div className="pl-4 text-slate-500 text-xs mt-2">
                    <span>→ Deploying via SSH/SFTP</span>
                  </div>

                  {/* AI Alert */}
                  <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Brain className="h-4 w-4" />
                      <span className="text-xs font-semibold">AI Analysis Complete</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Detected 2 potential issues in your recent commit. <span className="text-indigo-300 cursor-pointer hover:underline">View analysis →</span>
                    </p>
                  </div>

                  <div className="pl-4 text-green-400 text-xs mt-3">
                    <span>✓ Deployment successful! (2.3s)</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-cyan-400">➜</span>
                    <span className="text-slate-400 text-xs">Ready for next command...</span>
                    <span className="typing-cursor text-slate-400">_</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Comparison Section ── */}
      <section className="relative py-24 lg:py-32 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-red-500/5 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-green-500/5 to-transparent" />
        </div>

        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16"
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-rose-400 mb-3">
              Why Logimax?
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Traditional DevOps vs Logimax
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional DevOps */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative p-8 rounded-2xl border border-red-500/20 bg-red-500/[0.02]"
              {...motionProps}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
              <h3 className="text-lg font-semibold text-red-400 mb-6 flex items-center gap-2">
                <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded">SLOW</span>
                Traditional DevOps
              </h3>
              <ul className="space-y-4">
                {[
                  'Manual deployment scripts',
                  'Hours of debugging wasted',
                  'Multiple tools = more complexity',
                  'No AI-powered insights',
                  'Reactive bug fixing',
                  'Steep learning curve',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-400 text-sm">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Logimax */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="relative p-8 rounded-2xl border border-green-500/20 bg-green-500/[0.02] overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="text-lg font-semibold text-green-400 mb-6 flex items-center gap-2">
                <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded">FAST</span>
                Logimax DevOps
              </h3>
              <ul className="space-y-4 relative">
                {[
                  'One-click automated deploys',
                  'AI tells you WHY bugs happen',
                  'All-in-one unified platform',
                  'Proactive error prevention',
                  'Smart root cause analysis',
                  'Anyone can use it',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack Section ── */}
      <section id="stack" className="relative py-24 lg:py-32">
        {/* Gradient Divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Built for Scale
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Powered by modern infrastructure
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            {...motionProps}
          >
            {[
              { icon: Monitor, label: 'Next.js 16', sub: 'Dashboard' },
              { icon: Zap, label: 'Fastify 5', sub: 'REST API' },
              { icon: Layers, label: 'PostgreSQL', sub: 'Database' },
              { icon: RefreshCw, label: 'Redis 7', sub: 'Queue + Cache' },
              { icon: Lock, label: 'JWT + OAuth', sub: 'Auth' },
              { icon: Cpu, label: 'BullMQ', sub: 'Workers' },
            ].map(({ icon: Icon, label, sub }) => (
              <motion.div
                key={label}
                variants={scaleIn}
                className="group flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className="rounded-lg bg-slate-800/60 p-3 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-300">
                  <Icon className="h-6 w-6 text-slate-400 group-hover:text-indigo-400 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="relative py-20 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8"
            {...motionProps}
          >
            {[
              { value: '90+', label: 'API Endpoints', color: 'indigo' },
              { value: '70+', label: 'Client Deployments', color: 'violet' },
              { value: '18', label: 'Database Tables', color: 'cyan' },
              { value: '37', label: 'Dashboard Pages', color: 'rose' },
            ].map(({ value, label, color }, idx) => (
              <motion.div
                key={label}
                variants={fadeUp}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <p className={`text-4xl lg:text-5xl font-bold bg-gradient-to-br from-${color}-400 to-${color}-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                    {value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 group-hover:text-slate-400 transition-colors">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trusted By Section ── */}
      <section className="relative py-16 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
        </div>
        <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-xs font-medium uppercase tracking-widest text-slate-600 mb-8">
              Trusted by innovative teams worldwide
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-60">
              {[
                { name: 'TechCorp', initials: 'TC' },
                { name: 'DevFlow', initials: 'DF' },
                { name: 'CloudBase', initials: 'CB' },
                { name: 'CodeShip', initials: 'CS' },
                { name: 'DeployLab', initials: 'DL' },
              ].map(({ name, initials }) => (
                <div key={name} className="group flex items-center gap-3 cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-slate-800/60 flex items-center justify-center border border-slate-700 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all duration-300">
                    <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-400">{initials}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors">{name}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="relative py-24 lg:py-32">
        {/* Gradient Divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
            {...motionProps}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Got Questions?
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Frequently asked questions
            </motion.h2>
          </motion.div>

          <div className="flex flex-col gap-3">
            <FaqItem
              question="What makes Logimax Bullion DevOps different from Sentry or Datadog?"
              answer="Logimax Bullion DevOps combines CI/CD, error monitoring, and AI root cause analysis in one tool. Sentry only monitors — we also deploy and fix. Plus, our AI learns your deployment patterns over time."
            />
            <FaqItem
              question="Does it work with SSH/SFTP servers?"
              answer="Yes! SSH/SFTP is our primary deployment target. We're built for teams managing traditional hosting (like shared servers or VPS), not just cloud-native infrastructure."
            />
            <FaqItem
              question="What languages/frameworks are supported?"
              answer="PHP (CodeIgniter 3/4), Node.js, JavaScript (browser), Python (Django/Flask), and Flutter. SDKs are lightweight (<10KB for browser) and install in one line."
            />
            <FaqItem
              question="How does the AI work?"
              answer="We use OpenAI GPT-4o and Claude to analyze error→deploy correlations. The AI reads your git diff, stack trace, and codebase context to explain WHY a bug happened and suggest a fix."
            />
            <FaqItem
              question="Is it free?"
              answer="We'll have a generous free tier. Pricing details coming soon. For now, everything is free during beta."
            />
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Section ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Gradient Divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute left-[20%] top-[30%] h-[200px] w-[200px] rounded-full bg-violet-600/8 blur-[60px]" />
          <div className="absolute right-[20%] bottom-[30%] h-[200px] w-[200px] rounded-full bg-cyan-600/8 blur-[60px]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-indigo-400/30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            {...motionProps}
          >
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-bold tracking-tight">
              Ready to stop <span className="glow-text">debugging blindly?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-400">
              Join teams who deploy faster and fix bugs before users notice.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link
                href="/register"
                id="bottom-cta"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-lg font-semibold text-white no-underline shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
              >
                <Sparkles className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-white/[0.04] py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[800px] rounded-full bg-indigo-600/5 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-7xl px-5 lg:px-8 relative">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Logimax Bullion" className="h-8" />
                <span className="text-sm text-slate-400">Logimax Bullion</span>
              </div>
              <p className="text-sm text-slate-500 max-w-md mb-4">
                AI-powered DevOps platform for small teams. Deploy faster, detect bugs earlier, and debug with confidence.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: 'github', label: 'GitHub' },
                  { icon: 'twitter', label: 'Twitter' },
                  { icon: 'discord', label: 'Discord' },
                ].map(({ icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    className="group flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300"
                  >
                    <span className="text-xs text-slate-500 group-hover:text-indigo-400">{icon.charAt(0).toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-slate-500">
              {['Privacy Policy', 'Terms of Service', 'Documentation', 'API'].map((item) => (
                <a key={item} href="#" className="hover:text-slate-300 transition-colors duration-200">
                  {item}
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-600">
              © 2026 Logimax Bullion DevOps. Built for small DevOps teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ========================================
   COMPONENTS
   ======================================== */

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  glowColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:-translate-y-2 transition-all duration-300 cursor-default overflow-hidden"
    >
      {/* Animated corner decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div className={`absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-${glowColor}-500/50 to-transparent`} />
        <div className={`absolute top-0 right-0 h-px w-8 bg-gradient-to-l from-${glowColor}-500/50 to-transparent`} />
      </div>

      {/* Hover glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none`} />

      <div className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors duration-300">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </motion.div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={fadeUp} className="relative text-center group">
      {/* Step number badge */}
      <div className="mx-auto mb-5 relative">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-300">
          <Icon className="h-7 w-7 text-indigo-400" />
        </div>
        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
          {step}
        </span>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </motion.div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`rounded-xl border transition-all duration-300 ${
        open
          ? 'border-indigo-500/20 bg-indigo-500/[0.04]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left bg-transparent border-none cursor-pointer group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white pr-4">{question}</span>
        <div className={`flex-shrink-0 rounded-full p-1 transition-colors duration-200 ${open ? 'bg-indigo-500/20' : 'bg-white/[0.05]'}`}>
          {open ? (
            <ChevronUp className="h-4 w-4 text-indigo-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-white/[0.06] px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-400">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}
