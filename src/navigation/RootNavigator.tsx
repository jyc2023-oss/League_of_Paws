import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {MainTabParamList, RootStackParamList} from './types';
import HomeScreen from '@app/screens/HomeScreen';
import PetsScreen from '@app/screens/PetsScreen';
import CommunityScreen from '@app/screens/CommunityScreen';
import ProfileScreen from '@app/screens/ProfileScreen';
import RescueDetailsScreen from '@app/screens/RescueDetailsScreen';
import ServiceDetailsScreen from '@app/screens/ServiceDetailsScreen';
import {palette} from '@app/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = (): JSX.Element => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: palette.primary,
      tabBarInactiveTintColor: palette.textSecondary
    }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Pets" component={PetsScreen} />
    <Tab.Screen name="Community" component={CommunityScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const RootNavigator = (): JSX.Element => (
  <Stack.Navigator screenOptions={{headerBackTitleVisible: false}}>
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="RescueDetails"
      component={RescueDetailsScreen}
      options={{title: '救助详情'}}
    />
    <Stack.Screen
      name="ServiceDetails"
      component={ServiceDetailsScreen}
      options={{title: '服务详情'}}
    />
  </Stack.Navigator>
);

export default RootNavigator;
