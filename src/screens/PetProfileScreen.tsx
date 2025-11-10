import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {
  PetHealthProfile,
  VaccineRecord,
  MedicalCheckup,
  AllergyRecord,
  ExerciseRecord
} from '@app/types';
import {fetchPetHealthProfile} from '@app/services/api/petHealthApi';
import type {RootStackParamList} from '@app/navigation/types';
import {usePetStore} from '@app/store/zustand/petStore';
import {useAppSelector} from '@app/store/redux/hooks';
import {
  addVaccine,
  addCheckup,
  addAllergy,
  updateFeedingPlan,
  addExercise,
  updatePet
} from '@app/services/api/petApi';

type PetProfileRoute = RouteProp<RootStackParamList, 'PetProfile'>;

const Section = ({
  title,
  children,
  onAdd
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
}): JSX.Element => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
      {onAdd && (
        <Pressable onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 添加</Text>
        </Pressable>
      )}
    </View>
    {children}
  </View>
);

// 简单的输入Modal组件
const InputModal = ({
  visible,
  title,
  placeholder,
  onCancel,
  onConfirm,
  value,
  onChangeText
}: {
  visible: boolean;
  title: string;
  placeholder?: string;
  onCancel: () => void;
  onConfirm: () => void;
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={modalStyles.overlay}>
      <View style={modalStyles.container}>
        <Text style={modalStyles.title}>{title}</Text>
        <TextInput
          style={modalStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoFocus
        />
        <View style={modalStyles.buttonRow}>
          <Pressable style={[modalStyles.button, modalStyles.cancelButton]} onPress={onCancel}>
            <Text style={modalStyles.cancelText}>取消</Text>
          </Pressable>
          <Pressable style={[modalStyles.button, modalStyles.confirmButton, {marginLeft: spacing.sm}]} onPress={onConfirm}>
            <Text style={modalStyles.confirmText}>确定</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const PetProfileScreen = (): JSX.Element => {
  const route = useRoute<PetProfileRoute>();
  const activePetId = usePetStore(state => state.activePetId);
  const token = useAppSelector(state => state.auth.token);
  const pets = usePetStore(state => state.pets);
  
  // 获取petId，优先使用route参数，然后是activePetId，最后是第一个宠物
  const petId = route.params?.petId ?? activePetId ?? pets[0]?.id;

  const [profile, setProfile] = useState<PetHealthProfile | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 输入Modal状态
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputConfig, setInputConfig] = useState<{
    title: string;
    placeholder?: string;
    onConfirm: (value: string) => void;
  } | null>(null);

  const loadProfile = async () => {
    if (!petId) {
      setLoading(false);
      setError('未找到宠物ID');
      return;
    }

    if (!token) {
      setLoading(false);
      setError('未登录，请先登录');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (!petId) {
        throw new Error('petId为空');
      }
      console.log('加载健康档案 - petId:', petId, 'token存在:', !!token);
      const data = await fetchPetHealthProfile(petId, token);
      setProfile(data);
    } catch (err: any) {
      console.error('加载健康档案失败:', err);
      console.error('错误详情:', err.response?.data || err.message);
      // 如果API返回404或错误，创建空的基础档案
      const currentPet = pets.find(p => p.id === petId);
      if (currentPet) {
        setProfile({
          id: currentPet.id,
          name: currentPet.name,
          species: currentPet.species === 'dog' ? '犬' : currentPet.species === 'cat' ? '猫' : currentPet.species,
          breed: '未填写',
          age: currentPet.ageInMonths ? Math.floor(currentPet.ageInMonths / 12) : 0,
          weightKg: 0,
          vaccines: [],
          checkups: [],
          allergies: [],
          feedingPlan: {
            food: '',
            caloriesPerMeal: 0,
            schedule: [],
            notes: undefined
          },
          exerciseRecords: []
        });
      } else {
        setError('无法加载宠物档案');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 显示输入Modal的辅助函数
  const showInputModal = (title: string, placeholder: string, onConfirm: (value: string) => void) => {
    setInputValue('');
    setInputConfig({title, placeholder, onConfirm});
    setInputModalVisible(true);
  };
  
  const handleInputConfirm = () => {
    if (inputConfig && inputValue.trim()) {
      inputConfig.onConfirm(inputValue.trim());
      setInputModalVisible(false);
      setInputConfig(null);
      setInputValue('');
    }
  };
  
  const handleInputCancel = () => {
    setInputModalVisible(false);
    setInputConfig(null);
    setInputValue('');
  };

  useEffect(() => {
    loadProfile();
  }, [petId, token]);

  // 处理添加疫苗记录
  const handleAddVaccine = () => {
    showInputModal('添加疫苗记录', '请输入疫苗名称', async (name) => {
      if (!name || !token || !petId) return;
      showInputModal('接种日期', '格式：YYYY-MM-DD', async (date) => {
        if (!date) return;
        try {
          await addVaccine(token, petId, {
            name,
            date,
            clinic: '',
            vet: '',
            notes: ''
          });
          loadProfile();
          Alert.alert('成功', '疫苗记录已添加');
        } catch (err) {
          Alert.alert('错误', '添加失败，请稍后重试');
        }
      });
    });
  };

  // 处理添加体检报告
  const handleAddCheckup = () => {
    showInputModal('添加体检报告', '请输入体检日期（YYYY-MM-DD）', async (date) => {
      if (!date || !token || !petId) return;
      try {
        await addCheckup(token, petId, {
          date,
          clinic: '',
          vet: '',
          summary: '',
          weightKg: 0
        });
        loadProfile();
        Alert.alert('成功', '体检报告已添加');
      } catch (err) {
        Alert.alert('错误', '添加失败，请稍后重试');
      }
    });
  };

  // 处理添加过敏史
  const handleAddAllergy = () => {
    showInputModal('添加过敏史', '请输入过敏原', async (allergen) => {
      if (!allergen || !token || !petId) return;
      try {
        await addAllergy(token, petId, {
          allergen,
          reaction: '',
          severity: 'low',
          notes: ''
        });
        loadProfile();
        Alert.alert('成功', '过敏史已添加');
      } catch (err) {
        Alert.alert('错误', '添加失败，请稍后重试');
      }
    });
  };

  // 处理更新喂食计划
  const handleUpdateFeedingPlan = () => {
    showInputModal('更新喂食计划', '请输入食物名称', async (food) => {
      if (!token || !petId) return;
      try {
        await updateFeedingPlan(token, petId, {
          food: food || '',
          caloriesPerMeal: 0,
          schedule: [],
          notes: ''
        });
        loadProfile();
        Alert.alert('成功', '喂食计划已更新');
      } catch (err) {
        Alert.alert('错误', '更新失败，请稍后重试');
      }
    });
  };

  // 处理添加运动记录
  const handleAddExercise = () => {
    showInputModal('添加运动记录', '请输入运动类型', (activity) => {
      if (!activity) return;
      showInputModal('运动日期', '格式：YYYY-MM-DD', async (date) => {
        if (!date || !token || !petId) return;
        try {
          await addExercise(token, petId, {
            date,
            activity,
            durationMinutes: 30,
            intensity: 'medium'
          });
          loadProfile();
          Alert.alert('成功', '运动记录已添加');
        } catch (err) {
          Alert.alert('错误', '添加失败，请稍后重试');
        }
      });
    });
  };

  const summary = useMemo(() => {
    if (!profile) {
      return null;
    }
    const nextVaccine = profile.vaccines[0];
    return {
      name: profile.name,
      breed: profile.breed,
      age: profile.age,
      weight: profile.weightKg,
      nextVaccine: nextVaccine?.name,
      schedule: profile.feedingPlan.schedule.length > 0 
        ? profile.feedingPlan.schedule.join(' / ') 
        : '未设置'
    };
  }, [profile]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.hint}>正在加载宠物档案...</Text>
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.error}>没有找到宠物档案</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <InputModal
        visible={inputModalVisible}
        title={inputConfig?.title || ''}
        placeholder={inputConfig?.placeholder}
        value={inputValue}
        onChangeText={setInputValue}
        onCancel={handleInputCancel}
        onConfirm={handleInputConfirm}
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>健康档案</Text>
        {error && <Text style={styles.warning}>{error}</Text>}

        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryName}>{summary.name}</Text>
            <Text style={styles.summaryMeta}>
              {summary.breed} ｜ {summary.age} 岁 ｜ {summary.weight.toFixed(1)} kg
            </Text>
            <Text style={styles.summaryMeta}>喂食时间：{summary.schedule}</Text>
            {summary.nextVaccine && (
              <Text style={styles.summaryMeta}>下一次疫苗：{summary.nextVaccine}</Text>
            )}
          </View>
        )}

        <Section title="疫苗记录" onAdd={handleAddVaccine}>
          {profile.vaccines.length === 0 ? (
            <Text style={styles.emptyText}>暂无疫苗记录</Text>
          ) : (
            profile.vaccines.map((record: VaccineRecord) => (
            <View key={record.id} style={styles.card}>
              <Text style={styles.cardTitle}>{record.name}</Text>
              <Text style={styles.cardMeta}>
                {record.date} ｜ {record.clinic}
              </Text>
              <Text style={styles.cardMeta}>主治医生：{record.vet}</Text>
              {record.notes && <Text style={styles.cardNotes}>{record.notes}</Text>}
            </View>
            ))
          )}
        </Section>

        <Section title="体检报告" onAdd={handleAddCheckup}>
          {profile.checkups.length === 0 ? (
            <Text style={styles.emptyText}>暂无体检报告</Text>
          ) : (
            profile.checkups.map((checkup: MedicalCheckup) => (
            <View key={checkup.id} style={styles.card}>
              <Text style={styles.cardTitle}>{checkup.date}</Text>
              <Text style={styles.cardMeta}>
                {checkup.clinic} ｜ {checkup.vet}
              </Text>
              <Text style={styles.cardMeta}>体重：{checkup.weightKg.toFixed(1)} kg</Text>
              <Text style={styles.cardNotes}>{checkup.summary}</Text>
            </View>
            ))
          )}
        </Section>

        <Section title="过敏史" onAdd={handleAddAllergy}>
          {profile.allergies.length === 0 ? (
            <Text style={styles.emptyText}>暂无过敏记录</Text>
          ) : (
            profile.allergies.map((allergy: AllergyRecord) => (
            <View key={allergy.id} style={styles.card}>
              <Text style={styles.cardTitle}>{allergy.allergen}</Text>
              <Text style={styles.cardMeta}>反应：{allergy.reaction}</Text>
              <Text style={styles.cardMeta}>严重程度：{translateSeverity(allergy.severity)}</Text>
              {allergy.notes && <Text style={styles.cardNotes}>{allergy.notes}</Text>}
            </View>
            ))
          )}
        </Section>

        <Section title="喂食计划" onAdd={handleUpdateFeedingPlan}>
          {profile.feedingPlan.food ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{profile.feedingPlan.food}</Text>
            <Text style={styles.cardMeta}>
              每餐 {profile.feedingPlan.caloriesPerMeal} kcal ｜{' '}
              {profile.feedingPlan.schedule.join('、')}
            </Text>
            {profile.feedingPlan.notes && (
              <Text style={styles.cardNotes}>{profile.feedingPlan.notes}</Text>
            )}
          </View>
          ) : (
            <Text style={styles.emptyText}>未设置喂食计划</Text>
          )}
        </Section>

        <Section title="运动记录" onAdd={handleAddExercise}>
          {profile.exerciseRecords.length === 0 ? (
            <Text style={styles.emptyText}>暂无运动记录</Text>
          ) : (
            profile.exerciseRecords.map((exercise: ExerciseRecord) => (
            <View key={exercise.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {exercise.activity} ｜ {exercise.durationMinutes} min
              </Text>
              <Text style={styles.cardMeta}>
                {exercise.date} ｜ 强度：{translateIntensity(exercise.intensity)}
              </Text>
            </View>
            ))
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
};

const translateSeverity = (level: AllergyRecord['severity']): string => {
  switch (level) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    default:
      return '低';
  }
};

const translateIntensity = (level: ExerciseRecord['intensity']): string => {
  switch (level) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    default:
      return '低';
  }
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hint: {
    marginTop: spacing.sm,
    color: palette.textSecondary
  },
  error: {
    color: palette.primary,
    fontSize: typography.body
  },
  warning: {
    color: palette.accent,
    marginBottom: spacing.sm
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  summaryCard: {
    backgroundColor: palette.background,
    padding: spacing.md,
    borderRadius: 16,
    borderColor: palette.border,
    borderWidth: 1,
    marginBottom: spacing.lg
  },
  summaryName: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary
  },
  summaryMeta: {
    marginTop: 4,
    color: palette.textSecondary
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary
  },
  addButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.caption,
    fontWeight: '600'
  },
  emptyText: {
    color: palette.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.md
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary
  },
  cardMeta: {
    marginTop: 4,
    color: palette.textSecondary
  },
  cardNotes: {
    marginTop: spacing.xs,
    color: palette.textPrimary,
    lineHeight: 20
  }
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400
  },
  title: {
    fontSize: typography.title,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.background
  },
  confirmButton: {
    backgroundColor: palette.primary
  },
  cancelText: {
    color: palette.textSecondary,
    fontWeight: '600'
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default PetProfileScreen;
