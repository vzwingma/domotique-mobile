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
        if (currentUrl === newUrl) {
          console.log(`[withNetworkSecurity] Gradle déjà à ${GRADLE_VERSION}`);
        } else {
          content = content.replace(gradleUrlRegex, newUrl);
          fs.writeFileSync(wrapperPropsPath, content, 'utf8');
          console.log(`[withNetworkSecurity] Gradle rétrogradé → ${GRADLE_VERSION} (était : ${currentUrl.split('gradle-')[1]?.split('-')[0]})`);
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

      if (domoticzDomain) {
        console.log('[withNetworkSecurity] Domaine configuré : ' + domoticzDomain);
      } else {
        console.warn(
          '[withNetworkSecurity] ⚠️  Domaine non configuré.' +
          '\n  → Passez le domaine en option dans app.json :' +
          '\n     ["./plugins/withNetworkSecurity", { "domain": "votre-domaine.fr" }]'
        );
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
 * Génère DomoticzSSLHelper.java et patche MainApplication.kt pour configurer
 * OkHttp avec un TrustManager composite (CAs système + cert Domoticz bundlé)
 * et un HostnameVerifier avec CN fallback (pour les certs sans SubjectAltName).
 *
 * Cette approche est plus fiable que NetworkSecurityConfig seul et fonctionne
 * indépendamment de la version Android ou des personnalisations constructeur.
 */
const withOkHttpSsl = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const packageName = cfg.android?.package ?? 'io.github.vzwingma.domatique.mobile';

      // Chemin vers le répertoire du package Java/Kotlin
      const javaDir = path.join(
        projectRoot, 'android', 'app', 'src', 'main', 'java',
        ...packageName.split('.')
      );
      fs.mkdirSync(javaDir, { recursive: true });

      // Génération de DomoticzSSLHelper.java
      const helperContent = `package ${packageName};

import android.content.Context;
import android.util.Log;
import com.facebook.react.modules.network.OkHttpClientProvider;
import okhttp3.OkHttpClient;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

/**
 * Configure OkHttp pour faire confiance au certificat auto-signé Domoticz bundlé dans l'app.
 * Gère à la fois la validation de la chaîne de certificats (TrustManager composite)
 * et la vérification du hostname (avec fallback CN pour les certs sans SubjectAltName).
 *
 * Généré automatiquement par plugins/withNetworkSecurity.js — ne pas modifier manuellement.
 */
public final class DomoticzSSLHelper {
    private static final String TAG = "DomoticzSSL";

    private DomoticzSSLHelper() {}

    public static void configureSsl(final Context context) {
        try {
            // Chargement du certificat auto-signé depuis les ressources raw
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            X509Certificate domoticzCert;
            try (InputStream is = context.getResources().openRawResource(R.raw.${CERT_DEST_NAME})) {
                domoticzCert = (X509Certificate) cf.generateCertificate(is);
            }
            Log.i(TAG, "Certificat Domoticz chargé : " + domoticzCert.getSubjectX500Principal().getName());

            // KeyStore personnalisé contenant notre certificat
            KeyStore customKs = KeyStore.getInstance(KeyStore.getDefaultType());
            customKs.load(null, null);
            customKs.setCertificateEntry("domoticz-ca", domoticzCert);

            // TrustManager système (CAs du système Android)
            TrustManagerFactory sysTmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            sysTmf.init((KeyStore) null);
            final X509TrustManager sysTm = findX509TrustManager(sysTmf);

            // TrustManager personnalisé (notre certificat Domoticz)
            TrustManagerFactory customTmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            customTmf.init(customKs);
            final X509TrustManager customTm = findX509TrustManager(customTmf);

            // TrustManager composite : essaie les CAs système, puis notre certificat
            final X509TrustManager compositeTm = new X509TrustManager() {
                @Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) {}

                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType)
                        throws java.security.cert.CertificateException {
                    try {
                        sysTm.checkServerTrusted(chain, authType);
                    } catch (java.security.cert.CertificateException e) {
                        // Les CAs système ne font pas confiance à ce cert : essai avec le cert Domoticz bundlé
                        customTm.checkServerTrusted(chain, authType);
                        Log.i(TAG, "✅ Certificat validé par le CA Domoticz bundlé");
                    }
                }

                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    X509Certificate[] sys = sysTm.getAcceptedIssuers();
                    X509Certificate[] custom = customTm.getAcceptedIssuers();
                    X509Certificate[] all = new X509Certificate[sys.length + custom.length];
                    System.arraycopy(sys, 0, all, 0, sys.length);
                    System.arraycopy(custom, 0, all, sys.length, custom.length);
                    return all;
                }
            };

            SSLContext sslCtx = SSLContext.getInstance("TLS");
            sslCtx.init(null, new TrustManager[]{compositeTm}, null);
            final SSLSocketFactory sslSocketFactory = sslCtx.getSocketFactory();

            // HostnameVerifier avec fallback CN (pour les certs sans extension SubjectAltName)
            final HostnameVerifier hnv = new HostnameVerifier() {
                @Override
                public boolean verify(String hostname, SSLSession session) {
                    // Vérification standard (OkHttp / HttpsURLConnection)
                    if (HttpsURLConnection.getDefaultHostnameVerifier().verify(hostname, session)) {
                        return true;
                    }
                    // Fallback : vérification manuelle via le CN (Common Name)
                    try {
                        X509Certificate cert = (X509Certificate) session.getPeerCertificates()[0];
                        String cn = extractCN(cert.getSubjectX500Principal().getName());
                        if (cn != null) {
                            boolean match = cn.equalsIgnoreCase(hostname)
                                || (cn.startsWith("*.") && hostname.endsWith(cn.substring(1)));
                            if (match) {
                                Log.i(TAG, "✅ Hostname validé via CN : " + cn + " → " + hostname);
                            } else {
                                Log.w(TAG, "❌ Hostname CN mismatch : CN=" + cn + ", hostname=" + hostname);
                            }
                            return match;
                        }
                    } catch (Exception e) {
                        Log.w(TAG, "Hostname verification CN fallback échoué : " + e.getMessage());
                    }
                    return false;
                }

                private String extractCN(String dn) {
                    for (String part : dn.split(",")) {
                        String[] kv = part.trim().split("=", 2);
                        if (kv.length == 2 && "CN".equalsIgnoreCase(kv[0].trim())) {
                            return kv[1].trim();
                        }
                    }
                    return null;
                }
            };

            OkHttpClientProvider.setOkHttpClientFactory(new com.facebook.react.modules.network.OkHttpClientFactory() {
                @Override
                public OkHttpClient createNewNetworkModuleClient() {
                    return OkHttpClientProvider.createClientBuilder(context)
                        .sslSocketFactory(sslSocketFactory, compositeTm)
                        .hostnameVerifier(hnv)
                        .build();
                }
            });

            Log.i(TAG, "✅ OkHttp SSL factory Domoticz activée (cert bundlé + CN fallback)");

        } catch (Exception e) {
            Log.e(TAG, "❌ Erreur config SSL Domoticz — comportement OkHttp par défaut : " + e.getMessage());
        }
    }

    private static X509TrustManager findX509TrustManager(TrustManagerFactory tmf) {
        for (TrustManager tm : tmf.getTrustManagers()) {
            if (tm instanceof X509TrustManager) return (X509TrustManager) tm;
        }
        throw new RuntimeException("Aucun X509TrustManager trouvé");
    }
}
`;

      fs.writeFileSync(path.join(javaDir, 'DomoticzSSLHelper.java'), helperContent, 'utf8');
      console.log('[withNetworkSecurity] DomoticzSSLHelper.java généré dans ' + packageName);

      // Patch de MainApplication.kt
      const mainAppPath = path.join(javaDir, 'MainApplication.kt');
      if (fs.existsSync(mainAppPath)) {
        let content = fs.readFileSync(mainAppPath, 'utf8');

        if (content.includes('DomoticzSSLHelper.configureSsl')) {
          console.log('[withNetworkSecurity] MainApplication.kt déjà patché');
        } else {
          // Insertion avant loadReactNative(this) en préservant l'indentation
          content = content.replace(
            /^(\s+)(loadReactNative\(this\))/m,
            '$1DomoticzSSLHelper.configureSsl(this)\n$1$2'
          );
          fs.writeFileSync(mainAppPath, content, 'utf8');
          console.log('[withNetworkSecurity] MainApplication.kt patché avec DomoticzSSLHelper.configureSsl');
        }
      } else {
        console.warn('[withNetworkSecurity] ⚠️  MainApplication.kt introuvable : ' + mainAppPath);
      }

      return cfg;
    },
  ]);
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
 *   5. Génère DomoticzSSLHelper.java et patche MainApplication.kt pour configurer OkHttp
 *      directement avec un TrustManager composite et un HostnameVerifier CN-fallback
 */
const withNetworkSecurity = (config, options) => {
  config = withGradleVersion(config);
  config = withCertificateFiles(config, options);
  config = withNetworkSecurityManifest(config);
  config = withOkHttpSsl(config);
  return config;
};

module.exports = withNetworkSecurity;
