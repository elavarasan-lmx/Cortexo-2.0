'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Building2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter', price: '$0', period: '/mo', icon: Zap, color: '#3B82F6', popular: false,
    description: 'Perfect for individual developers',
    features: ['3 Projects', '5 Deployments / day', 'Basic Error Tracking', 'Community Support', '1 Server', '100 MB Logs'],
  },
  {
    name: 'Pro', price: '$49', period: '/mo', icon: Crown, color: '#7C3AED', popular: true,
    description: 'For growing teams and startups',
    features: ['Unlimited Projects', 'Unlimited Deploys', 'AI Code Review', 'AI Bug Detection', '10 Servers', 'Slack + Discord Integration', 'Priority Support', '10 GB Logs', 'Custom Agents'],
  },
  {
    name: 'Enterprise', price: '$199', period: '/mo', icon: Building2, color: '#F59E0B', popular: false,
    description: 'For large teams and organizations',
    features: ['Everything in Pro', 'Unlimited Servers', 'SSO / SAML', 'Audit Logs', 'SLA Guarantee', 'Dedicated Support', 'Custom Integrations', 'On-Premise Option', 'Unlimited Logs', 'White-label'],
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'rgb(var(--text-primary))', margin: '0 0 12px' }}>Choose Your Plan</h1>
        <p style={{ fontSize: '16px', color: 'rgb(var(--text-muted))', margin: '0 0 24px' }}>Start free, scale as you grow. No credit card required.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '4px', borderRadius: '10px', backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}>
          <button onClick={() => setAnnual(false)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: !annual ? '#7C3AED' : 'transparent', color: !annual ? '#fff' : 'rgb(var(--text-muted))' }}>Monthly</button>
          <button onClick={() => setAnnual(true)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: annual ? '#7C3AED' : 'transparent', color: annual ? '#fff' : 'rgb(var(--text-muted))' }}>Annual <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', marginLeft: '4px' }}>-20%</span></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = annual ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8)}` : plan.price;
          return (
            <div key={plan.name} style={{
              borderRadius: '20px', border: plan.popular ? '2px solid #7C3AED' : '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--surface))', padding: '32px 28px', position: 'relative',
              boxShadow: plan.popular ? '0 8px 32px rgba(124,58,237,0.15)' : 'none',
              transform: plan.popular ? 'scale(1.03)' : 'none',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: '20px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                  Most Popular
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '20px', height: '20px', color: plan.color }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>{plan.name}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'rgb(var(--text-muted))', margin: '0 0 20px' }}>{plan.description}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'rgb(var(--text-primary))' }}>{price}</span>
                <span style={{ fontSize: '14px', color: 'rgb(var(--text-muted))' }}>{plan.period}</span>
              </div>
              <button style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: plan.popular ? 'none' : '1px solid rgb(var(--border))',
                backgroundColor: plan.popular ? '#7C3AED' : 'transparent',
                color: plan.popular ? '#fff' : 'rgb(var(--text-primary))',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px',
              }}>
                {plan.price === '$0' ? 'Get Started Free' : 'Start 14-Day Trial'}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check style={{ width: '14px', height: '14px', color: plan.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'rgb(var(--text-primary))' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
