import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as ReduxProvider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from '@app/navigation/RootNavigator';
import {store} from '@app/store/redux/store';
import {useHydrateZustandStores} from '@app/store/zustand/hydration';

const App = (): JSX.Element => {
  useHydrateZustandStores();

  return (
    <ReduxProvider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
};

export default App;
