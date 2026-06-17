import { mapAppIconName } from '../AppIcon';

describe('AppIcon mapping', () => {
  it('mappe les noms Ionicons connus vers MaterialCommunityIcons', () => {
    expect(mapAppIconName('bulb')).toBe('lightbulb');
    expect(mapAppIconName('bulb-outline')).toBe('lightbulb-outline');
    expect(mapAppIconName('reorder-four')).toBe('blinds-horizontal');
    expect(mapAppIconName('thermometer-sharp')).toBe('thermometer');
  });

  it('conserve le nom si aucun mapping specifique', () => {
    expect(mapAppIconName('unknown-icon')).toBe('unknown-icon');
  });
});
