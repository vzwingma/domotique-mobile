const { readFileSync } = require('fs');

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

module.exports = ({ config }) => {
  const styleDir = process.env.EXPO_PUBLIC_MY_ENVIRONMENT === 'previewC' ? 'c' : 'v';

  const appIcon = `./assets/images/${styleDir}/icon.png`;
  const splashImage = `./assets/images/${styleDir}/splash.png`;
  const adaptiveIconForegroundImage = `./assets/images/${styleDir}/adaptive-icon.png`;
  const webFavicon = `./assets/images/${styleDir}/favicon.png`;
  const mobileVersion = packageJson.version || config.version || '1.0.0';

  return {
    ...config,
    version: mobileVersion,
    extra: {
      ...config.extra,
      domoticzAuth: process.env.DOMOTICZ_AUTH,
    },
    icon: appIcon,
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
