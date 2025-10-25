import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Screen from '@app/components/common/Screen';
import {usePetStore, PetProfile} from '@app/store/zustand/petStore';
import {spacing, typography, palette} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {updateAccountDetails} from '@app/store/redux/slices/userSlice';
import type {RootStackParamList} from '@app/navigation/types';

type PetHealthRoute = 'PetProfile' | 'HealthReport' | 'FeedingControl' | 'HabitAnalytics';

type PetAction = {
  label: string;
  description: string;
  route: PetHealthRoute;
  accent: string;
};

const PetsScreen = (): JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const {pets, activePetId, setActivePet, addPet} = usePetStore(state => ({
    pets: state.pets,
    activePetId: state.activePetId,
    setActivePet: state.setActivePet,
    addPet: state.addPet
  }));

  const handleAddPet = (): void => {
    const newPet: PetProfile = {
      id: `pet-${Date.now()}`,
      name: '新成员',
      species: 'dog'
    };
    addPet(newPet);
    setActivePet(newPet.id);

    if (activeUserId) {
      const totalPets = usePetStore.getState().pets.length;
      dispatch(
        updateAccountDetails({
          userId: activeUserId,
          petsCount: totalPets
        })
      );
    }
  };

  const actions: PetAction[] = [
    {
      label: '健康档案',
      description: '疫苗 · 体检 · 过敏史',
      route: 'PetProfile',
      accent: palette.primary
    },
    {
      label: '趋势报告',
      description: '喂食 / 运动 / 体重',
      route: 'HealthReport',
      accent: palette.secondary
    },
    {
      label: '喂食控制',
      description: '远程提醒与推送',
      route: 'FeedingControl',
      accent: palette.accent
    },
    {
      label: '陪伴分析',
      description: '坚持度 · 洞察',
      route: 'HabitAnalytics',
      accent: '#FFB74D'
    }
  ];

  const handleNavigate = (route: PetHealthRoute): void => {
    if (!activePetId) {
      return;
    }
    navigation.navigate(route, {petId: activePetId});
  };

  return (
    <Screen padded={true}>
      <View style={styles.header}>
        <Text style={styles.title}>宠物档案</Text>
        <Pressable style={styles.addButton} onPress={handleAddPet}>
          <Text style={styles.addButtonText}>+ 添加宠物</Text>
        </Pressable>
      </View>
      <FlatList
        data={pets}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            暂无宠物档案，点击“添加宠物”创建一个吧。
          </Text>
        }
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View>
            <Text style={styles.actionTitle}>健康管理工具</Text>
            <View style={styles.actionsGrid}>
              {actions.map(action => (
                <Pressable
                  key={action.route}
                  style={[styles.actionCard, {borderColor: action.accent}]}
                  disabled={!activePetId}
                  onPress={() => handleNavigate(action.route)}>
                  <Text style={[styles.actionLabel, {color: action.accent}]}>
                    {action.label}
                  </Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                  {!activePetId && <Text style={styles.actionDisabled}>先选择宠物</Text>}
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({item}) => {
          const isActive = item.id === activePetId;
          return (
            <Pressable
              onPress={() => setActivePet(item.id)}
              style={[styles.card, isActive && styles.activeCard]}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petMeta}>
                {item.species === 'dog'
                  ? '犬类'
                  : item.species === 'cat'
                  ? '猫类'
                  : '其他'}
              </Text>
              {isActive && <Text style={styles.activeBadge}>当前管理</Text>}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary
  },
  addButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  listContainer: {
    paddingBottom: spacing.xl
  },
  separator: {
    height: spacing.md
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border
  },
  activeCard: {
    borderColor: palette.primary,
    borderWidth: 2
  },
  petName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary
  },
  petMeta: {
    marginTop: spacing.xs,
    color: palette.textSecondary
  },
  activeBadge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    color: palette.primary,
    fontWeight: '600'
  },
  empty: {
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl
  },
  actionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  actionCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff'
  },
  actionLabel: {
    fontWeight: '700',
    fontSize: typography.body
  },
  actionDescription: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    lineHeight: 18
  },
  actionDisabled: {
    marginTop: spacing.sm,
    fontSize: typography.caption,
    color: palette.textSecondary
  }
});

export default PetsScreen;
