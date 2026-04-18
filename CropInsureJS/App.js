import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 🟢 1. Global Context Providers (The Brains of your App)
import { LanguageProvider } from './src/context/LanguageContext';
import { AgriProvider } from './src/context/AgriContext'; 

// 🟢 2. All Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MarketScreen from './src/screens/MarketScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CameraScreen from './src/screens/CameraScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import LoanApplicationScreen from './src/screens/LoanApplicationScreen';
import TasksScreen from './src/screens/TasksScreen';
import AgriScoreScreen from './src/screens/AgriScoreScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // 🟢 3. The AgriProvider tracks the crop stages and score everywhere!
    <AgriProvider>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator 
            initialRouteName="Splash"
            screenOptions={{ headerShown: false, animation: 'fade' }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Market" component={MarketScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="LoanApplication" component={LoanApplicationScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="AgriScore" component={AgriScoreScreen} /> 
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </AgriProvider>
  );
}