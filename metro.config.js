const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Temporarily exclude react-native-reanimated to resolve minSdkVersion conflict
config.resolver.blacklistRE = /node_modules\/react-native-reanimated\/.*/;

module.exports = config;