import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {usePetStore} from '@app/store/zustand/petStore';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {
  updateAccountDetails,
  UserAccount
} from '@app/store/redux/slices/userSlice';
import {completeOnboarding} from '@app/store/redux/slices/appSlice';
import type {RootStackParamList} from '@app/navigation/types';
import {createPet} from '@app/services/api/petApi';

type Props = NativeStackScreenProps<RootStackParamList, 'PetOnboarding'>;

type SpeciesOption = 'dog' | 'cat' | 'other';

const speciesOptions: Array<{label: string; value: SpeciesOption}> = [
  {label: '犬类', value: 'dog'},
  {label: '猫类', value: 'cat'},
  {label: '其他', value: 'other'}
];

const PetOnboardingScreen = ({navigation}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const token = useAppSelector(state => state.auth.token);
  const activeUser = useMemo<UserAccount | undefined>(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const {addPet, setActivePet, pets} = usePetStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [species, setSpecies] = useState<SpeciesOption>('dog');
  const [breed, setBreed] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeUser) {
      navigation.reset({
        index: 0,
        routes: [{name: 'AuthLanding'}]
      });
    }
    // 移除自动跳转逻辑，允许已完成档案的用户添加新宠物
  }, [activeUser, navigation]);

  const handleSubmit = async () => {
    if (!activeUser || !token) {
      Alert.alert('错误', '未登录，请先登录');
      return;
    }

    if (name.trim().length === 0) {
      Alert.alert('提示', '请填写宠物昵称');
      return;
    }

    setIsLoading(true);

    try {
      const ageInMonths = Number.parseInt(age, 10);
      const ageValue = Number.isNaN(ageInMonths) ? undefined : ageInMonths;
      const weightValue = weightKg.trim() ? parseFloat(weightKg) : undefined;

      // 调用后端API创建宠物
      const createdPet = await createPet(token, {
        name: name.trim(),
        species,
        ageInMonths: ageValue,
        breed: breed.trim() || undefined,
        weightKg: weightValue
      });

      // 成功后添加到本地store
      addPet(createdPet);
      setActivePet(createdPet.id);

      const totalPets = usePetStore.getState().pets.length;

      // 更新用户信息
      dispatch(
        updateAccountDetails({
          userId: activeUser.id,
          petsCount: totalPets,
          hasCompletedProfile: true
        })
      );

      // 如果是首次添加宠物，完成引导流程
      if (!activeUser.hasCompletedProfile) {
        dispatch(completeOnboarding());
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs'}]
        });
      } else {
        // 如果已完成档案，添加宠物后返回宠物列表
        Alert.alert('成功', '宠物已添加', [
          {
            text: '确定',
            onPress: () => {
              // 检查是否可以返回，如果不能则导航到MainTabs
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }
          }
        ]);
      }
    } catch (error: any) {
      console.error('创建宠物失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '创建宠物失败，请稍后重试';
      Alert.alert('错误', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {activeUser?.hasCompletedProfile ? '添加新宠物' : '完善宠物档案'}
        </Text>
        <Text style={styles.subtitle}>
          {activeUser?.hasCompletedProfile 
            ? '填写新宠物的基本信息'
            : '为宠物填写基础信息后即可解锁健康记录、习惯打卡与社区服务。'}
        </Text>

        <Text style={styles.label}>宠物昵称 *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="例如：可可"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={styles.label}>宠物品类 *</Text>
        <View style={styles.speciesGroup}>
          {speciesOptions.map(option => {
            const isActive = option.value === species;
            return (
              <Pressable
                key={option.value}
                onPress={() => setSpecies(option.value)}
                style={[
                  styles.speciesButton,
                  isActive && styles.speciesButtonActive
                ]}>
                <Text
                  style={[
                    styles.speciesText,
                    isActive && styles.speciesTextActive
                  ]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>宠物品种</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="例如：柯基、金毛（可选）"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={styles.label}>年龄（月龄）</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType='numeric'
          placeholder='例如：18（可选）'
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={styles.label}>体重（kg）</Text>
        <TextInput
          style={styles.input}
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType='decimal-pad'
          placeholder='例如：11.2（可选）'
          placeholderTextColor={palette.textSecondary}
        />

        <Pressable 
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {activeUser?.hasCompletedProfile ? '保存' : '保存并进入首页'}
            </Text>
          )}
        </Pressable>

        {/* 跳过按钮 - 仅在首次添加时显示 */}
        {!activeUser?.hasCompletedProfile && (
          <Pressable
            style={styles.skipButton}
            onPress={() => {
              // 如果没有宠物，确保至少标记为已完成档案
              if (pets.length === 0) {
                dispatch(
                  updateAccountDetails({
                    userId: activeUser.id,
                    hasCompletedProfile: true,
                    petsCount: 0
                  })
                );
              } else {
                dispatch(
                  updateAccountDetails({
                    userId: activeUser.id,
                    hasCompletedProfile: true,
                    petsCount: pets.length
                  })
                );
              }
              dispatch(completeOnboarding());
              navigation.reset({
                index: 0,
                routes: [{name: 'MainTabs'}]
              });
            }}>
            <Text style={styles.skipText}>稍后再添加宠物</Text>
          </Pressable>
        )}
        
        {/* 取消按钮 - 已完成档案的用户添加新宠物时可以取消 */}
        {activeUser?.hasCompletedProfile && (
          <Pressable
            style={styles.skipButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }}>
            <Text style={styles.skipText}>取消</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.lg
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  subtitle: {
    color: palette.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20
  },
  label: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.xs
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  speciesGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  speciesButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: spacing.sm
  },
  speciesButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  speciesText: {
    color: palette.textSecondary
  },
  speciesTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  skipButton: {
    marginTop: spacing.md,
    alignItems: 'center'
  },
  skipText: {
    color: palette.textSecondary
  },
  primaryButtonDisabled: {
    opacity: 0.6
  }
});

export default PetOnboardingScreen;
