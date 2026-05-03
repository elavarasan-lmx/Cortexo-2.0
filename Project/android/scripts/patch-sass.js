/**
 * Post-install patch script
 * Fixes node-sass / Dart Sass compatibility for Node.js 16+
 *
 * 1. Redirects node-sass to dart-sass (pure JS, no native binary needed)
 * 2. Fixes multiline strings in ionic.functions.scss that dart-sass rejects
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// --- Patch 1: Redirect node-sass to dart-sass ---
const nodeSassIndex = path.join(ROOT, 'node_modules', 'node-sass', 'lib', 'index.js');
if (fs.existsSync(nodeSassIndex)) {
  const wrapper = `// Patched by scripts/patch-sass.js — redirect node-sass to dart-sass\nvar sass = require('sass');\nmodule.exports = sass;\n`;
  fs.writeFileSync(nodeSassIndex, wrapper, 'utf8');
  console.log('[patch-sass] ✔ Redirected node-sass → sass (Dart Sass)');
} else {
  console.log('[patch-sass] ⚠ node-sass/lib/index.js not found, skipping patch 1');
}

// --- Patch 2: Fix multiline strings in ionic.functions.scss ---
const ionicFunctionsScss = path.join(ROOT, 'node_modules', 'ionic-angular', 'themes', 'ionic.functions.scss');
if (fs.existsSync(ionicFunctionsScss)) {
  let content = fs.readFileSync(ionicFunctionsScss, 'utf8');
  let patched = false;

  // Fix first multiline string (color-value error message)
  const multiline1 = /\$error-msg:\s*"\s*\n\s*The value.*?;\s*\)\s*;\s*"\s*;/s;
  if (multiline1.test(content)) {
    content = content.replace(
      multiline1,
      '$error-msg: "The value `#{$color-value}` must be a color. If you are setting the value as a map make sure both the base and contrast are defined as colors.";'
    );
    patched = true;
  }

  // Fix second multiline string (color-name error message)
  const multiline2 = /\$error-msg:\s*"\s*\n\s*The map color.*?;\s*\)\s*;\s*"\s*;/s;
  if (multiline2.test(content)) {
    content = content.replace(
      multiline2,
      '$error-msg: "The map color `#{$color-name}` is not defined. Please make sure the color exists in your $colors map.";'
    );
    patched = true;
  }

  if (patched) {
    fs.writeFileSync(ionicFunctionsScss, content, 'utf8');
    console.log('[patch-sass] ✔ Fixed multiline strings in ionic.functions.scss');
  } else {
    console.log('[patch-sass] ℹ ionic.functions.scss already patched or format changed');
  }
} else {
  console.log('[patch-sass] ⚠ ionic.functions.scss not found, skipping patch 2');
}

console.log('[patch-sass] Done.');
