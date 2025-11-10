import {useEffect} from 'react';
import {usePetStore} from './petStore';

const demoPets = [
  {
    id: 'pet-1',
    name: '可可',
    species: 'dog' as const,
    ageInMonths: 18
  },
  {
    id: 'pet-2',
    name: '喵喵',
    species: 'cat' as const,
    ageInMonths: 30
  }
];

export const useHydrateZustandStores = (): void => {
  useEffect(() => {
    const hasPets = usePetStore.getState().pets.length > 0;
    if (!hasPets) {
      usePetStore.setState({
        pets: demoPets,
        activePetId: demoPets[0].id
      });
    }
  }, []);
};
