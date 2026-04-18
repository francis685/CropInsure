import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, ImageBackground, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Theme = {
  bgOverlayTop: 'rgba(212, 140, 62, 0.6)',
  bgOverlayBottom: 'rgba(33, 43, 26, 0.95)',
  cardBg: '#FFFFFF',
  textDark: '#1A1D16',
  textMuted: '#8A9681',
  accentGreen: '#4A6B36',
  accentEarth: '#D48C3E',
};

export default function VerificationScreen({ navigation }) {
  const [step, setStep] = useState(1); 
  const [idNumber, setIdNumber] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  
  const [isIdVerifying, setIsIdVerifying] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  
  const [isLandVerifying, setIsLandVerifying] = useState(false);
  const [isLandVerified, setIsLandVerified] = useState(false);

  const handleVerifyId = () => {
    if (idNumber.length < 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsIdVerifying(true);
    
    setTimeout(() => {
      setIsIdVerifying(false);
      setIsIdVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setStep(2), 1000); 
    }, 1500);
  };

  const handleVerifyLand = () => {
    if (surveyNumber.length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLandVerifying(true);
    
    setTimeout(() => {
      setIsLandVerifying(false);
      setIsLandVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setStep(3), 1000); 
    }, 2000);
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.replace('Dashboard');
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80' }} 
      style={styles.rootContainer}
    >
      <LinearGradient colors={[Theme.bgOverlayTop, 'transparent', Theme.bgOverlayBottom]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* 🟢 KEYBOARD FIX: Wrapped everything in KeyboardAvoidingView and ScrollView */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Farmer Onboarding</Text>
              <Text style={styles.headerSub}>Complete your profile to access insurance and loans.</Text>
            </View>

            {/* STEP 1: IDENTITY VERIFICATION */}
            <View style={[styles.card, step < 1 && styles.cardInactive]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name={isIdVerified ? "check-decagram" : "card-account-details-outline"} size={28} color={isIdVerified ? Theme.accentGreen : Theme.textDark} />
                <Text style={styles.cardTitle}>1. Identity Verification</Text>
              </View>
              
              {!isIdVerified ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Government ID Number"
                    placeholderTextColor={Theme.textMuted}
                    keyboardType="numeric"
                    value={idNumber}
                    onChangeText={setIdNumber}
                    editable={step === 1 && !isIdVerifying}
                  />
                  <TouchableOpacity 
                    style={[styles.verifyBtn, idNumber.length < 4 && styles.verifyBtnDisabled]} 
                    onPress={handleVerifyId}
                    disabled={idNumber.length < 4 || isIdVerifying || step !== 1}
                  >
                    {isIdVerifying ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.verifiedBox}>
                  <Text style={styles.verifiedText}>✅ Profile Verified: Francis Dsouza</Text>
                  <Text style={styles.verifiedSub}>ID ending in {idNumber.slice(-4) || '7821'}</Text>
                </View>
              )}
            </View>

            {/* STEP 2: LAND VERIFICATION */}
            <View style={[styles.card, step < 2 && styles.cardInactive]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name={isLandVerified ? "check-decagram" : "map-marker-path"} size={28} color={isLandVerified ? Theme.accentGreen : Theme.textDark} />
                <Text style={styles.cardTitle}>2. Land Katha Verification</Text>
              </View>
              
              {step >= 2 && !isLandVerified && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Survey No. (e.g. 123/4)"
                    placeholderTextColor={Theme.textMuted}
                    value={surveyNumber}
                    onChangeText={setSurveyNumber}
                    editable={!isLandVerifying}
                  />
                  <TouchableOpacity 
                    style={[styles.verifyBtn, surveyNumber.length < 2 && styles.verifyBtnDisabled]} 
                    onPress={handleVerifyLand}
                    disabled={surveyNumber.length < 2 || isLandVerifying}
                  >
                    {isLandVerifying ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
                  </TouchableOpacity>
                </View>
              )}

              {isLandVerified && (
                <View style={styles.verifiedBox}>
                  <Text style={styles.verifiedText}>✅ Land Verified via State Portal</Text>
                  <Text style={styles.verifiedSub}>Survey: {surveyNumber || '123/4'} | Area: 2.5 Acres</Text>
                </View>
              )}
            </View>

            {/* STEP 3: COMPLETION */}
            {step === 3 && (
              <Animated.View style={styles.completionContainer}>
                <MaterialCommunityIcons name="shield-check" size={64} color={Theme.accentEarth} style={{ marginBottom: 16 }} />
                <Text style={styles.completionTitle}>Profile Ready!</Text>
                <Text style={styles.completionSub}>Your AgriScore has been initialized. You are now eligible for instant claim processing.</Text>
                
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
  rootContainer: { flex: 1, backgroundColor: '#000' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' }, // 🟢 Centered properly for scrolling
  header: { marginBottom: 32, marginTop: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
  card: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardInactive: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Theme.textDark, marginLeft: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, backgroundColor: '#F7F7F7', borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, color: Theme.textDark, fontWeight: '600' },
  verifyBtn: { backgroundColor: Theme.accentGreen, height: 50, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  verifyBtnDisabled: { backgroundColor: '#A0A0A0' },
  verifyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  verifiedBox: { backgroundColor: 'rgba(74, 107, 54, 0.1)', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: Theme.accentGreen },
  verifiedText: { fontSize: 15, fontWeight: '700', color: Theme.accentGreen, marginBottom: 4 },
  verifiedSub: { fontSize: 13, color: Theme.textDark, fontWeight: '500' },
  completionContainer: { alignItems: 'center', marginTop: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  completionTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  completionSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  finishBtn: { backgroundColor: Theme.accentEarth, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, height: 56, borderRadius: 28, gap: 8 },
  finishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});