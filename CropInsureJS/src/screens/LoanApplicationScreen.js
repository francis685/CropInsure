import React, { useState } from 'react';
// 🟢 FIXED: Added Platform to the import list below!
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Theme = {
  bgOverlayTop: '#FDECCC',       
  bgOverlayBottom: '#F9F7F2',    
  cardBg: '#FFFFFF',             
  textDark: '#212B1A',           
  textMuted: '#8A9681',          
  accentEarth: '#D48C3E',        
  accentGreen: '#4A6B36',        
};

export default function LoanApplicationScreen({ navigation }) {
  const [amount, setAmount] = useState(50000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    // 🎭 HACKATHON FAKE: Simulate Bank API Processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsApproved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  };

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kisan Credit</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* VIRTUAL CREDIT CARD */}
          <LinearGradient 
            colors={['#212B1A', '#3A4D2E']} 
            start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
            style={styles.creditCard}
          >
            <View style={styles.cardTop}>
              <MaterialCommunityIcons name="integrated-circuit-chip" size={32} color="#D48C3E" />
              <Text style={styles.cardLogo}>CropInsure Bank</Text>
            </View>
            <Text style={styles.cardNumber}>**** **** **** 7821</Text>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>CARDHOLDER</Text>
                <Text style={styles.cardValue}>FRANCIS DSOUZA</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>AGRISCORE</Text>
                <Text style={styles.cardValue}>785 / EXCELLENT</Text>
              </View>
            </View>
          </LinearGradient>

          {isApproved ? (
            // SUCCESS STATE
            <View style={styles.successBox}>
              <MaterialCommunityIcons name="check-decagram" size={64} color={Theme.accentGreen} />
              <Text style={styles.successTitle}>₹{amount.toLocaleString()} Disbursed!</Text>
              <Text style={styles.successText}>Funds have been instantly transferred to your linked bank account via UPI.</Text>
              <TouchableOpacity style={styles.returnBtn} onPress={() => navigation.navigate('Dashboard')}>
                <Text style={styles.returnBtnText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // APPLICATION FORM
            <>
              <Text style={styles.sectionTitle}>Select Advance Amount</Text>
              <View style={styles.amountGrid}>
                {[10000, 25000, 50000].map((val) => (
                  <TouchableOpacity 
                    key={val} 
                    style={[styles.amountPill, amount === val && styles.amountPillActive]}
                    onPress={() => { Haptics.selectionAsync(); setAmount(val); }}
                  >
                    <Text style={[styles.amountText, amount === val && styles.amountTextActive]}>
                      ₹{val.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Interest Rate (Subsidized)</Text>
                  <Text style={styles.detailValueGreen}>4.0% p.a.</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Repayment Tenure</Text>
                  <Text style={styles.detailValue}>6 Months</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Processing Fee</Text>
                  <Text style={styles.detailValue}>₹0</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.applyBtn, isProcessing && { opacity: 0.7 }]} 
                onPress={handleApply}
                disabled={isProcessing}
              >
                <Text style={styles.applyBtnText}>{isProcessing ? 'Verifying with Bank...' : '1-Click Apply & Disburse'}</Text>
                {!isProcessing && <Ionicons name="flash" size={20} color="#FFF" />}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: Theme.bgOverlayBottom },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.cardBg, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.textDark },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  
  creditCard: { borderRadius: 24, padding: 24, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  cardLogo: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  cardNumber: { color: '#FFF', fontSize: 24, fontWeight: '600', letterSpacing: 4, marginBottom: 32, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
  cardValue: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: Theme.textDark, marginBottom: 16 },
  amountGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  amountPill: { flex: 1, backgroundColor: Theme.cardBg, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#EFEFEF' },
  amountPillActive: { backgroundColor: Theme.accentEarth, borderColor: Theme.accentEarth },
  amountText: { fontSize: 16, fontWeight: '700', color: Theme.textDark },
  amountTextActive: { color: '#FFF' },

  detailsCard: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 20, marginBottom: 32 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  detailLabel: { fontSize: 14, color: Theme.textMuted, fontWeight: '600' },
  detailValue: { fontSize: 15, color: Theme.textDark, fontWeight: '800' },
  detailValueGreen: { fontSize: 15, color: Theme.accentGreen, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F1EFE8', marginVertical: 8 },

  applyBtn: { backgroundColor: Theme.accentGreen, height: 60, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: Theme.accentGreen, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  applyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  successBox: { alignItems: 'center', backgroundColor: Theme.cardBg, padding: 32, borderRadius: 24, marginTop: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Theme.textDark, marginTop: 16, marginBottom: 8 },
  successText: { fontSize: 14, color: Theme.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  returnBtn: { backgroundColor: Theme.accentEarth, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  returnBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 }
});