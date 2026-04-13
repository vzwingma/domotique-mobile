# Certificats SSL

Ce répertoire contient les certificats SSL utilisés pour sécuriser les appels HTTPS vers le serveur Domoticz.

## Procédure d'export du certificat Domoticz

### Depuis un navigateur (Chrome / Firefox)

1. Accédez à l'interface web de Domoticz via HTTPS (ex: `https://192.168.1.x:8443`)
2. Cliquez sur le cadenas (ou l'icône d'avertissement) dans la barre d'adresse
3. → *La connexion n'est pas sécurisée* → *Certificat* → *Détails*
4. Exportez le certificat au format **PEM** ou **Base64**

### Depuis le serveur Domoticz (Linux)

```bash
# Si Domoticz utilise son propre certificat intégré
openssl s_client -connect <HOST>:<PORT> -showcerts </dev/null 2>/dev/null \
  | openssl x509 -outform PEM > domoticz.crt

# Exemple :
openssl s_client -connect 192.168.1.100:8443 -showcerts </dev/null 2>/dev/null \
  | openssl x509 -outform PEM > domoticz.crt
```

## Placement du fichier

Copiez le fichier exporté dans ce répertoire en le nommant **`domoticz.crt`** :

```
assets/
  certificates/
    domoticz.crt   ← placer le fichier ici
    README.md
```

## Notes importantes

- Le fichier `domoticz.crt` doit être au format **PEM** (commence par `-----BEGIN CERTIFICATE-----`)
- Ce fichier est automatiquement copié dans les ressources Android lors du build EAS
- En cas de renouvellement du certificat, remplacer `domoticz.crt` et relancer un build EAS
- **Ne pas commiter** ce fichier si le certificat contient des informations sensibles
