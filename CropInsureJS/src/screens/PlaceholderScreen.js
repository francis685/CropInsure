import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const Theme = {
  bgOverlayTop: '#FDECCC', bgOverlayBottom: '#F9F7F2', cardBg: '#FFFFFF', 
  textDark: '#212B1A', textMuted: '#8A9681', accentEarth: '#D48C3E', accentGreen: '#4A6B36'
};

export default function PlaceholderScreen({ navigation, route }) {
  // Magically gets the name of the screen from App.js (e.g., "Tasks", "Camera")
  const screenName = route.name; 

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); navigation.goBack(); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="hammer-wrench" size={48} color={Theme.accentEarth} />
          </View>
          
          {/* Dynamically displays the screen name! */}
          <Text style={styles.title}>{screenName} Hub</Text>
          
          <Text style={styles.subtitle}>
            This feature is currently in active development for the v2.0 release. 
          </Text>
          
          <TouchableOpacity 
            style={styles.returnBtn} 
            onPress={() => { Haptics.impactAsync(); navigation.goBack(); }}
          >
            <Text style={styles.returnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: Theme.bgOverlayBottom },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: -50 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(212, 140, 62, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: Theme.textDark, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: Theme.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  returnBtn: { backgroundColor: Theme.accentGreen, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, shadowColor: Theme.accentGreen, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  returnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});