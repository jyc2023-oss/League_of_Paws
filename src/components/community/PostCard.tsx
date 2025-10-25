import React, {useMemo, useRef} from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  View
} from 'react-native';
import {
  Avatar,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme
} from 'react-native-paper';
import {palette, spacing} from '@app/theme';
import type {CommunityMedia, CommunityPost} from '@app/types';

type PostCardProps = {
  post: CommunityPost;
  onPressLike?: () => void;
  onPressComment?: () => void;
  onPressShare?: () => void;
};

const formatTimestamp = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = Date.now();
  const diffMinutes = Math.floor((now - date.getTime()) / 60_000);
  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return date.toLocaleDateString();
};

const MediaPreview = ({media}: {media?: CommunityMedia[]}): JSX.Element | null => {
  const item = useMemo(() => media?.[0], [media]);
  if (!item) {
    return null;
  }
  if (item.type === 'image') {
    return (
      <Image
        source={{uri: item.uri}}
        style={styles.mediaImage}
        resizeMode="cover"
      />
    );
  }
  return (
    <ImageBackground
      source={{uri: item.thumbnail ?? item.uri}}
      style={styles.mediaImage}
      imageStyle={styles.mediaRadius}>
      <View style={styles.videoBadge}>
        <Text style={styles.videoBadgeText}>▶ Video</Text>
      </View>
    </ImageBackground>
  );
};

const PostCard = ({
  post,
  onPressLike,
  onPressComment,
  onPressShare
}: PostCardProps): JSX.Element => {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true
      })
    ]).start();
    onPressLike?.();
  };

  const likeColor = post.likedByMe ? colors.primary : colors.onSurfaceVariant;

  return (
    <Card style={styles.card} mode="contained">
      <Card.Title
        title={post.authorName}
        titleNumberOfLines={1}
        subtitle={formatTimestamp(post.createdAt)}
        left={props => (
          <Avatar.Image
            {...props}
            source={{uri: post.authorAvatar}}
            size={42}
          />
        )}
      />
      <Card.Content>
        <Text style={styles.content}>{post.content}</Text>
        <MediaPreview media={post.media} />
        {post.tags.length > 0 && (
          <View style={styles.tagRow}>
            {post.tags.map(tag => (
              <Chip
                compact
                key={`${post.id}-${tag}`}
                style={styles.tagChip}
                textStyle={styles.tagText}>
                #{tag.toUpperCase()}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <View style={styles.actionGroup}>
          <Animated.View style={{transform: [{scale: scaleAnim}]}}>
            <IconButton
              icon={post.likedByMe ? 'heart' : 'heart-outline'}
              iconColor={likeColor}
              size={22}
              onPress={handleLike}
            />
          </Animated.View>
          <Text style={styles.countText}>{post.likes}</Text>
        </View>
        <View style={styles.actionGroup}>
          <IconButton
            icon="comment-outline"
            size={22}
            onPress={onPressComment}
          />
          <Text style={styles.countText}>{post.comments}</Text>
        </View>
        <IconButton icon="share-variant" size={22} onPress={onPressShare} />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 16
  },
  content: {
    color: palette.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs
  },
  tagChip: {
    backgroundColor: palette.background,
    marginRight: spacing.xs,
    marginBottom: spacing.xs
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600'
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  countText: {
    color: palette.textSecondary,
    fontWeight: '600'
  },
  mediaImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: spacing.sm
  },
  mediaRadius: {
    borderRadius: 16
  },
  videoBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#00000080',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999
  },
  videoBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  }
});

export default PostCard;
