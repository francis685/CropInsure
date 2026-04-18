import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🟢 Standardized Theme
const Theme = {
  accentGreen: '#4A6B36',
  accentEarth: '#D48C3E',
};

export default function OnboardingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Reveal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Continuous Floating Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15, 
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, 
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80' }} 
      style={styles.container}
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER LOGO */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <MaterialCommunityIcons name="sprout" size={28} color={Theme.accentGreen} />
          <Text style={styles.headerText}>CropInsure</Text>
        </Animated.View>

        {/* MAIN TYPOGRAPHY */}
        <Animated.View style={[styles.textSection, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <Text style={styles.title}>Welcome To The Future</Text>
          <Text style={styles.titleLine2}>
            Of Farming <MaterialCommunityIcons name="leaf" size={28} color={Theme.accentGreen} />
          </Text>
          <Text style={styles.description}>
            Empowering farmers with smart, AI-driven claim solutions and instant financial protections.
          </Text>
        </Animated.View>

        {/* 🟢 FLOATING GLASSMORPHIC WIDGET */}
        <View style={styles.centerGraphic}>
          <Animated.View style={[styles.glassCircle, { transform: [{ translateY: floatAnim }] }]}>
            
            {/* Top Left Tag */}
            <View style={[styles.floatingTag, { top: -20, left: -30 }]}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#FFF" />
              <Text style={styles.tagText}>Risk Assessed</Text>
            </View>
            
            {/* Bottom Right Tag */}
            <View style={[styles.floatingTag, { bottom: -20, right: -30, backgroundColor: 'rgba(0,0,0,0.8)', borderColor: Theme.accentEarth }]}>
              <MaterialCommunityIcons name="robot-outline" size={16} color={Theme.accentEarth} />
              <Text style={styles.tagText}>Gemini AI Active</Text>
            </View>

            {/* Center Data */}
            <View style={styles.circleInner}>
              <MaterialCommunityIcons name="camera-iris" size={40} color={Theme.accentGreen} />
            </View>

          </Animated.View>
        </View>

        {/* BOTTOM GET STARTED BUTTON */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <TouchableOpacity 
            style={styles.glassButton} 
            onPress={() => navigation.replace('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 29, 22, 0.65)', 
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  textSection: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 50,
  },
  titleLine2: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 50,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    lineHeight: 24,
    maxWidth: '90%',
  },
  centerGraphic: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCircle: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 107, 54, 0.25)', 
    borderWidth: 1,
    borderColor: Theme.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingTag: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.accentGreen, 
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  tagText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  glassButton: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    backgroundColor: Theme.accentGreen, 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.accentGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});