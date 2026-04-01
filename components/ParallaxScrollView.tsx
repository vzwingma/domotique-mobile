import type { PropsWithChildren, ReactElement } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import React from 'react';
import { Colors } from '@/app/enums/Colors';
import { AppHeader } from './AppHeader';
import type { ConnectionBadgeState } from './ConnectionBadge';

const HEADER_HEIGHT = 70;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerTitle: string;
  connectionState: ConnectionBadgeState;
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerTitle,
  connectionState,
  setRefreshing
}: Props) {

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

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
    setRefreshing(!refreshing);
    refreshing = !refreshing;
  }, [refreshing, setRefreshing]);


  return (
    <View style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: Colors.dark.titlebackground },
            headerAnimatedStyle,
          ]}>
          <AppHeader title={headerTitle} icon={headerImage} connectionState={connectionState} />
        </Animated.View>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
