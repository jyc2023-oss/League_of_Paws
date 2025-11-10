import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {usePetStore} from '@app/store/zustand/petStore';
import {useAppSelector} from '@app/store/redux/hooks';
import type {RootStackParamList} from '@app/navigation/types';
import {updatePet, updateFeedingPlan, addVaccine} from '@app/services/api/petApi';
import {fetchPetHealthProfile} from '@app/services/api/petHealthApi';

type PetManageRoute = RouteProp<RootStackParamList, 'PetManage'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

const PetManageScreen = (): JSX.Element => {
  const route = useRoute<PetManageRoute>();
  const navigation = useNavigation<Navigation>();
  const activePetId = usePetStore(state => state.activePetId);
  const token = useAppSelector(state => state.auth.token);
  const pets = usePetStore(state => state.pets);
  
  const petId = route.params?.petId ?? activePetId ?? pets[0]?.id;
  const currentPet = pets.find(p => p.id === petId);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 基本信息状态
  const [breed, setBreed] = useState('');
  const [ageInMonths, setAgeInMonths] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [feedingTimes, setFeedingTimes] = useState('');
  const [nextVaccineDate, setNextVaccineDate] = useState('');
  const [nextVaccineName, setNextVaccineName] = useState('');

  const loadPetData = async () => {
    if (!petId || !token) {
      // 如果没有token，使用本地数据
      if (currentPet) {
        setBreed('');
        setAgeInMonths(currentPet.ageInMonths?.toString() || '');
        setWeightKg('');
        setFeedingTimes('');
        setNextVaccineDate('');
        setNextVaccineName('');
      }
      return;
    }
    
    setLoading(true);
    try {
      // 从后端加载健康档案获取完整信息
      const profile = await fetchPetHealthProfile(petId, token);
      
      // 计算月龄（如果有年龄数据）
      const months = currentPet?.ageInMonths || (profile.age * 12);
      
      setBreed(profile.breed === '未填写' ? '' : profile.breed);
      setAgeInMonths(months.toString());
      setWeightKg(profile.weightKg > 0 ? profile.weightKg.toString() : '');
      setFeedingTimes(profile.feedingPlan.schedule.length > 0 ? profile.feedingPlan.schedule.join(', ') : '');
      setNextVaccineName(profile.vaccines.length > 0 ? profile.vaccines[0].name : '');
      setNextVaccineDate(profile.vaccines.length > 0 ? profile.vaccines[0].date : '');
    } catch (err: any) {
      // 如果加载失败（404或其他错误），使用本地数据
      console.log('加载健康档案失败，使用本地数据:', err.message);
      if (currentPet) {
        setBreed('');
        setAgeInMonths(currentPet.ageInMonths?.toString() || '');
        setWeightKg('');
        setFeedingTimes('');
        setNextVaccineDate('');
        setNextVaccineName('');
      }
    } finally {
      setLoading(false);
    }
  };

  // 加载宠物数据
  useEffect(() => {
    loadPetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId, token, currentPet]);

  const handleSave = async () => {
    if (!token || !petId) {
      Alert.alert('错误', '未登录，请先登录');
      return;
    }

    setSaving(true);
    try {
      // 保存基本信息
      await updatePet(token, petId, {
        breed: breed.trim() || undefined,
        ageInMonths: ageInMonths ? parseInt(ageInMonths, 10) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined
      });

      // 保存喂食时间
      if (feedingTimes.trim()) {
        const schedule = feedingTimes.split(',').map(t => t.trim()).filter(t => t);
        await updateFeedingPlan(token, petId, {
          schedule
        });
      }

      // 保存下一次疫苗信息（如果有填写）
      if (nextVaccineName.trim() && nextVaccineDate.trim()) {
        try {
          await addVaccine(token, petId, {
            name: nextVaccineName.trim(),
            date: nextVaccineDate.trim(),
            clinic: '',
            vet: '',
            notes: '计划接种'
          });
        } catch (vaccineErr) {
          // 疫苗保存失败不影响基本信息保存
          console.warn('保存疫苗信息失败:', vaccineErr);
        }
      }

      Alert.alert('成功', '信息已保存');
      // 重新加载数据
      loadPetData();
    } catch (err: any) {
      console.error('保存失败:', err);
      Alert.alert('错误', err.response?.data?.message || '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleNavigateToTool = (route: 'PetProfile' | 'HealthReport' | 'FeedingControl' | 'HabitAnalytics') => {
    navigation.navigate(route, {petId});
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.hint}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  if (!currentPet) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.error}>未找到宠物信息</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>宠物管理</Text>
        
        {/* 基本信息卡片 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>基本信息</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>宠物名称</Text>
            <Text style={styles.value}>{currentPet.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>宠物品类</Text>
            <Text style={styles.value}>
              {currentPet.species === 'dog' ? '犬类' : currentPet.species === 'cat' ? '猫类' : '其他'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>宠物品种</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="例如：柯基"
              placeholderTextColor={palette.textSecondary}
            />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>宠物年龄（月龄）</Text>
            <TextInput
              style={styles.input}
              value={ageInMonths}
              onChangeText={setAgeInMonths}
              keyboardType="numeric"
              placeholder="例如：18"
              placeholderTextColor={palette.textSecondary}
            />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>宠物体重（kg）</Text>
            <TextInput
              style={styles.input}
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              placeholder="例如：11.2"
              placeholderTextColor={palette.textSecondary}
            />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>宠物喂食时间</Text>
            <TextInput
              style={styles.input}
              value={feedingTimes}
              onChangeText={setFeedingTimes}
              placeholder="例如：07:30, 12:30, 18:30"
              placeholderTextColor={palette.textSecondary}
            />
            <Text style={styles.hintText}>多个时间用逗号分隔</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>下一次疫苗</Text>
            <View style={styles.vaccineRow}>
              <TextInput
                style={[styles.input, styles.vaccineInput, {marginRight: spacing.sm}]}
                value={nextVaccineName}
                onChangeText={setNextVaccineName}
                placeholder="疫苗名称"
                placeholderTextColor={palette.textSecondary}
              />
              <TextInput
                style={[styles.input, styles.vaccineInput]}
                value={nextVaccineDate}
                onChangeText={setNextVaccineDate}
                placeholder="日期（YYYY-MM-DD）"
                placeholderTextColor={palette.textSecondary}
              />
            </View>
          </View>
          
          <Pressable 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>保存信息</Text>
            )}
          </Pressable>
        </View>

        {/* 健康管理工具 */}
        <Text style={styles.sectionTitle}>健康管理工具</Text>
        <View style={styles.toolsGrid}>
          <Pressable
            style={[styles.toolCard, {borderColor: palette.primary}]}
            onPress={() => handleNavigateToTool('PetProfile')}
          >
            <Text style={[styles.toolLabel, {color: palette.primary}]}>健康档案</Text>
            <Text style={styles.toolDescription}>疫苗 · 体检 · 过敏史</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, {borderColor: palette.secondary}]}
            onPress={() => handleNavigateToTool('HealthReport')}
          >
            <Text style={[styles.toolLabel, {color: palette.secondary}]}>趋势报告</Text>
            <Text style={styles.toolDescription}>喂食 / 运动 / 体重</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, {borderColor: palette.accent}]}
            onPress={() => handleNavigateToTool('FeedingControl')}
          >
            <Text style={[styles.toolLabel, {color: palette.accent}]}>喂食控制</Text>
            <Text style={styles.toolDescription}>远程提醒与推送</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, {borderColor: '#FFB74D'}]}
            onPress={() => handleNavigateToTool('HabitAnalytics')}
          >
            <Text style={[styles.toolLabel, {color: '#FFB74D'}]}>陪伴分析</Text>
            <Text style={styles.toolDescription}>坚持度 · 洞察</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
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
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.lg
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.xl
  },
  cardTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  infoRow: {
    marginBottom: spacing.md
  },
  label: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.xs
  },
  value: {
    fontSize: typography.body,
    color: palette.textPrimary,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginTop: spacing.xs
  },
  hintText: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    marginTop: spacing.xs
  },
  vaccineRow: {
    flexDirection: 'row'
  },
  vaccineInput: {
    flex: 1
  },
  saveButton: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.body
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  toolCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff'
  },
  toolLabel: {
    fontWeight: '700',
    fontSize: typography.body,
    marginBottom: spacing.xs
  },
  toolDescription: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    lineHeight: 18
  }
});

export default PetManageScreen;

