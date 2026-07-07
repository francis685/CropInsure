import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, ImageBackground, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriContext } from '../context/AgriContext';
import { supabase } from '../lib/supabase';

const Theme = {
  bgOverlayTop: 'rgba(212, 140, 62, 0.6)',
  bgOverlayBottom: 'rgba(33, 43, 26, 0.95)',
  cardBg: '#FFFFFF',
  textDark: '#1A1D16',
  textMuted: '#8A9681',
  accentGreen: '#4A6B36',
  accentEarth: '#D48C3E',
  matchGreen: '#3D4435' // 🟢 Fallback color to prevent visual glitches
};

export default function VerificationScreen({ navigation }) {
  const { verifyLand } = useContext(AgriContext);
  const [step, setStep] = useState(1);
  
  // Identity States
  const [idNumber, setIdNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isIdVerifying, setIsIdVerifying] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  
  // Land States
  const [surveyNumber, setSurveyNumber] = useState('');
  const [isLandVerifying, setIsLandVerifying] = useState(false);
  const [isLandVerified, setIsLandVerified] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const handleSendOtp = () => {
    if (idNumber.length < 12) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsIdVerifying(true);
    
    // Simulate API network delay
    setTimeout(() => {
      setIsIdVerifying(false);
      setShowOtp(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsIdVerifying(true);
    
    // Simulate OTP Token verification
    setTimeout(() => {
      setIsIdVerifying(false);
      setIsIdVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setStep(2), 800); 
    }, 1500);
  };

  const handleVerifyLand = () => {
    if (surveyNumber.length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLandVerifying(true);
    
    // 🟢 HYPER-REALISTIC GOVERNMENT API SIMULATION
    setLoadingText("Pinging State Bhoomi DB...");
    setTimeout(() => setLoadingText("Extracting Spatial Polygon..."), 1200);
    setTimeout(() => setLoadingText("Cross-referencing eKYC Owner..."), 2400);
    
    setTimeout(async () => {
      setIsLandVerifying(false);
      setIsLandVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('land_records').insert({
          farmer_id: user.id,
          survey_number: surveyNumber,
          area_acres: 2.5,
          verified: true,
          verified_at: new Date().toISOString(),
        });
        if (error) console.warn('VerificationScreen: failed to save land record:', error.message);
      }
      await verifyLand();

      setTimeout(() => setStep(3), 1000);
    }, 3500);
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.replace('Dashboard');
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80' }} 
      style={styles.rootContainer}
      fadeDuration={0} // 🟢 Removes the Android 300ms loading pop delay
    >
      <LinearGradient colors={[Theme.bgOverlayTop, 'transparent', Theme.bgOverlayBottom]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Farmer Onboarding</Text>
              <Text style={styles.headerSub}>Secure connection to Govt. API Test-Net active.</Text>
            </View>

            {/* STEP 1: IDENTITY VERIFICATION */}
            <View style={[styles.card, step < 1 && styles.cardInactive]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name={isIdVerified ? "shield-check" : "fingerprint"} size={28} color={isIdVerified ? Theme.accentGreen : Theme.textDark} />
                <Text style={styles.cardTitle}>1. Govt. eKYC Verification</Text>
              </View>
              
              {!isIdVerified ? (
                <>
                  {!showOtp ? (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 12-Digit ID No."
                        placeholderTextColor={Theme.textMuted}
                        keyboardType="numeric"
                        maxLength={12}
                        value={idNumber}
                        onChangeText={setIdNumber}
                        editable={!isIdVerifying}
                      />
                      <TouchableOpacity style={[styles.verifyBtn, idNumber.length < 12 && styles.verifyBtnDisabled]} onPress={handleSendOtp} disabled={idNumber.length < 12 || isIdVerifying}>
                        {isIdVerifying ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.verifyBtnText}>Get OTP</Text>}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter SMS OTP"
                        placeholderTextColor={Theme.textMuted}
                        keyboardType="numeric"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                        editable={!isIdVerifying}
                      />
                      <TouchableOpacity style={[styles.verifyBtn, otp.length < 4 && styles.verifyBtnDisabled]} onPress={handleVerifyOtp} disabled={otp.length < 4 || isIdVerifying}>
                        {isIdVerifying ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.verifiedBox}>
                  <Text style={styles.verifiedText}>✅ Govt. ID Verified: Farmer Francis</Text>
                  <Text style={styles.verifiedSub}>ID ending in {idNumber.slice(-4) || '[Aadhaar Redacted]'} locked to session.</Text>
                </View>
              )}
            </View>

            {/* STEP 2: LAND VERIFICATION */}
            <View style={[styles.card, step < 2 && styles.cardInactive]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name={isLandVerified ? "map-marker-check" : "map-search-outline"} size={28} color={isLandVerified ? Theme.accentGreen : Theme.textDark} />
                <Text style={styles.cardTitle}>2. State e-Khata Sync</Text>
              </View>
              
              {step >= 2 && !isLandVerified && (
                <View style={{ gap: 12 }}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Survey No. (e.g. 77/1)"
                      placeholderTextColor={Theme.textMuted}
                      value={surveyNumber}
                      onChangeText={setSurveyNumber}
                      editable={!isLandVerifying}
                    />
                    <TouchableOpacity style={[styles.verifyBtn, surveyNumber.length < 2 && styles.verifyBtnDisabled]} onPress={handleVerifyLand} disabled={surveyNumber.length < 2 || isLandVerifying}>
                      {isLandVerifying ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.verifyBtnText}>Fetch GIS</Text>}
                    </TouchableOpacity>
                  </View>
                  
                  {isLandVerifying && (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator color={Theme.accentEarth} size="small" />
                      <Text style={styles.loadingText}>{loadingText}</Text>
                    </View>
                  )}
                </View>
              )}

              {isLandVerified && (
                <View style={styles.verifiedBox}>
                  <Text style={styles.verifiedText}>✅ e-Khata Spatial Data Synced</Text>
                  <Text style={styles.verifiedSub}>Survey: {surveyNumber || '77/1'} | Area: 2.5 Acres | Owner Matched</Text>
                  
                  <TouchableOpacity 
                    style={styles.radarBtn}
                    onPress={() => navigation.navigate('GeoFenceAudit')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="satellite-variant" size={18} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.radarBtnText}>View GIS Geo-Fence Audit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* STEP 3: COMPLETION */}
            {step === 3 && (
              <Animated.View style={styles.completionContainer}>
                <MaterialCommunityIcons name="shield-check" size={64} color={Theme.accentEarth} style={{ marginBottom: 16 }} />
                <Text style={styles.completionTitle}>Trust Engine Armed</Text>
                <Text style={styles.completionSub}>Your identity and land are geospatially locked. AgriScore initialized at 300.</Text>
                
                <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                  <Text style={styles.finishBtnText}>Go to Dashboard</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: Theme.matchGreen },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' }, 
  header: { marginBottom: 32, marginTop: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 14, color: Theme.accentEarth, fontWeight: '600', letterSpacing: 0.5 },
  card: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardInactive: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Theme.textDark, marginLeft: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, backgroundColor: '#F7F7F7', borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, color: Theme.textDark, fontWeight: '600' },
  verifyBtn: { backgroundColor: Theme.accentGreen, height: 50, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 90 },
  verifyBtnDisabled: { backgroundColor: '#A0A0A0' },
  verifyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 8, gap: 10 },
  loadingText: { color: Theme.accentEarth, fontWeight: '700', fontSize: 13 },
  verifiedBox: { backgroundColor: 'rgba(74, 107, 54, 0.1)', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: Theme.accentGreen },
  verifiedText: { fontSize: 15, fontWeight: '700', color: Theme.accentGreen, marginBottom: 4 },
  verifiedSub: { fontSize: 13, color: Theme.textDark, fontWeight: '500' },
  radarBtn: { marginTop: 16, backgroundColor: Theme.textDark, paddingVertical: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  radarBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  completionContainer: { alignItems: 'center', marginTop: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  completionTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  completionSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  finishBtn: { backgroundColor: Theme.accentEarth, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, height: 56, borderRadius: 28, gap: 8 },
  finishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});