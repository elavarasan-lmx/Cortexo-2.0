/**
 * Testing Module — Shared Types & Constants
 */

// ─── Business Module Classification ────────────────────────────────────────

export const MODULE_MAP: Record<string, { keywords: string[]; severity: string }> = {
  auth:     { keywords: ['login','logout','session','register','password','otp','captcha','psw','CheckAppVersion'], severity: 'high' },
  rates:    { keywords: ['rate','rates','premium','spot','commodity','apirate','bcencdata','txtdata','broadcastrate','chart_data','ratehistory'], severity: 'critical' },
  trading:  { keywords: ['booking','trade','order','quotation','contract','hedge','bookingRequest','updatebook','limitupdate','bookupdate','gettradecommodities','tradable_status','trade_summery'], severity: 'critical' },
  delivery: { keywords: ['delivery','delv','unfix','pendingdelv','customerDelivery'], severity: 'high' },
  margin:   { keywords: ['margin','balance','limit','transaction','fund'], severity: 'high' },
  kyc:      { keywords: ['kyc','userregistration','customer_group','customerservice'], severity: 'medium' },
  reports:  { keywords: ['report','history','historical','calendar','log','analytics','chart'], severity: 'medium' },
  notif:    { keywords: ['sms','email','whatsapp','notification','push','marquee','message','alert','onesignal'], severity: 'medium' },
  config:   { keywords: ['setting','config','logo','maintenance','general','rpanel','getsettings','bankdetails','aboutus','contactus','socialshare'], severity: 'low' },
};

// ─── Module Pattern Definitions (for /testing/modules endpoint) ────────────

export const MODULE_PATTERNS: Record<string, { keywords: string[]; description: string }> = {
  'Authentication': {
    keywords: ['login', 'logout', 'session', 'auth', 'register', 'password', 'otp', 'captcha', 'psw'],
    description: 'Login, registration, session management, OTP verification',
  },
  'Rate Engine': {
    keywords: ['rate', 'rates', 'premium', 'spot', 'mjdma', 'commodity', 'prem_group', 'com_group'],
    description: 'Live rates, historical rates, commodities, premium calculation',
  },
  'Booking & Trade': {
    keywords: ['booking', 'trade', 'order', 'quotation', 'contract', 'hedge', 'delivery'],
    description: 'Trade booking, delivery, contracts, hedging',
  },
  'User Management': {
    keywords: ['user', 'customer', 'client', 'admin_user', 'kyc', 'account'],
    description: 'User profiles, KYC, customer management',
  },
  'Communication': {
    keywords: ['sms', 'email', 'whatsapp', 'notification', 'push', 'marquee', 'message'],
    description: 'SMS, Email, WhatsApp, push notifications',
  },
  'Content & Pages': {
    keywords: ['news', 'gallery', 'popup', 'banner', 'video', 'career', 'page', 'event', 'advertisement'],
    description: 'CMS content, galleries, popups, videos',
  },
  'Settings & Config': {
    keywords: ['setting', 'config', 'logo', 'maintenance', 'general', 'api_key', 'rpanel'],
    description: 'System configuration, branding, maintenance mode',
  },
  'Reports': {
    keywords: ['report', 'log', 'history', 'analytics', 'stats', 'calendar'],
    description: 'Business reports, rate history, booking reports',
  },
};

// ─── Helper Functions ──────────────────────────────────────────────────────

export function classifyEndpoint(endpoint: string): { module: string; severity: string } {
  const ep = endpoint.toLowerCase();
  for (const [mod, cfg] of Object.entries(MODULE_MAP)) {
    if (cfg.keywords.some(k => ep.includes(k.toLowerCase()))) return { module: mod, severity: cfg.severity };
  }
  return { module: 'other', severity: 'low' };
}

export function validateJsonSchema(body: string, endpoint: string): { valid: boolean; errors: string[] } {
  const errs: string[] = [];
  try {
    const json = JSON.parse(body);
    // Mobile API must have { success, message, data }
    if (endpoint.includes('mobileapi')) {
      if (typeof json.success === 'undefined') errs.push('Missing "success" field');
      if (typeof json.message === 'undefined' && typeof json.data === 'undefined') errs.push('Missing "message" or "data" field');
    }
    // Public API must return valid JSON object/array
    if (endpoint.includes('/api/') && typeof json !== 'object') errs.push('Expected JSON object/array');
  } catch {
    if (body.trim().startsWith('<')) errs.push('Returns HTML instead of JSON');
    else if (body.trim() === '') errs.push('Empty response body');
    else errs.push('Invalid JSON response');
  }
  return { valid: errs.length === 0, errors: errs };
}

/**
 * Helper to make HTTP requests for testing
 */
export async function doFetch(
  url: string,
  method: string,
  payload?: any,
  headers?: Record<string, string>,
  cookies?: string
): Promise<{ status: number; body: string; latency: number; error?: string }> {
  const caseStart = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const opts: RequestInit = {
      method, signal: controller.signal, redirect: 'manual' as RequestRedirect,
      headers: { 'User-Agent': 'Cortexo-Tester/2.0', ...(headers || {}) },
    };
    if (cookies) (opts.headers as any)['Cookie'] = cookies;
    if (method === 'POST' && payload) {
      (opts.headers as any)['Content-Type'] = 'application/json';
      opts.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    }
    const res = await fetch(url, opts);
    clearTimeout(timeout);
    const text = await res.text();
    return { status: res.status, body: text.substring(0, 2000), latency: Date.now() - caseStart };
  } catch (err: any) {
    return { status: 0, body: '', latency: Date.now() - caseStart, error: err.name === 'AbortError' ? 'Timeout (15s)' : err.message };
  }
}
