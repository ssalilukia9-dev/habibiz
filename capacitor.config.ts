import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.median.android.jboner',
  appName: 'Habibi Sanctuary',
  webDir: 'dist',
  backgroundColor: '#0b0614',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    useLegacyBridge: false,
    backgroundColor: '#0b0614'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#10b981',
      sound: 'adhan.wav'
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;

