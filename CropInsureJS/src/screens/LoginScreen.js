import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions, 
  ImageBackground,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const Theme = {
  bgOverlayTop: 'rgba(212, 140, 62, 0.4)',     
  bgOverlayBottom: 'rgba(33, 43, 26, 0.85)',   
  cardBg: '#FFFFFF',                           
  textDark: '#1A1D16',                         
  textMuted: '#8A9681',                        
  accentGreen: '#4A6B36',                      
  inputBg: '#F7F7F7',                          
};

export default function LoginScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();
  }, []);

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSubmitting) return;

    if (step === 1) {
      if (phone.length < 10) {
        Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number.");
        return;
      }

      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
      setIsSubmitting(false);

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Could Not Send OTP", error.message);
        return;
      }

      setStep(2);
    } else {
      if (otp.length < 4) {
        Alert.alert("Invalid OTP", "Please enter the OTP you received.");
        return;
      }

      setIsSubmitting(true);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: 'sms',
      });

      if (error) {
        setIsSubmitting(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Authentication Failed", error.message);
        return;
      }

      const { data: farmer } = await supabase
        .from('farmers')
        .select('is_verified')
        .eq('id', data.user.id)
        .single();

      setIsSubmitting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace(farmer?.is_verified ? 'Dashboard' : 'Verification');
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80' }} 
      style={styles.rootContainer}
    >
      <LinearGradient 
        colors={[Theme.bgOverlayTop, 'transparent', Theme.bgOverlayBottom]} 
        locations={[0, 0.4, 1]} 
        style={StyleSheet.absoluteFill} 
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              
              <View style={styles.brandingHeader}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="sprout" size={36} color={Theme.accentGreen} />
                </View>
                <Text style={styles.brandTitle}>CropInsure</Text>
                <Text style={styles.brandSubtitle}>The Future of Farming</Text>
              </View>

              <View style={styles.loginCard}>
                <Text style={styles.cardTitle}>{step === 1 ? 'Welcome Back' : 'Verify Account'}</Text>
                <Text style={styles.cardSubtitle}>
                  {step === 1 ? 'Enter your mobile number to continue.' : `Enter the 4-digit OTP sent to +91 ${phone}`}
                </Text>

                {step === 1 ? (
                  <View style={styles.inputWrapper}>
                    <View style={styles.prefixBox}>
                      <Text style={styles.prefixText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Mobile Number"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="numeric"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                ) : (
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter OTP"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="numeric"
                      maxLength={6}
                      value={otp}
                      onChangeText={setOtp}
                    />
                  </View>
                )}

                <TouchableOpacity activeOpacity={0.8} onPress={handleNext} style={styles.mainBtn} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.mainBtnText}>{step === 1 ? 'Get OTP' : 'Verify & Login'}</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>

                {step === 2 && (
                  <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Change mobile number</Text>
                  </TouchableOpacity>
                )}
              </View>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  rootContainer: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', 
  },
  contentContainer: { 
    paddingHorizontal: 24, 
    alignItems: 'center',
    width: '100%',
    paddingBottom: 40 
  },
  
  brandingHeader: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  iconBox: { 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 }
  },
  brandTitle: { 
    fontSize: 34, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    letterSpacing: -0.5, 
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' 
  },
  brandSubtitle: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: 'rgba(255, 255, 255, 0.85)', 
    marginTop: 4 
  },

  loginCard: { 
    backgroundColor: Theme.cardBg, 
    borderRadius: 32, 
    padding: 32, 
    width: '100%',
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowRadius: 30, 
    shadowOffset: { width: 0, height: 15 },
    elevation: 10
  },
  cardTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: Theme.textDark, 
    marginBottom: 8 
  },
  cardSubtitle: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: Theme.textMuted, 
    marginBottom: 32, 
    lineHeight: 20 
  },

  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Theme.inputBg, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#EFEFEF', 
    marginBottom: 24, 
    paddingHorizontal: 16, 
    height: 64 
  },
  prefixBox: { 
    borderRightWidth: 1, 
    borderRightColor: '#D8D8D8', 
    paddingRight: 16, 
    marginRight: 16 
  },
  prefixText: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: Theme.textDark 
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    fontSize: 18, 
    fontWeight: '600', 
    color: Theme.textDark, 
    height: '100%' 
  },

  mainBtn: { 
    backgroundColor: Theme.accentGreen, 
    borderRadius: 16, 
    height: 60, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: Theme.accentGreen, 
    shadowOpacity: 0.25, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 6 } 
  },
  mainBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800', 
    marginRight: 8 
  },
  
  backBtn: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  backBtnText: { 
    color: Theme.textMuted, 
    fontSize: 14, 
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});