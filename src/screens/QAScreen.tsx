import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Snackbar,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import Screen from '@app/components/common/Screen';
import {palette, spacing} from '@app/theme';
import {
  COMMUNITY_TAGS,
  type CommunityQuestion,
  type CommunityTag
} from '@app/types';
import {communityApi} from '@app/services/api/communityApi';
import {useCommunityStore} from '@app/store/zustand/communityStore';

const availableTags = COMMUNITY_TAGS.filter(tag => tag.value !== 'all');

const QAScreen = (): JSX.Element => {
  const {colors} = useTheme();
  const questions = useCommunityStore(state => state.questions);
  const setQuestions = useCommunityStore(state => state.setQuestions);
  const addQuestion = useCommunityStore(state => state.addQuestion);
  const replaceQuestion = useCommunityStore(state => state.replaceQuestion);

  const [questionDraft, setQuestionDraft] = useState('');
  const [questionTags, setQuestionTags] = useState<CommunityTag[]>(['qa']);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [submittingAnswerId, setSubmittingAnswerId] = useState<string | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const canSubmitQuestion = useMemo(
    () => questionDraft.trim().length >= 6 && questionTags.length > 0,
    [questionDraft, questionTags]
  );

  const toggleQuestionTag = (tag: CommunityTag) => {
    setQuestionTags(prev => {
      if (prev.includes(tag)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(value => value !== tag);
      }
      return [...prev, tag];
    });
  };

  const fetchQuestions = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await communityApi.fetchQuestions();
      setQuestions(data);
    } catch (error) {
      console.warn('Failed to fetch questions', error);
      setSnackbar('加载问答失败，请稍后再试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setQuestions]);

  useEffect(() => {
    if (questions.length === 0) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [fetchQuestions, questions.length]);

  const handleCreateQuestion = async () => {
    if (!canSubmitQuestion) {
      setSnackbar('请完善问题内容与标签');
      return;
    }
    setSubmittingQuestion(true);
    try {
      const newQuestion = await communityApi.createQuestion({
        question: questionDraft.trim(),
        tags: questionTags
      });
      addQuestion(newQuestion);
      setQuestionDraft('');
      setQuestionTags(['qa']);
      setSnackbar('问题发布成功');
    } catch (error) {
      console.warn('Create question failed', error);
      setSnackbar('发布问题失败，请稍后再试');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const draft = answerDrafts[questionId]?.trim();
    if (!draft) {
      setSnackbar('请先写下回答内容');
      return;
    }
    setSubmittingAnswerId(questionId);
    try {
      const updatedQuestion = await communityApi.createAnswer({
        questionId,
        text: draft
      });
      replaceQuestion(updatedQuestion);
      setAnswerDrafts(prev => ({...prev, [questionId]: ''}));
      setSnackbar('回答已发布');
    } catch (error) {
      console.warn('Create answer failed', error);
      setSnackbar('发布回答失败，请稍后再试');
    } finally {
      setSubmittingAnswerId(null);
    }
  };

  const handleAcceptAnswer = async (
    questionId: string,
    answerId: string
  ) => {
    try {
      const updatedQuestion = await communityApi.markAnswerAccepted(
        questionId,
        answerId
      );
      replaceQuestion(updatedQuestion);
      setSnackbar('已标记为最佳答案');
    } catch (error) {
      console.warn('Mark accepted failed', error);
      setSnackbar('操作失败，请稍后重试');
    }
  };

  const renderQuestion = ({item}: {item: CommunityQuestion}) => (
    <Card style={styles.questionCard} mode="elevated">
      <Card.Title
        title={item.question}
        titleNumberOfLines={2}
        subtitle={`来自 ${item.authorName}`}
      />
      <Card.Content>
        <View style={styles.tagRow}>
          {item.tags.map(tag => (
            <Chip key={`${item.id}-${tag}`} style={styles.tagChip}>
              #{tag.toUpperCase()}
            </Chip>
          ))}
        </View>
        <View style={styles.answerSection}>
          <Text style={styles.answerTitle}>
            {item.answers.length} 个回答
          </Text>
          {item.answers.length === 0 && (
            <Text style={styles.answerEmpty}>还没有回答，快来第一个答题！</Text>
          )}
          {item.answers.map(answer => (
            <Card style={styles.answerCard} key={answer.id} mode="contained">
              <Card.Title
                title={answer.authorName}
                subtitle={new Date(
                  answer.createdAt
                ).toLocaleTimeString()}
                right={() =>
                  answer.isAccepted ? (
                    <Chip icon="check" compact style={styles.acceptChip}>
                      已采纳
                    </Chip>
                  ) : (
                    <IconButton
                      icon="check-circle-outline"
                      onPress={() =>
                        handleAcceptAnswer(item.id, answer.id)
                      }
                    />
                  )
                }
              />
              <Card.Content>
                <Text style={styles.answerText}>{answer.text}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
        <View style={styles.answerInputRow}>
          <TextInput
            value={answerDrafts[item.id] ?? ''}
            onChangeText={text =>
              setAnswerDrafts(prev => ({...prev, [item.id]: text}))
            }
            placeholder="输入你的回答..."
            mode="outlined"
            style={styles.answerInput}
            dense
          />
          <Button
            mode="contained"
            loading={submittingAnswerId === item.id}
            onPress={() => handleSubmitAnswer(item.id)}>
            发送
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <Screen padded={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating color={colors.primary} />
          <Text style={styles.loadingText}>加载问答</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={questions}
        keyExtractor={item => item.id}
        renderItem={renderQuestion}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchQuestions} />
        }
        ListHeaderComponent={
          <Card style={styles.formCard} mode="contained">
            <Card.Title title="发起新问题" />
            <Card.Content>
              <TextInput
                value={questionDraft}
                onChangeText={setQuestionDraft}
                placeholder="例如：夏天怎么帮助哈士奇散热？"
                multiline
                style={styles.questionInput}
                mode="outlined"
              />
              <View style={styles.tagRow}>
                {availableTags.map(tag => (
                  <Chip
                    key={tag.value}
                    selected={questionTags.includes(tag.value)}
                    style={[
                      styles.tagChip,
                      questionTags.includes(tag.value) &&
                        styles.tagChipSelected
                    ]}
                    onPress={() => toggleQuestionTag(tag.value)}>
                    {tag.label}
                  </Chip>
                ))}
              </View>
              <Button
                mode="contained"
                onPress={handleCreateQuestion}
                disabled={!canSubmitQuestion || submittingQuestion}
                loading={submittingQuestion}>
                发布问题
              </Button>
            </Card.Content>
          </Card>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>暂无问题，快来抢先提问吧</Text>
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
  formCard: {
    marginBottom: spacing.lg,
    borderRadius: 16
  },
  questionInput: {
    marginBottom: spacing.md
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm
  },
  tagChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm
  },
  tagChipSelected: {
    backgroundColor: palette.primary
  },
  questionCard: {
    marginBottom: spacing.lg,
    borderRadius: 16
  },
  answerSection: {
    marginTop: spacing.md
  },
  answerTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs
  },
  answerCard: {
    marginTop: spacing.sm,
    borderRadius: 12,
    backgroundColor: '#F8FAFD'
  },
  answerText: {
    color: palette.textPrimary
  },
  answerEmpty: {
    color: palette.textSecondary
  },
  answerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm
  },
  answerInput: {
    flex: 1,
    marginRight: spacing.sm
  },
  acceptChip: {
    backgroundColor: palette.secondary
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: spacing.sm,
    color: palette.textSecondary
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.lg
  }
});

export default QAScreen;
