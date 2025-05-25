import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.unrayinternational.app",
  appName: "Un Ray",
  webDir: "www",
  bundledWebRuntime: false,

  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["phone"],
      webRecaptchaSiteKey: "6LcgmyorAAAAAGbKGu8jnVczIi4fISnh5cxEi4ny"
    },
    Keyboard: {
      resize: "ionic" // Opciones: "ionic", "body", "none"
    },
    GoogleMaps: {
      apiKey: {
        android: 'AIzaSyCdS2NwR42Mk9uTeKeOKKlipcCRhpHtdV8',
        ios: 'AIzaSyCdS2NwR42Mk9uTeKeOKKlipcCRhpHtdV8',
      }
    },

    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#ff4500",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner:false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: false,
      splashImmersive: false,
      layoutName: "splash",
      useDialog: false
    }
    ,

    Geolocation: {
      androidPermission: "fine"
    },
    Camera: {
      permissions: ['camera', 'photos'],
    },
    OneSignal: {
      appId: '9e1814a7-d611-4c13-b6e4-fa16fafc21e3', // Reemplaza con tu APP ID de OneSignal
      //safari_web_id: 'safari_web_id', // Si usas Safari (opcional)
      autoRegister: true,
      inAppLaunchURL: true,
      googleProjectNumber: '524176191412',
      notificationIcon: 'assets/marker/icon.png', // Ruta del icono
    }

  },

};

export default config;
