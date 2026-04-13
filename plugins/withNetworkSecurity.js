// @ts-check
const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const CERT_SRC = path.join(__dirname, '..', 'assets', 'certificates', 'domoticz.crt');
const NETWORK_SECURITY_CONFIG_NAME = 'network_security_config';

/**
 * Copie le certificat dans android/app/src/main/res/raw/
 * et génère le network_security_config.xml dans android/app/src/main/res/xml/
 */
const withCertificateFiles = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

      // Copie du certificat dans res/raw/
      const rawDir = path.join(androidResDir, 'raw');
      fs.mkdirSync(rawDir, { recursive: true });

      if (fs.existsSync(CERT_SRC)) {
        fs.copyFileSync(CERT_SRC, path.join(rawDir, 'domoticz.crt'));
        console.log('[withNetworkSecurity] Certificat copié dans res/raw/domoticz.crt');
      } else {
        console.warn(
          '[withNetworkSecurity] ⚠️  Certificat introuvable : ' + CERT_SRC +
          '\n  → Placez votre certificat dans assets/certificates/domoticz.crt'
        );
      }

      // Génération du network_security_config.xml dans res/xml/
      const xmlDir = path.join(androidResDir, 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });

      const domoticzDomain = process.env.EXPO_PUBLIC_DOMOTICZ_DOMAIN ?? '';

      const domainConfig = domoticzDomain
        ? `
    <!-- Domaine Domoticz : confiance au certificat auto-signé -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">${domoticzDomain}</domain>
        <trust-anchors>
            <certificates src="@raw/domoticz"/>
        </trust-anchors>
    </domain-config>`
        : `
    <!-- Aucun domaine configuré via EXPO_PUBLIC_DOMOTICZ_DOMAIN -->
    <!-- Le certificat domoticz.crt est disponible mais aucune restriction de domaine n'est appliquée -->
    <!-- Configurez EXPO_PUBLIC_DOMOTICZ_DOMAIN pour restreindre la confiance à votre domaine Domoticz -->`;

      const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
${domainConfig}

    <!-- Trafic général : certificats système uniquement, HTTP autorisé sur LAN -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
`;

      fs.writeFileSync(
        path.join(xmlDir, `${NETWORK_SECURITY_CONFIG_NAME}.xml`),
        networkSecurityConfig,
        'utf8'
      );
      console.log('[withNetworkSecurity] network_security_config.xml généré');

      return cfg;
    },
  ]);
};

/**
 * Injecte android:networkSecurityConfig dans AndroidManifest.xml
 */
const withNetworkSecurityManifest = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const application = manifest.manifest.application?.[0];

    if (application) {
      application.$['android:networkSecurityConfig'] = `@xml/${NETWORK_SECURITY_CONFIG_NAME}`;
      console.log('[withNetworkSecurity] android:networkSecurityConfig injecté dans AndroidManifest.xml');
    }

    return cfg;
  });
};

/**
 * Plugin Expo pour la gestion du certificat SSL auto-signé Domoticz.
 *
 * Prérequis :
 *   - Placer le certificat PEM dans : assets/certificates/domoticz.crt
 *   - Optionnel : définir EXPO_PUBLIC_DOMOTICZ_DOMAIN dans .env pour restreindre la confiance au domaine
 *
 * Ce plugin :
 *   1. Copie domoticz.crt dans android/app/src/main/res/raw/
 *   2. Génère network_security_config.xml dans android/app/src/main/res/xml/
 *   3. Injecte android:networkSecurityConfig dans AndroidManifest.xml
 */
const withNetworkSecurity = (config) => {
  config = withCertificateFiles(config);
  config = withNetworkSecurityManifest(config);
  return config;
};

module.exports = withNetworkSecurity;
