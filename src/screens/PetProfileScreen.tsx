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
  TextInput,
  Linking
} from 'react-native';
import type {KeyboardTypeOptions} from 'react-native';
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

type FormFieldOption = {
  label: string;
  value: string;
};

type FormFieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  helperText?: string;
  options?: FormFieldOption[];
};

type FormModalConfig = {
  title: string;
  fields: FormFieldConfig[];
  initialValues?: Record<string, string>;
  confirmText?: string;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
};

const FormModal = ({
  visible,
  config,
  values,
  submitting,
  onChangeValue,
  onCancel,
  onConfirm
}: {
  visible: boolean;
  config: FormModalConfig | null;
  values: Record<string, string>;
  submitting: boolean;
  onChangeValue: (key: string, value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  if (!config) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>{config.title}</Text>
          {config.fields.map(field => {
            const value = values[field.key] ?? '';
            return (
              <View key={field.key} style={modalStyles.fieldBlock}>
                <Text style={modalStyles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={modalStyles.required}> *</Text>}
                </Text>
                {field.options ? (
                  <View style={modalStyles.optionRow}>
                    {field.options.map(option => {
                      const selected = value === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => onChangeValue(field.key, option.value)}
                          style={[
                            modalStyles.optionChip,
                            selected && modalStyles.optionChipSelected
                          ]}
                        >
                          <Text
                            style={[
                              modalStyles.optionChipText,
                              selected && modalStyles.optionChipTextSelected
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={[
                      modalStyles.input,
                      field.multiline && modalStyles.textArea
                    ]}
                    value={value}
                    editable={!submitting}
                    onChangeText={text => onChangeValue(field.key, text)}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboardType}
                    multiline={field.multiline}
                  />
                )}
                {field.helperText && (
                  <Text style={modalStyles.helper}>{field.helperText}</Text>
                )}
              </View>
            );
          })}
          <View style={modalStyles.buttonRow}>
            <Pressable
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onCancel}
              disabled={submitting}
            >
              <Text style={modalStyles.cancelText}>取消</Text>
            </Pressable>
            <Pressable
              style={[modalStyles.button, modalStyles.confirmButton, {marginLeft: spacing.sm}]}
              onPress={onConfirm}
              disabled={submitting}
            >
              <Text style={modalStyles.confirmText}>
                {submitting ? '提交中...' : config.confirmText ?? '确定'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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

  // 通用表单弹窗
  const [formModalConfig, setFormModalConfig] = useState<FormModalConfig | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);

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

  const openFormModal = (config: FormModalConfig) => {
    setFormModalConfig(config);
    setFormValues(config.initialValues ?? {});
  };

  const closeFormModal = () => {
    setFormModalConfig(null);
    setFormValues({});
    setFormSubmitting(false);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFormConfirm = async () => {
    if (!formModalConfig) return;
    for (const field of formModalConfig.fields) {
      if (field.required) {
        const val = formValues[field.key]?.trim();
        if (!val) {
          Alert.alert('提示', `请填写${field.label}`);
          return;
        }
      }
    }
    try {
      setFormSubmitting(true);
      await formModalConfig.onSubmit(formValues);
      closeFormModal();
    } catch (err) {
      console.error('提交失败', err);
      setFormSubmitting(false);
      Alert.alert('错误', '操作失败，请稍后重试');
    }
  };
  
  useEffect(() => {
    loadProfile();
  }, [petId, token]);

  // 处理添加疫苗记录
  const handleAddVaccine = () => {
    if (!token || !petId) {
      Alert.alert('提示', '请先登录并选择宠物');
      return;
    }
    openFormModal({
      title: '添加疫苗记录',
      fields: [
        {key: 'name', label: '疫苗名称', placeholder: '如：狂犬疫苗', required: true},
        {key: 'date', label: '接种日期', placeholder: 'YYYY-MM-DD', required: true},
        {key: 'clinic', label: '接种医院', placeholder: '可选填写'},
        {key: 'vet', label: '主治医生', placeholder: '可选填写'},
        {
          key: 'effect',
          label: '疫苗作用',
          placeholder: '简述疫苗防护范围',
          multiline: true
        },
        {
          key: 'precautions',
          label: '注意事项',
          placeholder: '接种后需要留意的事项',
          multiline: true
        }
      ],
      onSubmit: async values => {
        await addVaccine(token, petId, {
          name: values.name.trim(),
          date: values.date.trim(),
          clinic: values.clinic?.trim(),
          vet: values.vet?.trim(),
          effect: values.effect?.trim(),
          precautions: values.precautions?.trim()
        });
        await loadProfile();
        Alert.alert('成功', '疫苗记录已添加');
      }
    });
  };

  // 处理添加体检报告
  const handleAddCheckup = () => {
    if (!token || !petId) {
      Alert.alert('提示', '请先登录并选择宠物');
      return;
    }
    openFormModal({
      title: '添加体检报告',
      fields: [
        {key: 'date', label: '体检日期', placeholder: 'YYYY-MM-DD', required: true},
        {key: 'clinic', label: '体检医院', placeholder: '如：城市宠物医院'},
        {key: 'vet', label: '主治医生', placeholder: '医生姓名'},
        {
          key: 'weightKg',
          label: '体检体重 (kg)',
          placeholder: '如：13.8',
          keyboardType: 'decimal-pad'
        },
        {
          key: 'summary',
          label: '体检总结',
          placeholder: '总体评价、医生建议等',
          multiline: true
        },
        {
          key: 'details',
          label: '体检内容',
          placeholder: '营养、血常规、影像等项目',
          multiline: true
        },
        {
          key: 'reportFileUrl',
          label: '体检报告PDF',
          placeholder: '输入本地路径或在线链接',
          helperText: '目前支持输入PDF文件的链接或共享路径'
        }
      ],
      onSubmit: async values => {
        await addCheckup(token, petId, {
          date: values.date.trim(),
          clinic: values.clinic?.trim(),
          vet: values.vet?.trim(),
          summary: values.summary?.trim(),
          details: values.details?.trim(),
          reportFileUrl: values.reportFileUrl?.trim(),
          weightKg: values.weightKg ? parseFloat(values.weightKg) : undefined
        });
        await loadProfile();
        Alert.alert('成功', '体检报告已添加');
      }
    });
  };

  // 处理添加过敏史
  const handleAddAllergy = () => {
    if (!token || !petId) {
      Alert.alert('提示', '请先登录并选择宠物');
      return;
    }
    openFormModal({
      title: '添加过敏史',
      fields: [
        {key: 'allergen', label: '过敏源', placeholder: '如：鸡肉', required: true},
        {key: 'reaction', label: '过敏反应', placeholder: '皮肤瘙痒、呕吐等', multiline: true},
        {
          key: 'severity',
          label: '严重程度',
          options: [
            {label: '低', value: 'low'},
            {label: '中', value: 'medium'},
            {label: '高', value: 'high'}
          ],
          required: true
        },
        {
          key: 'notes',
          label: '注意事项',
          placeholder: '触发后的处理方式、注意事项',
          multiline: true
        }
      ],
      initialValues: {severity: 'low'},
      onSubmit: async values => {
        await addAllergy(token, petId, {
          allergen: values.allergen.trim(),
          reaction: values.reaction?.trim(),
          severity: (values.severity as 'low' | 'medium' | 'high') ?? 'low',
          notes: values.notes?.trim()
        });
        await loadProfile();
        Alert.alert('成功', '过敏史已添加');
      }
    });
  };

  // 处理更新喂食计划
  const handleUpdateFeedingPlan = () => {
    if (!token || !petId) {
      Alert.alert('提示', '请先登录并选择宠物');
      return;
    }
    openFormModal({
      title: '更新喂食计划',
      fields: [
        {key: 'food', label: '食物名称', placeholder: '如：低敏犬粮', required: true},
        {
          key: 'calories',
          label: '每餐热量/份量',
          placeholder: '120 kcal 或 80g',
          helperText: '可填写热量或克数'
        },
        {
          key: 'schedule',
          label: '喂食时间与份量',
          placeholder: '每行一个时间：07:30 - 80g',
          helperText: '例如：07:30 - 80g↵18:30 - 70g',
          multiline: true
        },
        {key: 'notes', label: '补充说明', placeholder: '如：饭后加益生菌', multiline: true}
      ],
      onSubmit: async values => {
        const schedule = (values.schedule ?? '')
          .split('\n')
          .map(item => item.trim())
          .filter(Boolean);
        await updateFeedingPlan(token, petId, {
          food: values.food.trim(),
          caloriesPerMeal: values.calories ? parseInt(values.calories, 10) || 0 : 0,
          schedule,
          notes: values.notes?.trim()
        });
        await loadProfile();
        Alert.alert('成功', '喂食计划已更新');
      }
    });
  };

  // 处理添加运动记录
  const handleAddExercise = () => {
    if (!token || !petId) {
      Alert.alert('提示', '请先登录并选择宠物');
      return;
    }
    openFormModal({
      title: '添加运动记录',
      fields: [
        {key: 'activity', label: '运动类型', placeholder: '如：慢跑', required: true},
        {key: 'date', label: '运动日期', placeholder: 'YYYY-MM-DD', required: true},
        {
          key: 'duration',
          label: '持续时间（分钟）',
          placeholder: '如：30',
          required: true,
          keyboardType: 'number-pad'
        },
        {
          key: 'intensity',
          label: '运动强度',
          options: [
            {label: '低', value: 'low'},
            {label: '中', value: 'medium'},
            {label: '高', value: 'high'}
          ],
          required: true
        }
      ],
      initialValues: {intensity: 'medium'},
      onSubmit: async values => {
        await addExercise(token, petId, {
          date: values.date.trim(),
          activity: values.activity.trim(),
          durationMinutes: parseInt(values.duration, 10) || 0,
          intensity: (values.intensity as 'low' | 'medium' | 'high') ?? 'medium'
        });
        await loadProfile();
        Alert.alert('成功', '运动记录已添加');
      }
    });
  };

  const handleOpenReport = async (url: string) => {
    if (!url) {
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('提示', '无法打开该链接，请确认地址是否正确');
      }
    } catch (err) {
      console.error('打开体检报告失败', err);
      Alert.alert('错误', '打开链接失败，请稍后重试');
    }
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
      <FormModal
        visible={!!formModalConfig}
        config={formModalConfig}
        values={formValues}
        submitting={formSubmitting}
        onChangeValue={handleFieldChange}
        onCancel={closeFormModal}
        onConfirm={handleFormConfirm}
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
              {record.effect ? (
                <Text style={styles.cardNotes}>作用：{record.effect}</Text>
              ) : null}
              {record.precautions ? (
                <Text style={styles.cardNotes}>注意事项：{record.precautions}</Text>
              ) : null}
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
              {checkup.details ? (
                <Text style={styles.cardNotes}>体检内容：{checkup.details}</Text>
              ) : null}
              {checkup.reportFileUrl ? (
                <Pressable onPress={() => handleOpenReport(checkup.reportFileUrl || '')}>
                  <Text style={styles.linkText}>查看 PDF 报告</Text>
                </Pressable>
              ) : null}
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
              {allergy.notes && <Text style={styles.cardNotes}>注意事项：{allergy.notes}</Text>}
            </View>
            ))
          )}
        </Section>

        <Section title="喂食计划" onAdd={handleUpdateFeedingPlan}>
          {profile.feedingPlan.food ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{profile.feedingPlan.food}</Text>
            <Text style={styles.cardMeta}>
              每餐 {profile.feedingPlan.caloriesPerMeal} kcal
            </Text>
            {profile.feedingPlan.schedule.length > 0 && (
              <View style={styles.scheduleList}>
                {profile.feedingPlan.schedule.map((item, index) => (
                  <Text key={`${item}-${index}`} style={styles.cardMeta}>
                    {item}
                  </Text>
                ))}
              </View>
            )}
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
  },
  scheduleList: {
    marginTop: spacing.xs
  },
  linkText: {
    marginTop: spacing.xs,
    color: palette.primary,
    fontWeight: '600'
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
  fieldBlock: {
    marginBottom: spacing.md
  },
  fieldLabel: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.xs
  },
  required: {
    color: '#FF5A5F',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.xs
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  helper: {
    fontSize: typography.caption,
    color: palette.textSecondary
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  optionChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginRight: spacing.xs,
    marginBottom: spacing.xs
  },
  optionChipSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  optionChipText: {
    color: palette.textSecondary,
    fontWeight: '500'
  },
  optionChipTextSelected: {
    color: '#fff'
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
