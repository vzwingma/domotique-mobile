import type { PropsWithChildren, ReactElement } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { Colors } from '@/app/constants/Colors';

const HEADER_HEIGHT = 100;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  setRefreshing
}: Props) {

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  let refreshing = false;

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const onRefresh = React.useCallback(() => {
    refreshing = !refreshing;
    setRefreshing(refreshing);
  }, []);


  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: Colors.dark.titlebackground },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 10,
    gap: 10,
    overflow: 'hidden',
  },
});
