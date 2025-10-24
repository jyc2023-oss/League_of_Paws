import {useAppSelector} from '@app/store/redux/hooks';
import {useColorScheme} from 'react-native';

export const useAppTheme = (): 'light' | 'dark' => {
  const systemScheme = useColorScheme() ?? 'light';
  const preference = useAppSelector(state => state.app.themePreference);

  if (preference === 'system') {
    return systemScheme;
  }

  return preference;
};
