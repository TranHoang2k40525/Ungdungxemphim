// src/config/env.js
// Environment configuration for the app

const ENV = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.35.237.105:5016/api',
    assetUrl: process.env.EXPO_PUBLIC_ASSET_URL || 'http://10.35.237.105:5016/Assets',
  },
  production: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://yourdomain.com/api',
    assetUrl: process.env.EXPO_PUBLIC_ASSET_URL || 'https://yourdomain.com/Assets',
  },
};

const getEnvVars = () => {
  // __DEV__ is set by React Native
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars;
