import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location'; 
import { LanguageContext } from '../context/LanguageContext'; 
import { AgriContext } from '../context/AgriContext'; 

// 🟢 ADDED SUPABASE IMPORT FOR HISTORY
import { supabase } from '../lib/supabase'; 

const { width } = Dimensions.get('window');

const Theme = {
  bgOverlayTop: '#FDECCC',       
  bgOverlayBottom: '#F9F7F2',    
  cardBg: '#FFFFFF',             
  textDark: '#212B1A',           
  textMuted: '#8A9681',          
  accentEarth: '#D48C3E',        
  accentGreen: '#4A6B36',        
  navDark: '#1A1D16', 
  danger: '#D32F2F', // 🟢 ADDED DANGER COLOR FOR FRAUD           
};

const LANGUAGES = [
  { code: 'EN', name: 'English', apiCode: 'en-IN' },
  { code: 'HI', name: 'हिन्दी (Hindi)', apiCode: 'hi-IN' },
  { code: 'KN', name: 'ಕನ್ನಡ (Kannada)', apiCode: 'kn-IN' }
];

const TRANSLATIONS = {
  0: { hello: "Hello", location: "Locating...", weather: "Fetching...", commodities: "Commodities", rice: "Rice", corn: "Corn", wheat: "Wheat", financials: "Farmer's Financials", agriScore: "Verified AgriScore", preApprovedLoan: "Pre-Approved Loan", kisanCredit: "Kisan Credit Available", apply: "Apply", tasks: "Farmer's Tasks", seeAll: "See All ▾", morningScan: "New Crop Scan", scanSub: "Identify disease & file claim", highPriority: "High Priority", actionRequired: "Action Required", listening: "Listening... (Hold to speak)", processing: "Processing your voice...", activeClaims: "Active Claims", estPayout: "Est. Payout Value:", claimAdvance: "Claim ₹50,000 Advance Now", aiVerified: "AI Verified", agentReview: "Agent Review (Processing)", payout: "Payout", fundsReady: "Funds Ready for Payout", agentApproved: "Agent Approved", claimHistory: "Claim History" },
  1: { hello: "नमस्ते", location: "खोज रहा है...", weather: "ला रहा है...", commodities: "फसलें", rice: "चावल", corn: "मक्का", wheat: "गेहूँ", financials: "किसान वित्त", agriScore: "सत्यापित एग्रीस्कोर", preApprovedLoan: "पूर्व-स्वीकृत ऋण", kisanCredit: "किसान क्रेडिट उपलब्ध", apply: "आवेदन करें", tasks: "किसान के कार्य", seeAll: "सभी देखें ▾", morningScan: "नया फसल स्कैन", scanSub: "रोग की पहचान करें और क्लेम करें", highPriority: "उच्च प्राथमिकता", actionRequired: "कार्रवाई आवश्यक", listening: "सुन रहा हूँ...", processing: "आवाज़ प्रोसेस हो रही है...", activeClaims: "सक्रिय क्लेम", estPayout: "अनुमानित भुगतान:", claimAdvance: "अभी ₹50,000 का अग्रिम क्लेम करें", aiVerified: "AI द्वारा सत्यापित", agentReview: "एजेंट समीक्षा (प्रक्रिया में)", payout: "भुगतान", fundsReady: "भुगतान के लिए राशि तैयार", agentApproved: "एजेंट द्वारा स्वीकृत", claimHistory: "क्लेम इतिहास" },
  2: { hello: "ನಮಸ್ಕಾರ", location: "ಹುಡುಕಲಾಗುತ್ತಿದೆ...", weather: "ತರಲಾಗುತ್ತಿದೆ...", commodities: "ಬೆಳೆಗಳು", rice: "ಅಕ್ಕಿ", corn: "ಜೋಳ", wheat: "ಗೋಧಿ", financials: "ರೈತರ ಹಣಕಾಸು", agriScore: "ಪರಿಶೀಲಿಸಿದ ಅಗ್ರಿಸ್ಕೋರ್", preApprovedLoan: "ಪೂರ್ವ-ಅನುಮೋದಿತ ಸಾಲ", kisanCredit: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಲಭ್ಯವಿದೆ", apply: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ", tasks: "ರೈತರ ಕಾರ್ಯಗಳು", seeAll: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ ▾", morningScan: "ಹೊಸ ಬೆಳೆ ಸ್ಕ್ಯಾನ್", scanSub: "ರೋಗವನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಕ್ಲೈಮ್ ಮಾಡಿ", highPriority: "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ", actionRequired: "ಕ್ರಮ ಅಗತ್ಯವಿದೆ", listening: "ಆಲಿಸುತ್ತಿದ್ದೇನೆ...", processing: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...", activeClaims: "ಸಕ್ರಿಯ ಕ್ಲೈಮ್‌ಗಳು", estPayout: "ಅಂದಾಜು ಪಾವತಿ:", claimAdvance: "ಈಗ ₹50,000 ಮುಂಗಡವನ್ನು ಕ್ಲೈಮ್ ಮಾಡಿ", aiVerified: "AI ಪರಿಶೀಲಿಸಿದೆ", agentReview: "ಏಜೆಂಟ್ ವಿಮರ್ಶೆ (ಪ್ರಗತಿಯಲ್ಲಿದೆ)", payout: "ಪಾವತಿ", fundsReady: "ಪಾವತಿಗೆ ಹಣ ಸಿದ್ಧವಾಗಿದೆ", agentApproved: "ಏಜೆಂಟ್ ಅನುಮೋದಿಸಿದ್ದಾರೆ", claimHistory: "ಕ್ಲೈಮ್ ಇತಿಹಾಸ" }
};

export default function DashboardScreen({ navigation, route }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { langIndex, setLangIndex } = useContext(LanguageContext);
  const { agriScore, loanTier } = useContext(AgriContext); 
  const T = TRANSLATIONS[langIndex];
  
  const [isLangModalVisible, setLangModalVisible] = useState(false);
  const [queryIndex, setQueryIndex] = useState(0);

  // 🟢 ADDED SECRET TARGET SCORE
  const [displayScore, setDisplayScore] = useState(0); 
  const [targetScore, setTargetScore] = useState(300);

  const [temperature, setTemperature] = useState('--');
  const [weatherCondition, setWeatherCondition] = useState(T.weather);
  const [cityName, setCityName] = useState(T.location);

  const newClaim = route.params?.claimData || null;
  const [showAgentWorkflow, setShowAgentWorkflow] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  const [claimApproved, setClaimApproved] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');

  const [claimHistory, setClaimHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCityName('GPS Denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        const weatherKey = process.env.EXPO_PUBLIC_WEATHER_KEY || 'b4ce5ee9b9c3eb8d8158f4ed09dbfa0b';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`);
        const data = await response.json();

        if (data.main) {
          setTemperature(Math.round(data.main.temp));
          setWeatherCondition(data.weather[0].main);
          setCityName(data.name);
        }
      } catch (error) {
        console.log("Weather fetch error", error);
        setCityName("Offline Mode");
      }
    })();
  }, []);

  useEffect(() => {
    fetchHistory();
    const uniqueChannelName = `mobile-history-${Date.now()}`;
    const channel = supabase.channel(uniqueChannelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, payload => {
        fetchHistory();
      }).subscribe();
      
    return () => { supabase.removeChannel(channel) };
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .order('id', { ascending: false })
      .limit(5);
    if (data) setClaimHistory(data);
    setIsLoadingHistory(false);
  };

  // 🟢 UPDATED ANIMATION FOR SECRET DROP
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();

    let start = displayScore;
    const end = targetScore; 
    const duration = start === 0 ? 1500 : 800; 
    const incrementTime = 30; 
    const steps = duration / incrementTime;
    const stepValue = (end - start) / steps;

    const timer = setInterval(() => {
      start += stepValue;
      if ((stepValue < 0 && start <= end) || (stepValue > 0 && start >= end) || stepValue === 0) {
        clearInterval(timer);
        setDisplayScore(end);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  useEffect(() => {
    if (newClaim && !claimApproved) {
      setShowAgentWorkflow(true);
      const runAgents = async () => {
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        await delay(800);
        setActiveAgentIndex(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(2500);
        setActiveAgentIndex(1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(2000);
        setActiveAgentIndex(2);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(2200);
        setActiveAgentIndex(3);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(2000);
        setActiveAgentIndex(4);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await delay(1500);
        setShowAgentWorkflow(false);
        setClaimApproved(true);
      };
      runAgents();
    }
  }, [newClaim?.timestamp]);

  const startRecording = async () => {
    if (isListening) return; 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsListening(true);
    setTranscription(T.listening); 

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true })
      ])
    ).start();
  };

  const stopRecording = async () => {
    setTranscription(T.processing); 
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    setIsListening(false);
    await processHackathonAudio();
  };

  const processHackathonAudio = async () => {
    try {
      const langCode = LANGUAGES[langIndex].apiCode;
      await new Promise(resolve => setTimeout(resolve, 800));

      let userSaid = "";
      let replyText = "";

      if (langCode === 'kn-IN') {
        if (queryIndex === 0) {
          userSaid = "ನನ್ನ ಬೆಳೆ ವಿಮೆ ಸ್ಥಿತಿ ಏನು?"; 
          replyText = 'ನಿಮ್ಮ ಕ್ಲೈಮ್ ಅನ್ನು ಅನುಮೋದಿಸಲಾಗಿದೆ. ಐವತ್ತು ಸಾವಿರ ರೂಪಾಯಿ ಸಾಲ ಲಭ್ಯವಿದೆ.';
        } else if (queryIndex === 1) {
          userSaid = "ಇಂದು ಅಕ್ಕಿ ಬೆಲೆ ಎಷ್ಟು?"; 
          replyText = 'ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಅಕ್ಕಿ ಪ್ರಸ್ತುತ ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್‌ಗೆ ಎರಡು ಸಾವಿರದ ನಾನೂರು ರೂಪಾಯಿಗಳಿಗೆ ವಹಿವಾಟು ನಡೆಸುತ್ತಿದೆ.';
        } else {
          userSaid = "ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆಯೇ?"; 
          replyText = 'ಇಂದು ಮಂಗಳೂರಿನಲ್ಲಿ ಭಾರಿ ಮಳೆಯಾಗುವ ನಿರೀಕ್ಷೆಯಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ರಕ್ಷಿಸಿ.';
        }
      } else if (langCode === 'hi-IN') {
        if (queryIndex === 0) {
          userSaid = "मेरा क्लेम स्टेटस क्या है?";
          replyText = 'आपका क्लेम मंजूर हो गया है। पचास हज़ार रुपये का लोन उपलब्ध है।';
        } else if (queryIndex === 1) {
          userSaid = "आज चावल का भाव क्या है?";
          replyText = 'स्थानीय बाजार में चावल फिलहाल 2,400 रुपये प्रति क्विंटल पर कारोबार कर रहा है।';
        } else {
          userSaid = "क्या आज बारिश होने वाली है?";
          replyText = 'आज मंगलुरु में भारी बारिश की संभावना है। कृपया अपनी फसल को सुरक्षित रखें।';
        }
      } else {
        if (queryIndex === 0) {
          userSaid = "What is my claim status?";
          replyText = 'Your claim is approved. A 50,000 rupee advance loan is available for you now.';
        } else if (queryIndex === 1) {
          userSaid = "What is the market price of rice today?";
          replyText = 'Rice is currently trading at 2,400 rupees per quintal in the local Mangaluru market.';
        } else {
          userSaid = "Is it going to rain today?";
          replyText = 'Heavy rainfall is expected in Mangaluru today. Please take steps to protect your harvested crops.';
        }
      }

      setTranscription(`"${userSaid}"`);
      setQueryIndex((prev) => (prev + 1) % 3);

      Speech.speak(replyText, { language: langCode, rate: 0.95 });
      setTimeout(() => setTranscription(''), 5000);

    } catch (error) {
      console.error("Voice Error:", error);
      setTranscription('Speech synthesis not available.');
    }
  };

  const selectLanguage = (index) => {
    Haptics.selectionAsync();
    setLangIndex(index);
    setLangModalVisible(false);
    setQueryIndex(0); 
  };

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom, Theme.bgOverlayBottom]} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{T.hello}, Francis</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={14} color={Theme.textMuted} />
                  <Text style={styles.locationText}>{cityName}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Notifications')}>
                <Ionicons name="notifications" size={20} color={Theme.textDark} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <View style={styles.weatherBlock}>
              <View>
                <Text style={styles.hugeTemp}>{temperature}°</Text>
                <View style={styles.weatherConditionRow}>
                  <Ionicons name={weatherCondition.includes('Rain') ? "rainy" : weatherCondition.includes('Cloud') ? "cloudy" : "partly-sunny"} size={18} color={Theme.accentEarth} />
                  <Text style={styles.weatherCondition}>{weatherCondition}</Text>
                </View>
              </View>
              
              <View style={styles.miniGrid}>
                <TouchableOpacity style={styles.miniGridItem}>
                  <Ionicons name="call" size={16} color={Theme.accentGreen} />
                  <Text style={styles.miniGridText}>1551</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniGridItem} onPress={() => { Haptics.selectionAsync(); setLangModalVisible(true); }}>
                  <MaterialCommunityIcons name="translate" size={16} color={Theme.accentEarth} />
                  <Text style={styles.miniGridText}>{LANGUAGES[langIndex].code}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{T.commodities}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesRow}>
            <TouchableOpacity activeOpacity={0.7} style={styles.commodityItem} onPress={() => navigation.navigate('Market')}>
              <View style={styles.commodityIconBox}>
                <MaterialCommunityIcons name="rice" size={24} color={Theme.accentGreen} />
              </View>
              <Text style={styles.commodityText}>{T.rice}</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={styles.commodityItem} onPress={() => navigation.navigate('Market')}>
              <View style={styles.commodityIconBox}>
                <MaterialCommunityIcons name="corn" size={24} color={Theme.accentEarth} />
              </View>
              <Text style={styles.commodityText}>{T.corn}</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={styles.commodityItem} onPress={() => navigation.navigate('Market')}>
              <View style={styles.commodityIconBox}>
                <MaterialCommunityIcons name="sprout" size={24} color={Theme.accentGreen} />
              </View>
              <Text style={styles.commodityText}>{T.wheat}</Text>
            </TouchableOpacity>
          </ScrollView>

          <Text style={styles.sectionTitle}>{T.financials}</Text>

          {/* 🟢 SECRET BUTTON ADDED HERE */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <TouchableOpacity activeOpacity={1} onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setTargetScore(150);
              }}>
                <Text style={styles.scoreTitle}>{T.agriScore}</Text>
              </TouchableOpacity>
              <View><MaterialCommunityIcons name="chevron-right" size={24} color={Theme.textMuted} /></View>
            </View>
            
            <View style={styles.scoreDisplayRow}>
              <Text style={[styles.scoreHuge, targetScore < 200 && {color: Theme.danger}]}>{displayScore}</Text>
              <Text style={styles.scoreSub}>/ 900</Text>
            </View>
            
            {targetScore < 200 && (
              <Text style={{color: Theme.danger, fontWeight: '700', marginTop: 4}}>⚠️ Account Flagged for Fraud</Text>
            )}

            <View style={styles.divider} />
            
            <View style={styles.loanOfferRow}>
              <View style={styles.loanIconWrap}>
                <MaterialCommunityIcons name="bank-outline" size={18} color={Theme.accentEarth} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.loanTitle}>{T.preApprovedLoan}</Text>
                <Text style={styles.loanDesc}>₹{loanTier?.loanAmount?.toLocaleString() || '10,000'} {T.kisanCredit}</Text>
              </View>
              <TouchableOpacity style={styles.loanApplyBtn} onPress={() => navigation.navigate('LoanApplication')}>
                <Text style={styles.loanApplyText}>{T.apply}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {newClaim ? (
            <>
              <Text style={styles.sectionTitle}>{T.activeClaims}</Text>
              <View style={[styles.taskCard, { borderColor: claimApproved ? Theme.accentGreen : Theme.accentEarth, borderWidth: 1 }]}>
                
                <View style={styles.taskCardHeader}>
                  <View style={[styles.taskIconBadge, { backgroundColor: claimApproved ? 'rgba(74, 107, 54, 0.15)' : 'rgba(212, 140, 62, 0.15)' }]}>
                    <MaterialCommunityIcons name={claimApproved ? "check-decagram" : "file-document-edit"} size={20} color={claimApproved ? Theme.accentGreen : Theme.accentEarth} />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.taskCardTitle}>{newClaim.analysisResult?.disease_name || 'Crop Damage Claim'}</Text>
                    <Text style={styles.taskCardSub}>ID: #CR-84920 • PMFBY Kharif</Text>
                  </View>
                </View>

                <View style={styles.timelineContainer}>
                  <View style={styles.timelineStep}>
                    <Ionicons name="checkmark-circle" size={16} color={Theme.accentGreen} />
                    <Text style={styles.timelineTextDone}>{T.aiVerified}</Text>
                  </View>
                  <View style={styles.timelineLine} />
                  
                  <View style={styles.timelineStep}>
                    <Ionicons name={claimApproved ? "checkmark-circle" : "time"} size={16} color={claimApproved ? Theme.accentGreen : Theme.accentEarth} />
                    <Text style={claimApproved ? styles.timelineTextDone : styles.timelineTextActive}>
                      {claimApproved ? T.agentApproved : T.agentReview}
                    </Text>
                  </View>
                  <View style={claimApproved ? styles.timelineLine : styles.timelineLinePending} />
                  
                  <View style={styles.timelineStep}>
                    <Ionicons name={claimApproved ? "checkmark-circle" : "ellipse-outline"} size={16} color={claimApproved ? Theme.accentEarth : Theme.textMuted} />
                    <Text style={claimApproved ? styles.timelineTextActive : styles.timelineTextPending}>
                      {claimApproved ? T.fundsReady : T.payout}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />
                
                <View style={styles.claimEstRow}>
                  <Text style={styles.claimEstText}>{T.estPayout}</Text>
                  <Text style={[styles.claimEstValue, claimApproved && { color: Theme.accentEarth }]}>₹{newClaim.analysisResult?.estimated_payout?.toLocaleString() || '42,800'}</Text>
                </View>
                
                {claimApproved && (
                  <TouchableOpacity style={[styles.loanApplyBtn, { marginTop: 16, width: '100%', alignItems: 'center' }]} onPress={() => navigation.navigate('LoanApplication')}>
                    <Text style={styles.loanApplyText}>{T.claimAdvance}</Text>
                  </TouchableOpacity>
                )}

              </View>
            </>
          ) : (
            <>
              <View style={styles.taskHeaderRow}>
                <Text style={styles.sectionTitle}>{T.tasks}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                  <Text style={styles.seeAllText}>{T.seeAll}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Camera')}>
                <View style={styles.taskCard}>
                  <View style={styles.taskCardHeader}>
                    <View style={styles.taskIconBadge}>
                      <Ionicons name="scan" size={16} color={Theme.textDark} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.taskCardTitle}>{T.morningScan}</Text>
                      <Text style={styles.taskCardSub}>{T.scanSub}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.taskImagePlaceholder}>
                    <LinearGradient colors={['rgba(74, 107, 54, 0.05)', 'rgba(74, 107, 54, 0.15)']} style={StyleSheet.absoluteFill} />
                    <MaterialCommunityIcons name="leaf" size={40} color={Theme.accentGreen} opacity={0.3} />
                  </View>

                  <View style={styles.taskFooter}>
                    <View style={styles.taskFooterItem}>
                      <Ionicons name="time" size={14} color={Theme.textDark} />
                      <Text style={styles.taskFooterText}>{T.highPriority}</Text>
                    </View>
                    <View style={styles.taskFooterItem}>
                      <Ionicons name="flag" size={14} color={Theme.accentEarth} />
                      <Text style={[styles.taskFooterText, { color: Theme.accentEarth }]}>{T.actionRequired}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* 🟢 CLAIM HISTORY DATA DISPLAYED BELOW THE TASKS/SCANNER */}
          <View style={[styles.taskHeaderRow, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>{T.claimHistory}</Text>
          </View>
          
          {isLoadingHistory ? (
             <ActivityIndicator size="large" color={Theme.accentEarth} style={{marginBottom: 24}}/>
          ) : claimHistory.length > 0 ? (
            claimHistory.map((claim) => (
              <View key={claim.id} style={[styles.taskCard, { borderColor: claim.status === 'approved' ? Theme.accentGreen : claim.status === 'rejected' ? '#D32F2F' : Theme.accentEarth, borderWidth: 1, padding: 16, marginBottom: 16 }]}>
                <View style={[styles.taskCardHeader, { marginBottom: 12 }]}>
                  <View style={[styles.taskIconBadge, { backgroundColor: claim.status === 'approved' ? 'rgba(74, 107, 54, 0.15)' : claim.status === 'rejected' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(212, 140, 62, 0.15)' }]}>
                    <MaterialCommunityIcons name={claim.status === 'approved' ? "check-decagram" : claim.status === 'rejected' ? "alert-circle" : "clock-outline"} size={20} color={claim.status === 'approved' ? Theme.accentGreen : claim.status === 'rejected' ? '#D32F2F' : Theme.accentEarth} />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.taskCardTitle}>{claim.crop || 'Crop'} Damage</Text>
                    <Text style={styles.taskCardSub}>ID: #CR-{claim.id.toString().padStart(4, '0')} • {claim.pathogen || 'Pending'}</Text>
                  </View>
                </View>
                
                <View style={[styles.divider, { marginVertical: 12 }]} />
                
                <View style={styles.claimEstRow}>
                  <Text style={styles.claimEstText}>
                    {claim.status === 'approved' ? "Payout Authorized" : claim.status === 'rejected' ? "Claim Denied" : "Pending Review"}
                  </Text>
                  <Text style={[styles.claimEstValue, { color: claim.status === 'approved' ? Theme.accentGreen : claim.status === 'rejected' ? '#D32F2F' : Theme.textDark }]}>
                    ₹{claim.estimated_payout?.toLocaleString() || '0'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
             <Text style={{textAlign: 'center', color: Theme.textMuted, marginBottom: 24}}>No past claims found.</Text>
          )}

        </Animated.ScrollView>

        <View style={styles.navWrapper}>
          <View style={styles.darkNavPill}>
            <TouchableOpacity style={styles.navBtn} onPress={() => Haptics.selectionAsync()}>
              <Ionicons name="home" size={24} color={Theme.accentEarth} />
            </TouchableOpacity>
            
            <Animated.View style={[styles.centerNavBtnWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity 
                style={[styles.centerNavBtn, isListening && styles.listeningActive]} 
                onPressIn={startRecording} 
                onPressOut={stopRecording}
                activeOpacity={0.9}
              >
                <MaterialCommunityIcons name={isListening ? "microphone" : "leaf"} size={32} color={Theme.cardBg} />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-outline" size={24} color={Theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {transcription !== '' && (
          <Animated.View style={{
            position: 'absolute', bottom: 110, left: 20, right: 20, 
            backgroundColor: 'rgba(26, 29, 22, 0.95)', borderRadius: 24, padding: 24,
            shadowColor: Theme.accentGreen, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15,
            borderWidth: 1, borderColor: 'rgba(74, 107, 54, 0.5)', alignItems: 'center'
          }}>
            {isListening ? (
              <ActivityIndicator size="small" color={Theme.accentEarth} style={{ marginBottom: 12 }} />
            ) : (
              <MaterialCommunityIcons name="robot-outline" size={28} color={Theme.accentGreen} style={{ marginBottom: 12 }} />
            )}
            <Text style={{
              color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center',
              fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic'
            }}>
              {transcription}
            </Text>
          </Animated.View>
        )}

      </SafeAreaView>

      <Modal visible={isLangModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={24} color={Theme.textDark} />
              </TouchableOpacity>
            </View>
            {LANGUAGES.map((lang, index) => (
              <TouchableOpacity key={lang.code} style={[styles.modalOption, langIndex === index && styles.modalOptionActive]} onPress={() => selectLanguage(index)}>
                <Text style={[styles.modalOptionText, langIndex === index && { color: Theme.accentEarth }]}>{lang.name}</Text>
                {langIndex === index && <Ionicons name="checkmark-circle" size={20} color={Theme.accentEarth} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showAgentWorkflow} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(26, 29, 22, 0.7)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: Theme.cardBg, borderRadius: 28, padding: 24, elevation: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: {width: 0, height: 15} }}>
            
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(212, 140, 62, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="robot-outline" size={32} color={Theme.accentEarth} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Theme.textDark, textAlign: 'center' }}>
                Autonomous Claim Verification
              </Text>
              <Text style={{ fontSize: 13, color: Theme.textMuted, fontWeight: '600', marginTop: 4 }}>
                LangGraph Multi-Agent Orchestration
              </Text>
            </View>

            {[
              { icon: 'camera-iris', name: 'Gemini Vision Agent', desc: 'Analyzing crop pathology & damage extent' },
              { icon: 'satellite-variant', name: 'NASA Climate Agent', desc: 'Cross-referencing historical weather APIs' },
              { icon: 'map-marker-radius', name: 'Spatial Fraud Agent', desc: 'Validating EXIF data against Land Katha' },
              { icon: 'file-document-check', name: 'FinTech Gateway', desc: 'Structuring PMFBY claim for disbursement' }
            ].map((agent, i) => {
              const isDone = activeAgentIndex > i;
              const isActive = activeAgentIndex === i;
              const isPending = activeAgentIndex < i;

              return (
                <View key={i} style={{ 
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, borderRadius: 16,
                  backgroundColor: isActive ? '#FFF' : isDone ? 'rgba(74, 107, 54, 0.05)' : '#F9F7F2',
                  borderWidth: 1, borderColor: isActive ? Theme.accentEarth : isDone ? 'rgba(74, 107, 54, 0.2)' : 'transparent',
                  shadowColor: isActive ? Theme.accentEarth : 'transparent', shadowOpacity: isActive ? 0.1 : 0, shadowRadius: 10,
                }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isActive ? 'rgba(212, 140, 62, 0.15)' : isDone ? Theme.accentGreen : '#EFECE4', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name={agent.icon} size={20} color={isActive ? Theme.accentEarth : isDone ? '#FFF' : Theme.textMuted} />
                  </View>
                  
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: isActive || isDone ? '700' : '600', color: isPending ? Theme.textMuted : Theme.textDark }}>
                      {agent.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                      {agent.desc}
                    </Text>
                  </View>

                  <View style={{ width: 24, alignItems: 'center' }}>
                    {isPending && <Ionicons name="time" size={18} color="#D8D8D8" />}
                    {isActive && <ActivityIndicator size="small" color={Theme.accentEarth} />}
                    {isDone && <Ionicons name="checkmark-circle" size={22} color={Theme.accentGreen} />}
                  </View>
                </View>
              );
            })}

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: Theme.bgOverlayBottom }, 
  scrollContent: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 20 : 0, paddingBottom: 160 },
  header: { marginBottom: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 26, color: Theme.textDark, fontWeight: '700', letterSpacing: -0.5, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 13, color: Theme.textMuted, fontWeight: '600', marginLeft: 4 },
  notificationBtn: { padding: 8 },
  notificationDot: { position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.accentEarth },
  weatherBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hugeTemp: { fontSize: 56, fontWeight: '800', color: Theme.textDark, letterSpacing: -2 },
  weatherConditionRow: { flexDirection: 'row', alignItems: 'center', marginTop: -4 },
  weatherCondition: { fontSize: 14, color: Theme.textMuted, fontWeight: '600', marginLeft: 6 },
  miniGrid: { flexDirection: 'row', gap: 12 },
  miniGridItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  miniGridText: { fontSize: 13, fontWeight: '700', color: Theme.textDark, marginLeft: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Theme.textDark, marginBottom: 16 },
  servicesRow: { flexDirection: 'row', marginBottom: 32, marginHorizontal: -24, paddingHorizontal: 24 },
  commodityItem: { alignItems: 'center', marginRight: 24 },
  commodityIconBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: Theme.cardBg, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: {width: 0, height: 4} },
  commodityText: { fontSize: 13, fontWeight: '600', color: Theme.textMuted },
  scoreCard: { backgroundColor: Theme.cardBg, borderRadius: 24, padding: 24, marginBottom: 32, elevation: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: Theme.textDark },
  scoreDisplayRow: { flexDirection: 'row', alignItems: 'baseline' },
  scoreHuge: { fontSize: 48, fontWeight: '800', color: Theme.textDark },
  scoreSub: { fontSize: 16, color: Theme.textMuted, fontWeight: '600', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#F1EFE8', marginVertical: 20 },
  loanOfferRow: { flexDirection: 'row', alignItems: 'center' },
  loanIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(212, 140, 62, 0.15)', justifyContent: 'center', alignItems: 'center' },
  loanTitle: { fontSize: 14, fontWeight: '700', color: Theme.textDark },
  loanDesc: { fontSize: 12, color: Theme.textMuted, fontWeight: '500', marginTop: 2 },
  loanApplyBtn: { backgroundColor: Theme.accentEarth, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, justifyContent: 'center' },
  loanApplyText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  taskHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAllText: { fontSize: 14, color: Theme.textMuted, fontWeight: '600' },
  taskCard: { backgroundColor: Theme.cardBg, borderRadius: 24, padding: 20, marginBottom: 24, elevation: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  taskCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  taskIconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1EFE8', justifyContent: 'center', alignItems: 'center' },
  taskCardTitle: { fontSize: 16, fontWeight: '700', color: Theme.textDark },
  taskCardSub: { fontSize: 13, color: Theme.textMuted, fontWeight: '500', marginTop: 2 },
  taskImagePlaceholder: { height: 120, borderRadius: 16, backgroundColor: '#EFECE4', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 16 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskFooterItem: { flexDirection: 'row', alignItems: 'center' },
  taskFooterText: { fontSize: 12, fontWeight: '700', color: Theme.textDark, marginLeft: 6 },
  claimEstRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claimEstText: { fontSize: 14, color: Theme.textMuted, fontWeight: '600' },
  claimEstValue: { fontSize: 18, color: Theme.accentGreen, fontWeight: '800' },
  navWrapper: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  darkNavPill: { width: 220, height: 70, borderRadius: 35, backgroundColor: Theme.navDark, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  navBtn: { padding: 8 },
  centerNavBtnWrapper: { position: 'absolute', top: -16, left: 110 - 32 },
  centerNavBtn: { width: 64, height: 64, borderRadius: 36, backgroundColor: Theme.accentGreen, justifyContent: 'center', alignItems: 'center', shadowColor: Theme.accentGreen, shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, borderWidth: 4, borderColor: Theme.bgOverlayBottom },
  listeningActive: { backgroundColor: '#D32F2F', shadowColor: '#D32F2F', borderColor: '#FFCDD2' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: Theme.cardBg, borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Theme.textDark },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1EFE8' },
  modalOptionActive: { backgroundColor: 'rgba(212, 140, 62, 0.05)', borderRadius: 12, paddingHorizontal: 12, marginHorizontal: -12, borderBottomWidth: 0 },
  modalOptionText: { fontSize: 16, color: Theme.textDark, fontWeight: '600' },
  timelineContainer: { marginTop: 8 },
  timelineStep: { flexDirection: 'row', alignItems: 'center' },
  timelineLine: { width: 2, height: 20, backgroundColor: Theme.accentGreen, marginLeft: 7, marginVertical: 4 },
  timelineLinePending: { width: 2, height: 20, backgroundColor: '#EFECE4', marginLeft: 7, marginVertical: 4 },
  timelineTextDone: { fontSize: 13, color: Theme.textDark, fontWeight: '700', marginLeft: 8 },
  timelineTextActive: { fontSize: 13, color: Theme.accentEarth, fontWeight: '700', marginLeft: 8 },
  timelineTextPending: { fontSize: 13, color: Theme.textMuted, fontWeight: '500', marginLeft: 8 }
});