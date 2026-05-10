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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 transition-shadow duration-300 group-hover:shadow-indigo-500/40">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Cortexo</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Stack', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 no-underline cursor-pointer"
            >
              Log in
            </Link>
            <Link
              href="/register"
              id="nav-cta"
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
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
        </div>

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} {...motionProps}>
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              AI-Powered DevOps Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              Deploy. Detect. Debug.{' '}
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
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-base font-semibold text-white no-underline shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                id="hero-cta-secondary"
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-3.5 text-base font-medium text-slate-300 no-underline hover:border-slate-500 hover:text-white transition-all duration-200 cursor-pointer"
              >
                See How It Works
              </a>
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
              From CI/CD pipelines to AI-powered debugging — Cortexo covers your entire deployment lifecycle.
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

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative py-24 lg:py-32 border-t border-white/[0.04]">
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
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            {...motionProps}
          >
            <StepCard
              step="01"
              icon={Terminal}
              title="Connect"
              description="Link your GitHub repo. Cortexo auto-detects your stack (PHP, Node, Flutter) and suggests the optimal pipeline."
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
          </motion.div>
        </div>
      </section>

      {/* ── Tech Stack Section ── */}
      <section id="stack" className="relative py-24 lg:py-32 border-t border-white/[0.04]">
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
                className="group flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-300 cursor-default"
              >
                <div className="rounded-lg bg-slate-800/60 p-3 group-hover:bg-indigo-500/10 transition-colors duration-300">
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
      <section className="relative py-20 border-t border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            {...motionProps}
          >
            {[
              { value: '90+', label: 'API Endpoints' },
              { value: '70+', label: 'Client Deployments' },
              { value: '18', label: 'Database Tables' },
              { value: '37', label: 'Dashboard Pages' },
            ].map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="relative py-24 lg:py-32 border-t border-white/[0.04]">
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
              question="What makes Cortexo different from Sentry or Datadog?"
              answer="Cortexo combines CI/CD, error monitoring, and AI root cause analysis in one tool. Sentry only monitors — Cortexo also deploys and fixes. Plus, our AI learns your deployment patterns over time."
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
      <section className="relative py-24 lg:py-32 border-t border-white/[0.04]">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
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
              Ready to stop debugging blindly?
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
      <footer className="border-t border-white/[0.04] py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <span className="text-xs font-bold text-white">C</span>
              </div>
              <span className="text-sm font-semibold text-white">Cortexo</span>
              <span className="text-xs text-slate-600">— The brain for your code</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              {['Privacy', 'Terms', 'Documentation', 'GitHub'].map((item) => (
                <a key={item} href="#" className="hover:text-slate-300 transition-colors duration-200 cursor-pointer no-underline text-inherit">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-600">
            © 2026 Cortexo. Built for small DevOps teams.
          </p>
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
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] transition-all duration-300 cursor-default"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none`} />

      <div className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg mb-4`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
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
