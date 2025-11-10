import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  FAB,
  Modal,
  Portal,
  Snackbar,
  Text,
  useTheme
} from 'react-native-paper';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Screen from '@app/components/common/Screen';
import PostCard from '@app/components/community/PostCard';
import {palette, spacing} from '@app/theme';
import {
  COMMUNITY_TAGS,
  type CommunityPost,
  type CommunityTag
} from '@app/types';
import {communityApi} from '@app/services/api/communityApi';
import {useCommunityStore} from '@app/store/zustand/communityStore';
import type {RootStackParamList} from '@app/navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const CommunityFeedScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const {colors} = useTheme();
  const listRef = useRef<FlatList<CommunityPost>>(null);
  useScrollToTop(listRef);

  const posts = useCommunityStore(state => state.posts);
  const filterTag = useCommunityStore(state => state.filterTag);
  const hasMorePosts = useCommunityStore(state => state.hasMorePosts);
  const nextPage = useCommunityStore(state => state.nextPage);
  const setFilterTag = useCommunityStore(state => state.setFilterTag);
  const setPosts = useCommunityStore(state => state.setPosts);
  const appendPosts = useCommunityStore(state => state.appendPosts);
  const toggleLike = useCommunityStore(state => state.toggleLike);
  const incrementCommentCount = useCommunityStore(
    state => state.incrementCommentCount
  );

  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [isPublishModalVisible, setPublishModalVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const loadPosts = useCallback(
    async ({
      page,
      replace = false,
      tag = filterTag
    }: {
      page: number;
      replace?: boolean;
      tag?: CommunityTag;
    }) => {
      if (page === 1) {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const response = await communityApi.fetchPosts({
          page,
          tag
        });
        if (replace) {
          setPosts(response.items, {hasMore: response.hasMore});
        } else {
          appendPosts(response.items, {hasMore: response.hasMore});
        }
      } catch (error) {
        console.warn('Failed to load posts', error);
        setSnackbarMessage('无法加载动态，请稍后再试');
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [appendPosts, filterTag, setPosts]
  );

  useEffect(() => {
    loadPosts({page: 1, replace: true});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTag]);

  useEffect(() => {
    if (posts.length === 0) {
      loadPosts({page: 1, replace: true});
    }
  }, [loadPosts, posts.length]);

  const handleFilterChange = (tag: CommunityTag) => {
    if (tag === filterTag) {
      listRef.current?.scrollToOffset({offset: 0, animated: true});
      return;
    }
    setFilterTag(tag);
  };

  const handleLikePress = async (post: CommunityPost) => {
    const nextLiked = !(post.likedByMe ?? false);
    toggleLike(post.id, nextLiked);
    try {
      await communityApi.likePost(post.id, nextLiked);
    } catch (error) {
      console.warn('Like failed', error);
      toggleLike(post.id, !nextLiked);
      setSnackbarMessage('点赞失败，请稍后再试');
    }
  };

  const handleCommentPress = async (post: CommunityPost) => {
    incrementCommentCount(post.id, 1);
    try {
      await communityApi.commentOnPost(post.id, 'Love this!');
      setSnackbarMessage('已投递评论（演示数据）');
    } catch (error) {
      console.warn('Comment failed', error);
      incrementCommentCount(post.id, -1);
      setSnackbarMessage('评论失败，请稍后再试');
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 260);
  };

  const renderHeader = useMemo(
    () => (
      <View style={styles.hero}>
        <Text style={styles.title}>Pet Glory 社区</Text>
        <Text style={styles.subtitle}>
          分享宠物日常、提问求助、联络救助伙伴，一起建设温暖社区。
        </Text>
        <View style={styles.heroActions}>
          <Button
            mode="contained"
            icon="account-group"
            onPress={() => navigation.navigate('NearbyFriends')}>
            附近宠友
          </Button>
          <Button
            mode="outlined"
            icon="comment-question-outline"
            onPress={() => navigation.navigate('CommunityQA')}>
            问答广场
          </Button>
        </View>
        <View style={styles.filterRow}>
          {COMMUNITY_TAGS.map(tab => (
            <Chip
              key={tab.value}
              mode={filterTag === tab.value ? 'flat' : 'outlined'}
              selected={filterTag === tab.value}
              style={[
                styles.filterChip,
                filterTag === tab.value && styles.filterChipSelected
              ]}
              onPress={() => handleFilterChange(tab.value)}>
              {tab.label}
            </Chip>
          ))}
        </View>
      </View>
    ),
    [filterTag, navigation]
  );

  const renderItem = ({item}: {item: CommunityPost}) => (
    <PostCard
      post={item}
      onPressLike={() => handleLikePress(item)}
      onPressComment={() => handleCommentPress(item)}
      onPressShare={() => setSnackbarMessage('即将支持分享功能')}
    />
  );

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMorePosts) {
      return;
    }
    loadPosts({page: nextPage, tag: filterTag});
  };

  if (initialLoading) {
    return (
      <Screen padded={false}>
        <View style={styles.centered}>
          <ActivityIndicator animating color={colors.primary} />
          <Text style={styles.loadingText}>加载社区动态中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        ref={listRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadPosts({page: 1, replace: true})} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator animating />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>暂无动态，成为第一个分享的宠友！</Text>
          </View>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <Portal>
        <FAB
          icon="plus"
          style={styles.publishFab}
          onPress={() => setPublishModalVisible(true)}
        />
        {showScrollTop && (
          <FAB
            icon="arrow-up"
            small
            style={styles.scrollTopFab}
            onPress={() =>
              listRef.current?.scrollToOffset({offset: 0, animated: true})
            }
          />
        )}
        <Modal
          visible={isPublishModalVisible}
          onDismiss={() => setPublishModalVisible(false)}
          contentContainerStyle={styles.publishModal}>
          <Text style={styles.modalTitle}>发布到社区</Text>
          <Text style={styles.modalSubtitle}>
            想分享心得、发起问答或发布救助信息？
          </Text>
          <Button
            icon="feather"
            mode="contained"
            style={styles.modalButton}
            onPress={() => {
              setPublishModalVisible(false);
              navigation.navigate('CreatePost');
            }}>
            发布动态
          </Button>
          <Button
            icon="comment-question-outline"
            mode="outlined"
            onPress={() => {
              setPublishModalVisible(false);
              navigation.navigate('CommunityQA');
            }}>
            提问/答疑
          </Button>
        </Modal>
        <Snackbar
          visible={Boolean(snackbarMessage)}
          onDismiss={() => setSnackbarMessage(null)}
          duration={3000}>
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary
  },
  subtitle: {
    marginTop: spacing.xs,
    color: palette.textSecondary
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md
  },
  filterChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm
  },
  filterChipSelected: {
    backgroundColor: palette.primary
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120
  },
  separator: {
    height: spacing.xs
  },
  publishFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg
  },
  scrollTopFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + 72
  },
  publishModal: {
    margin: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: spacing.lg
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary
  },
  modalSubtitle: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    marginBottom: spacing.md
  },
  modalButton: {
    marginBottom: spacing.sm
  },
  footerLoader: {
    paddingVertical: spacing.md
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  loadingText: {
    marginTop: spacing.sm,
    color: palette.textSecondary
  }
});

export default CommunityFeedScreen;
