import React, { useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriContext } from '../context/AgriContext';

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

export default function AgriScoreScreen({ navigation }) {
  const { agriScore, loanTier, scoreLog, completedStages, CROP_STAGES, currentWeek } = useContext(AgriContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const activeStageId = `W${currentWeek}`;

  return (
    <View style={styles.rootContainer}>
      <LinearGradient colors={[Theme.bgOverlayTop, Theme.bgOverlayBottom]} locations={[0, 0.3]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AgriScore</Text>
          <View style={{ width: 44 }} />
        </View>

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          <View style={styles.scoreCard}>
            <Text style={styles.scoreHuge}>{agriScore}</Text>
            <Text style={styles.scoreSub}>/ 900</Text>
            <View style={styles.tierBadge}>
              <MaterialCommunityIcons name={loanTier.icon} size={16} color={Theme.accentEarth} />
              <Text style={styles.tierText}>{loanTier.label}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>7-Week Compliance Cycle</Text>
          <View style={styles.stagesCard}>
            {CROP_STAGES.map((stage, index) => {
              const isDone = completedStages.includes(stage.id);
              const isActive = !isDone && stage.id === activeStageId;
              const isLast = index === CROP_STAGES.length - 1;

              return (
                <View key={stage.id} style={styles.stageRow}>
                  <View style={styles.stageMarkerColumn}>
                    <View style={[
                      styles.stageDot,
                      isDone && styles.stageDotDone,
                      isActive && styles.stageDotActive,
                    ]}>
                      <MaterialCommunityIcons
                        name={isDone ? 'check' : stage.icon}
                        size={14}
                        color={isDone || isActive ? '#FFF' : Theme.textMuted}
                      />
                    </View>
                    {!isLast && <View style={[styles.stageLine, isDone && styles.stageLineDone]} />}
                  </View>
                  <View style={styles.stageTextWrap}>
                    <Text style={[styles.stageLabel, (isDone || isActive) && styles.stageLabelActive]}>{stage.label}</Text>
                    <Text style={styles.stageDesc}>{stage.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Score History</Text>
          {scoreLog.length === 0 ? (
            <Text style={styles.emptyText}>No score activity yet.</Text>
          ) : (
            <View style={styles.historyCard}>
              {scoreLog.map((entry, index) => (
                <View key={entry.id}>
                  <View style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyReason}>{entry.reason}</Text>
                      <Text style={styles.historyDate}>{entry.date} • {entry.category}</Text>
                    </View>
                    <View style={styles.historyValueWrap}>
                      <Text style={[styles.historyChange, { color: entry.change.startsWith('-') ? Theme.danger : Theme.accentGreen }]}>
                        {entry.change}
                      </Text>
                      <Text style={styles.historyResult}>{entry.resultScore}</Text>
                    </View>
                  </View>
                  {index < scoreLog.length - 1 && <View style={styles.historyDivider} />}
                </View>
              ))}
            </View>
          )}
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

  scoreCard: { alignItems: 'center', backgroundColor: Theme.cardBg, borderRadius: 24, padding: 28, marginBottom: 32, elevation: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  scoreHuge: { fontSize: 56, fontWeight: '800', color: Theme.textDark },
  scoreSub: { fontSize: 16, color: Theme.textMuted, fontWeight: '600', marginTop: -8 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 140, 62, 0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginTop: 16, gap: 6 },
  tierText: { fontSize: 13, fontWeight: '700', color: Theme.accentEarth },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.textDark, marginBottom: 16 },

  stagesCard: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 20, marginBottom: 32, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  stageRow: { flexDirection: 'row' },
  stageMarkerColumn: { alignItems: 'center', marginRight: 16 },
  stageDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFECE4', justifyContent: 'center', alignItems: 'center' },
  stageDotDone: { backgroundColor: Theme.accentGreen },
  stageDotActive: { backgroundColor: Theme.accentEarth },
  stageLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: '#EFECE4', marginVertical: 4 },
  stageLineDone: { backgroundColor: Theme.accentGreen },
  stageTextWrap: { flex: 1, paddingBottom: 20 },
  stageLabel: { fontSize: 14, fontWeight: '700', color: Theme.textMuted },
  stageLabelActive: { color: Theme.textDark },
  stageDesc: { fontSize: 12, color: Theme.textMuted, marginTop: 2 },

  emptyText: { textAlign: 'center', color: Theme.textMuted, marginBottom: 24 },
  historyCard: { backgroundColor: Theme.cardBg, borderRadius: 20, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyReason: { fontSize: 14, fontWeight: '700', color: Theme.textDark },
  historyDate: { fontSize: 12, color: Theme.textMuted, marginTop: 2 },
  historyValueWrap: { alignItems: 'flex-end' },
  historyChange: { fontSize: 15, fontWeight: '800' },
  historyResult: { fontSize: 11, color: Theme.textMuted, marginTop: 2 },
  historyDivider: { height: 1, backgroundColor: '#F1EFE8' },
});
