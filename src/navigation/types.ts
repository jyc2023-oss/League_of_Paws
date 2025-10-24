export type RootStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  Register: undefined;
  PetOnboarding: undefined;
  MainTabs: undefined;
  HabitCheckIn: undefined;
  CreatePost: undefined;
  ServiceFinder: undefined;
  RescueSubmission: undefined;
  RescueDetails: {rescueId: string} | undefined;
  ServiceDetails: {serviceId: string} | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pets: undefined;
  Community: undefined;
  Profile: undefined;
};
