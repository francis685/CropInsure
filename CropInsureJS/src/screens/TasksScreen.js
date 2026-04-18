import React, { useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../context/LanguageContext';

const Theme = {
  bgOverlayTop: '#FDECCC',       
  bgOverlayBottom: '#F9F7F2',    
  cardBg: '#FFFFFF',             
  textDark: '#212B1A',           
  textMuted: '#8A9681',          
  accentEarth: '#D48C3E',        
  accentGreen: '#4A6B36',
  danger: '#D32F2F'
};

const TRANSLATIONS = {
  0: {
    header: "Farmer's Tasks", date: "Today, Oct 14", progTitle: "Daily Progress", progBadge: "1 / 3 Completed",
    sec1: "High Priority", t1Title: "Morning Field Scan", t1Sub: "AI Assessment Required • Plot B",
    sec2: "Upcoming", t2Title: "Claim Kisan Credit", t2Sub: "Pre-approved ₹50,000 pending",
    t3Title: "Secure Harvest Storage", t3Sub: "Due Tomorrow • Rain Expected",
    sec3: "Completed", t4Title: "e-KYC Verification", t4Sub: "Verified by State Portal"
  },
  1: {
    header: "किसान के कार्य", date: "आज, 14 अक्टूबर", progTitle: "दैनिक प्रगति", progBadge: "1 / 3 पूरा हुआ",
    sec1: "उच्च प्राथमिकता", t1Title: "सुबह का खेत निरीक्षण", t1Sub: "AI मूल्यांकन आवश्यक • प्लॉट B",
    sec2: "आगामी", t2Title: "किसान क्रेडिट का क्लेम करें", t2Sub: "पूर्व-स्वीकृत ₹50,000 लंबित",
    t3Title: "कटी फसल सुरक्षित करें", t3Sub: "कल देय • बारिश की संभावना",
    sec3: "पूरा हुआ", t4Title: "e-KYC सत्यापन", t4Sub: "राज्य पोर्टल द्वारा सत्यापित"
  },
  2: {
    header: "ರೈತರ ಕಾರ್ಯಗಳು", date: "ಇಂದು, ಅಕ್ಟೋಬರ್ 14", progTitle: "ದೈನಂದಿನ ಪ್ರಗತಿ", progBadge: "1 / 3 ಪೂರ್ಣಗೊಂಡಿದೆ",
    sec1: "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ", t1Title: "ಬೆಳಗಿನ ಕ್ಷೇತ್ರ ತಪಾಸಣೆ", t1Sub: "AI ಮೌಲ್ಯಮಾಪನ ಅಗತ್ಯವಿದೆ • ಪ್ಲಾಟ್ B",
    sec2: "ಮುಂಬರುವ", t2Title: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕ್ಲೈಮ್ ಮಾಡಿ", t2Sub: "ಪೂರ್ವ-ಅನುಮೋದಿತ ₹50,000 ಬಾಕಿ ಇದೆ",
    t3Title: "ಕೊಯ್ಲು ಮಾಡಿದ ಬೆಳೆ ಸುರಕ್ಷಿತಗೊಳಿಸಿ", t3Sub: "ನಾಳೆ ಗಡುವು • ಮಳೆಯ ನಿರೀಕ್ಷೆಯಿದೆ",
    sec3: "ಪೂರ್ಣಗೊಂಡಿದೆ", t4Title: "e-KYC ಪರಿಶೀಲನೆ", t4Sub: "ರಾಜ್ಯ ಪೋರ್ಟಲ್‌ನಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ"
  }
};

export default function TasksScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const { langIndex } = useContext(LanguageContext);
  const T = TRANSLATIONS[langIndex];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const handleTaskPress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(route);
  };

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom]} locations={[0, 0.2]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{T.header}</Text>
          <View style={{ width: 44 }} />
        </View>

        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.dateText}>{T.date}</Text>
                <Text style={styles.progressTitle}>{T.progTitle}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{T.progBadge}</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '33%' }]} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>{T.sec1}</Text>

          <TouchableOpacity activeOpacity={0.8} onPress={() => handleTaskPress('Camera')}>
            <View style={[styles.taskCard, { borderColor: Theme.danger, borderWidth: 1 }]}>
              <View style={styles.taskCardHeader}>
                <View style={[styles.taskIconBadge, { backgroundColor: 'rgba(211, 47, 47, 0.1)' }]}>
                  <Ionicons name="scan" size={20} color={Theme.danger} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.taskCardTitle}>{T.t1Title}</Text>
                  <Text style={styles.taskCardSub}>{T.t1Sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Theme.textMuted} />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{T.sec2}</Text>

          <TouchableOpacity activeOpacity={0.8} onPress={() => handleTaskPress('LoanApplication')}>
            <View style={styles.taskCard}>
              <View style={styles.taskCardHeader}>
                <View style={[styles.taskIconBadge, { backgroundColor: 'rgba(212, 140, 62, 0.15)' }]}>
                  <MaterialCommunityIcons name="bank-check" size={20} color={Theme.accentEarth} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.taskCardTitle}>{T.t2Title}</Text>
                  <Text style={styles.taskCardSub}>{T.t2Sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Theme.textMuted} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.taskCard, { opacity: 0.7 }]}>
            <View style={styles.taskCardHeader}>
              <View style={styles.taskIconBadge}>
                <MaterialCommunityIcons name="weather-pouring" size={20} color={Theme.textMuted} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.taskCardTitle}>{T.t3Title}</Text>
                <Text style={styles.taskCardSub}>{T.t3Sub}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{T.sec3}</Text>

          <View style={[styles.taskCard, { backgroundColor: 'rgba(74, 107, 54, 0.05)' }]}>
            <View style={styles.taskCardHeader}>
              <View style={[styles.taskIconBadge, { backgroundColor: Theme.accentGreen }]}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.taskCardTitle, { textDecorationLine: 'line-through', color: Theme.textMuted }]}>{T.t4Title}</Text>
                <Text style={styles.taskCardSub}>{T.t4Sub}</Text>
              </View>
            </View>
          </View>

        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: Theme.bgOverlayBottom },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Theme.cardBg, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Theme.textDark },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },

  progressCard: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 20, marginBottom: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dateText: { fontSize: 12, color: Theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  progressTitle: { fontSize: 18, fontWeight: '800', color: Theme.textDark },
  badge: { backgroundColor: 'rgba(74, 107, 54, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: Theme.accentGreen, fontWeight: '700', fontSize: 12 },
  progressBarBg: { height: 8, backgroundColor: '#F1EFE8', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Theme.accentGreen, borderRadius: 4 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.textDark, marginBottom: 12, marginLeft: 4, marginTop: 8 },
  
  taskCard: { backgroundColor: Theme.cardBg, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8 },
  taskCardHeader: { flexDirection: 'row', alignItems: 'center' },
  taskIconBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1EFE8', justifyContent: 'center', alignItems: 'center' },
  taskCardTitle: { fontSize: 16, fontWeight: '700', color: Theme.textDark, marginBottom: 2 },
  taskCardSub: { fontSize: 13, color: Theme.textMuted, fontWeight: '500' },
});