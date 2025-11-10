import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Screen from '@app/components/common/Screen';
import {usePetStore} from '@app/store/zustand/petStore';
import {spacing, typography, palette} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {updateAccountDetails} from '@app/store/redux/slices/userSlice';
import type {RootStackParamList} from '@app/navigation/types';
import {fetchPets} from '@app/services/api/petApi';

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
  const token = useAppSelector(state => state.auth.token);
  const {pets, activePetId, setActivePet} = usePetStore(state => ({
    pets: state.pets,
    activePetId: state.activePetId,
    setActivePet: state.setActivePet
  }));
  
  const [isLoadingPets, setIsLoadingPets] = useState(false);

  const loadPetsFromBackend = async () => {
    if (!token) return;
    
    setIsLoadingPets(true);
    try {
      const backendPets = await fetchPets(token);
      
      // 清空现有pets并添加从后端获取的pets
      const currentPets = usePetStore.getState().pets;
      const backendPetIds = new Set(backendPets.map(p => p.id));
      
      // 合并：如果本地有后端没有的宠物，保留它（可能是临时的）
      const allPets = [...backendPets];
      currentPets.forEach(localPet => {
        if (!backendPetIds.has(localPet.id)) {
          allPets.push(localPet);
        }
      });
      
      // 更新store - 先清空再添加
      usePetStore.setState({pets: allPets});
      
      // 如果没有activePet但有多只宠物，设置第一只为active
      if (!activePetId && allPets.length > 0) {
        setActivePet(allPets[0].id);
      }
      
      // 更新用户账号信息
    if (activeUserId) {
      dispatch(
        updateAccountDetails({
          userId: activeUserId,
            petsCount: allPets.length
          })
        );
      }
    } catch (error: any) {
      console.error('加载宠物列表失败:', error);
      // 静默失败，继续使用本地数据
    } finally {
      setIsLoadingPets(false);
    }
  };

  // 从后端加载宠物列表
  useEffect(() => {
    if (token && activeUserId) {
      loadPetsFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeUserId]);

  const handleAddPet = (): void => {
    // 导航到宠物引导页面添加新宠物
    navigation.navigate('PetOnboarding');
  };
  
  const handleActivePetPress = (petId: string): void => {
    // 如果点击的是当前管理的宠物，打开宠物管理界面
    if (petId === activePetId) {
      navigation.navigate('PetManage', {petId});
    } else {
      // 如果不是当前管理的，设置为当前管理
      setActivePet(petId);
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
      {isLoadingPets && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>加载宠物列表...</Text>
        </View>
      )}
      <FlatList
        data={pets}
        keyExtractor={item => item.id}
        refreshing={isLoadingPets}
        onRefresh={loadPetsFromBackend}
        ListEmptyComponent={
          <Text style={styles.empty}>
            暂无宠物档案，点击"添加宠物"创建一个吧。
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
              onPress={() => handleActivePetPress(item.id)}
              style={[styles.card, isActive && styles.activeCard]}>
              <View style={styles.cardHeader}>
              <Text style={styles.petName}>{item.name}</Text>
                {isActive && <Text style={styles.activeBadge}>当前管理</Text>}
              </View>
              <Text style={styles.petMeta}>
                {item.species === 'dog'
                  ? '犬类'
                  : item.species === 'cat'
                  ? '猫类'
                  : '其他'}
                {item.ageInMonths && ` · ${item.ageInMonths}个月`}
              </Text>
              {isActive && (
                <Pressable
                  onPress={() => navigation.navigate('PetProfile', {petId: item.id})}
                  style={styles.viewProfileButton}>
                  <Text style={styles.viewProfileText}>查看健康档案 →</Text>
                </Pressable>
              )}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  petName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    flex: 1
  },
  petMeta: {
    marginTop: spacing.xs,
    color: palette.textSecondary
  },
  activeBadge: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: typography.caption
  },
  viewProfileButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: palette.primary + '20',
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  viewProfileText: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: typography.caption
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: spacing.sm,
    color: palette.textSecondary
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
