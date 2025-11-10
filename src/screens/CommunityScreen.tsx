import React, {useMemo} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {
  CommunityPost,
  likePost,
  updatePostHighlights
} from '@app/store/redux/slices/contentSlice';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const CommunityScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const posts = useAppSelector(state => state.community.posts);
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);

  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const orderedPosts = useMemo(() => {
    const pinned = posts.filter(post => post.isPinned);
    const normal = posts.filter(post => !post.isPinned);
    return [...pinned, ...normal];
  }, [posts]);

  const handleToggleHighlight = (post: CommunityPost, type: 'pin' | 'feature') => {
    if (activeUser?.role !== 'senior') {
      return;
    }
    dispatch(
      updatePostHighlights({
        postId: post.id,
        isPinned: type === 'pin' ? !post.isPinned : post.isPinned,
        isFeatured:
          type === 'feature' ? !post.isFeatured : post.isFeatured
      })
    );
  };

  const renderPost = ({item}: {item: CommunityPost}) => {
    const isSeniorAuthor = item.authorRole === 'senior';
    return (
      <View style={[styles.postCard, item.isPinned && styles.postPinned]}>
        <View style={styles.postHeader}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <View style={styles.badgeRow}>
            {isSeniorAuthor && <Text style={styles.badge}>资深用户</Text>}
            {item.isFeatured && <Text style={[styles.badge, styles.featureBadge]}>精选</Text>}
            {item.isPinned && <Text style={[styles.badge, styles.pinBadge]}>置顶</Text>}
          </View>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        {item.tags.length > 0 && (
          <View style={styles.tagRow}>
            {item.tags.map(tag => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
        <View style={styles.postFooter}>
          <Pressable
            style={styles.likeButton}
            onPress={() => dispatch(likePost({postId: item.id}))}>
            <Text style={styles.likeText}>👍 {item.likes}</Text>
          </Pressable>
          {activeUser?.role === 'senior' && (
            <View style={styles.moderationRow}>
              <Pressable
                style={styles.moderationButton}
                onPress={() => handleToggleHighlight(item, 'pin')}>
                <Text style={styles.moderationText}>
                  {item.isPinned ? '取消置顶' : '置顶'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.moderationButton}
                onPress={() => handleToggleHighlight(item, 'feature')}>
                <Text style={styles.moderationText}>
                  {item.isFeatured ? '取消加精' : '加精'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>社区广场</Text>
        <Text style={styles.subtitle}>
          浏览宠物圈动态、问答与救助信息，参与互动可提升资深等级。
        </Text>
        <View style={styles.entryRow}>
          <Pressable
            style={styles.entryButton}
            onPress={() => navigation.navigate('CreatePost')}>
            <Text style={styles.entryText}>发布动态</Text>
          </Pressable>
          <Pressable
            style={styles.entryButton}
            onPress={() => navigation.navigate('RescueSubmission')}>
            <Text style={styles.entryText}>救助信息</Text>
          </Pressable>
          <Pressable
            style={[styles.entryButton, styles.entryButtonLast]}
            onPress={() => navigation.navigate('ServiceFinder')}>
            <Text style={styles.entryText}>本地服务</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={orderedPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>社区暂时还没有内容</Text>
            <Text style={styles.emptyDescription}>
              成为第一位分享者，或等待系统生成示例数据。
            </Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.textPrimary
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20
  },
  entryRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    justifyContent: 'space-between'
  },
  entryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    alignItems: 'center'
  },
  entryButtonLast: {
    marginRight: 0
  },
  entryText: {
    color: palette.primary,
    fontWeight: '600'
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl
  },
  emptyState: {
    alignItems: 'center',
    marginTop: spacing.xl
  },
  emptyTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary
  },
  emptyDescription: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    textAlign: 'center'
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md
  },
  postPinned: {
    borderColor: palette.primary,
    borderWidth: 2
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  authorName: {
    fontWeight: '600',
    color: palette.textPrimary
  },
  badgeRow: {
    flexDirection: 'row'
  },
  badge: {
    backgroundColor: '#E0F2F1',
    color: palette.secondary,
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginLeft: spacing.xs,
    fontSize: typography.caption,
    fontWeight: '600'
  },
  featureBadge: {
    backgroundColor: '#FFF3E0',
    color: palette.primary
  },
  pinBadge: {
    backgroundColor: '#E8EAF6',
    color: '#3949AB'
  },
  postContent: {
    color: palette.textPrimary,
    marginTop: spacing.sm,
    lineHeight: 20
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm
  },
  tag: {
    color: palette.secondary,
    marginRight: spacing.xs,
    fontSize: typography.caption
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md
  },
  likeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border
  },
  likeText: {
    color: palette.textPrimary,
    fontWeight: '600'
  },
  moderationRow: {
    flexDirection: 'row'
  },
  moderationButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: palette.secondary
  },
  moderationText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default CommunityScreen;
