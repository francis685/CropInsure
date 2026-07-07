import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export const AgriContext = createContext();

// ─────────────────────────────────────────
// COMPLIANCE SCORE RULES
// ─────────────────────────────────────────
const SCORE_RULES = {
  CROP_PHOTO: { FIRST_SUBMISSION: +40, FAKE_PHOTO: -80 },
  WEATHER:    { HONEST_MATCH: +25, CONTRADICTS_NASA: -30 },
  INPUTS:     { FILED_CONSISTENT: +35, FRAUD_SIGNAL: -40 },
  PEST_SCAN:  { ALL_CLEAR_HONEST: +30, DISEASE_HIDDEN: -40 },
  MANDI:      { REALISTIC_QUANTITY: +20, UNREALISTIC: -10 },
  INSURANCE:  { ENROLLED_PAID: +35, NOT_ENROLLED: -20 },
};

// ─────────────────────────────────────────
// THE 7-WEEK COMPLIANCE CYCLE
// ─────────────────────────────────────────
export const CROP_STAGES = [
  { id: 'W1', label: 'Land Verified', icon: 'file-document-check', description: 'Khata & Identity matched' },
  { id: 'W2', label: 'Crop Photo', icon: 'camera', description: 'Baseline photo evidence submitted' },
  { id: 'W3', label: 'Weather Check', icon: 'weather-partly-cloudy', description: 'NASA weather cross-verified' },
  { id: 'W4', label: 'Input Report', icon: 'clipboard-list', description: 'Weekly expense reporting' },
  { id: 'W5', label: 'Pest Scan', icon: 'shield-search', description: 'Active disease monitoring' },
  { id: 'W6', label: 'Mandi Check', icon: 'storefront', description: 'Market sell intent declared' },
  { id: 'W7', label: 'Insurance', icon: 'shield-check', description: 'PMFBY compliance active' },
];

// ─────────────────────────────────────────
// LOAN TIERS
// ─────────────────────────────────────────
export const LOAN_TIERS = {
  LOCKED:  { minScore: 0,   loanAmount: 0,      approvalDays: null, label: 'Not Eligible', icon: 'lock' },
  STAGE_1: { minScore: 300, loanAmount: 10000,  approvalDays: 7,    label: 'Starter Loan', icon: 'clock-outline' },
  STAGE_2: { minScore: 400, loanAmount: 25000,  approvalDays: 5,    label: 'Growing Loan', icon: 'clock-fast' },
  STAGE_3: { minScore: 500, loanAmount: 50000,  approvalDays: 3,    label: 'Season Loan',  icon: 'check-circle-outline' },
  STAGE_4: { minScore: 600, loanAmount: 100000, approvalDays: 1,    label: 'Harvest Loan', icon: 'lightning-bolt' },
  STAGE_5: { minScore: 700, loanAmount: 150000, approvalDays: 0,    label: 'Instant Approval', icon: 'star' },
};

const getLoanTierKey = (score) => {
  if (score >= 700) return 'STAGE_5';
  if (score >= 600) return 'STAGE_4';
  if (score >= 500) return 'STAGE_3';
  if (score >= 400) return 'STAGE_2';
  if (score >= 300) return 'STAGE_1';
  return 'LOCKED';
};

const getLoanTier = (score) => LOAN_TIERS[getLoanTierKey(score)];

const mapScoreLogRow = (row) => ({
  id: row.id,
  date: new Date(row.created_at).toLocaleDateString('en-IN'),
  reason: row.reason,
  category: row.category,
  change: row.points_delta >= 0 ? `+${row.points_delta}` : `${row.points_delta}`,
  resultScore: row.result_score,
});

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────
export const AgriProvider = ({ children }) => {
  const [farmerId, setFarmerId]               = useState(null);
  const [isVerified, setIsVerified]           = useState(false);
  const [agriScore, setAgriScore]             = useState(0);
  const [loanTier, setLoanTier]               = useState(LOAN_TIERS.LOCKED);
  const [scoreLog, setScoreLog]               = useState([]);
  const [completedStages, setCompletedStages] = useState([]);
  const [currentWeek, setCurrentWeek]         = useState(1);

  // Refs so async writers always see the latest value, not a stale closure.
  const agriScoreRef = useRef(0);
  const currentWeekRef = useRef(1);

  // ── AUTH STATE ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setFarmerId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setFarmerId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── LOAD FARMER STATE FROM SUPABASE ──
  useEffect(() => {
    if (!farmerId) {
      setIsVerified(false);
      setAgriScore(0);
      setLoanTier(LOAN_TIERS.LOCKED);
      setScoreLog([]);
      setCompletedStages([]);
      setCurrentWeek(1);
      agriScoreRef.current = 0;
      currentWeekRef.current = 1;
      return;
    }

    (async () => {
      const [{ data: farmer }, { data: log }] = await Promise.all([
        supabase.from('farmers').select('*').eq('id', farmerId).single(),
        supabase.from('score_log').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
      ]);

      if (farmer) {
        setIsVerified(farmer.is_verified);
        setAgriScore(farmer.agri_score);
        setLoanTier(getLoanTier(farmer.agri_score));
        setCurrentWeek(farmer.current_week);
        agriScoreRef.current = farmer.agri_score;
        currentWeekRef.current = farmer.current_week;
      }

      if (log) {
        setScoreLog(log.map(mapScoreLogRow));
        setCompletedStages([...new Set(log.map((row) => row.week_id).filter(Boolean))]);
      }
    })();
  }, [farmerId]);

  // ── SCORE ENGINE ── persists to farmers + score_log, then updates local cache optimistically.
  const applyScoreChange = useCallback(async (points, reason, category, weekId, nextWeek) => {
    if (!farmerId) return;

    const newScore = Math.min(Math.max(agriScoreRef.current + points, 0), 900);
    const newTier = getLoanTier(newScore);
    const resolvedWeek = nextWeek ?? currentWeekRef.current;

    agriScoreRef.current = newScore;
    currentWeekRef.current = resolvedWeek;

    setAgriScore(newScore);
    setLoanTier(newTier);
    setCurrentWeek(resolvedWeek);
    if (weekId) setCompletedStages((prev) => [...new Set([...prev, weekId])]);

    const entry = {
      id: Date.now() + Math.random(),
      date: new Date().toLocaleDateString('en-IN'),
      reason,
      category,
      change: points >= 0 ? `+${points}` : `${points}`,
      resultScore: newScore,
    };
    setScoreLog((prevLog) => [entry, ...prevLog]);

    const [{ error: updateError }, { error: insertError }] = await Promise.all([
      supabase.from('farmers').update({
        agri_score: newScore,
        current_week: resolvedWeek,
        loan_tier_key: getLoanTierKey(newScore),
        updated_at: new Date().toISOString(),
      }).eq('id', farmerId),
      supabase.from('score_log').insert({
        farmer_id: farmerId,
        reason,
        category,
        week_id: weekId || null,
        points_delta: points,
        result_score: newScore,
      }),
    ]);

    if (updateError) console.warn('AgriContext: failed to persist score update:', updateError.message);
    if (insertError) console.warn('AgriContext: failed to persist score log:', insertError.message);
  }, [farmerId]);

  // ── WEEK 1: LAND VERIFICATION ──
  const verifyLand = useCallback(async () => {
    if (isVerified || !farmerId) return;
    setIsVerified(true);

    const { error } = await supabase.from('farmers').update({ is_verified: true }).eq('id', farmerId);
    if (error) console.warn('AgriContext: failed to persist verification:', error.message);

    await applyScoreChange(300, 'Land & Identity Verified via Khata', 'VERIFICATION', 'W1', 2);
  }, [isVerified, farmerId, applyScoreChange]);

  // ── WEEK 2 & 5: CAMERA SCANS (Called by CameraScreen) ──
  const recordAIHealthScan = useCallback(async (diseaseDetected) => {
    if (currentWeekRef.current === 2) {
      await applyScoreChange(SCORE_RULES.CROP_PHOTO.FIRST_SUBMISSION, 'Week 2: Crop Baseline Photo Verified', 'STAGE', 'W2', 3);
    } else if (currentWeekRef.current === 5) {
      const points = diseaseDetected ? 20 : SCORE_RULES.PEST_SCAN.ALL_CLEAR_HONEST;
      const reason = diseaseDetected ? 'Week 5: Disease honestly reported' : 'Week 5: Pest Scan All Clear';
      await applyScoreChange(points, reason, 'STAGE', 'W5', 6);
    } else {
      // Bonus scan outside of required weeks
      await applyScoreChange(10, 'Proactive Field Scan', 'BONUS', null, currentWeekRef.current);
    }
  }, [applyScoreChange]);

  // ── DEMO TRIGGERS (Call these from buttons to show off the math) ──
  const triggerWeatherResponse = useCallback(() => {
    applyScoreChange(SCORE_RULES.WEATHER.HONEST_MATCH, 'Week 3: Weather Response matched NASA Data', 'STAGE', 'W3', 4);
  }, [applyScoreChange]);

  const triggerInputReport = useCallback(() => {
    applyScoreChange(SCORE_RULES.INPUTS.FILED_CONSISTENT, 'Week 4: Input spend matches crop profile', 'STAGE', 'W4', 5);
  }, [applyScoreChange]);

  const triggerMandiEngagement = useCallback(() => {
    applyScoreChange(SCORE_RULES.MANDI.REALISTIC_QUANTITY, 'Week 6: Mandi sell intent recorded', 'STAGE', 'W6', 7);
  }, [applyScoreChange]);

  const triggerInsuranceCompliance = useCallback(() => {
    applyScoreChange(SCORE_RULES.INSURANCE.ENROLLED_PAID, 'Week 7: PMFBY Enrollment Verified', 'STAGE', 'W7', 2); // Loop back to Week 2
  }, [applyScoreChange]);

  return (
    <AgriContext.Provider value={{
      isVerified, agriScore, loanTier, scoreLog, completedStages, CROP_STAGES, currentWeek,
      verifyLand,
      recordAIHealthScan,
      triggerWeatherResponse,
      triggerInputReport,
      triggerMandiEngagement,
      triggerInsuranceCompliance
    }}>
      {children}
    </AgriContext.Provider>
  );
};
