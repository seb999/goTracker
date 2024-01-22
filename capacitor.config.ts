import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'go.tracker.starter',
  appName: 'goTracker',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext:true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;