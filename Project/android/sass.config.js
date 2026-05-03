
const sassConfig = require('./node_modules/@ionic/app-scripts/config/sass.config.js');

// Silence all Sass deprecation warnings (since this is a legacy Ionic 3 project)
sassConfig.quietDeps = true;
sassConfig.logger = {
    warn(message, options) {
        if (options.deprecation) return;
        console.warn(message);
    }
};

// Also add for compatibility with newer Sass options if needed
sassConfig.silenceDeprecations = ['elseif', 'if-function', 'global-builtin', 'color-functions', 'slash-div', 'import'];

module.exports = sassConfig;
