import type { PropsWithChildren, ReactElement } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import React from 'react';
import { Colors } from '@/app/enums/Colors';
import { ThemedText } from './ThemedText';
import { DomoticzStatus } from '@/app/enums/DomoticzEnum';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HEADER_HEIGHT = 100;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerTitle: string;
  headerSubtitle?: string;
  connexionStatus?: DomoticzStatus;
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerTitle,
  headerSubtitle,
  connexionStatus,
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
          {headerImage}
          <View style={styles.titleHeader}>
            {connexionStatus && getConnexionStatusIcon(connexionStatus)}
            <ThemedText type="title" style={styles.domoticzColor}>{headerTitle}</ThemedText>
          </View>
          <View style={styles.titleHeader}>
            <ThemedText type="italic" style={{color : 'grey', marginRight: 36}}>{headerSubtitle}</ThemedText>
          </View>
        </Animated.View>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

/**
 * Retourne l'icône de connexion en fonction du statut de connexion
 * @param connexionStatus Le statut de connexion
 * @returns L'icône de connexion
 * @see DomoticzStatus
 * @see MaterialCommunityIcons
 * @see MaterialCommunityIconsProps
 * @see Colors
 */
function getConnexionStatusIcon(connexionStatus: DomoticzStatus) {
  switch (connexionStatus) {
    case DomoticzStatus.CONNECTE:
      return <MaterialCommunityIcons name="check-circle" size={24} color="green" style={{padding: 5}} />;
    case DomoticzStatus.DECONNECTE:
      return <MaterialCommunityIcons name="alert-circle" size={24} color="red" style={{padding: 5}}/>;
    default:
      return <MaterialCommunityIcons name="help-circle" size={24} color="grey" style={{padding: 5}}/>;
  }
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
  titleHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
    top: 30,
    right: 8,
  },
  domoticzColor: {
    color: Colors.domoticz.color
  }
});
