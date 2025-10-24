import React, {useMemo, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {
  createCommunityPost,
  updatePostHighlights
} from '@app/store/redux/slices/contentSlice';

const CreatePostScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [pinPost, setPinPost] = useState(false);
  const [featurePost, setFeaturePost] = useState(false);

  const handleSubmit = () => {
    if (!activeUser) {
      Alert.alert('提示', '请先登录账号。');
      return;
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      Alert.alert('提示', '请输入动态内容。');
      return;
    }

    const parsedTags = tags
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const action = dispatch(
      createCommunityPost({
        authorId: activeUser.id,
        authorName: activeUser.name,
        authorRole: activeUser.role,
        content: trimmed,
        tags: parsedTags
      })
    );

    if (activeUser.role === 'senior') {
      dispatch(
        updatePostHighlights({
          postId: action.payload.id,
          isPinned: pinPost,
          isFeatured: featurePost
        })
      );
    }

    setContent('');
    setTags('');
    setPinPost(false);
    setFeaturePost(false);
    Alert.alert('发布成功', '动态已提交到宠物圈子。');
  };

  return (
    <Screen padded={true}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>发布社区动态</Text>
        <Text style={styles.subtitle}>
          分享宠物日常、经验或救助故事，增强社区互动。
        </Text>

        <Text style={styles.label}>动态内容</Text>
        <TextInput
          style={styles.textarea}
          value={content}
          onChangeText={setContent}
          placeholder="记录你的宠物故事..."
          placeholderTextColor={palette.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.label}>话题标签（使用逗号分隔）</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="萌宠, 初次训练, 救助故事"
          placeholderTextColor={palette.textSecondary}
        />

        {activeUser?.role === 'senior' && (
          <View style={styles.privilegedSection}>
            <Text style={styles.sectionTitle}>资深用户工具</Text>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>置顶此帖子</Text>
              <Switch
                value={pinPost}
                onValueChange={setPinPost}
                trackColor={{true: palette.primary}}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>加精推荐</Text>
              <Switch
                value={featurePost}
                onValueChange={setFeaturePost}
                trackColor={{true: palette.secondary}}
              />
            </View>
          </View>
        )}

        <View style={styles.submitButtonContainer}>
          <Text style={styles.submitButton} onPress={handleSubmit}>
            发布动态
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.textPrimary
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg
  },
  label: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.xs
  },
  textarea: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.lg,
    minHeight: 160
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.lg
  },
  privilegedSection: {
    borderWidth: 1,
    borderColor: palette.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: '#E0F2F1'
  },
  sectionTitle: {
    fontWeight: '600',
    color: palette.secondary,
    marginBottom: spacing.sm
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  toggleLabel: {
    color: palette.textPrimary,
    fontSize: typography.body
  },
  submitButtonContainer: {
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: palette.primary,
    color: '#fff',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    fontWeight: '600'
  }
});

export default CreatePostScreen;
