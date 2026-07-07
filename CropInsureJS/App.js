import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LanguageProvider } from './src/context/LanguageContext';
import { AgriProvider } from './src/context/AgriContext';
import { supabase } from './src/lib/supabase';

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
import GeoFenceAuditScreen from './src/screens/GeoFenceAuditScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isResolvingSession, setIsResolvingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // 🟢 THE FIX: Pre-fetch images so they load instantly with zero lag
  useEffect(() => {
    const imagesToCache = [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop'
    ];

    // This tells the phone to download the images quietly in the background
    // the moment the app opens, so they are ready when the user navigates.
    imagesToCache.forEach(url => Image.prefetch(url));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setIsResolvingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isResolvingSession) {
    return <SplashScreen />;
  }

  return (
    <AgriProvider>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName={hasSession ? 'Dashboard' : 'Onboarding'}
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
            <Stack.Screen name="GeoFenceAudit" component={GeoFenceAuditScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </AgriProvider>
  );
}