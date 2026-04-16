// @ts-check
const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const CERT_SRC = path.join(__dirname, '..', 'assets', 'certificates', 'domoticz.crt');
const CERT_DEST_NAME = 'domoticz';
const NETWORK_SECURITY_CONFIG_NAME = 'network_security_config';

// Gradle 8.13 : dernière version stable 8.x compatible JDK 17/21 et avec le plugin foojay d'Expo
const GRADLE_VERSION = '8.13';

/**
 * Corrige la version Gradle dans gradle-wrapper.properties.
 * Gradle 9.x est incompatible avec le plugin foojay-resolver généré par Expo.
 */
const withGradleVersion = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const wrapperPropsPath = path.join(
        cfg.modRequest.projectRoot,
        'android', 'gradle', 'wrapper', 'gradle-wrapper.properties'
      );

      if (!fs.existsSync(wrapperPropsPath)) {
        console.warn('[withNetworkSecurity] gradle-wrapper.properties introuvable, ignoré');
        return cfg;
      }

      let content = fs.readFileSync(wrapperPropsPath, 'utf8');
      const gradleUrlRegex = /distributionUrl=.*gradle-[\d.]+-.*\.zip/;
      const currentMatch = content.match(gradleUrlRegex);

      if (currentMatch) {
        const currentUrl = currentMatch[0];
        const newUrl = `distributionUrl=https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip`;
        if (currentUrl !== newUrl) {
          content = content.replace(gradleUrlRegex, newUrl);
          fs.writeFileSync(wrapperPropsPath, content, 'utf8');
          console.log(`[withNetworkSecurity] Gradle rétrogradé → ${GRADLE_VERSION} (était : ${currentUrl.split('gradle-')[1]?.split('-')[0]})`);
        } else {
          console.log(`[withNetworkSecurity] Gradle déjà à ${GRADLE_VERSION}`);
        }
      }

      return cfg;
    },
  ]);
};

/**
 * Copie le certificat dans android/app/src/main/res/raw/
 * et génère le network_security_config.xml dans android/app/src/main/res/xml/
 */
const withCertificateFiles = (config, options) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

      // Copie du certificat dans res/raw/
      const rawDir = path.join(androidResDir, 'raw');
      fs.mkdirSync(rawDir, { recursive: true });

      const certExists = fs.existsSync(CERT_SRC);
      if (certExists) {
        fs.copyFileSync(CERT_SRC, path.join(rawDir, CERT_DEST_NAME + '.pem'));
        console.log('[withNetworkSecurity] Certificat copié dans res/raw/' + CERT_DEST_NAME + '.pem');
      } else {
        console.warn(
          '[withNetworkSecurity] ⚠️  Certificat introuvable : ' + CERT_SRC +
          '\n  → Placez votre certificat dans assets/certificates/domoticz.crt'
        );
      }

      // Résolution du domaine : option plugin (prioritaire) > env var (fallback)
      const domoticzDomain = options?.domain ?? process.env.EXPO_PUBLIC_DOMOTICZ_DOMAIN ?? '';

      if (!domoticzDomain) {
        console.warn(
          '[withNetworkSecurity] ⚠️  Domaine non configuré.' +
          '\n  → Passez le domaine en option dans app.json :' +
          '\n     ["./plugins/withNetworkSecurity", { "domain": "votre-domaine.fr" }]'
        );
      } else {
        console.log('[withNetworkSecurity] Domaine configuré : ' + domoticzDomain);
      }

      // Génération du network_security_config.xml dans res/xml/
      const xmlDir = path.join(androidResDir, 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });

      const domainConfig = domoticzDomain
        ? `
    <!-- Domaine Domoticz : confiance au certificat auto-signé bundlé dans l'app -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">${domoticzDomain}</domain>
        <trust-anchors>
            <!-- Certificat auto-signé bundlé -->
            <certificates src="@raw/${CERT_DEST_NAME}"/>
            <!-- Certificats installés manuellement sur l'appareil (fallback développement) -->
            <certificates src="user"/>
        </trust-anchors>
    </domain-config>`
        : `
    <!-- ⚠️  Aucun domaine configuré : le certificat bundlé ne sera pas utilisé -->
    <!-- Passez le domaine en option du plugin dans app.json pour activer le support SSL auto-signé -->`;

      const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
${domainConfig}

    <!-- Trafic général : certificats système uniquement, HTTP cleartext autorisé (LAN) -->
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
 * Configuration dans app.json (domaine obligatoire en option directe, pas via env var) :
 *   ["./plugins/withNetworkSecurity", { "domain": "domatique.freeboxos.fr" }]
 *
 * Ce plugin :
 *   1. Rétrograde Gradle à 8.13 (compatible JDK 17/21, incompatibilité Gradle 9.x + foojay)
 *   2. Copie domoticz.crt dans android/app/src/main/res/raw/domoticz.pem
 *   3. Génère network_security_config.xml dans android/app/src/main/res/xml/
 *   4. Injecte android:networkSecurityConfig dans AndroidManifest.xml
 */
const withNetworkSecurity = (config, options) => {
  config = withGradleVersion(config);
  config = withCertificateFiles(config, options);
  config = withNetworkSecurityManifest(config);
  return config;
};

module.exports = withNetworkSecurity;
