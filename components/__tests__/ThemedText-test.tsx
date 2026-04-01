import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  let tree: renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null = null;
  let root: renderer.ReactTestRenderer;

  renderer.act(() => {
    root = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
    tree = root.toJSON();
  });

  renderer.act(() => {
    root.unmount();
  });

  expect(tree).toMatchSnapshot();
});
