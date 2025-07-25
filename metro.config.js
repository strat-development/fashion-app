const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = (() => {
    config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

    config.resolver.extraNodeModules = {
        '@supabase/node-fetch': require.resolve('node-fetch'),
    };

    return config;
})();

module.exports = withNativeWind(config, { input: './global.css' })