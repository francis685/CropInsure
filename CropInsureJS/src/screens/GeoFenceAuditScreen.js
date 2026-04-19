import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 🟢 Using your official Earthy/Minimalist Theme
const Theme = {
  bgLight: '#F9F7F2',
  cardBg: '#FFFFFF',
  textDark: '#1A1D16',
  textMuted: '#8A9681',
  accentEarth: '#D48C3E',
  accentGreen: '#4A6B36',
  danger: '#D32F2F',
  borderLight: '#E5E0D8'
};

const AUDIT_STEPS = [
  "System Ready. Awaiting Initialization.",
  "Extracting EXIF GPS coordinates from photo...",
  "Fetching Land Registry (Bhoomi) Survey #123/4...",
  "Rendering geospatial boundary...",
  "Calculating coordinate intersection...",
  "VERIFIED: Photo matches legal property boundary."
];

export default function GeoFenceAuditScreen({ navigation }) {
  const [auditStep, setAuditStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock coordinates for the Farm Boundary (Khata)
  const farmBoundary = [
    { latitude: 12.8710, longitude: 74.8410 },
    { latitude: 12.8750, longitude: 74.8420 },
    { latitude: 12.8740, longitude: 74.8480 },
    { latitude: 12.8690, longitude: 74.8460 },
  ];

  // Photo Location (Inside the boundary)
  const photoLocation = { latitude: 12.8725, longitude: 74.8440 };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const runAudit = () => {
    if (auditStep > 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const timings = [600, 1800, 3000, 4200, 5500];
    timings.forEach((time, index) => {
      setTimeout(() => {
        setAuditStep(index + 1);
        if (index === timings.length - 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }, time);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spatial Audit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* REAL MAP VIEW */}
        <Animated.View style={[styles.mapCard, { opacity: fadeAnim }]}>
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              mapType="hybrid"
              initialRegion={{
                latitude: 12.8720,
                longitude: 74.8445,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
            >
              {auditStep >= 3 && (
                <Polygon
                  coordinates={farmBoundary}
                  fillColor="rgba(74, 107, 54, 0.3)" // Earthy green with opacity
                  strokeColor={Theme.accentGreen}
                  strokeWidth={3}
                />
              )}
              {auditStep >= 1 && (
                <Marker coordinate={photoLocation}>
                  <View style={[styles.markerRing, auditStep === 5 && { borderColor: Theme.accentGreen }]}>
                    <View style={[styles.markerDot, auditStep === 5 && { backgroundColor: Theme.accentGreen }]} />
                  </View>
                </Marker>
              )}
            </MapView>
          </View>

          {/* LOG CONSOLE */}
          <View style={styles.logBox}>
            <Text style={[styles.logText, auditStep === 5 && { color: Theme.accentGreen }]}>
              <Text style={{ color: Theme.accentEarth }}>{'>'} </Text>
              {AUDIT_STEPS[auditStep]}
            </Text>
          </View>
        </Animated.View>

        {/* AUDIT BUTTON */}
        <TouchableOpacity 
          style={[styles.auditBtn, auditStep === 5 && styles.auditBtnSuccess]} 
          onPress={runAudit}
          disabled={auditStep > 0}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name={auditStep === 0 ? "map-search" : auditStep === 5 ? "shield-check" : "satellite-variant"} 
            size={24} 
            color="#FFF" 
          />
          <Text style={styles.auditBtnText}>
            {auditStep === 0 ? "Run GPS Verification" : auditStep === 5 ? "Verification Passed" : "Auditing Data..."}
          </Text>
        </TouchableOpacity>

        {/* VERIFICATION CHECKLIST */}
        <Text style={styles.sectionTitle}>Verification Protocols</Text>

        <View style={[styles.checkCard, auditStep >= 0 && styles.checkCardActive]}>
          <MaterialCommunityIcons name="fingerprint" size={24} color={auditStep >= 0 ? Theme.accentGreen : Theme.textMuted} />
          <View style={styles.checkTextWrap}>
            <Text style={styles.checkTitle}>Identity Match</Text>
            <Text style={styles.checkDesc}>eKYC matches land registry data.</Text>
          </View>
          {auditStep >= 0 && <Ionicons name="checkmark-circle" size={20} color={Theme.accentGreen} />}
        </View>

        <View style={[styles.checkCard, auditStep >= 3 && styles.checkCardActive]}>
          <MaterialCommunityIcons name="layers-triple-outline" size={24} color={auditStep >= 3 ? Theme.accentEarth : Theme.textMuted} />
          <View style={styles.checkTextWrap}>
            <Text style={styles.checkTitle}>Land Boundary</Text>
            <Text style={styles.checkDesc}>Survey #123/4 bounds rendered.</Text>
          </View>
          {auditStep >= 3 && auditStep < 5 && <ActivityIndicator size="small" color={Theme.accentEarth} />}
          {auditStep >= 5 && <Ionicons name="checkmark-circle" size={20} color={Theme.accentGreen} />}
        </View>

        <View style={[styles.checkCard, auditStep >= 5 && styles.checkCardActive]}>
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color={auditStep >= 5 ? Theme.accentGreen : Theme.textMuted} />
          <View style={styles.checkTextWrap}>
            <Text style={styles.checkTitle}>Geospatial Lock</Text>
            <Text style={styles.checkDesc}>Photo EXIF is inside boundary.</Text>
          </View>
          {auditStep >= 5 && <Ionicons name="checkmark-circle" size={20} color={Theme.accentGreen} />}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bgLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.cardBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Theme.borderLight },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Theme.textDark },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  mapCard: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 12, marginBottom: 24, borderWidth: 1, borderColor: Theme.borderLight, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  mapWrapper: { height: 280, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E5E0D8' },
  map: { width: '100%', height: '100%' },
  
  markerRing: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: Theme.accentEarth, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)' },
  markerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Theme.accentEarth },

  logBox: { marginTop: 12, backgroundColor: '#F4F1EA', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Theme.borderLight },
  logText: { color: Theme.textDark, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, fontWeight: '700' },

  auditBtn: { backgroundColor: Theme.textDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 16, marginBottom: 32, gap: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  auditBtnSuccess: { backgroundColor: Theme.accentGreen },
  auditBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.textDark, marginBottom: 16 },
  checkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.cardBg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Theme.borderLight, opacity: 0.5 },
  checkCardActive: { opacity: 1, borderColor: Theme.accentGreen, shadowColor: Theme.accentGreen, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  checkTextWrap: { flex: 1, marginLeft: 16 },
  checkTitle: { fontSize: 15, fontWeight: '700', color: Theme.textDark, marginBottom: 2 },
  checkDesc: { fontSize: 13, color: Theme.textMuted }
});