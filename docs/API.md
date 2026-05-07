# API Domoticz — Documentation

**Documentation Version:** 3.0.0  
**Last Updated:** 2026-05-04  
**Server:** Domoticz (https://www.domoticz.com/)  
**Scope:** Endpoints utilisés par domoticz-mobile

---

## 📋 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Authentification](#-authentification)
3. [Format des Requêtes](#-format-des-requêtes)
4. [Gestion des Erreurs](#-gestion-des-erreurs)
5. [Endpoints Principaux](#-endpoints-principaux)
6. [Exemples de Flux Complets](#-exemples-de-flux-complets)
7. [Diagnostic SSL](#-diagnostic-ssl)

---

## 👁️ Vue d'ensemble

**API Domoticz** est une REST API HTTP fournie par le serveur Domoticz. L'application **domoticz-mobile** communique avec cette API pour :

- Récupérer la liste des équipements (lumières, volets, capteurs, etc.)
- Envoyer des commandes de contrôle (allumer/éteindre, ajuster niveaux, etc.)
- Vérifier l'état du serveur

**Caractéristiques :**
- **Protocole :** HTTP/HTTPS
- **Format :** JSON
- **Authentification :** Basic Auth (login:password encodé en Base64)
- **Statut codes :** 200 (OK), 400 (Bad Request), 401 (Unauthorized), 500 (Server Error)

---

## 🔐 Authentification

### Basic Auth

Domoticz utilise **HTTP Basic Authentication**. Chaque requête doit inclure un header `Authorization` :

```
Authorization: Basic <Base64_Encoded_Credentials>
```

### Configuration dans domoticz-mobile

1. **Générer la valeur Base64 :**

```bash
# Format: login:password encodé en Base64

# macOS/Linux
echo -n "monlogin:monmotdepasse" | base64
# Sortie: bW9ubG9naW46bW9ubW90ZGVwYXNzZQ==

# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("monlogin:monmotdepasse"))
# Sortie: bW9ubG9naW46bW9ubW90ZGVwYXNzZQ==
```

2. **Ajouter à `.env.local` :**

```env
EXPO_PUBLIC_DOMOTICZ_AUTH=bW9ubG9naW46bW9ubW90ZGVwYXNzZQ==
```

3. **ClientHTTP.service.ts l'ajoute automatiquement à chaque requête :**

```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Basic ${process.env.EXPO_PUBLIC_DOMOTICZ_AUTH}`
  }
});
```

### Credentials Sécurité

⚠️ **Important :**
- Les credentials sont stockés dans `.env.local` (non versionné)
- Pour la production, utiliser un secret manager ou CI/CD variables
- Ne jamais commiter `.env.local` ou les credentials en clair

---

## 📤 Format des Requêtes

### Structure générale

```
GET /json.htm?type=TYPE&param=PARAM&idx=IDX&...
```

### Paramètres communs

| Paramètre | Type | Description | Requis |
|-----------|------|-------------|--------|
| `type` | string | Type de requête (devices, command, status) | ✅ |
| `param` | string | Sous-commande (switchlight, setused, etc.) | Selon type |
| `idx` | number | Device index Domoticz | Selon param |
| `nvalue` | number | Commande numérique (0=off, 1=on, etc.) | Selon param |
| `svalue` | string | Commande string (niveau, etc.) | Selon param |

### Exemples

**1. Récupérer la liste des équipements :**

```
GET /json.htm?type=devices&filter=all
```

**2. Allumer une lumière (idx 42) :**

```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=1&svalue=
```

**3. Ajuster le niveau d'une lumière (idx 42) à 75% :**

```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=2&svalue=75
```

**4. Obtenir l'état du serveur :**

```
GET /json.htm?type=status
```

---

## 📋 Gestion des Erreurs

### Réponses Domoticz

Domoticz utilise le format suivant :

**Succès (status OK) :**

```json
{
  "status": "OK",
  "data": { ... }
}
```

**Erreur (status ERR) :**

```json
{
  "status": "ERR",
  "message": "Device not found"
}
```

### Statuts HTTP

| Code | Sens | Cause Courante |
|------|------|-----------------|
| 200 | OK | Requête réussie |
| 400 | Bad Request | Paramètre manquant ou invalide |
| 401 | Unauthorized | Authentification échouée |
| 404 | Not Found | URL invalide |
| 500 | Server Error | Erreur serveur Domoticz |

### Gestion dans domoticz-mobile

Le `ClientHTTP.service.ts` gère les erreurs :

```typescript
export class ClientHTTP {
  async callDomoticz(params: object): Promise<DomoticzResponse> {
    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.error(`HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'ERR') {
        console.error('API Error:', data.message);
        throw new Error(`Domoticz Error: ${data.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to call Domoticz:', error);
      setConnectionStatus(ConnectionStatus.ERROR);
      throw error;
    }
  }
}
```

### États de Connexion

| État | Condition | Badge UI |
|------|-----------|----------|
| `CONNECTED` | Requête réussie, status OK | ✅ Connecté |
| `SYNCING` | Requête en cours | 🔄 Synchronisation |
| `DISCONNECTED` | Pas de réponse du serveur | ❌ Déconnecté |
| `ERROR` | Erreur (réseau, auth, API) | ⚠️ Erreur |

---

## 🔌 Endpoints Principaux

### 1. Récupérer les équipements

**URL :**
```
GET /json.htm?type=devices&filter=all
```

**Authentification :** ✅ Basic Auth requise

**Réponse :**

```json
{
  "status": "OK",
  "result": [
    {
      "idx": 1,
      "id": "1",
      "name": "Salon Lumière",
      "type": "Light/Switch",
      "subtype": "Switch",
      "level": 100,
      "status": "On",
      "lastupdate": "2026-05-04 14:30:45",
      "devicetype": "Light"
    },
    {
      "idx": 2,
      "id": "2",
      "name": "Salon Volet",
      "type": "Blind",
      "subtype": "Blind",
      "level": 75,
      "status": "Mixed",
      "lastupdate": "2026-05-04 14:30:45"
    },
    {
      "idx": 3,
      "id": "3",
      "name": "Température Salon",
      "type": "Temperature",
      "subtype": "Temperature",
      "temp": 21.5,
      "status": "21.5 °C",
      "lastupdate": "2026-05-04 14:30:45"
    }
  ]
}
```

**Exemple cURL :**

```bash
curl -u "login:password" \
  "http://192.168.1.100:8080/json.htm?type=devices&filter=all"
```

---

### 2. Allumer/Éteindre une Lumière

**URL :**
```
GET /json.htm?type=command&param=switchlight&idx=IDX&nvalue=NVALUE&svalue=SVALUE
```

**Paramètres :**

| Paramètre | Type | Valeur | Sens |
|-----------|------|--------|------|
| `idx` | number | Device index | Index de la lumière |
| `nvalue` | number | 0 ou 1 | 0 = off, 1 = on |
| `svalue` | string | Niveau (0-100) | Optionnel : niveau en % |

**Exemples :**

1. **Allumer :**
```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=1&svalue=
```

2. **Éteindre :**
```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=0&svalue=
```

3. **Allumer à 75% :**
```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=2&svalue=75
```

**Réponse :**

```json
{
  "status": "OK"
}
```

**Exemple cURL :**

```bash
# Allumer
curl -u "login:password" \
  "http://192.168.1.100:8080/json.htm?type=command&param=switchlight&idx=42&nvalue=1&svalue="

# Éteindre
curl -u "login:password" \
  "http://192.168.1.100:8080/json.htm?type=command&param=switchlight&idx=42&nvalue=0&svalue="

# Allumer à 75%
curl -u "login:password" \
  "http://192.168.1.100:8080/json.htm?type=command&param=switchlight&idx=42&nvalue=2&svalue=75"
```

---

### 3. Contrôler un Volet

**URL :**
```
GET /json.htm?type=command&param=switchlight&idx=IDX&nvalue=NVALUE&svalue=LEVEL
```

**Paramètres :**

| nvalue | Sens |
|--------|------|
| 0 | Fermer (0%) |
| 2 | Positionner à LEVEL% |
| 1 | Ouvrir (100%) |

**Exemples :**

1. **Fermer complètement :**
```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=0&svalue=
```

2. **Ouvrir complètement :**
```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=1&svalue=
```

3. **Positionner à 50% :**
```
GET /json.htm?type=command&param=switchlight&idx=42&nvalue=2&svalue=50
```

**Exemple cURL :**

```bash
curl -u "login:password" \
  "http://192.168.1.100:8080/json.htm?type=command&param=switchlight&idx=42&nvalue=2&svalue=50"
```

---

### 4. Obtenir l'État du Serveur

**URL :**
```
GET /json.htm?type=status
```

**Réponse :**

```json
{
  "status": "OK",
  "servertime": "2026-05-04 14:30:45",
  "sunrise": "06:45",
  "sunset": "20:50",
  "DomoticzVersion": "2024.2",
  "result": {
    "name": "Domotique Maison",
    "version": "2024.2"
  }
}
```

**Exemple cURL :**

```bash
curl -u "login:password" \
  "http://192.168.1.100:8080/json.htm?type=status"
```

---

## 📊 Exemples de Flux Complets

### Flux 1: Charger tous les équipements et afficher leur état

**Étape 1 : Récupérer les équipements**

```bash
curl -u "login:password" \
  "http://192.168.1.100:8080/json.htm?type=devices&filter=all"
```

**Réponse :**

```json
{
  "status": "OK",
  "result": [
    {
      "idx": 1,
      "name": "Lumière Salon",
      "type": "Light/Switch",
      "level": 0,
      "status": "Off"
    },
    {
      "idx": 2,
      "name": "Volet Salon",
      "type": "Blind",
      "level": 0,
      "status": "Closed"
    }
  ]
}
```

**Étape 2 : Parser et afficher dans l'application**

```typescript
// app/services/ClientHTTP.service.ts
const response = await callDomoticz({ type: 'devices', filter: 'all' });

// Parse les équipements
const devices = response.result.map(device => {
  const type = getDeviceType(device);
  
  if (type === DeviceType.LIGHT) {
    return new Light(device.id, device.name, device.level);
  } else if (type === DeviceType.BLIND) {
    return new Blind(device.id, device.name, device.level);
  }
  
  return new Device(device);
});

// Mettre à jour Context
setDevices(devices);
```

### Flux 2: Allumer une lumière et mettre à jour l'UI

**Code TypeScript (app/controllers/lights.controller.tsx) :**

```typescript
export function useLightsController() {
  const { devices, setDevices, setConnectionStatus } = useContext(DomoticzContext);
  
  const toggleLight = async (light: Light) => {
    const newLevel = light.level === 0 ? 100 : 0;
    
    setConnectionStatus(ConnectionStatus.SYNCING);
    
    try {
      // 1. Appeler API Domoticz
      const result = await ClientHTTP.callDomoticz({
        type: 'command',
        param: 'switchlight',
        idx: light.idx,
        nvalue: newLevel > 0 ? 1 : 0,
        svalue: ''
      });
      
      // 2. Vérifier réponse
      if (result.status !== 'OK') {
        throw new Error('API returned error');
      }
      
      // 3. Mettre à jour state local
      const updated = devices.map(d =>
        d.id === light.id ? new Light(d.id, d.name, newLevel) : d
      );
      setDevices(updated);
      
      // 4. Marquer comme connecté
      setConnectionStatus(ConnectionStatus.CONNECTED);
    } catch (error) {
      console.error('Failed to toggle light:', error);
      setConnectionStatus(ConnectionStatus.ERROR);
    }
  };
  
  return { toggleLight };
}
```

**Usage dans le composant :**

```typescript
export const ViewLightDevice: React.FC<ViewLightProps> = ({ device }) => {
  const { toggleLight } = useLightsController();
  
  return (
    <Pressable onPress={() => toggleLight(device as Light)}>
      <Text>{device.name}</Text>
      <Text>{device.level > 0 ? 'On' : 'Off'}</Text>
    </Pressable>
  );
};
```

---

## 🔒 Diagnostic SSL

### Quand utiliser HTTPS

- ✅ Production (serveur en réseau public)
- ✅ Certificat auto-signé en réseau local
- ❌ Développement local (HTTP suffisant)

### Problèmes SSL courants

#### 1. Erreur "certificate verify failed"

**Cause :** Certificat auto-signé non reconnu par le client

**Solution :**
1. Exporter le certificat depuis le serveur Domoticz
2. Placer dans `assets/certificates/domoticz.crt`
3. Configurer dans `app.json` (plugin SSL)
4. Relancer avec `npm run android`

#### 2. Erreur "ERR_SSL_SSLV3_ALERT_CERTIFICATE_UNKNOWN"

**Cause :** Domaine du certificat ne correspond pas à l'URL

**Solution :**
```env
# Vérifier que le domaine correspond au certificat
EXPO_PUBLIC_DOMOTICZ_URL=https://192.168.1.100:8443/
EXPO_PUBLIC_DOMOTICZ_DOMAIN=192.168.1.100
```

#### 3. Comment vérifier le certificat

**Commande OpenSSL :**

```bash
openssl s_client -connect 192.168.1.100:8443 -showcerts
```

Vérifier que :
- ✅ Le certificat est valide
- ✅ Le domaine correspond
- ✅ La date d'expiration est valide

**Exemple cURL (ignorer erreur SSL) :**

```bash
curl -k -u "login:password" \
  "https://192.168.1.100:8443/json.htm?type=devices&filter=all"
# -k flag = insecure (ignore SSL errors)
```

---

## 📝 Notes d'Implémentation

### Rate Limiting

Domoticz n'a pas de rate limiting officiel, mais:
- Limiter les syncs à ~5 secondes
- Éviter les appels parallèles excessifs

### Logging & Debugging

Chaque requête est logguée avec un UUID unique :

```typescript
const uuid = generateUUID();
console.log(`[${uuid}] Calling Domoticz...`);
// ...
console.log(`[${uuid}] Response:`, data);
```

### Timeouts

Configurer un timeout de 15 secondes :

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 15000);

const response = await fetch(url, {
  signal: controller.signal
});
```

---

## 🔗 Ressources

- **Domoticz Official Docs :** https://www.domoticz.com/
- **Domoticz API Reference :** https://www.domoticz.com/wiki/Domoticz_API/JSON
- **domoticz-mobile Architecture :** [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- **domoticz-mobile CONTRIBUTING :** [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Document maintained by:** @vzwingma  
**Last reviewed:** 2026-05-04
