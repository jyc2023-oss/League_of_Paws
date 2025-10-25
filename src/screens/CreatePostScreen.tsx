import React, {useMemo, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Appbar,
  Button,
  Chip,
  HelperText,
  IconButton,
  Snackbar,
  Text,
  TextInput
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  launchImageLibrary,
  type Asset,
  type ImageLibraryOptions
} from 'react-native-image-picker';
import Screen from '@app/components/common/Screen';
import {palette, spacing} from '@app/theme';
import {
  COMMUNITY_TAGS,
  type CommunityMedia,
  type CommunityTag
} from '@app/types';
import {communityApi} from '@app/services/api/communityApi';
import {useCommunityStore} from '@app/store/zustand/communityStore';
import type {RootStackParamList} from '@app/navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const availableTags = COMMUNITY_TAGS.filter(tag => tag.value !== 'all');

const CreatePostScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const addPostToTop = useCommunityStore(state => state.addPostToTop);
  const setFilterTag = useCommunityStore(state => state.setFilterTag);

  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<CommunityTag[]>(['daily']);
  const [mediaItems, setMediaItems] = useState<CommunityMedia[]>([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [contentError, setContentError] = useState('');

  const canSubmit = useMemo(
    () => content.trim().length >= 5 && selectedTags.length > 0,
    [content, selectedTags]
  );

  const toggleTag = (tag: CommunityTag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(item => item !== tag);
      }
      return [...prev, tag];
    });
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    const readImagesPermission =
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES ??
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const granted = await PermissionsAndroid.request(readImagesPermission);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handlePickMedia = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      setSnackbarMessage('需要相册权限才能上传图片或视频');
      return;
    }
    const options: ImageLibraryOptions = {
      mediaType: 'mixed',
      selectionLimit: 0,
      includeExtra: false
    };
    launchImageLibrary(options, response => {
      if (response.didCancel || !response.assets) {
        return;
      }
      const mapped = response.assets
        .map((asset: Asset) => {
          if (!asset.uri) {
            return null;
          }
          const isVideo = asset.type?.startsWith('video');
          return {
            id: asset.assetId ?? asset.fileName ?? `${asset.uri}-${Date.now()}`,
            type: isVideo ? 'video' : 'image',
            uri: asset.uri,
            thumbnail: isVideo ? asset.uri : undefined
          } as CommunityMedia;
        })
        .filter((item): item is CommunityMedia => Boolean(item));
      setMediaItems(prev => [...prev, ...mapped]);
    });
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setContentError('请至少输入 5 个字，并选择标签');
      return;
    }
    setSubmitting(true);
    setContentError('');
    try {
      const newPost = await communityApi.createPost({
        content: content.trim(),
        tags: selectedTags,
        media: mediaItems
      });
      addPostToTop(newPost);
      setFilterTag('all');
      setSnackbarMessage('发布成功，已推送到社区');
      setContent('');
      setMediaItems([]);
      navigation.goBack();
    } catch (error) {
      console.warn('Create post failed', error);
      setSnackbarMessage('发布失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={false}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="发布动态" />
        <Appbar.Action
          icon="check"
          disabled={!canSubmit || isSubmitting}
          onPress={handleSubmit}
        />
      </Appbar.Header>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionLabel}>正文</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          mode="outlined"
          placeholder="分享宠物日常、训练心得或救助信息..."
          style={styles.textInput}
        />
        {contentError.length > 0 && (
          <HelperText type="error" visible>
            {contentError}
          </HelperText>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>标签</Text>
          <Text style={styles.sectionHint}>选择至少 1 个标签帮助分类</Text>
        </View>
        <View style={styles.tagsRow}>
          {availableTags.map(tag => (
            <Chip
              key={tag.value}
              selected={selectedTags.includes(tag.value)}
              style={[
                styles.tagChip,
                selectedTags.includes(tag.value) && styles.tagChipSelected
              ]}
              onPress={() => toggleTag(tag.value)}>
              {tag.label}
            </Chip>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>图片/视频</Text>
          <Button
            icon="image-plus"
            mode="outlined"
            onPress={handlePickMedia}
            disabled={isSubmitting}>
            选择文件
          </Button>
        </View>
        <View style={styles.mediaGrid}>
          {mediaItems.map(item => (
            <View style={styles.mediaItem} key={item.id}>
              <Image source={{uri: item.uri}} style={styles.mediaImage} />
              {item.type === 'video' && (
                <View style={styles.videoLabel}>
                  <Text style={styles.videoLabelText}>VIDEO</Text>
                </View>
              )}
              <IconButton
                icon="close"
                size={18}
                style={styles.mediaRemove}
                onPress={() => handleRemoveMedia(item.id)}
              />
            </View>
          ))}
          {mediaItems.length === 0 && (
            <Text style={styles.mediaEmpty}>暂未选择媒体</Text>
          )}
        </View>

        <Button
          mode="contained"
          style={styles.submitButton}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit || isSubmitting}>
          发布
        </Button>
      </ScrollView>
      <Snackbar
        visible={Boolean(snackbarMessage)}
        onDismiss={() => setSnackbarMessage(null)}
        duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs
  },
  sectionHint: {
    color: palette.textSecondary,
    fontSize: 12
  },
  textInput: {
    minHeight: 160,
    textAlignVertical: 'top'
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tagChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm
  },
  tagChipSelected: {
    backgroundColor: palette.primary
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm
  },
  mediaItem: {
    width: '30%',
    aspectRatio: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden'
  },
  mediaImage: {
    width: '100%',
    height: '100%'
  },
  mediaRemove: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#00000060'
  },
  mediaEmpty: {
    color: palette.textSecondary
  },
  videoLabel: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: '#00000070',
    paddingHorizontal: spacing.xs,
    borderRadius: 8
  },
  videoLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600'
  },
  submitButton: {
    marginTop: spacing.xl,
    borderRadius: 999
  }
});

export default CreatePostScreen;
