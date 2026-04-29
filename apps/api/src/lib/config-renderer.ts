import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Config Renderer — generates global_configs.php from template + client data.
 *
 * Token format:  {{SECTION.KEY|default_value}}
 * Nested refs:   {{URLS.WEB_BASE_URL}} can be used inside default values
 * Derived keys:  CLIENT_UPPER = uppercase of client slug (for event class names)
 *                CLIENT_DOMAIN = domain extracted from web_base_url
 */

interface RenderContext {
  identity: Record<string, string>;
  urls: Record<string, string>;
  database: Record<string, string>;
  versions: Record<string, string>;
  flags: Record<string, string | number>;
  rateFeed: Record<string, string | number>;
  socket: Record<string, string>;
  lightstreamer: Record<string, string>;
  broadcast: Record<string, string>;
  encryption: Record<string, string>;
  notifications: Record<string, string>;
  whatsapp: Record<string, string>;
  mobileApps: Record<string, string>;
  email: Record<string, string>;
  hedge: Record<string, string>;
  display: Record<string, string>;
  [key: string]: Record<string, string | number>;
}

/**
 * Flatten configData (from DB) into the rendering context.
 * Adds derived keys like CLIENT_UPPER and CLIENT_DOMAIN.
 */
export function buildRenderContext(configData: Record<string, unknown>): RenderContext {
  const ctx: Record<string, Record<string, string | number>> = {};

  for (const [section, values] of Object.entries(configData)) {
    if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
      const sectionData: Record<string, string | number> = {};
      for (const [key, val] of Object.entries(values as Record<string, unknown>)) {
        sectionData[key.toUpperCase()] = val as string | number;
      }
      ctx[section.toUpperCase()] = sectionData;
    }
  }

  // Derived keys
  const client = String(ctx.IDENTITY?.CLIENT || '');
  ctx.IDENTITY = ctx.IDENTITY || {};
  ctx.IDENTITY.CLIENT_UPPER = client.toUpperCase();

  // Extract domain from web_base_url
  const webUrl = String(ctx.URLS?.WEB_BASE_URL || '');
  try {
    const u = new URL(webUrl);
    ctx.IDENTITY.CLIENT_DOMAIN = u.hostname;
  } catch {
    ctx.IDENTITY.CLIENT_DOMAIN = webUrl.replace(/https?:\/\//, '').replace(/\/$/, '');
  }

  // Add generation timestamp
  ctx.GENERATED_AT = { '': new Date().toISOString() };

  return ctx as unknown as RenderContext;
}

/**
 * Resolve a single token value from the context.
 * Handles nested references like {{URLS.WEB_BASE_URL}} inside defaults.
 */
function resolveToken(token: string, ctx: RenderContext, depth = 0): string {
  if (depth > 5) return token; // prevent infinite recursion

  // Parse: SECTION.KEY|default
  const pipeIdx = token.indexOf('|');
  const ref = pipeIdx >= 0 ? token.substring(0, pipeIdx) : token;
  const defaultVal = pipeIdx >= 0 ? token.substring(pipeIdx + 1) : '';

  const dotIdx = ref.indexOf('.');
  if (dotIdx < 0) {
    // Special case: top-level key like {{GENERATED_AT}}
    const val = ctx[ref]?.[''];
    return val !== undefined ? String(val) : defaultVal;
  }

  const section = ref.substring(0, dotIdx);
  const key = ref.substring(dotIdx + 1);

  const val = ctx[section]?.[key];
  if (val !== undefined && val !== null && String(val) !== '') {
    return String(val);
  }

  // Resolve nested tokens in the default value
  const resolved = defaultVal.replace(/\{\{([^}]+)\}\}/g, (_, inner) =>
    resolveToken(inner.trim(), ctx, depth + 1),
  );

  return resolved;
}

/**
 * Render a template string by replacing all {{...}} tokens.
 */
export function renderTemplate(template: string, ctx: RenderContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, token) =>
    resolveToken(token.trim(), ctx),
  );
}

/**
 * Load the template file and render it with the given config data.
 */
export async function renderConfigFile(
  templatePath: string,
  configData: Record<string, unknown>,
): Promise<string> {
  const template = await fs.readFile(templatePath, 'utf-8');
  const ctx = buildRenderContext(configData);
  return renderTemplate(template, ctx);
}

/**
 * Resolve the absolute path to the sources directory.
 */
export function getSourcesDir(): string {
  // Walk up from apps/api/src/lib to project root, then into sources/
  return path.resolve(import.meta.dirname, '..', '..', '..', '..', 'sources');
}

/**
 * Get the path to a specific source's template or schema file.
 */
export function getSourcePath(sourceSlug: string, fileName: string): string {
  return path.join(getSourcesDir(), sourceSlug, fileName);
}
