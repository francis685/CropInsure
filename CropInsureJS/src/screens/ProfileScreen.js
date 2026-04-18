import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Switch } from 'react-native';
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
    title: "Farmer Profile", name: "Francis Dsouza", member: "CropInsure Member since Oct 2023",
    section1: "Verification & Linked Data", aadhaarTitle: "Aadhaar eKYC", aadhaarSub: "[Aadhaar Redacted]",
    landTitle: "Land Records (Bhoomi)", landSub: "Survey No. 123/4 • 2.5 Acres", bankTitle: "Bank Account", bankSub: "State Bank of India • **** 4021",
    section2: "App Settings", pushTitle: "Push Notifications", pushSub: "Claim updates & weather alerts",
    smsTitle: "SMS Alerts", smsSub: "Offline fallback via Twilio", langTitle: "Language", langSub: "English (EN)",
    helpTitle: "Help & Support", helpSub: "Contact Agent • FAQ", logout: "Secure Logout",
    version: "CropInsure App v1.0.0 (Hackathon Build)", verified: "Verified"
  },
  1: {
    title: "किसान प्रोफ़ाइल", name: "फ्रांसिस डिसूजा", member: "अक्टूबर 2023 से क्रॉपइन्श्योर सदस्य",
    section1: "सत्यापन और लिंक्ड डेटा", aadhaarTitle: "आधार eKYC", aadhaarSub: "[Aadhaar Redacted]",
    landTitle: "भूमि रिकॉर्ड (भूमि)", landSub: "सर्वे नंबर 123/4 • 2.5 एकड़", bankTitle: "बैंक खाता", bankSub: "भारतीय स्टेट बैंक • **** 4021",
    section2: "ऐप सेटिंग्स", pushTitle: "पुश नोटिफिकेशन", pushSub: "क्लेम अपडेट और मौसम अलर्ट",
    smsTitle: "एसएमएस अलर्ट", smsSub: "ट्विलियो के माध्यम से ऑफ़लाइन अलर्ट", langTitle: "भाषा", langSub: "अंग्रेजी (EN)",
    helpTitle: "सहायता और समर्थन", helpSub: "एजेंट से संपर्क करें • सामान्य प्रश्न", logout: "सुरक्षित लॉगआउट",
    version: "क्रॉपइन्श्योर ऐप v1.0.0 (हैकथॉन बिल्ड)", verified: "सत्यापित"
  },
  2: {
    title: "ರೈತರ ಪ್ರೊಫೈಲ್", name: "ಫ್ರಾನ್ಸಿಸ್ ಡಿಸೋಜಾ", member: "ಅಕ್ಟೋಬರ್ 2023 ರಿಂದ ಕ್ರಾಪ್‌ಇನ್ಶೂರ್ ಸದಸ್ಯ",
    section1: "ಪರಿಶೀಲನೆ ಮತ್ತು ಲಿಂಕ್ ಮಾಡಿದ ಡೇಟಾ", aadhaarTitle: "ಆಧಾರ್ eKYC", aadhaarSub: "[Aadhaar Redacted]",
    landTitle: "ಭೂ ದಾಖಲೆಗಳು (ಭೂಮಿ)", landSub: "ಸರ್ವೆ ನಂ. 123/4 • 2.5 ಎಕರೆ", bankTitle: "ಬ್ಯಾಂಕ್ ಖಾತೆ", bankSub: "ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ • **** 4021",
    section2: "ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು", pushTitle: "ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು", pushSub: "ಕ್ಲೈಮ್ ನವೀಕರಣಗಳು ಮತ್ತು ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು",
    smsTitle: "ಎಸ್‌ಎಂಎಸ್ ಎಚ್ಚರಿಕೆಗಳು", smsSub: "ಟ್ವಿಲಿಯೊ ಮೂಲಕ ಆಫ್‌ಲೈನ್ ಎಚ್ಚರಿಕೆಗಳು", langTitle: "ಭಾಷೆ", langSub: "ಇಂಗ್ಲಿಷ್ (EN)",
    helpTitle: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ", helpSub: "ಏಜೆಂಟ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ • FAQ", logout: "ಸುರಕ್ಷಿತ ಲಾಗ್ ಔಟ್",
    version: "ಕ್ರಾಪ್‌ಇನ್ಶೂರ್ ಅಪ್ಲಿಕೇಶನ್ v1.0.0 (ಹ್ಯಾಕಥಾನ್ ಬಿಲ್ಡ್)", verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ"
  }
};

export default function ProfileScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const { langIndex } = useContext(LanguageContext);
  const T = TRANSLATIONS[langIndex];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const toggleSwitch = (setter, value) => {
    Haptics.selectionAsync();
    setter(!value);
  };

  const MenuItem = ({ icon, title, subtitle, isVerified, color = Theme.textDark }) => (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => Haptics.selectionAsync()}>
      <View style={[styles.menuIconBox, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {isVerified ? (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color={Theme.accentGreen} />
          <Text style={styles.verifiedText}>{T.verified}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={Theme.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom]} locations={[0, 0.3]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{T.title}</Text>
          <View style={{ width: 44 }} />
        </View>

        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>FD</Text>
              </View>
              <View style={styles.agriScoreBadge}>
                <MaterialCommunityIcons name="star-shooting" size={14} color="#FFF" />
                <Text style={styles.agriScoreText}>785</Text>
              </View>
            </View>
            
            <Text style={styles.profileName}>{T.name}</Text>
            <Text style={styles.profilePhone}>+91 98765 43210</Text>
            <View style={styles.memberSince}>
              <Text style={styles.memberSinceText}>{T.member}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{T.section1}</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="card-account-details" title={T.aadhaarTitle} subtitle={T.aadhaarSub} isVerified={true} color={Theme.accentGreen} />
            <View style={styles.divider} />
            <MenuItem icon="map-marker-path" title={T.landTitle} subtitle={T.landSub} isVerified={true} color={Theme.accentEarth} />
            <View style={styles.divider} />
            <MenuItem icon="bank" title={T.bankTitle} subtitle={T.bankSub} isVerified={true} color={Theme.accentGreen} />
          </View>

          <Text style={styles.sectionTitle}>{T.section2}</Text>
          <View style={styles.menuCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.menuTitle}>{T.pushTitle}</Text>
                <Text style={styles.menuSubtitle}>{T.pushSub}</Text>
              </View>
              <Switch 
                value={pushEnabled} 
                onValueChange={() => toggleSwitch(setPushEnabled, pushEnabled)} 
                trackColor={{ false: '#E0E0E0', true: Theme.accentGreen }}
                thumbColor="#FFF"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.menuTitle}>{T.smsTitle}</Text>
                <Text style={styles.menuSubtitle}>{T.smsSub}</Text>
              </View>
              <Switch 
                value={smsEnabled} 
                onValueChange={() => toggleSwitch(setSmsEnabled, smsEnabled)} 
                trackColor={{ false: '#E0E0E0', true: Theme.accentEarth }}
                thumbColor="#FFF"
              />
            </View>
            <View style={styles.divider} />
            <MenuItem icon="translate" title={T.langTitle} subtitle={T.langSub} isVerified={false} />
            <View style={styles.divider} />
            <MenuItem icon="help-circle-outline" title={T.helpTitle} subtitle={T.helpSub} isVerified={false} />
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <MaterialCommunityIcons name="logout" size={20} color={Theme.danger} />
            <Text style={styles.logoutText}>{T.logout}</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>{T.version}</Text>

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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  profileCard: { alignItems: 'center', backgroundColor: Theme.cardBg, borderRadius: 24, padding: 24, marginBottom: 32, elevation: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(74, 107, 54, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Theme.accentGreen },
  avatarText: { fontSize: 28, fontWeight: '800', color: Theme.accentGreen },
  agriScoreBadge: { position: 'absolute', bottom: -5, right: -10, backgroundColor: Theme.accentEarth, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 2, borderColor: '#FFF' },
  agriScoreText: { color: '#FFF', fontSize: 12, fontWeight: '800', marginLeft: 4 },
  
  profileName: { fontSize: 24, fontWeight: '800', color: Theme.textDark, marginBottom: 4 },
  profilePhone: { fontSize: 16, color: Theme.textMuted, fontWeight: '600', marginBottom: 16 },
  memberSince: { backgroundColor: '#F1EFE8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  memberSinceText: { fontSize: 12, color: Theme.textMuted, fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.textDark, marginBottom: 12, marginLeft: 4 },
  menuCard: { backgroundColor: Theme.cardBg, borderRadius: 20, paddingHorizontal: 16, marginBottom: 32, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuTextContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: Theme.textMuted, fontWeight: '500' },
  
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 107, 54, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  verifiedText: { color: Theme.accentGreen, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  
  divider: { height: 1, backgroundColor: '#F1EFE8', marginLeft: 56 },
  
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  toggleTextWrap: { flex: 1 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(211, 47, 47, 0.1)', paddingVertical: 16, borderRadius: 16, marginBottom: 24 },
  logoutText: { color: Theme.danger, fontSize: 16, fontWeight: '800', marginLeft: 8 },

  versionText: { textAlign: 'center', color: Theme.textMuted, fontSize: 12, fontWeight: '600', opacity: 0.6 }
});