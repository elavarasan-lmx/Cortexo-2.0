// Cortexo Device Profiles — Ported from BullionLite/Mobile/DeviceProfile.java
// Predefined mobile device profiles for responsive view testing via Playwright
// Original: DeviceProfile.java enum with 6 device presets + CDP emulation params

export interface DeviceProfile {
  /** Human-readable device name */
  displayName: string;
  /** Viewport width in CSS pixels */
  width: number;
  /** Viewport height in CSS pixels */
  height: number;
  /** Device pixel ratio for high-DPI emulation */
  pixelRatio: number;
  /** User-agent string for accurate mobile detection */
  userAgent: string;
  /** Whether the device is a mobile (affects behavior thresholds) */
  isMobile: boolean;
  /** Whether the device supports touch events */
  hasTouch: boolean;
}

/**
 * Registry of predefined device profiles.
 * Ported from BullionLite's DeviceProfile.java enum and extended with
 * additional modern devices relevant to bullion platform testing.
 */
export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  'iphone-se': {
    displayName: 'iPhone SE',
    width: 375,
    height: 667,
    pixelRatio: 2.0,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  },
  'iphone-12-pro': {
    displayName: 'iPhone 12 Pro',
    width: 390,
    height: 844,
    pixelRatio: 3.0,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  },
  'samsung-galaxy': {
    displayName: 'Samsung Galaxy S20 Ultra',
    width: 412,
    height: 915,
    pixelRatio: 3.5,
    userAgent:
      'Mozilla/5.0 (Linux; Android 10; SM-G988B) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    isMobile: true,
    hasTouch: true,
  },
  'pixel-5': {
    displayName: 'Google Pixel 5',
    width: 393,
    height: 851,
    pixelRatio: 2.75,
    userAgent:
      'Mozilla/5.0 (Linux; Android 11; Pixel 5) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    isMobile: true,
    hasTouch: true,
  },
  'ipad': {
    displayName: 'iPad',
    width: 768,
    height: 1024,
    pixelRatio: 2.0,
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  },
  'ipad-pro': {
    displayName: 'iPad Pro 12.9',
    width: 1024,
    height: 1366,
    pixelRatio: 2.0,
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  },
  'desktop-1080': {
    displayName: 'Desktop 1080p',
    width: 1920,
    height: 1080,
    pixelRatio: 1.0,
    userAgent: '',
    isMobile: false,
    hasTouch: false,
  },
  'desktop-720': {
    displayName: 'Desktop 720p',
    width: 1280,
    height: 720,
    pixelRatio: 1.0,
    userAgent: '',
    isMobile: false,
    hasTouch: false,
  },
};

/**
 * Get a device profile by key (case-insensitive).
 * Returns null if no matching profile is found.
 */
export function getDeviceProfile(key: string): DeviceProfile | null {
  const normalized = key.toLowerCase().replace(/\s+/g, '-');
  return DEVICE_PROFILES[normalized] ?? null;
}

/**
 * List all available device profile keys.
 */
export function listDeviceProfiles(): string[] {
  return Object.keys(DEVICE_PROFILES);
}

/**
 * Get a human-readable summary string for a device profile.
 * Ported from DeviceProfile.getSummary() in Java.
 */
export function getDeviceSummary(profile: DeviceProfile): string {
  return `${profile.displayName} (${profile.width}x${profile.height} @${profile.pixelRatio}x)`;
}
