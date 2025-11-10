import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as ReduxProvider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from '@app/navigation/RootNavigator';
import {store} from '@app/store/redux/store';
import {useHydrateZustandStores} from '@app/store/zustand/hydration';

// ⬇️ 新增：paper 及图标
import {Provider as PaperProvider, MD3LightTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// 给 paper 指定 icons 渲染器：字符串图标名会走这里
const paperSettings = {
  icon: (props: any) => <MaterialCommunityIcons {...props} />,
};

const App = (): JSX.Element => {
  useHydrateZustandStores();

  return (
    <ReduxProvider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        {/* 关键：把 PaperProvider 放在根部（Portal/Modal 等才可用） */}
        <PaperProvider theme={MD3LightTheme} settings={paperSettings}>
          <SafeAreaProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
};

export default App;
