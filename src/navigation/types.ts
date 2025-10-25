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
  PetProfile: {petId?: string} | undefined;
  HealthReport: {petId?: string} | undefined;
  FeedingControl: {petId?: string} | undefined;
  HabitAnalytics: {petId?: string} | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pets: undefined;
  Community: undefined;
  Profile: undefined;
};
