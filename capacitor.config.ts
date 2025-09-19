import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rental.management',
  appName: '租房管理系统',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    allowNavigation: [
      'http://192.168.79.13:8000',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'http://192.168.79.15:8000',
      'http://192.168.1.*:8000',
      'http://192.168.0.*:8000',
      'http://10.0.2.2:8000',
      '192.168.*',
      'localhost:*',
      '127.0.0.1:*',
      '10.0.2.2:*'
    ],
    cleartext: true,
    hostname: 'localhost'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: 'RentalManagementApp'
  },
  ios: {
    scheme: '租房管理系统',
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    },
    App: {
      launchUrl: 'capacitor://localhost'
    }
  }
};

export default config;
