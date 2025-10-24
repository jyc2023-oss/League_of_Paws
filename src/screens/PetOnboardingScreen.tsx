import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
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
  const activeUser = useMemo<UserAccount | undefined>(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const {addPet, setActivePet, pets} = usePetStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [species, setSpecies] = useState<SpeciesOption>('dog');

  useEffect(() => {
    if (!activeUser) {
      navigation.reset({
        index: 0,
        routes: [{name: 'AuthLanding'}]
      });
    } else if (activeUser.hasCompletedProfile) {
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}]
      });
    }
  }, [activeUser, navigation]);

  const handleSubmit = () => {
    if (!activeUser) {
      return;
    }

    if (name.trim().length === 0) {
      Alert.alert('提示', '请填写宠物昵称');
      return;
    }

    const ageInMonths = Number.parseInt(age, 10);

    const newPet = {
      id: `pet-${Date.now()}`,
      name: name.trim(),
      species,
      ageInMonths: Number.isNaN(ageInMonths) ? undefined : ageInMonths
    } as const;

    addPet(newPet);
    setActivePet(newPet.id);

    const totalPets = usePetStore.getState().pets.length;

    dispatch(
      updateAccountDetails({
        userId: activeUser.id,
        petsCount: totalPets,
        hasCompletedProfile: true
      })
    );
    dispatch(completeOnboarding());
  };

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>完善宠物档案</Text>
        <Text style={styles.subtitle}>
          为宠物填写基础信息后即可解锁健康记录、习惯打卡与社区服务。
        </Text>

        <Text style={styles.label}>宠物昵称</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="例如：可可"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={styles.label}>宠物品类</Text>
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

        <Text style={styles.label}>年龄（月龄）</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType='numeric'
          placeholder='例如：18'
          placeholderTextColor={palette.textSecondary}
        />

        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>保存并进入首页</Text>
        </Pressable>

        {pets.length > 0 && activeUser && (
          <Pressable
            style={styles.skipButton}
            onPress={() => {
              dispatch(
                updateAccountDetails({
                  userId: activeUser.id,
                  hasCompletedProfile: true,
                  petsCount: pets.length
                })
              );
              dispatch(completeOnboarding());
            }}>
            <Text style={styles.skipText}>稍后再添加宠物</Text>
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
  }
});

export default PetOnboardingScreen;
