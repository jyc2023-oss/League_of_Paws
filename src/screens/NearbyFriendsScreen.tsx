import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Geolocation,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Snackbar,
  Text
} from 'react-native-paper';
import Screen from '@app/components/common/Screen';
import {palette, spacing} from '@app/theme';
import type {NearbyPetOwner} from '@app/types';
import {communityApi} from '@app/services/api/communityApi';
import {useCommunityStore} from '@app/store/zustand/communityStore';

const formatDistance = (distanceKm: number): string =>
  distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;

const formatLastActive = (isoDate: string): string => {
  const diffMinutes = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 60_000
  );
  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前活跃`;
  }
  const hours = Math.floor(diffMinutes / 60);
  return `${hours} 小时前活跃`;
};

const NearbyFriendsScreen = (): JSX.Element => {
  const nearbyUsers = useCommunityStore(state => state.nearbyUsers);
  const setNearbyUsers = useCommunityStore(state => state.setNearbyUsers);
  const markFriendRequested = useCommunityStore(
    state => state.markFriendRequested
  );

  const [hasLocationPermission, setHasLocationPermission] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const ensurePermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization?.('whenInUse');
      setHasLocationPermission(true);
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    setHasLocationPermission(isGranted);
    return isGranted;
  }, []);

  const loadNearbyUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(true),
          {enableHighAccuracy: true, timeout: 5000}
        );
      });
      const users = await communityApi.fetchNearbyUsers();
      setNearbyUsers(users);
    } catch (error) {
      console.warn('Failed to load nearby users', error);
      setSnackbar('加载附近宠友失败，请稍后重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setNearbyUsers]);

  useEffect(() => {
    (async () => {
      const granted = await ensurePermission();
      if (granted) {
        await loadNearbyUsers();
      } else {
        setLoading(false);
      }
    })();
  }, [ensurePermission, loadNearbyUsers]);

  const handleSendRequest = async (user: NearbyPetOwner) => {
    if (user.isRequestPending) {
      return;
    }
    markFriendRequested(user.id);
    try {
      await communityApi.sendFriendRequest(user.id);
      setSnackbar(`已向 ${user.displayName} 发送好友请求`);
    } catch (error) {
      console.warn('Friend request failed', error);
      setSnackbar('发送请求失败，请稍后重试');
      await loadNearbyUsers();
    }
  };

  const renderUser = ({item}: {item: NearbyPetOwner}) => (
    <Card style={styles.card} mode="contained">
      <Card.Title
        title={item.displayName}
        subtitle={`${item.petSummary} · ${formatLastActive(item.lastActive)}`}
        left={props => <Avatar.Image {...props} source={{uri: item.avatar}} />}
        right={() => (
          <Text style={styles.distance}>{formatDistance(item.distanceKm)}</Text>
        )}
      />
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="contained-tonal"
          icon="hand-heart"
          disabled={item.isRequestPending}
          onPress={() => handleSendRequest(item)}>
          {item.isRequestPending ? '已发送' : '加为好友'}
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderGrantPermission = () => (
    <View style={styles.permissionBox}>
      <Text style={styles.permissionTitle}>需要定位权限</Text>
      <Text style={styles.permissionHint}>
        我们将根据你附近 3 公里内的宠友匹配。
      </Text>
      <Button mode="contained" onPress={ensurePermission}>
        授权定位
      </Button>
    </View>
  );

  if (loading) {
    return (
      <Screen padded={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating />
          <Text style={styles.loadingText}>正在获取附近宠友...</Text>
        </View>
      </Screen>
    );
  }

  if (hasLocationPermission === false) {
    return (
      <Screen padded>
        {renderGrantPermission()}
        <Snackbar
          visible={Boolean(snackbar)}
          onDismiss={() => setSnackbar(null)}
          duration={3000}>
          {snackbar}
        </Snackbar>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={nearbyUsers}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadNearbyUsers} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>附近暂时没有宠友，稍后再试试。</Text>
          </View>
        }
      />
      <Snackbar
        visible={Boolean(snackbar)}
        onDismiss={() => setSnackbar(null)}
        duration={3000}>
        {snackbar}
      </Snackbar>
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: 18
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md
  },
  distance: {
    color: palette.primary,
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: spacing.sm,
    color: palette.textSecondary
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center'
  },
  permissionBox: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center'
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  permissionHint: {
    marginVertical: spacing.sm,
    textAlign: 'center',
    color: palette.textSecondary
  }
});

export default NearbyFriendsScreen;
