// src/config/env.js
// Environment configuration for the app

const ENV = {
  development: {
    // Ưu tiên đọc từ file .env, fallback về localhost nếu không có
    // Trong dev, cần dùng Cloudflare Tunnel hoặc localtunnel để Expo tunnel có thể kết nối
    // Khi chạy web trong browser, dùng localhost của máy host
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 
            (typeof window !== 'undefined' ? 'http://localhost:5016/api' : 'http://backend:5016/api'),
    assetUrl: process.env.EXPO_PUBLIC_ASSET_URL || 
              (typeof window !== 'undefined' ? 'http://localhost:5016/Assets' : 'http://backend:5016/Assets'),
  },
  production: {
    // Production cũng đọc từ .env
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5016/api',
    assetUrl: process.env.EXPO_PUBLIC_ASSET_URL || 'http://localhost:5016/Assets',
  },
};

const getEnvVars = () => {
  // __DEV__ is set by React Native (true khi chạy expo start)
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars;
