# Testing Guide — domoticz-mobile

**Document Version:** 3.0.0  
**Last Updated:** 2026-05-04  
**Framework:** Jest + jest-expo + Testing Library  
**Target Coverage:** ≥ 80% (app/ + components/)

---

## 📋 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Setup Jest](#-setup-jest)
3. [Writing Unit Tests](#-writing-unit-tests)
4. [Snapshot Testing](#-snapshot-testing)
5. [Mocking Domoticz API](#-mocking-domoticz-api)
6. [Coverage Reports](#-coverage-reports)
7. [Best Practices](#-best-practices)
8. [Troubleshooting](#-troubleshooting)

---

## 👁️ Vue d'ensemble

**Jest** est le framework de test utilisé par domoticz-mobile avec:
- **Jest core** pour exécution tests
- **jest-expo** preset pour React Native support
- **Testing Library** pour composants UI
- **Snapshot testing** pour détection changements
- **Coverage reports** pour analyse couverture

### Objectifs

- **Couverture global :** ≥ 80% (app/ + components/)
- **Controllers :** 100% (logique métier critique)
- **Services :** ≥ 90% (HTTP, data utils)
- **Composants :** ≥ 70% (snapshot tests)
- **Modèles :** ≥ 85% (classes immuables)

### Commandes

```bash
npm test                                      # Mode watch
npm test -- --coverage                        # Avec coverage report
npm test -- --testNamePattern="mon pattern"   # Filtre par nom
npm test -- path/to/file.test.tsx             # Fichier spécifique
npm run lint                                  # ESLint
```

---

## ⚙️ Setup Jest

### Configuration (jest.config.js)

```javascript
module.exports = {
  // Preset pour React Native + Expo
  preset: 'jest-expo',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1'
  },
  
  // Coverage
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Setup Files (jest.setup.ts)

```typescript
// jest.setup.ts
import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn()
  })
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}));

// Suppress console warnings in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
```

### Installation

```bash
npm install --save-dev \
  jest \
  jest-expo \
  @testing-library/react-native \
  @testing-library/jest-native \
  ts-node
```

---

## 📝 Writing Unit Tests

### Structure de base

```typescript
// app/services/__tests__/ClientHTTP.service.test.ts
import { ClientHTTP } from '../ClientHTTP.service';

describe('ClientHTTP', () => {
  let service: ClientHTTP;
  
  beforeEach(() => {
    // Setup avant chaque test
    service = new ClientHTTP(
      'http://localhost:8080',
      'bXlhdXRo'  // Base64 auth
    );
  });
  
  afterEach(() => {
    // Cleanup après chaque test
    jest.clearAllMocks();
  });
  
  describe('callDomoticz', () => {
    it('should make successful API call', async () => {
      // Arrange
      const params = { type: 'devices' };
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'OK', result: [] })
      } as Response);
      
      // Act
      const result = await service.callDomoticz(params);
      
      // Assert
      expect(result.status).toBe('OK');
      expect(result.result).toEqual([]);
    });
    
    it('should handle network error', async () => {
      // Arrange
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('Network error')
      );
      
      // Act & Assert
      await expect(
        service.callDomoticz({ type: 'devices' })
      ).rejects.toThrow('Network error');
    });
  });
});
```

### Test Controllers

```typescript
// app/controllers/__tests__/lights.controller.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useLightsController } from '../lights.controller';
import { Light } from '../../models/Light.model';

describe('LightsController', () => {
  it('should toggle light from off to on', async () => {
    // Arrange
    const mockDevice = new Light('1', 'Test Light', 0);
    const { result } = renderHook(() => useLightsController());
    
    // Mock ClientHTTP
    jest.spyOn(ClientHTTP, 'callDomoticz').mockResolvedValueOnce({
      status: 'OK'
    });
    
    // Act
    await act(async () => {
      await result.current.toggleLight(mockDevice);
    });
    
    // Assert
    expect(ClientHTTP.callDomoticz).toHaveBeenCalledWith({
      type: 'command',
      param: 'switchlight',
      idx: 1,
      nvalue: 1,
      svalue: ''
    });
  });
  
  it('should handle toggle error gracefully', async () => {
    // Arrange
    const mockDevice = new Light('1', 'Test Light', 0);
    const { result } = renderHook(() => useLightsController());
    
    jest.spyOn(ClientHTTP, 'callDomoticz').mockRejectedValueOnce(
      new Error('API Error')
    );
    
    // Act & Assert
    await expect(
      act(async () => {
        await result.current.toggleLight(mockDevice);
      })
    ).rejects.toThrow();
  });
});
```

### Test Services

```typescript
// app/services/__tests__/DataUtils.service.test.ts
import { DataUtils } from '../DataUtils.service';
import { Light } from '../../models/Light.model';
import { DeviceType } from '../../enums/DeviceType.enum';

describe('DataUtils', () => {
  describe('sortEquipements', () => {
    it('should sort devices alphabetically', () => {
      // Arrange
      const devices = [
        new Light('3', 'Zebra Light', 100),
        new Light('1', 'Apple Light', 50),
        new Light('2', 'Banana Light', 75)
      ];
      
      // Act
      const sorted = DataUtils.sortEquipements(devices);
      
      // Assert
      expect(sorted[0].name).toBe('Apple Light');
      expect(sorted[1].name).toBe('Banana Light');
      expect(sorted[2].name).toBe('Zebra Light');
    });
  });
  
  describe('getDeviceType', () => {
    it('should detect Light device type', () => {
      // Arrange
      const light = new Light('1', 'Salon Lumière', 100);
      
      // Act
      const type = DataUtils.getDeviceType(light);
      
      // Assert
      expect(type).toBe(DeviceType.LIGHT);
    });
    
    it('should detect Blind device type', () => {
      // Arrange
      const blind = new Blind('2', 'Salon Volet', 50);
      
      // Act
      const type = DataUtils.getDeviceType(blind);
      
      // Assert
      expect(type).toBe(DeviceType.BLIND);
    });
  });
});
```

### Test Models

```typescript
// app/models/__tests__/Light.model.test.ts
import { Light } from '../Light.model';

describe('Light', () => {
  it('should create Light instance', () => {
    // Arrange & Act
    const light = new Light('1', 'Test Light', 75);
    
    // Assert
    expect(light.id).toBe('1');
    expect(light.name).toBe('Test Light');
    expect(light.level).toBe(75);
    expect(light.isOn).toBe(true);
  });
  
  it('should be immutable', () => {
    // Arrange
    const light = new Light('1', 'Test Light', 100);
    
    // Act & Assert
    expect(() => {
      (light as any).level = 0;  // Type cast to bypass TypeScript check
    }).toThrow();
  });
  
  it('should return correct percentage', () => {
    // Arrange & Act
    const light = new Light('1', 'Test Light', 75);
    
    // Assert
    expect(light.percentage).toBe('75%');
  });
});
```

---

## 📸 Snapshot Testing

### Qu'est-ce que le snapshot testing?

Les snapshots capture l'état actuel d'un composant et détectent les changements involontaires :

```typescript
// app/components/__tests__/device.component.test.tsx
import { render } from '@testing-library/react-native';
import { DeviceComponent } from '../device.component';
import { Light } from '../../models/Light.model';

describe('DeviceComponent', () => {
  it('should render Light device', () => {
    // Arrange
    const device = new Light('1', 'Test Light', 100);
    
    // Act
    const tree = render(
      <DeviceComponent device={device} />
    ).toJSON();
    
    // Assert
    expect(tree).toMatchSnapshot();
  });
});
```

Lors de la première exécution, Jest crée un snapshot :

```javascript
// __snapshots__/device.component.test.tsx.snap
exports[`DeviceComponent should render Light device 1`] = `
<View
  style={
    Object {
      "backgroundColor": "#fff",
      "borderRadius": 8,
      "padding": 12,
    }
  }
>
  <Text>
    Test Light
  </Text>
  <Text>
    On
  </Text>
</View>
`;
```

### Mettre à jour les snapshots

Après un changement intentionnel du composant :

```bash
npm test -- --updateSnapshot
# ou
npm test -- -u
```

### Guidelines pour snapshots

- ✅ Utiliser pour composants UI simples
- ✅ Commiter les snapshots en Git
- ✅ Revoir les changements avec `git diff`
- ❌ Ne pas mettre à jour automatiquement sans vérification
- ❌ Éviter snapshots trop grands (>500 lines)

---

## 🎯 Mocking Domoticz API

### Mock ClientHTTP

```typescript
// Mock à la portée du test
jest.mock('../../services/ClientHTTP.service');
import { ClientHTTP } from '../../services/ClientHTTP.service';

describe('LightsController', () => {
  it('should call Domoticz API', async () => {
    // Arrange
    (ClientHTTP.callDomoticz as jest.Mock).mockResolvedValueOnce({
      status: 'OK',
      result: [{ idx: 1, name: 'Light', level: 100 }]
    });
    
    // Act & Assert
    // ...
  });
});
```

### Mock AsyncStorage

```typescript
jest.mock('@react-native-async-storage/async-storage');
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('DataUtils', () => {
  it('should save favorites to storage', async () => {
    // Arrange
    const favorites = ['1', '2', '3'];
    (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
    
    // Act
    await DataUtils.saveFavoritesToStorage(favorites);
    
    // Assert
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'favorites',
      JSON.stringify(favorites)
    );
  });
});
```

### Mock Context

```typescript
describe('ViewLightDevice', () => {
  it('should render with Context', () => {
    // Arrange
    const mockContext = {
      devices: [new Light('1', 'Test', 100)],
      setDevices: jest.fn()
    };
    
    // Act
    const { getByText } = render(
      <DomoticzContext.Provider value={mockContext}>
        <ViewLightDevice device={mockContext.devices[0]} />
      </DomoticzContext.Provider>
    );
    
    // Assert
    expect(getByText('Test')).toBeDefined();
  });
});
```

---

## 📊 Coverage Reports

### Générer un report

```bash
npm test -- --coverage
```

### Résultat esperado

```
-----|----------|----------|----------|----------|
File |  % Stmts | % Branch | % Funcs  | % Lines  |
-----|----------|----------|----------|----------|
All  |   83.45  |   81.22  |   84.67  |   83.45  |
-----|----------|----------|----------|----------|
```

### Interpréter les métriques

| Métrique | Sens |
|----------|------|
| `% Stmts` | Pourcentage de statements exécutés |
| `% Branch` | Pourcentage de branches (if/else) couvertes |
| `% Funcs` | Pourcentage de fonctions appelées |
| `% Lines` | Pourcentage de lignes exécutées |

### Coverage par fichier

```bash
npm test -- --coverage --verbose
```

Génère un rapport HTML détaillé : `coverage/lcov-report/index.html`

### Maintenir une couverture élevée

1. **Écrire des tests avant de commiter**
   ```bash
   npm test -- --coverage
   ```

2. **Cibler les fichiers bas :**
   ```bash
   npm test -- --coverage app/controllers/
   ```

3. **Utiliser CI pour enforcer :**
   - GitHub Actions avec threshold
   - SonarQube quality gates
   - Coverage badges

---

## ✨ Best Practices

### 1. Arrange-Act-Assert (AAA)

```typescript
// ✅ Correct
it('should toggle light', async () => {
  // Arrange - Setup
  const light = new Light('1', 'Test', 0);
  
  // Act - Execute
  const result = toggleLight(light);
  
  // Assert - Verify
  expect(result.level).toBe(100);
});

// ❌ Incorrect
it('should toggle light', async () => {
  // Mélange de setup, execution, vérification
  const light = new Light('1', 'Test', 0);
  const result = toggleLight(light);
  expect(result.level).toBe(100);
  const result2 = toggleLight(result);
  expect(result2.level).toBe(0);
});
```

### 2. Nommer les tests clairement

```typescript
// ✅ Correct - descriptif
describe('LightsController', () => {
  it('should toggle light from off to on when level is 0', () => {});
  it('should return error when API call fails', () => {});
});

// ❌ Incorrect - vague
describe('Lights', () => {
  it('works', () => {});
  it('error handling', () => {});
});
```

### 3. Tester un seul comportement par test

```typescript
// ✅ Correct
it('should toggle light on', () => { });
it('should toggle light off', () => { });
it('should handle API error', () => { });

// ❌ Incorrect - plusieurs comportements
it('should toggle light and handle errors and update state', () => { });
```

### 4. Éviter les tests flaky

```typescript
// ❌ Problématique - timing dependent
it('should update after delay', async () => {
  updateDevice();
  await sleep(100);  // Fragile, peut échouer de manière aléatoire
  expect(device.updated).toBe(true);
});

// ✅ Meilleur - attendre l'événement
it('should update on state change', async () => {
  const promise = waitFor(() => {
    expect(device.updated).toBe(true);
  });
  updateDevice();
  await promise;
});
```

### 5. Tester les edge cases

```typescript
it('should handle empty device list', () => {
  expect(DataUtils.sortEquipements([])).toEqual([]);
});

it('should handle null values', () => {
  expect(DataUtils.getDeviceType(null)).toBe(DeviceType.UNKNOWN);
});

it('should handle very large numbers', () => {
  const light = new Light('1', 'Test', 999999);
  expect(light.isOn).toBe(true);
});
```

### 6. Fixtures & Factories

```typescript
// ✅ Utiliser une factory pour créer des mocks
const createMockLight = (overrides = {}) => {
  return new Light('1', 'Test Light', 100, { ...overrides });
};

it('should toggle light', () => {
  const light = createMockLight({ level: 0 });
  const result = toggleLight(light);
  expect(result.level).toBe(100);
});
```

---

## 🔧 Troubleshooting

### Jest ne trouve pas les fichiers

```
Cannot find module 'app/models/Light.model'
```

**Solution:** Vérifier `jest.config.js` `moduleNameMapper` :

```javascript
moduleNameMapper: {
  '^app/(.*)$': '<rootDir>/app/$1',
  '^components/(.*)$': '<rootDir>/components/$1'
}
```

### Tests timeout

```
Jest did not exit one second after the test run has completed
```

**Solutions:**
- Fermer les connexions ouvertes
- Mocker `setTimeout` / `setInterval`
- Augmenter le timeout :
  ```typescript
  jest.setTimeout(10000);  // 10 secondes
  ```

### Snapshots périmés

```
Snapshot does not match
```

**Solution:** Revoir le changement, puis mettre à jour:

```bash
npm test -- -u
git diff __snapshots__/
```

### Problèmes d'imports TypeScript

```
Cannot find name 'jest'
```

**Solution:** Installer types-jest :

```bash
npm install --save-dev @types/jest
```

### Memory leaks en tests

```
FAIL: Tests did not complete
```

**Solution:** Proper cleanup :

```typescript
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();  // Important!
});
```

---

## 📈 Intégration CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### SonarQube

```yaml
- name: SonarQube Scan
  uses: SonarSource/sonarcloud-github-action@master
  with:
    args: >
      -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
      -Dsonar.coverage.exclusions=**/*.test.tsx
```

### Coverage Threshold

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './app/controllers/': {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
  }
}
```

---

## 📚 Ressources

- **Jest Documentation:** https://jestjs.io/
- **jest-expo:** https://docs.expo.dev/guides/testing/
- **Testing Library:** https://testing-library.com/docs/react-native-testing-library/intro/
- **React Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **domoticz-mobile Architecture:** [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- **domoticz-mobile Contributing:** [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Document maintained by:** @vzwingma  
**Last reviewed:** 2026-05-04
