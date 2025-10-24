import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import {usePetStore, PetProfile} from '@app/store/zustand/petStore';
import {spacing, typography, palette} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {updateAccountDetails} from '@app/store/redux/slices/userSlice';

const PetsScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const {pets, activePetId, setActivePet, addPet} = usePetStore(state => ({
    pets: state.pets,
    activePetId: state.activePetId,
    setActivePet: state.setActivePet,
    addPet: state.addPet
  }));

  const handleAddPet = () => {
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
            暂无宠物档案，点击“添加宠物”创建。
          </Text>
        }
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingBottom: spacing.lg
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
  }
});

export default PetsScreen;
