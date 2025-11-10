import {create} from 'zustand';

export type PetProfile = {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  avatarUrl?: string;
  ageInMonths?: number;
};

export type PetStoreState = {
  pets: PetProfile[];
  activePetId?: string;
  addPet: (pet: PetProfile) => void;
  setActivePet: (petId: string) => void;
};

export const usePetStore = create<PetStoreState>(set => ({
  pets: [],
  activePetId: undefined,
  addPet: pet =>
    set(state => ({
      pets: [...state.pets, pet]
    })),
  setActivePet: activePetId => set({activePetId})
}));
