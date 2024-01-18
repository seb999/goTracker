import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'go.tracker.starter',
  appName: 'goTracker',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
