import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const Theme = {
  bgOverlayTop: '#FDECCC',       
  bgOverlayBottom: '#F9F7F2',    
  cardBg: '#FFFFFF',             
  textDark: '#212B1A',           
  textMuted: '#8A9681',          
  accentEarth: '#D48C3E',        
  accentGreen: '#4A6B36',        
  danger: '#D32F2F',
};

const INITIAL_MARKET_DATA = [
  { id: '1', icon: 'sprout', currentPriceNum: 2450, currentPrice: '₹2,450', trend: '+2.4%', isUp: true, history: [40, 60, 45, 80, 65, 90, 100] },
  { id: '2', icon: 'rice', currentPriceNum: 3200, currentPrice: '₹3,200', trend: '+1.1%', isUp: true, history: [70, 65, 75, 85, 80, 95, 90] },
  { id: '3', icon: 'corn', currentPriceNum: 1850, currentPrice: '₹1,850', trend: '-0.8%', isUp: false, history: [90, 85, 70, 60, 55, 65, 50] },
];

const TRANSLATIONS = {
  0: { 
    title: "Market Trends", live: "Live Update • Just now", regional: "Regional Prices", unit: "/ quintal", 
    crops: { '1': 'Wheat', '2': 'Rice', '3': 'Corn' }, 
    cities: ["Mandi, Punjab", "Karnal, Haryana", "Indore, MP"] 
  },
  1: { 
    title: "बाजार के रुझान", live: "लाइव अपडेट • अभी-अभी", regional: "क्षेत्रीय कीमतें", unit: "/ क्विंटल", 
    crops: { '1': 'गेहूँ', '2': 'चावल', '3': 'मक्का' }, 
    cities: ["मंडी, पंजाब", "करनाल, हरियाणा", "इंदौर, एमपी"] 
  },
  2: { 
    title: "ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳು", live: "ಲೈವ್ ಅಪ್‌ಡೇಟ್ • ಈಗಷ್ಟೇ", regional: "ಪ್ರಾದೇಶಿಕ ಬೆಲೆಗಳು", unit: "/ ಕ್ವಿಂಟಾಲ್‌ಗೆ", 
    crops: { '1': 'ಗೋಧಿ', '2': 'ಅಕ್ಕಿ', '3': 'ಜೋಳ' }, 
    cities: ["ಮಂಡಿ, ಪಂಜಾಬ್", "ಕರ್ನಾಲ್, ಹರಿಯಾಣ", "ಇಂದೋರ್, ಎಂಪಿ"] 
  }
};

export default function MarketScreen({ navigation }) {
  const { langIndex } = useContext(LanguageContext);
  const T = TRANSLATIONS[langIndex];

  const [liveData, setLiveData] = useState(INITIAL_MARKET_DATA);
  const [selectedItem, setSelectedItem] = useState(INITIAL_MARKET_DATA[0]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const chartAnims = useRef(INITIAL_MARKET_DATA[0].history.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const liveTimer = setInterval(() => {
      setLiveData(currentData => {
        const newData = currentData.map(item => {
          const fluctuation = Math.floor(Math.random() * 21) - 10; 
          const newPriceNum = item.currentPriceNum + fluctuation;
          const formattedPrice = `₹${newPriceNum.toLocaleString('en-IN')}`;
          
          return {
            ...item,
            currentPriceNum: newPriceNum,
            currentPrice: formattedPrice,
            isUp: fluctuation >= 0,
            trend: fluctuation >= 0 ? `+${(Math.random() * 2).toFixed(1)}%` : `-${(Math.random() * 2).toFixed(1)}%`
          };
        });
        
        setSelectedItem(prev => newData.find(d => d.id === prev.id));
        return newData;
      });
    }, 3000); 

    return () => clearInterval(liveTimer);
  }, []);

  useEffect(() => {
    chartAnims.forEach(anim => anim.setValue(0));
    Animated.stagger(100, chartAnims.map((anim, index) => 
      Animated.timing(anim, {
        toValue: selectedItem.history[index], 
        duration: 800,
        useNativeDriver: false, 
      })
    )).start();
  }, [selectedItem.id]);

  const handleSelect = (item) => {
    Haptics.selectionAsync();
    setSelectedItem(item);
  };

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom, Theme.bgOverlayBottom]} locations={[0, 0.2, 1]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{T.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {liveData.map((item) => {
              const isActive = selectedItem.id === item.id;
              return (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={0.8}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => handleSelect(item)}
                >
                  <MaterialCommunityIcons name={item.icon} size={20} color={isActive ? '#FFF' : Theme.textMuted} />
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {T.crops[item.id]}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <View style={styles.priceCard}>
            <View style={styles.priceHeaderRow}>
              <View>
                <Text style={styles.commodityName}>{T.crops[selectedItem.id]}</Text>
                <Text style={styles.liveUpdateText}>{T.live}</Text>
              </View>
              <View style={[styles.trendBadge, { backgroundColor: selectedItem.isUp ? 'rgba(74, 107, 54, 0.15)' : 'rgba(211, 47, 47, 0.1)' }]}>
                <Ionicons name={selectedItem.isUp ? "trending-up" : "trending-down"} size={16} color={selectedItem.isUp ? Theme.accentGreen : Theme.danger} />
                <Text style={[styles.trendText, { color: selectedItem.isUp ? Theme.accentGreen : Theme.danger }]}>{selectedItem.trend}</Text>
              </View>
            </View>

            <View style={styles.priceDisplayRow}>
              <Text style={styles.hugePrice}>{selectedItem.currentPrice}</Text>
              <Text style={styles.priceUnit}>{T.unit}</Text>
            </View>

            <View style={styles.chartContainer}>
              {selectedItem.history.map((val, index) => (
                <View key={index} style={styles.barWrapper}>
                  <Animated.View 
                    style={[
                      styles.chartBar, 
                      { 
                        height: chartAnims[index].interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%']
                        }),
                        backgroundColor: selectedItem.isUp ? Theme.accentGreen : Theme.accentEarth
                      }
                    ]} 
                  />
                  <Text style={styles.chartLabel}>{'SMTWTFS'[index]}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>{T.regional}</Text>
          <View style={styles.listCard}>
            <View style={styles.listItem}>
              <Text style={styles.listCity}>{T.cities[0]}</Text>
              <Text style={styles.listPrice}>₹2,460</Text>
            </View>
            <View style={styles.listDivider} />
            <View style={styles.listItem}>
              <Text style={styles.listCity}>{T.cities[1]}</Text>
              <Text style={styles.listPrice}>₹2,445</Text>
            </View>
            <View style={styles.listDivider} />
            <View style={styles.listItem}>
              <Text style={styles.listCity}>{T.cities[2]}</Text>
              <Text style={styles.listPrice}>₹2,430</Text>
            </View>
          </View>

        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: Theme.bgOverlayBottom },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.cardBg, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.textDark },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  categoryRow: { flexDirection: 'row', marginBottom: 24, marginHorizontal: -20, paddingHorizontal: 20 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, marginRight: 12, borderWidth: 1, borderColor: '#F1EFE8' },
  categoryPillActive: { backgroundColor: Theme.accentEarth, borderColor: Theme.accentEarth },
  categoryText: { fontSize: 14, fontWeight: '700', color: Theme.textMuted, marginLeft: 6 },
  categoryTextActive: { color: '#FFF' },
  priceCard: { backgroundColor: Theme.cardBg, borderRadius: 24, padding: 24, marginBottom: 32, elevation: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  priceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  commodityName: { fontSize: 22, fontWeight: '800', color: Theme.textDark },
  liveUpdateText: { fontSize: 12, color: Theme.textMuted, fontWeight: '600', marginTop: 4 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  trendText: { fontSize: 13, fontWeight: '800', marginLeft: 4 },
  priceDisplayRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 20, marginBottom: 30 },
  hugePrice: { fontSize: 44, fontWeight: '900', color: Theme.textDark, letterSpacing: -1 },
  priceUnit: { fontSize: 16, color: Theme.textMuted, fontWeight: '600', marginLeft: 8 },
  chartContainer: { height: 160, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1EFE8' },
  barWrapper: { alignItems: 'center', flex: 1 },
  chartBar: { width: 12, borderRadius: 6, backgroundColor: Theme.accentGreen },
  chartLabel: { fontSize: 12, color: Theme.textMuted, fontWeight: '700', marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Theme.textDark, marginBottom: 16 },
  listCard: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  listCity: { fontSize: 15, color: Theme.textDark, fontWeight: '600' },
  listPrice: { fontSize: 16, color: Theme.accentEarth, fontWeight: '800' },
  listDivider: { height: 1, backgroundColor: '#F1EFE8', marginVertical: 8 },
});