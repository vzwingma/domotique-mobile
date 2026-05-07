declare module '@expo/vector-icons' {
  import type { ComponentType } from 'react';

  export const Ionicons: ComponentType<any>;
  export const MaterialCommunityIcons: ComponentType<any>;
}

declare module '@expo/vector-icons/Ionicons' {
  import type { ComponentType } from 'react';

  const Ionicons: ComponentType<any>;
  export default Ionicons;
}
