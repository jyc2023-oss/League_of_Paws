import React, {useMemo} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {MainTabParamList, RootStackParamList} from './types';
import HomeScreen from '@app/screens/HomeScreen';
import PetsScreen from '@app/screens/PetsScreen';
import CommunityFeedScreen from '@app/screens/CommunityFeedScreen';
import ProfileScreen from '@app/screens/ProfileScreen';
import RescueDetailsScreen from '@app/screens/RescueDetailsScreen';
import ServiceDetailsScreen from '@app/screens/ServiceDetailsScreen';
import AuthLandingScreen from '@app/screens/AuthLandingScreen';
import LoginScreen from '@app/screens/LoginScreen';
import RegisterScreen from '@app/screens/RegisterScreen';
import PetOnboardingScreen from '@app/screens/PetOnboardingScreen';
import HabitCheckInScreen from '@app/screens/HabitCheckInScreen';
import CreatePostScreen from '@app/screens/CreatePostScreen';
import QAScreen from '@app/screens/QAScreen';
import NearbyFriendsScreen from '@app/screens/NearbyFriendsScreen';
import ServiceFinderScreen from '@app/screens/ServiceFinderScreen';
import RescueSubmissionScreen from '@app/screens/RescueSubmissionScreen';
import PetProfileScreen from '@app/screens/PetProfileScreen';
import HealthReportScreen from '@app/screens/HealthReportScreen';
import FeedingControlScreen from '@app/screens/FeedingControlScreen';
import HabitAnalyticsScreen from '@app/screens/HabitAnalyticsScreen';
import {palette} from '@app/theme';
import {useAppSelector} from '@app/store/redux/hooks';

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
    <Tab.Screen name="Community" component={CommunityFeedScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const RootNavigator = (): JSX.Element => {
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);

  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  return (
    <Stack.Navigator screenOptions={{headerBackTitleVisible: false}}>
      {!activeUser && (
        <>
          <Stack.Screen
            name="AuthLanding"
            component={AuthLandingScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{title: '登录'}}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{title: '注册'}}
          />
        </>
      )}

      {activeUser && !activeUser.hasCompletedProfile && (
        <Stack.Screen
          name="PetOnboarding"
          component={PetOnboardingScreen}
          options={{title: '完善宠物档案'}}
        />
      )}

      {activeUser && activeUser.hasCompletedProfile && (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="HabitCheckIn"
            component={HabitCheckInScreen}
            options={{title: '每日打卡'}}
          />
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{title: '发布动态'}}
          />
          <Stack.Screen
            name="CommunityQA"
            component={QAScreen}
            options={{title: '社区问答'}}
          />
          <Stack.Screen
            name="NearbyFriends"
            component={NearbyFriendsScreen}
            options={{title: '附近宠友'}}
          />
          <Stack.Screen
            name="ServiceFinder"
            component={ServiceFinderScreen}
            options={{title: '社区服务推荐'}}
          />
          <Stack.Screen
            name="RescueSubmission"
            component={RescueSubmissionScreen}
            options={{title: '救助信息'}}
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
          <Stack.Screen
            name="PetProfile"
            component={PetProfileScreen}
            options={{title: '宠物健康档案'}}
          />
          <Stack.Screen
            name="HealthReport"
            component={HealthReportScreen}
            options={{title: '健康趋势报告'}}
          />
          <Stack.Screen
            name="FeedingControl"
            component={FeedingControlScreen}
            options={{title: '远程喂食提醒'}}
          />
          <Stack.Screen
            name="HabitAnalytics"
            component={HabitAnalyticsScreen}
            options={{title: '陪伴与坚持度'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
