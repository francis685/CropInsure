import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AgriContext = createContext();

// ─────────────────────────────────────────
// NEW COMPLIANCE SCORE RULES
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
// (Aliased to CROP_STAGES so your UI doesn't crash)
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
// LOAN TIERS (Same as before)
// ─────────────────────────────────────────
export const LOAN_TIERS = {
  LOCKED:  { minScore: 0,   loanAmount: 0,      approvalDays: null, label: 'Not Eligible', icon: 'lock' },
  STAGE_1: { minScore: 300, loanAmount: 10000,  approvalDays: 7,    label: 'Starter Loan', icon: 'clock-outline' },
  STAGE_2: { minScore: 400, loanAmount: 25000,  approvalDays: 5,    label: 'Growing Loan', icon: 'clock-fast' },
  STAGE_3: { minScore: 500, loanAmount: 50000,  approvalDays: 3,    label: 'Season Loan',  icon: 'check-circle-outline' },
  STAGE_4: { minScore: 600, loanAmount: 100000, approvalDays: 1,    label: 'Harvest Loan', icon: 'lightning-bolt' },
  STAGE_5: { minScore: 700, loanAmount: 150000, approvalDays: 0,    label: 'Instant Approval', icon: 'star' },
};

const getLoanTier = (score) => {
  if (score >= 700) return LOAN_TIERS.STAGE_5;
  if (score >= 600) return LOAN_TIERS.STAGE_4;
  if (score >= 500) return LOAN_TIERS.STAGE_3;
  if (score >= 400) return LOAN_TIERS.STAGE_2;
  if (score >= 300) return LOAN_TIERS.STAGE_1;
  return LOAN_TIERS.LOCKED;
};

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────
export const AgriProvider = ({ children }) => {
  const [isVerified, setIsVerified]           = useState(false);
  const [agriScore, setAgriScore]             = useState(0);
  const [loanTier, setLoanTier]               = useState(LOAN_TIERS.LOCKED);
  const [scoreLog, setScoreLog]               = useState([]);
  const [completedStages, setCompletedStages] = useState([]); // Tracks completed weeks
  const [currentWeek, setCurrentWeek]         = useState(1);

  // ── SCORE ENGINE ──
  const applyScoreChange = useCallback((points, reason, category, weekId) => {
    setAgriScore(prev => {
      const newScore = Math.min(Math.max(prev + points, 0), 900);
      setLoanTier(getLoanTier(newScore));

      const entry = {
        id: Date.now() + Math.random(),
        date: new Date().toLocaleDateString('en-IN'),
        reason,
        category,
        change: points >= 0 ? `+${points}` : `${points}`,
        resultScore: newScore,
      };

      setScoreLog(prevLog => [entry, ...prevLog]);
      if (weekId) setCompletedStages(prev => [...new Set([...prev, weekId])]);
      
      return newScore;
    });
  }, []);

  // ── WEEK 1: LAND VERIFICATION ──
  const verifyLand = useCallback(() => {
    if (isVerified) return;
    setIsVerified(true);
    setCurrentWeek(2);
    applyScoreChange(300, 'Land & Identity Verified via Khata', 'VERIFICATION', 'W1');
  }, [isVerified, applyScoreChange]);

  // ── WEEK 2 & 5: CAMERA SCANS (Called by CameraScreen) ──
  const recordAIHealthScan = useCallback((diseaseDetected) => {
    if (currentWeek === 2) {
      applyScoreChange(SCORE_RULES.CROP_PHOTO.FIRST_SUBMISSION, 'Week 2: Crop Baseline Photo Verified', 'STAGE', 'W2');
      setCurrentWeek(3);
    } else if (currentWeek === 5) {
      const points = diseaseDetected ? 20 : SCORE_RULES.PEST_SCAN.ALL_CLEAR_HONEST;
      const reason = diseaseDetected ? 'Week 5: Disease honestly reported' : 'Week 5: Pest Scan All Clear';
      applyScoreChange(points, reason, 'STAGE', 'W5');
      setCurrentWeek(6);
    } else {
      // Bonus scan outside of required weeks
      applyScoreChange(10, 'Proactive Field Scan', 'BONUS');
    }
  }, [currentWeek, applyScoreChange]);

  // ── DEMO TRIGGERS (Call these from buttons to show off the math) ──
  const triggerWeatherResponse = () => {
    applyScoreChange(SCORE_RULES.WEATHER.HONEST_MATCH, 'Week 3: Weather Response matched NASA Data', 'STAGE', 'W3');
    setCurrentWeek(4);
  };

  const triggerInputReport = () => {
    applyScoreChange(SCORE_RULES.INPUTS.FILED_CONSISTENT, 'Week 4: Input spend matches crop profile', 'STAGE', 'W4');
    setCurrentWeek(5);
  };

  const triggerMandiEngagement = () => {
    applyScoreChange(SCORE_RULES.MANDI.REALISTIC_QUANTITY, 'Week 6: Mandi sell intent recorded', 'STAGE', 'W6');
    setCurrentWeek(7);
  };

  const triggerInsuranceCompliance = () => {
    applyScoreChange(SCORE_RULES.INSURANCE.ENROLLED_PAID, 'Week 7: PMFBY Enrollment Verified', 'STAGE', 'W7');
    setCurrentWeek(2); // Loop back to Week 2
  };

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