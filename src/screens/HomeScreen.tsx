import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import {usePetStore} from '@app/store/zustand/petStore';
import {spacing, typography, palette} from '@app/theme';

const HomeScreen = (): JSX.Element => {
  const pets = usePetStore(state => state.pets);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>今日概览</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>活跃宠物</Text>
          {pets.map(pet => (
            <View key={pet.id} style={styles.petRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petMeta}>
                {pet.species === 'dog' ? '犬' : pet.species === 'cat' ? '猫' : '其他'} ·
                {` ${Math.floor((pet.ageInMonths ?? 0) / 12)}岁`}
              </Text>
            </View>
          ))}
          {pets.length === 0 && (
            <Text style={styles.emptyText}>添加宠物后，将在此展示健康概览。</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>任务与活动</Text>
          <Text style={styles.emptyText}>任务系统将集成在后续迭代中。</Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg
  },
  title: {
    fontSize: typography.title,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
    marginBottom: spacing.lg
  },
  cardTitle: {
    fontSize: typography.heading,
    fontWeight: '500',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  petRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs
  },
  petName: {
    fontSize: typography.body,
    color: palette.textPrimary,
    fontWeight: '500'
  },
  petMeta: {
    fontSize: typography.caption,
    color: palette.textSecondary
  },
  emptyText: {
    fontSize: typography.body,
    color: palette.textSecondary,
    marginTop: spacing.sm
  }
});

export default HomeScreen;
