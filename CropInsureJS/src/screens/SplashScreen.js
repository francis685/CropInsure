import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StatusBar, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 🟢 Standardized Theme
const Theme = {
  accentGreen: '#4A6B36',
  accentEarth: '#D48C3E',
};

export default function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current; 
  const opacityAnim = useRef(new Animated.Value(0)).current;  
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current; 

  useEffect(() => {
    const flutterCurve = Easing.out(Easing.cubic);

    // Initial Entrance Animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        easing: flutterCurve,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        easing: flutterCurve,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: 300, 
        easing: flutterCurve,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Continuous Pulsing Effect after entrance
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    });

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3200); 

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80' }} 
      style={styles.container}
    >
      <View style={styles.overlay} />
      
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[
        styles.logoContainer, 
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }, { scale: pulseAnim }] } 
      ]}>
        <MaterialCommunityIcons name="sprout" size={100} color={Theme.accentGreen} />
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>CropInsure</Text>
        <Text style={styles.subtitle}>THE FUTURE OF FARMING</Text>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 29, 22, 0.75)', // Darker forest tint
  },
  logoContainer: { 
    marginBottom: 20,
    shadowColor: Theme.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30, 
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    padding: 20,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(74, 107, 54, 0.4)',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: { 
    fontSize: 48, 
    color: '#FFFFFF', 
    fontWeight: '900', 
    letterSpacing: -1.2 
  },
  subtitle: { 
    fontSize: 14, 
    color: Theme.accentEarth, 
    fontWeight: '700', 
    letterSpacing: 5, 
    marginTop: 8, 
  }
});