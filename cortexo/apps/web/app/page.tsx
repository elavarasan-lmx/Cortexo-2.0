'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'rgb(15, 23, 42)' }}>
      {/* Navigation */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 50,
          width: '100%',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'flex',
            height: '64px',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                height: '32px',
                width: '32px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366F1, #9333EA)',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>C</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>Cortexo</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#features" style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>
              Features
            </a>

            <a href="#how-it-works" style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>
              How It Works
            </a>
            <a href="#faq" style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>
              FAQ
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/login"
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#CBD5E1',
                textDecoration: 'none',
              }}
            >
              Log in
            </Link>
            <Link
              href="/register"
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(to right, #6366F1, #9333EA)',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'white',
                textDecoration: 'none',
                transition: 'box-shadow 0.2s',
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '160px',
          paddingBottom: '80px',
        }}
      >
        {/* Gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: '25%',
              top: '20%',
              height: '400px',
              width: '400px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '20%',
              bottom: '20%',
              height: '400px',
              width: '400px',
              borderRadius: '50%',
              backgroundColor: 'rgba(147, 51, 234, 0.2)',
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              height: '256px',
              width: '256px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div
          style={{
            position: 'relative',
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                padding: '6px 16px',
                fontSize: '14px',
                color: '#A5B4FC',
                marginBottom: '24px',
              }}
            >
              <Sparkles style={{ height: '16px', width: '16px' }} />
              AI-Powered DevOps Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              style={{
                maxWidth: '56rem',
                margin: '0 auto',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                color: 'white',
              }}
            >
              Deploy. Detect. Debug.{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(to right, #818CF8, #C084FC, #22D3EE)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                All in one platform.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              style={{
                maxWidth: '42rem',
                margin: '24px auto 0',
                fontSize: '1.125rem',
                lineHeight: 1.75,
                color: '#94A3B8',
              }}
            >
              The only DevOps tool that deploys your code, catches bugs
              automatically, and tells you{' '}
              <span style={{ fontWeight: 600, color: 'white' }}>WHY</span> they
              happened — powered by AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              style={{
                marginTop: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <Link
                href="/register"
                id="hero-cta-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #6366F1, #9333EA)',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'box-shadow 0.3s',
                }}
              >
                Get Started Free
                <ArrowRight style={{ height: '16px', width: '16px' }} />
              </Link>
              <a
                href="#how-it-works"
                id="hero-cta-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#CBD5E1',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
              >
                See How It Works
              </a>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              variants={fadeUp}
              style={{
                marginTop: '64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748B',
                }}
              >
                Trusted by teams managing 70+ client deployments
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
                  <Server style={{ height: '20px', width: '20px' }} />
                  <span style={{ fontSize: '14px' }}>SSH/SFTP First</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
                  <Code style={{ height: '20px', width: '20px' }} />
                  <span style={{ fontSize: '14px' }}>PHP + Node.js</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
                  <Shield style={{ height: '20px', width: '20px' }} />
                  <span style={{ fontSize: '14px' }}>Production-Safe AI</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ position: 'relative', padding: '96px 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            style={{ textAlign: 'center' }}
          >
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: 700, color: 'white' }}
            >
              Everything you need to ship with confidence
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{
                maxWidth: '42rem',
                margin: '16px auto 0',
                fontSize: '1.125rem',
                color: '#94A3B8',
              }}
            >
              From CI/CD pipelines to AI-powered debugging — Cortexo covers
              your entire deployment lifecycle.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            style={{
              marginTop: '64px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
            }}
          >
            <FeatureCard
              icon={GitBranch}
              title="CI/CD Pipeline Builder"
              description="Visual + YAML config with GitHub Actions templates. One-click SSH/SFTP deploys to 70+ servers."
              color="#818CF8"
              borderColor="rgba(99, 102, 241, 0.2)"
              bgColor="rgba(99, 102, 241, 0.1)"
            />
            <FeatureCard
              icon={Bug}
              title="Auto Bug Detection"
              description="SDKs capture PHP/JS/Node errors in real-time. AI groups, prioritizes, and links them to deploys."
              color="#F87171"
              borderColor="rgba(239, 68, 68, 0.2)"
              bgColor="rgba(239, 68, 68, 0.1)"
            />
            <FeatureCard
              icon={Search}
              title="AI Root Cause Analysis"
              description="Error → Deploy correlation → AI explains WHY + suggests fix. One-click PR creation."
              color="#60A5FA"
              borderColor="rgba(59, 130, 246, 0.2)"
              bgColor="rgba(59, 130, 246, 0.1)"
            />
            <FeatureCard
              icon={Brain}
              title="Agent Intelligence"
              description="Autonomous AI agents review code, fix bugs, and learn from your codebase patterns."
              color="#C084FC"
              borderColor="rgba(147, 51, 234, 0.2)"
              bgColor="rgba(147, 51, 234, 0.1)"
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        style={{
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '96px 0',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            style={{ textAlign: 'center' }}
          >
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: 700, color: 'white' }}
            >
              Three steps to smarter DevOps
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            style={{
              marginTop: '64px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
            }}
          >
            <StepCard
              step="01"
              title="Connect"
              description="Link your GitHub repo. Cortexo auto-detects your stack (PHP, Node, Flutter) and suggests the optimal pipeline."
            />
            <StepCard
              step="02"
              title="Deploy"
              description="Push to main → pipeline runs → code deploys via SSH/SFTP to your servers. Live logs streaming in real-time."
            />
            <StepCard
              step="03"
              title="Detect & Fix"
              description="SDKs monitor your app. When bugs appear, AI instantly correlates them to your last deploy and suggests fixes."
            />
          </motion.div>
        </div>
      </section>



      {/* FAQ Section */}
      <section
        id="faq"
        style={{
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '96px 0',
        }}
      >
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 24px' }}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              marginBottom: '48px',
              textAlign: 'center',
              fontSize: 'clamp(1.875rem, 4vw, 2.25rem)',
              fontWeight: 700,
              color: 'white',
            }}
          >
            Frequently asked questions
          </motion.h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FaqItem
              question="What makes Cortexo different from Sentry or Datadog?"
              answer="Cortexo combines CI/CD, error monitoring, and AI root cause analysis in one tool. Sentry only monitors — Cortexo also deploys and fixes. Plus, our Source Code Brain learns your codebase patterns."
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

      {/* CTA Section */}
      <section
        style={{
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '96px 0',
        }}
      >
        <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: 700, color: 'white' }}
            >
              Ready to stop debugging blindly?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{ marginTop: '16px', fontSize: '1.125rem', color: '#94A3B8' }}
            >
              Join teams who deploy faster and fix bugs before users notice.
            </motion.p>
            <motion.div variants={fadeUp} style={{ marginTop: '32px' }}>
              <Link
                href="/register"
                id="bottom-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #6366F1, #9333EA)',
                  padding: '16px 32px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'box-shadow 0.3s',
                }}
              >
                <Sparkles style={{ height: '20px', width: '20px' }} />
                Get Started Free
                <ArrowRight style={{ height: '20px', width: '20px' }} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  height: '28px',
                  width: '28px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366F1, #9333EA)',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>C</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Cortexo</span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                — The brain for your code
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', color: '#64748B' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                Privacy
              </a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                Terms
              </a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                Documentation
              </a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                GitHub
              </a>
            </div>
          </div>
          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>
            © 2026 Cortexo. Built with ❤️ for small DevOps teams.
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
  color,
  borderColor,
  bgColor,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        borderRadius: '16px',
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        padding: '24px',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          borderRadius: '12px',
          backgroundColor: bgColor,
          padding: '12px',
          marginBottom: '16px',
        }}
      >
        <Icon style={{ height: '24px', width: '24px', color }} />
      </div>
      <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 600, color: 'white' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#94A3B8' }}>{description}</p>
    </motion.div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
      <div
        style={{
          margin: '0 auto 16px',
          display: 'flex',
          height: '56px',
          width: '56px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2))',
          fontSize: '20px',
          fontWeight: 700,
          color: '#818CF8',
        }}
      >
        {step}
      </div>
      <h3 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 600, color: 'white' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#94A3B8' }}>{description}</p>
    </motion.div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      style={{
        borderRadius: '12px',
        border: '1px solid #1E293B',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>{question}</span>
        {open ? (
          <ChevronUp style={{ height: '16px', width: '16px', flexShrink: 0, color: '#94A3B8' }} />
        ) : (
          <ChevronDown style={{ height: '16px', width: '16px', flexShrink: 0, color: '#94A3B8' }} />
        )}
      </button>
      {open && (
        <div style={{ borderTop: '1px solid #1E293B', padding: '16px 24px' }}>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#94A3B8' }}>{answer}</p>
        </div>
      )}
    </motion.div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlight,
  badge,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlight: boolean;
  badge?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        borderRadius: '16px',
        border: highlight ? '2px solid rgba(99, 102, 241, 0.5)' : '1px solid #1E293B',
        backgroundColor: highlight ? 'rgba(99, 102, 241, 0.06)' : 'rgba(15, 23, 42, 0.5)',
        padding: '32px 24px',
        position: 'relative',
        transition: 'border-color 0.2s',
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          borderRadius: '9999px', background: 'linear-gradient(to right, #6366F1, #9333EA)',
          padding: '4px 16px', fontSize: '11px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#818CF8', margin: '0 0 4px' }}>{name}</h3>
      <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px' }}>{description}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
        <span style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>{price}</span>
        {period && <span style={{ fontSize: '14px', color: '#64748B' }}>{period}</span>}
      </div>
      <a
        href={ctaHref}
        style={{
          display: 'block', textAlign: 'center', borderRadius: '10px', padding: '12px',
          fontSize: '14px', fontWeight: 600, textDecoration: 'none',
          background: highlight ? 'linear-gradient(to right, #6366F1, #9333EA)' : 'transparent',
          color: highlight ? 'white' : '#818CF8',
          border: highlight ? 'none' : '1px solid #334155',
          transition: 'box-shadow 0.2s',
        }}
      >
        {cta}
      </a>
      <div style={{ marginTop: '24px', borderTop: '1px solid #1E293B', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', color: '#818CF8' }}>✓</span>
            </div>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>{f}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
