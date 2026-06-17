declare module '@expo/vector-icons' {
  import type { ComponentType } from 'react';

  export const Ionicons: ComponentType<any> & {
    font: Record<string, number | string>;
    loadFont: () => Promise<void>;
  };
  export const MaterialCommunityIcons: ComponentType<any> & {
    font: Record<string, number | string>;
    loadFont: () => Promise<void>;
  };
}

declare module '@expo/vector-icons/Ionicons' {
  import type { ComponentType } from 'react';

  const Ionicons: ComponentType<any> & {
    font: Record<string, number | string>;
    loadFont: () => Promise<void>;
  };
  export default Ionicons;
}
