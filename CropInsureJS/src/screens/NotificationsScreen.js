import React, { useState, useRef, useEffect, useContext } from 'react';
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
  danger: '#D32F2F',
  info: '#0288D1'
};

const TRANSLATIONS = {
  0: { 
    header: "Notifications", footer: "All communications are end-to-end encrypted",
    n1Title: "Claim Under Review", n1Msg: "Your claim #CR-84920 for Late Blight damage has passed AI triage and is now with an agent. Est. completion: 3 days.", n1Time: "Just now",
    n2Title: "Kisan Credit Pre-Approved", n2Msg: "Congratulations! Your AgriScore reached 785. You are instantly eligible for a ₹50,000 advance at 4% p.a.", n2Time: "2 hours ago",
    n3Title: "IMD Alert: Heavy Rainfall", n3Msg: "Warning: Heavy to very heavy rainfall expected in Mangaluru district over the next 48 hours. Please secure harvested crops.", n3Time: "Yesterday",
    n4Title: "Profile & Land Verified", n4Msg: "Your Identity ID and Survey Number (123/4) have been successfully verified against the state database.", n4Time: "2 days ago"
  },
  1: { 
    header: "सूचनाएं", footer: "सभी संचार एंड-टू-एंड एन्क्रिप्टेड हैं",
    n1Title: "समीक्षा के तहत क्लेम", n1Msg: "लेट ब्लाइट क्षति के लिए आपका क्लेम #CR-84920 AI ट्राइएज पास कर चुका है और अब एक एजेंट के पास है। अनुमानित समय: 3 दिन।", n1Time: "अभी-अभी",
    n2Title: "किसान क्रेडिट पूर्व-स्वीकृत", n2Msg: "बधाई हो! आपका एग्रीस्कोर 785 तक पहुंच गया है। आप तुरंत 4% प्रति वर्ष की दर से ₹50,000 के अग्रिम के लिए पात्र हैं।", n2Time: "2 घंटे पहले",
    n3Title: "IMD अलर्ट: भारी बारिश", n3Msg: "चेतावनी: अगले 48 घंटों में मंगलुरु जिले में भारी से बहुत भारी बारिश की संभावना है। कृपया कटी हुई फसल को सुरक्षित करें।", n3Time: "कल",
    n4Title: "प्रोफ़ाइल और भूमि सत्यापित", n4Msg: "आपकी पहचान आईडी और सर्वेक्षण संख्या (123/4) राज्य डेटाबेस से सफलतापूर्वक सत्यापित कर ली गई है।", n4Time: "2 दिन पहले"
  },
  2: { 
    header: "ಅಧಿಸೂಚನೆಗಳು", footer: "ಎಲ್ಲಾ ಸಂವಹನಗಳನ್ನು ಎಂಡ್-ಟು-ಎಂಡ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ",
    n1Title: "ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ಕ್ಲೈಮ್", n1Msg: "ಲೇಟ್ ಬ್ಲೈಟ್ ಹಾನಿಗಾಗಿ ನಿಮ್ಮ ಕ್ಲೈಮ್ #CR-84920 AI ವಿಂಗಡಣೆಯನ್ನು ದಾಟಿದೆ ಮತ್ತು ಈಗ ಏಜೆಂಟ್ ಬಳಿ ಇದೆ. ಅಂದಾಜು ಸಮಯ: 3 ದಿನಗಳು.", n1Time: "ಈಗಷ್ಟೇ",
    n2Title: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಪೂರ್ವ-ಅನುಮೋದಿತ", n2Msg: "ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಅಗ್ರಿಸ್ಕೋರ್ 785 ತಲುಪಿದೆ. ನೀವು ವಾರ್ಷಿಕ 4% ದರದಲ್ಲಿ ₹50,000 ಮುಂಗಡಕ್ಕೆ ತ್ವರಿತವಾಗಿ ಅರ್ಹರಾಗಿದ್ದೀರಿ.", n2Time: "2 ಗಂಟೆಗಳ ಹಿಂದೆ",
    n3Title: "IMD ಎಚ್ಚರಿಕೆ: ಭಾರಿ ಮಳೆ", n3Msg: "ಎಚ್ಚರಿಕೆ: ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಮಂಗಳೂರು ಜಿಲ್ಲೆಯಲ್ಲಿ ಭಾರಿ ಮಳೆಯಾಗುವ ನಿರೀಕ್ಷೆಯಿದೆ. ದಯವಿಟ್ಟು ಕೊಯ್ಲು ಮಾಡಿದ ಬೆಳೆಗಳನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಿ.", n3Time: "ನಿನ್ನೆ",
    n4Title: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಭೂಮಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ", n4Msg: "ನಿಮ್ಮ ಗುರುತಿನ ಐಡಿ ಮತ್ತು ಸರ್ವೆ ಸಂಖ್ಯೆ (123/4) ರಾಜ್ಯ ಡೇಟಾಬೇಸ್‌ನೊಂದಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.", n4Time: "2 ದಿನಗಳ ಹಿಂದೆ"
  }
};

export default function NotificationsScreen({ navigation }) {
  const { langIndex } = useContext(LanguageContext);
  const T = TRANSLATIONS[langIndex];

  // Store unread status separately so it doesn't reset when language changes
  const [unreadState, setUnreadState] = useState({ '1': true, '2': true, '3': false, '4': false });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const markAllAsRead = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUnreadState({ '1': false, '2': false, '3': false, '4': false });
  };

  const handlePressNotification = (id) => {
    Haptics.selectionAsync();
    setUnreadState(prev => ({ ...prev, [id]: false }));
  };

  // Generate the list dynamically based on the selected language
  const notifications = [
    { id: '1', title: T.n1Title, message: T.n1Msg, time: T.n1Time, icon: 'file-document-edit', color: Theme.accentEarth },
    { id: '2', title: T.n2Title, message: T.n2Msg, time: T.n2Time, icon: 'bank-outline', color: Theme.accentGreen },
    { id: '3', title: T.n3Title, message: T.n3Msg, time: T.n3Time, icon: 'weather-pouring', color: Theme.info },
    { id: '4', title: T.n4Title, message: T.n4Msg, time: T.n4Time, icon: 'check-decagram', color: Theme.accentGreen },
  ];

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom]} locations={[0, 0.3]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{T.header}</Text>
          <TouchableOpacity onPress={markAllAsRead} style={styles.readAllBtn}>
            <MaterialCommunityIcons name="check-all" size={24} color={Theme.accentGreen} />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          
          {notifications.map((notif) => (
            <TouchableOpacity 
              key={notif.id} 
              activeOpacity={0.8} 
              style={[styles.notificationCard, unreadState[notif.id] && styles.notificationCardUnread]}
              onPress={() => handlePressNotification(notif.id)}
            >
              {unreadState[notif.id] && <View style={styles.unreadDot} />}
              <View style={styles.cardLayout}>
                <View style={[styles.iconBox, { backgroundColor: `${notif.color}15` }]}>
                  <MaterialCommunityIcons name={notif.icon} size={28} color={notif.color} />
                </View>
                <View style={styles.textContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, unreadState[notif.id] && styles.titleUnread]} numberOfLines={1}>
                      {notif.title}
                    </Text>
                    <Text style={styles.timeText}>{notif.time}</Text>
                  </View>
                  <Text style={styles.messageText} numberOfLines={3}>
                    {notif.message}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 40 }} />
          
          <View style={styles.footerHint}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={Theme.textMuted} />
            <Text style={styles.footerHintText}>{T.footer}</Text>
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
  readAllBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(74, 107, 54, 0.1)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  notificationCard: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, position: 'relative' },
  notificationCardUnread: { backgroundColor: '#FFFFFF', elevation: 6, shadowOpacity: 0.08, borderColor: 'rgba(212, 140, 62, 0.3)', borderWidth: 1 },
  unreadDot: { position: 'absolute', top: 16, right: 16, width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.accentEarth, zIndex: 10 },
  cardLayout: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContent: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingRight: 16 },
  title: { fontSize: 16, fontWeight: '600', color: Theme.textDark, flex: 1, marginRight: 8 },
  titleUnread: { fontWeight: '800' },
  timeText: { fontSize: 12, color: Theme.textMuted, fontWeight: '500' },
  messageText: { fontSize: 14, color: '#555', lineHeight: 20, fontWeight: '500' },
  footerHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, opacity: 0.6 },
  footerHintText: { fontSize: 12, color: Theme.textMuted, marginLeft: 6, fontWeight: '500' }
});