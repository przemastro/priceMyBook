// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
    // [Web-only]: Enables CSS support in Metro.
    isCSSEnabled: true,
});

// Dodaj rozszerzenia dla WebAssembly (potrzebne dla OpenCV)
config.resolver.sourceExts.push('wasm');
config.resolver.sourceExts.push('cjs');

// Dla TensorFlow.js
config.resolver.assetExts = config.resolver.assetExts.filter(
    ext => ext !== 'svg'
);
config.resolver.sourceExts.push('svg');

// Transformer dla SVG
config.transformer.babelTransformerPath = require.resolve(
    'react-native-svg-transformer'
);

// Ignoruj node_modules dla szybkości (opcjonalnie)
config.watchFolders = [];

// Zwiększ timeout
config.server = {
    ...config.server,
    port: 8081,
    enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
            // Zwiększ timeout do 60 sekund
            res.setTimeout(60000);
            return middleware(req, res, next);
        };
    },
};

// Reset cache przy każdym starcie
config.resetCache = true;

module.exports = config;