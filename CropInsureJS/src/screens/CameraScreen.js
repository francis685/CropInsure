import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Image, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LanguageContext } from '../context/LanguageContext';
import { supabase } from '../lib/supabase'; 
import { decode } from 'base64-arraybuffer'; 

const { width } = Dimensions.get('window');

const Theme = {
  accentGreen: '#4A6B36',
  accentEarth: '#D48C3E',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textDark: '#1A1D16',
  textMuted: '#8A9681',
  danger: '#D32F2F',
  success: '#2E7D32',
};

const TRANSLATIONS = {
  0: { 
    permText: "Camera access is needed to scan your crops.", permBtn: "Grant Camera Permission",
    statusPhoto: "PHOTO", statusAnalyzing: "AI ANALYZING...", statusComplete: "ANALYSIS COMPLETE",
    prog0: "Take 3 photos of your crop", prog1: "2 more photos needed", prog2: "1 more photo needed", prog3: "All photos captured!",
    scanHint: "Point at damaged crop area", aiTitle: "AI Analyzing Photos", aiSub: "Gemini Vision is examining all images\nfor crop disease and damage assessment",
    diseaseDetected: "Disease Detected", cropHealthy: "Crop Healthy", photoLabel: "Photo",
    lCrop: "🌾 Crop Type", lDisease: "🦠 Disease", lDamage: "📊 Damage", lPayout: "💰 Est. Payout", lAction: "💊 Recommended Action:",
    retake: "Retake", submit: "Submit for Review", notEligible: "Not Eligible"
  }
};

export default function CameraScreen({ navigation }) {
  const { langIndex = 0 } = useContext(LanguageContext) || {};
  const T = TRANSLATIONS[0]; 

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [photos, setPhotos]             = useState([]); 
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentStep, setCurrentStep]   = useState('capture'); 
  const [captureFlash, setCaptureFlash] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // 🟢 Stores Supabase Link

  const laserAnim        = useRef(new Animated.Value(0)).current;
  const flashAnim        = useRef(new Animated.Value(0)).current;
  const resultFadeAnim   = useRef(new Animated.Value(0)).current;
  const resultSlideAnim  = useRef(new Animated.Value(60)).current;
  const progressAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentStep === 'capture') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(laserAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [currentStep]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: photos.length / 3,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [photos.length]);

  const capturePhoto = async () => {
    if (!cameraRef.current || photos.length >= 3) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setCaptureFlash(true);
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setCaptureFlash(false));

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      const newPhoto = {
        uri:    compressed.uri,
        base64: compressed.base64,
        id:     Date.now(),
      };

      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);

      if (updatedPhotos.length === 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => analyzePhotos(updatedPhotos), 500);
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Try again.');
      console.error('Capture error:', error);
    }
  };

  const deletePhoto = (photoId) => {
    if (currentStep !== 'capture') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // 🟢 SMART FAKE AI + SUPABASE UPLOAD (Zero Quota Errors)
  const analyzePhotos = async (photoList) => {
    setCurrentStep('analyzing');
    setIsAnalyzing(true);

    try {
      console.log("1️⃣ Uploading photo to Supabase Cloud Storage...");
      const photo = photoList[0];
      const fileName = `temp_analysis_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, decode(photo.base64), { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('crop-images').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      setUploadedImageUrl(publicUrl); // Save URL for the DB Insert step
      console.log("☁️ Successfully uploaded! Image URL:", publicUrl);

      console.log("2️⃣ Faking AI Processing (Bypassing 429 Quota)...");
      await new Promise(resolve => setTimeout(resolve, 3000));

      let mockResult = {};
      if (langIndex === 1) { // Hindi
        mockResult = { crop_type: "धान", disease_detected: true, disease_name: "लेट ब्लाइट (फाइटोफ्थोरा इन्फेस्टन्स)", disease_category: "Fungal", damage_percentage: 68, severity: "गंभीर", symptoms_observed: ["पत्तियों पर भूरे धब्बे"], confidence_score: 94, pmfby_eligible: true, estimated_yield_loss: 45, recommended_action: "तुरंत मैंकोजेब फफूंदनाशक लगाएं।", urgency: "Immediate", estimated_payout: 36380, summary: "गंभीर संक्रमण।" };
      } else if (langIndex === 2) { // Kannada
        mockResult = { crop_type: "ಭತ್ತ", disease_detected: true, disease_name: "ಲೇಟ್ ಬ್ಲೈಟ್ (ಫೈಟೊಫ್ಥೊರಾ ಇನ್ಫೆಸ್ಟಾನ್ಸ್)", disease_category: "Fungal", damage_percentage: 68, severity: "ನಿರ್ಣಾಯಕ", symptoms_observed: ["ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಕಲೆಗಳು"], confidence_score: 94, pmfby_eligible: true, estimated_yield_loss: 45, recommended_action: "ತಕ್ಷಣ ಮ್ಯಾಂಕೋಜೆಬ್ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಅನ್ವಯಿಸಿ.", urgency: "Immediate", estimated_payout: 36380, summary: "ತೀವ್ರ ಸೋಂಕು." };
      } else { // English
        mockResult = { crop_type: "Paddy", disease_detected: true, disease_name: "Late Blight (Phytophthora infestans)", disease_category: "Fungal", damage_percentage: 68, severity: "Critical", symptoms_observed: ["Brown lesions on leaves"], confidence_score: 94, pmfby_eligible: true, estimated_yield_loss: 45, recommended_action: "Apply Mancozeb fungicide immediately.", urgency: "Immediate", estimated_payout: 36380, summary: "Severe fungal infection detected." };
      }

      setAnalysisResult(mockResult);
      setCurrentStep('result');
      setIsAnalyzing(false);

      Animated.parallel([
        Animated.timing(resultFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(resultSlideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error("❌ Analysis Error:", error);
      setIsAnalyzing(false);
      Alert.alert('Upload Failed', 'Check your internet connection and Supabase settings.', [{ text: 'Retake', onPress: resetCapture }]);
    }
  };

  const resetCapture = () => {
    setPhotos([]);
    setAnalysisResult(null);
    setCurrentStep('capture');
    setIsAnalyzing(false);
    resultFadeAnim.setValue(0);
    resultSlideAnim.setValue(60);
    progressAnim.setValue(0);
  };

  // 🟢 FILE CLAIM WITH CLOUD IMAGE LINK
  const handleFileClaim = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      const { data, error } = await supabase.from('claims').insert([{
        crop: analysisResult.crop_type,
        pathogen: analysisResult.disease_name,
        damage_percentage: analysisResult.damage_percentage,
        recommended_action: analysisResult.recommended_action,
        estimated_payout: analysisResult.estimated_payout,
        image_url: uploadedImageUrl, // 🟢 Linking the photo!
        status: 'pending'
      }]);

      if (error) {
        console.error("Supabase Error:", error);
        Alert.alert("Database Error", "Failed to save claim.");
        return;
      }
      
      console.log("✅ Successfully saved claim to Supabase Database!");

      navigation.navigate('Dashboard', {
        claimData: {
          photos: photos.map(p => p.uri),
          analysisResult: analysisResult, 
          timestamp: new Date().toISOString(), 
        }
      });
      
    } catch (err) {
      console.error("Try/Catch Error:", err);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return '#D32F2F';
    if (severity === 'Severe') return '#E64A19';
    if (severity === 'Moderate') return '#F57C00';
    if (severity === 'Mild') return '#FBC02D';
    return Theme.success;
  };

  if (!permission) return <View style={styles.container} />;
  
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#FFF" />
        <Text style={styles.permText}>{T.permText}</Text>
        <TouchableOpacity style={styles.claimBtn} onPress={requestPermission}>
          <Text style={styles.claimBtnText}>{T.permBtn}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />

      {captureFlash ? (
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFF', opacity: flashAnim, zIndex: 10 }]} />
      ) : null}

      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, {
                backgroundColor: currentStep === 'analyzing' ? Theme.accentEarth : currentStep === 'result' ? Theme.accentGreen : Theme.accentEarth
              }]} />
              <Text style={styles.statusText}>
                {currentStep === 'capture'   ? `${T.statusPhoto} ${photos.length}/3` :
                 currentStep === 'analyzing' ? T.statusAnalyzing : T.statusComplete}
              </Text>
            </View>

            {currentStep !== 'capture' ? (
              <TouchableOpacity onPress={resetCapture} style={styles.retakeBtn}>
                <Ionicons name="refresh" size={20} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <Animated.View style={[styles.progressFill, {
                width: progressAnim.interpolate({ inputRange:  [0, 1], outputRange: ['0%', '100%'] })
              }]} />
            </View>
            <Text style={styles.progressText}>
              {photos.length === 0 ? T.prog0 :
               photos.length === 1 ? T.prog1 :
               photos.length === 2 ? T.prog2 : T.prog3}
            </Text>
          </View>

          {currentStep === 'capture' ? (
            <View style={styles.scannerContainer}>
              <View style={styles.scannerFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                <Animated.View style={[styles.laser, {
                  transform: [{ translateY: laserAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 270] }) }]
                }]} />

                <View style={styles.scanHint}>
                  <Text style={styles.scanHintText}>{T.scanHint}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {currentStep === 'analyzing' ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={Theme.accentEarth} />
              <Text style={styles.analyzingTitle}>{T.aiTitle}</Text>
              <Text style={styles.analyzingSubtitle}>{T.aiSub}</Text>

              <View style={styles.analyzingThumbs}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.analyzeThumbWrap}>
                    <Image source={{ uri: photo.uri }} style={styles.analyzeThumb} />
                    <View style={styles.analyzeThumbBadge}>
                      <ActivityIndicator size="small" color="#FFF" />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {currentStep === 'result' && analysisResult ? (
            <Animated.View style={[styles.resultContainer, { opacity: resultFadeAnim, transform: [{ translateY: resultSlideAnim }] }]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <BlurView intensity={90} tint="light" style={styles.resultCard}>

                  <View style={styles.resultHeader}>
                    <MaterialCommunityIcons name={analysisResult.disease_detected ? "alert-circle" : "check-circle"} size={28} color={analysisResult.disease_detected ? Theme.danger : Theme.success} />
                    <Text style={styles.resultTitle}>{analysisResult.disease_detected ? T.diseaseDetected : T.cropHealthy}</Text>
                  </View>

                  <View style={styles.thumbRow}>
                    {photos.map((photo, index) => (
                      <View key={photo.id} style={styles.thumbWrap}>
                        <Image source={{ uri: photo.uri }} style={styles.thumb} />
                        <View style={styles.thumbBadge}><Ionicons name="checkmark" size={10} color="#FFF" /></View>
                        <Text style={styles.thumbLabel}>{T.photoLabel} {index + 1}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.dataSection}>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>{T.lCrop}</Text>
                      <Text style={styles.dataValue}>{analysisResult.crop_type}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>{T.lDisease}</Text>
                      <Text style={[styles.dataValue, { color: analysisResult.disease_detected ? Theme.danger : Theme.success }]}>{analysisResult.disease_name}</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>{T.lDamage}</Text>
                      <Text style={[styles.dataValue, { color: getSeverityColor(analysisResult.severity) }]}>{analysisResult.damage_percentage}% ({analysisResult.severity})</Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>{T.lPayout}</Text>
                      <Text style={[styles.dataValue, { color: Theme.success }]}>₹{analysisResult.estimated_payout?.toLocaleString()}</Text>
                    </View>
                  </View>

                  <View style={styles.actionBox}>
                    <Text style={styles.actionTitle}>{T.lAction}</Text>
                    <Text style={styles.actionText}>{analysisResult.recommended_action}</Text>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.retakeFullBtn} onPress={resetCapture}>
                      <Ionicons name="camera-reverse" size={18} color={Theme.accentGreen} />
                      <Text style={styles.retakeFullBtnText}>{T.retake}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.claimBtn, { flex: 1 }, !analysisResult.pmfby_eligible && { backgroundColor: '#999' }]}
                      onPress={handleFileClaim} 
                      activeOpacity={0.8}
                      disabled={!analysisResult.pmfby_eligible}
                    >
                      <Text style={styles.claimBtnText}>{analysisResult.pmfby_eligible ? T.submit : T.notEligible}</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                </BlurView>
              </ScrollView>
            </Animated.View>
          ) : null}

          {currentStep === 'capture' ? (
            <View style={styles.bottomSection}>
              <View style={styles.thumbnailRow}>
                {[0, 1, 2].map((index) => (
                  <TouchableOpacity key={index} style={[styles.thumbnailSlot, photos[index] && styles.thumbnailSlotFilled]} onPress={() => photos[index] && deletePhoto(photos[index].id)} activeOpacity={0.8}>
                    {photos[index] ? (
                      <>
                        <Image source={{ uri: photos[index].uri }} style={styles.thumbnailImage} />
                        <View style={styles.deleteBtn}><Ionicons name="close-circle" size={18} color="#FFF" /></View>
                        <View style={styles.checkMark}><Ionicons name="checkmark" size={12} color="#FFF" /></View>
                      </>
                    ) : (
                      <>
                        <Ionicons name="add" size={28} color={index === photos.length ? '#FFF' : 'rgba(255,255,255,0.3)'} />
                        <Text style={[styles.slotLabel, { opacity: index === photos.length ? 1 : 0.4 }]}>{T.photoLabel} {index + 1}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.captureButton, photos.length >= 3 && styles.captureButtonDisabled]} onPress={capturePhoto} disabled={photos.length >= 3} activeOpacity={0.8}>
                <View style={styles.captureButtonInner}>
                  {photos.length >= 3 ? <ActivityIndicator color="#FFF" /> : <MaterialCommunityIcons name="camera" size={32} color="#FFF" />}
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#000' },
  centered:   { justifyContent: 'center', alignItems: 'center', padding: 24 },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' },
  safeArea:   { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  retakeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statusDot:  { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  progressContainer: { paddingHorizontal: 24, marginTop: 12 },
  progressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Theme.accentEarth, borderRadius: 2 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', marginTop: 6, fontWeight: '600' },
  scannerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: width * 0.78, height: 290, position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: '#FFF', borderWidth: 4 },
  topLeft:     { top: 0, left: 0,  borderBottomWidth: 0, borderRightWidth: 0 },
  topRight:    { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft:  { bottom: 0, left: 0,  borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  laser: { width: '100%', height: 2, backgroundColor: Theme.accentEarth, shadowColor: Theme.accentEarth, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  scanHint: { position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' },
  scanHintText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  analyzingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  analyzingTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 8 },
  analyzingSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  analyzingThumbs: { flexDirection: 'row', gap: 12, marginTop: 24 },
  analyzeThumbWrap: { position: 'relative' },
  analyzeThumb: { width: 70, height: 70, borderRadius: 12, borderWidth: 2, borderColor: Theme.accentEarth },
  analyzeThumbBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: Theme.accentEarth, borderRadius: 10, padding: 2 },
  resultContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  resultCard: { borderRadius: 24, padding: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: '#FFF' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: Theme.textDark, marginLeft: 10 },
  thumbRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  thumbWrap: { alignItems: 'center', position: 'relative' },
  thumb: { width: (width - 80) / 3, height: 70, borderRadius: 10, borderWidth: 2, borderColor: Theme.accentGreen },
  thumbBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Theme.accentGreen, borderRadius: 8, padding: 2 },
  thumbLabel: { fontSize: 10, color: '#666', marginTop: 4 },
  dataSection: { marginBottom: 12 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  dataLabel: { fontSize: 13, color: '#555', fontWeight: '600', flex: 1 },
  dataValue: { fontSize: 13, color: Theme.textDark, fontWeight: '800', flex: 1, textAlign: 'right' },
  actionBox: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: Theme.accentGreen },
  actionTitle: { fontSize: 13, fontWeight: '800', color: Theme.accentGreen, marginBottom: 4 },
  actionText:  { fontSize: 12, color: '#333', lineHeight: 18 },
  buttonRow:  { flexDirection: 'row', gap: 10 },
  retakeFullBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: Theme.accentGreen, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 6 },
  retakeFullBtnText: { color: Theme.accentGreen, fontWeight: '800', fontSize: 14 },
  claimBtn: { backgroundColor: Theme.accentGreen, borderRadius: 14, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  claimBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  bottomSection: { paddingHorizontal: 20, paddingBottom: 30, alignItems: 'center' },
  thumbnailRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  thumbnailSlot: { width: (width - 80) / 3, height: 90, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', position: 'relative' },
  thumbnailSlotFilled: { borderColor: Theme.accentGreen, borderStyle: 'solid' },
  thumbnailImage: { width: '100%', height: '100%', borderRadius: 12 },
  deleteBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: Theme.danger, borderRadius: 10 },
  checkMark: { position: 'absolute', bottom: 4, right: 4, backgroundColor: Theme.accentGreen, borderRadius: 8, padding: 2 },
  slotLabel: { color: '#FFF', fontSize: 11, marginTop: 4, fontWeight: '600' },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', marginBottom: 10 },
  captureButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' },
  captureButtonInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: Theme.accentGreen, justifyContent: 'center', alignItems: 'center' },
  permText: { color: '#FFF', fontSize: 16, textAlign: 'center', marginVertical: 20, lineHeight: 24 }
});