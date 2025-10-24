import React, {useMemo} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {
  completeServiceVisit,
  recordServiceVisit,
  ServiceRecord
} from '@app/store/redux/slices/contentSlice';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SERVICE_CATALOG: Array<{
  name: string;
  category: ServiceRecord['category'];
  description: string;
}> = [
  {
    name: '阳光动物医院',
    category: 'hospital',
    description: '提供疫苗接种、体检与急诊服务'
  },
  {
    name: '汪星美容中心',
    category: 'grooming',
    description: '洗护造型、一对一毛发护理'
  },
  {
    name: '宠物社交公园',
    category: 'park',
    description: '周末遛宠游玩与线下社交活动'
  },
  {
    name: '灵动训练营',
    category: 'training',
    description: '基础服从、减压与行为矫正课程'
  }
];

const ServiceFinderScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const visits = useAppSelector(state => state.community.services);

  const userRecords = useMemo(
    () => visits.filter(record => record.userId === activeUserId),
    [visits, activeUserId]
  );

  const handlePlanVisit = (
    serviceName: string,
    category: ServiceRecord['category']
  ) => {
    if (!activeUserId) {
      Alert.alert('提示', '请登录后再记录服务。');
      return;
    }
    const action = recordServiceVisit({
      userId: activeUserId,
      serviceName,
      category
    });
    dispatch(action);
    Alert.alert('已加入清单', '可在下方记录完成情况。', [
      {
        text: '查看详情',
        onPress: () =>
          navigation.navigate('ServiceDetails', {serviceId: action.payload.id})
      },
      {text: '知道了', style: 'cancel'}
    ]);
  };

  const handleComplete = (recordId: string) => {
    dispatch(completeServiceVisit({recordId}));
  };

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>附近宠物服务</Text>
        <Text style={styles.subtitle}>
          快速添加医院、美容、公园等服务到个人清单，方便跟踪进度。
        </Text>

        <FlatList
          data={SERVICE_CATALOG}
          keyExtractor={item => item.name}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <Pressable
                style={styles.planButton}
                onPress={() => handlePlanVisit(item.name, item.category)}>
                <Text style={styles.planText}>加入服务清单</Text>
              </Pressable>
            </View>
          )}
        />

        {userRecords.length > 0 && (
          <View style={styles.recordSection}>
            <Text style={styles.recordTitle}>我的服务记录</Text>
            {userRecords.map(record => (
              <Pressable
                key={record.id}
                style={styles.recordRow}
                onPress={() =>
                  navigation.navigate('ServiceDetails', {
                    serviceId: record.id
                  })
                }>
                <View>
                  <Text style={styles.recordName}>{record.serviceName}</Text>
                  <Text style={styles.recordStatus}>
                    状态：{record.status === 'planned' ? '待完成' : '已完成'}
                  </Text>
                  {record.visitedAt && (
                    <Text style={styles.recordStatus}>
                      完成日期：
                      {new Date(record.visitedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                {record.status === 'planned' && (
                  <Pressable
                    style={styles.completeButton}
                    onPress={() => handleComplete(record.id)}>
                    <Text style={styles.completeText}>标记完成</Text>
                  </Pressable>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.textPrimary
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md
  },
  cardTitle: {
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs
  },
  cardDescription: {
    color: palette.textSecondary,
    marginBottom: spacing.sm
  },
  planButton: {
    alignSelf: 'flex-start',
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16
  },
  planText: {
    color: '#fff',
    fontWeight: '600'
  },
  recordSection: {
    marginTop: spacing.lg
  },
  recordTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: palette.border
  },
  recordName: {
    fontWeight: '600',
    color: palette.textPrimary
  },
  recordStatus: {
    color: palette.textSecondary,
    fontSize: typography.caption
  },
  completeButton: {
    backgroundColor: palette.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16
  },
  completeText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default ServiceFinderScreen;
