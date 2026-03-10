import { ExpoConfig } from 'expo/config';

const appConfig = ({ config }: { config: ExpoConfig }): ExpoConfig => {
  
  const styleDir = process.env.EXPO_PUBLIC_MY_ENVIRONMENT === 'previewC' ? 'c' : 'v';

  const appIcon = `./assets/images/${styleDir}/icon.png`;

  const splashImage = `./assets/images/${styleDir}/splash.png`;

  const adaptiveIconForegroundImage = `./assets/images/${styleDir}/adaptive-icon.png`;

  const webFavicon = `./assets/images/${styleDir}/favicon.png`;
  
  return {
    ...config,
    icon: appIcon,
    splash: {
      ...config.splash,
      image: splashImage,
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        ...config.android?.adaptiveIcon,
        foregroundImage: adaptiveIconForegroundImage,
      },
    },
    web: {
      ...config.web,
      favicon: webFavicon,
    },
  };
};
export default appConfig;
