/**
 * Dom TEA - Data Service
 * Serviço de gerenciamento de dados com PostgreSQL via APIs
 * Fallback para localStorage quando offline
 */

import { v4 as uuidv4 } from 'uuid';

// ==================== API HELPERS ====================
const API_BASE = '/api';

const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// ==================== LOCAL STORAGE HELPERS ====================
const STORAGE_KEYS = {
  PATIENT: 'domtea_patient',
  PROGRAMS: 'domtea_programs',
  SESSIONS: 'domtea_sessions',
  TRIALS: 'domtea_trials',
  BEHAVIORS: 'domtea_behaviors',
  BEHAVIOR_RECORDS: 'domtea_behavior_records',
  DAILY_CHECKINS: 'domtea_daily_checkins',
  SETTINGS: 'domtea_settings',
  PROMPTS: 'domtea_prompts',
  REINFORCERS: 'domtea_reinforcers',
};

const getFromStorage = (key) => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const saveToStorage = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ==================== SEED DATA ====================
const seedPrompts = [
  { id: 'ind', name: 'Independente', abbrev: 'I', level: 0, color: '#10B981' },
  { id: 'verbal', name: 'Verbal', abbrev: 'V', level: 1, color: '#3B82F6' },
  { id: 'gestual', name: 'Gestual', abbrev: 'G', level: 2, color: '#8B5CF6' },
  { id: 'partial', name: 'Física Parcial', abbrev: 'FP', level: 3, color: '#F59E0B' },
  { id: 'total', name: 'Física Total', abbrev: 'FT', level: 4, color: '#EF4444' },
];

const seedReinforcers = [
  { id: 'r1', name: 'Elogio verbal', type: 'social', icon: '👏' },
  { id: 'r2', name: 'Tablet/Vídeo', type: 'tangible', icon: '📱' },
  { id: 'r3', name: 'Brinquedo preferido', type: 'tangible', icon: '🧸' },
  { id: 'r4', name: 'Comida/Snack', type: 'edible', icon: '🍪' },
  { id: 'r5', name: 'Música', type: 'sensory', icon: '🎵' },
];

const defaultSettings = {
  theme: 'light',
  sessionDuration: 60,
  trialsPerProgram: 10,
  showCelebrations: true,
  soundEnabled: true,
  language: 'pt-BR',
  autoSave: true,
};

// ==================== INICIALIZAÇÃO ====================
export const initializeData = () => {
  if (typeof window === 'undefined') return;

  // Inicializa dados locais se não existirem
  if (!getFromStorage(STORAGE_KEYS.PROMPTS)) {
    saveToStorage(STORAGE_KEYS.PROMPTS, seedPrompts);
  }
  if (!getFromStorage(STORAGE_KEYS.REINFORCERS)) {
    saveToStorage(STORAGE_KEYS.REINFORCERS, seedReinforcers);
  }
  if (!getFromStorage(STORAGE_KEYS.SETTINGS)) {
    saveToStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
  }
};

// ==================== PATIENT ====================
export const getPatient = () => {
  // Primeiro tenta localStorage para resposta imediata
  return getFromStorage(STORAGE_KEYS.PATIENT);
};

export const getPatientAsync = async () => {
  try {
    const patients = await fetchAPI('/patients');
    if (patients && patients.length > 0) {
      const patient = patients[0];
      saveToStorage(STORAGE_KEYS.PATIENT, patient);
      return patient;
    }
    return getFromStorage(STORAGE_KEYS.PATIENT);
  } catch (error) {
    return getFromStorage(STORAGE_KEYS.PATIENT);
  }
};

export const savePatient = async (patient) => {
  // Salva localmente primeiro para resposta imediata
  const patientData = {
    ...patient,
    updatedAt: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.PATIENT, patientData);

  // Tenta salvar no servidor
  try {
    if (patient.id) {
      await fetchAPI(`/patients?id=${patient.id}`, {
        method: 'PUT',
        body: JSON.stringify(patientData),
      });
    } else {
      const created = await fetchAPI('/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      });
      saveToStorage(STORAGE_KEYS.PATIENT, created);
      return created;
    }
  } catch (error) {
    console.error('Error saving patient to server:', error);
  }

  return patientData;
};

export const updatePatient = async (data) => {
  const patient = getPatient() || {};
  const updated = {
    ...patient,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return await savePatient(updated);
};

// ==================== PROGRAMS ====================
export const getPrograms = () => {
  return getFromStorage(STORAGE_KEYS.PROGRAMS) || [];
};

export const getProgramsAsync = async () => {
  try {
    const programs = await fetchAPI('/programs');
    saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
    return programs;
  } catch (error) {
    return getFromStorage(STORAGE_KEYS.PROGRAMS) || [];
  }
};

export const getProgramById = (id) => {
  const programs = getPrograms();
  return programs.find(p => p.id === id);
};

export const getProgramsByCategory = (category) => {
  const programs = getPrograms();
  return programs.filter(p => p.category === category);
};

export const addProgram = async (program) => {
  const newProgram = {
    ...program,
    id: uuidv4(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  // Salva localmente primeiro
  const programs = getPrograms();
  programs.push(newProgram);
  saveToStorage(STORAGE_KEYS.PROGRAMS, programs);

  // Tenta salvar no servidor
  try {
    const created = await fetchAPI('/programs', {
      method: 'POST',
      body: JSON.stringify(program),
    });
    // Atualiza com o ID do servidor
    const index = programs.findIndex(p => p.id === newProgram.id);
    if (index !== -1) {
      programs[index] = created;
      saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
      return created;
    }
  } catch (error) {
    console.error('Error saving program to server:', error);
  }

  return newProgram;
};

export const updateProgram = async (id, data) => {
  const programs = getPrograms();
  const index = programs.findIndex(p => p.id === id);

  if (index !== -1) {
    programs[index] = { ...programs[index], ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.PROGRAMS, programs);

    try {
      await fetchAPI(`/programs?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating program on server:', error);
    }

    return programs[index];
  }
  return null;
};

export const deleteProgram = async (id) => {
  const programs = getPrograms().filter(p => p.id !== id);
  saveToStorage(STORAGE_KEYS.PROGRAMS, programs);

  try {
    await fetchAPI(`/programs?id=${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting program on server:', error);
  }
};

// ==================== SESSIONS ====================
export const getSessions = () => {
  return getFromStorage(STORAGE_KEYS.SESSIONS) || [];
};

export const getSessionsAsync = async () => {
  try {
    const sessions = await fetchAPI('/sessions');
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    return sessions;
  } catch (error) {
    return getFromStorage(STORAGE_KEYS.SESSIONS) || [];
  }
};

export const getSessionById = (id) => {
  const sessions = getSessions();
  return sessions.find(s => s.id === id);
};

export const getSessionsByDate = (date) => {
  const sessions = getSessions();
  const targetDate = new Date(date).toDateString();
  return sessions.filter(s => new Date(s.startTime).toDateString() === targetDate);
};

export const getSessionsInRange = (startDate, endDate) => {
  const sessions = getSessions();
  return sessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate);
  });
};

export const startSession = async (therapistId = null) => {
  const patient = getPatient();
  const newSession = {
    id: uuidv4(),
    patientId: patient?.id,
    therapistId,
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'active',
    notes: '',
  };

  const sessions = getSessions();
  sessions.push(newSession);
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

  try {
    const created = await fetchAPI('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        patientId: patient?.id || 'default',
        therapistName: therapistId,
      }),
    });
    const index = sessions.findIndex(s => s.id === newSession.id);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...created };
      saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
      return sessions[index];
    }
  } catch (error) {
    console.error('Error starting session on server:', error);
  }

  return newSession;
};

export const endSession = async (id, notes = '') => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);

  if (index !== -1) {
    sessions[index] = {
      ...sessions[index],
      endTime: new Date().toISOString(),
      status: 'completed',
      notes,
    };
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

    try {
      await fetchAPI(`/sessions?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          notes,
        }),
      });
    } catch (error) {
      console.error('Error ending session on server:', error);
    }

    return sessions[index];
  }
  return null;
};

export const getActiveSession = () => {
  const sessions = getSessions();
  return sessions.find(s => s.status === 'active');
};

// ==================== TRIALS ====================
export const getTrials = () => {
  return getFromStorage(STORAGE_KEYS.TRIALS) || [];
};

export const getTrialsBySession = (sessionId) => {
  const trials = getTrials();
  return trials.filter(t => t.sessionId === sessionId);
};

export const getTrialsByProgram = (programId) => {
  const trials = getTrials();
  return trials.filter(t => t.programId === programId);
};

export const getTrialsByProgramAndDateRange = (programId, startDate, endDate) => {
  const trials = getTrials();
  return trials.filter(t => {
    const trialDate = new Date(t.timestamp);
    return t.programId === programId && trialDate >= new Date(startDate) && trialDate <= new Date(endDate);
  });
};

export const addTrial = async (trial) => {
  const newTrial = {
    ...trial,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    latencyMs: trial.latencyMs || 0,
    durationMs: trial.durationMs || 0,
  };

  const trials = getTrials();
  trials.push(newTrial);
  saveToStorage(STORAGE_KEYS.TRIALS, trials);

  try {
    await fetchAPI('/trials', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: trial.sessionId,
        programId: trial.programId,
        result: trial.result,
        promptLevel: trial.promptLevel || 'I',
        latency: trial.latencyMs,
        duration: trial.durationMs,
        notes: trial.notes,
      }),
    });
  } catch (error) {
    console.error('Error saving trial to server:', error);
  }

  return newTrial;
};

export const getTrialStats = (programId, days = 30) => {
  const trials = getTrialsByProgram(programId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentTrials = trials.filter(t => new Date(t.timestamp) >= startDate);
  const total = recentTrials.length;
  const correct = recentTrials.filter(t => t.result === 'correct').length;
  const incorrect = recentTrials.filter(t => t.result === 'incorrect').length;
  const prompted = recentTrials.filter(t => t.promptLevel && t.promptLevel !== 'ind' && t.promptLevel !== 'I').length;

  const trialsWithTiming = recentTrials.filter(t => t.durationMs > 0);
  const avgDurationMs = trialsWithTiming.length > 0
    ? Math.round(trialsWithTiming.reduce((sum, t) => sum + t.durationMs, 0) / trialsWithTiming.length)
    : 0;

  return {
    total,
    correct,
    incorrect,
    prompted,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    independentRate: total > 0 ? Math.round(((total - prompted) / total) * 100) : 0,
    avgDurationMs,
    avgDurationSec: Math.round(avgDurationMs / 1000),
  };
};

// ==================== BEHAVIORS ====================
export const getBehaviors = () => {
  return getFromStorage(STORAGE_KEYS.BEHAVIORS) || [];
};

export const getBehaviorsAsync = async () => {
  try {
    const behaviors = await fetchAPI('/behaviors');
    saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);
    return behaviors;
  } catch (error) {
    return getFromStorage(STORAGE_KEYS.BEHAVIORS) || [];
  }
};

export const getBehaviorById = (id) => {
  const behaviors = getBehaviors();
  return behaviors.find(b => b.id === id);
};

export const addBehavior = async (behavior) => {
  const newBehavior = {
    ...behavior,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  const behaviors = getBehaviors();
  behaviors.push(newBehavior);
  saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);

  try {
    await fetchAPI('/behaviors', {
      method: 'POST',
      body: JSON.stringify(behavior),
    });
  } catch (error) {
    console.error('Error saving behavior to server:', error);
  }

  return newBehavior;
};

export const updateBehavior = async (id, data) => {
  const behaviors = getBehaviors();
  const index = behaviors.findIndex(b => b.id === id);

  if (index !== -1) {
    behaviors[index] = { ...behaviors[index], ...data };
    saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);

    try {
      await fetchAPI(`/behaviors?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating behavior on server:', error);
    }

    return behaviors[index];
  }
  return null;
};

// ==================== BEHAVIOR RECORDS ====================
export const getBehaviorRecords = () => {
  return getFromStorage(STORAGE_KEYS.BEHAVIOR_RECORDS) || [];
};

export const addBehaviorRecord = async (record) => {
  const newRecord = {
    ...record,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };

  const records = getBehaviorRecords();
  records.push(newRecord);
  saveToStorage(STORAGE_KEYS.BEHAVIOR_RECORDS, records);

  return newRecord;
};

export const getBehaviorRecordsByBehavior = (behaviorId) => {
  const records = getBehaviorRecords();
  return records.filter(r => r.behaviorId === behaviorId);
};

export const getBehaviorRecordsByDate = (date) => {
  const records = getBehaviorRecords();
  const targetDate = new Date(date).toDateString();
  return records.filter(r => new Date(r.timestamp).toDateString() === targetDate);
};

export const getBehaviorStats = (behaviorId, days = 30) => {
  const records = getBehaviorRecordsByBehavior(behaviorId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentRecords = records.filter(r => new Date(r.timestamp) >= startDate);

  const byDay = {};
  recentRecords.forEach(r => {
    const day = new Date(r.timestamp).toDateString();
    byDay[day] = (byDay[day] || 0) + (r.count || 1);
  });

  const dailyCounts = Object.values(byDay);
  const total = dailyCounts.reduce((a, b) => a + b, 0);
  const avgPerDay = dailyCounts.length > 0 ? total / dailyCounts.length : 0;

  return {
    total,
    avgPerDay: Math.round(avgPerDay * 10) / 10,
    daysRecorded: dailyCounts.length,
    trend: calculateTrend(dailyCounts),
  };
};

// ==================== DAILY CHECK-INS ====================
export const getDailyCheckins = () => {
  return getFromStorage(STORAGE_KEYS.DAILY_CHECKINS) || [];
};

export const getTodayCheckin = () => {
  const checkins = getDailyCheckins();
  const today = new Date().toDateString();
  return checkins.find(c => new Date(c.date).toDateString() === today);
};

export const saveDailyCheckin = async (checkin) => {
  const checkins = getDailyCheckins();
  const today = new Date().toDateString();
  const existingIndex = checkins.findIndex(c => new Date(c.date).toDateString() === today);

  const newCheckin = {
    ...checkin,
    id: existingIndex >= 0 ? checkins[existingIndex].id : uuidv4(),
    date: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    checkins[existingIndex] = newCheckin;
  } else {
    checkins.push(newCheckin);
  }

  saveToStorage(STORAGE_KEYS.DAILY_CHECKINS, checkins);

  try {
    const patient = getPatient();
    await fetchAPI('/checkins', {
      method: 'POST',
      body: JSON.stringify({
        patientId: patient?.id || 'default',
        sleep: checkin.sleep,
        mood: checkin.mood,
        health: checkin.health,
        notes: checkin.notes,
      }),
    });
  } catch (error) {
    console.error('Error saving checkin to server:', error);
  }

  return newCheckin;
};

// ==================== SETTINGS ====================
export const getSettings = () => {
  return getFromStorage(STORAGE_KEYS.SETTINGS) || defaultSettings;
};

export const updateSettings = async (settings) => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  saveToStorage(STORAGE_KEYS.SETTINGS, updated);

  try {
    await fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
  } catch (error) {
    console.error('Error saving settings to server:', error);
  }

  return updated;
};

// ==================== PROMPTS & REINFORCERS ====================
export const getPrompts = () => getFromStorage(STORAGE_KEYS.PROMPTS) || seedPrompts;
export const getReinforcers = () => getFromStorage(STORAGE_KEYS.REINFORCERS) || seedReinforcers;

// ==================== ANALYTICS ====================
export const getDashboardStats = () => {
  const sessions = getSessions();
  const trials = getTrials();
  const today = new Date().toDateString();

  const todaySessions = sessions.filter(s => new Date(s.startTime).toDateString() === today);
  const todayTrials = trials.filter(t => new Date(t.timestamp).toDateString() === today);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const weekTrials = trials.filter(t => new Date(t.timestamp) >= last7Days);
  const weekCorrect = weekTrials.filter(t => t.result === 'correct').length;

  return {
    todaySessions: todaySessions.length,
    todayTrials: todayTrials.length,
    todayAccuracy: todayTrials.length > 0
      ? Math.round((todayTrials.filter(t => t.result === 'correct').length / todayTrials.length) * 100)
      : 0,
    weekTrials: weekTrials.length,
    weekAccuracy: weekTrials.length > 0
      ? Math.round((weekCorrect / weekTrials.length) * 100)
      : 0,
    totalSessions: sessions.length,
    totalTrials: trials.length,
  };
};

export const getProgramProgress = (programId) => {
  const program = getProgramById(programId);
  if (!program) return null;

  const trials = getTrialsByProgram(programId);
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentTrials = trials.filter(t => new Date(t.timestamp) >= last30Days);

  const byDay = {};
  recentTrials.forEach(t => {
    const day = new Date(t.timestamp).toDateString();
    if (!byDay[day]) byDay[day] = { correct: 0, total: 0 };
    byDay[day].total++;
    if (t.result === 'correct') byDay[day].correct++;
  });

  const dailyAccuracies = Object.values(byDay).map(d => (d.correct / d.total) * 100);
  const currentAccuracy = recentTrials.length > 0
    ? Math.round((recentTrials.filter(t => t.result === 'correct').length / recentTrials.length) * 100)
    : 0;

  return {
    programId,
    programName: program.name,
    category: program.category,
    targetAccuracy: program.targetAccuracy || 80,
    currentAccuracy,
    totalTrials: recentTrials.length,
    isAtTarget: currentAccuracy >= (program.targetAccuracy || 80),
    trend: calculateTrend(dailyAccuracies),
    dailyData: byDay,
  };
};

export const getAllProgramsProgress = () => {
  const programs = getPrograms().filter(p => p.status === 'active');
  return programs.map(p => getProgramProgress(p.id)).filter(Boolean);
};

// ==================== TIMING ANALYTICS ====================
export const getTimingAnalytics = (programId = null, days = 30) => {
  const trials = programId ? getTrialsByProgram(programId) : getTrials();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentTrials = trials.filter(t => new Date(t.timestamp) >= startDate && t.durationMs > 0);

  if (recentTrials.length === 0) {
    return { hasData: false };
  }

  return {
    hasData: true,
    totalTrialsWithTiming: recentTrials.length,
  };
};

export const getTimingByProgram = (days = 30) => {
  const programs = getPrograms();
  const trials = getTrials();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return programs.map(program => {
    const programTrials = trials.filter(t =>
      t.programId === program.id &&
      new Date(t.timestamp) >= startDate &&
      t.durationMs > 0
    );

    const avgDuration = programTrials.length > 0
      ? programTrials.reduce((sum, t) => sum + t.durationMs, 0) / programTrials.length
      : 0;

    return {
      programId: program.id,
      programName: program.name,
      category: program.category,
      totalTrials: programTrials.length,
      avgDurationMs: Math.round(avgDuration),
      avgDurationSec: Math.round(avgDuration / 1000),
    };
  }).filter(p => p.totalTrials > 0);
};

// ==================== HELPER FUNCTIONS ====================
const calculateTrend = (values) => {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = avgSecond - avgFirst;
  if (diff > 5) return 'increasing';
  if (diff < -5) return 'decreasing';
  return 'stable';
};

// ==================== THERAPISTS (Local only) ====================
export const getTherapists = () => [];
export const addTherapist = (t) => t;
export const updateTherapist = (id, data) => data;
export const deleteTherapist = (id) => { };

// ==================== NOTES (Local only) ====================
export const getNotes = () => [];
export const addNote = (note) => ({ ...note, id: uuidv4() });
export const getNotesBySession = (sessionId) => [];
export const deleteNote = (id) => { };

// ==================== DATA EXPORT/IMPORT ====================
export const exportAllData = () => {
  const data = {
    patient: getPatient(),
    programs: getPrograms(),
    sessions: getSessions(),
    trials: getTrials(),
    behaviors: getBehaviors(),
    behaviorRecords: getBehaviorRecords(),
    dailyCheckins: getDailyCheckins(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.patient) saveToStorage(STORAGE_KEYS.PATIENT, data.patient);
    if (data.programs) saveToStorage(STORAGE_KEYS.PROGRAMS, data.programs);
    if (data.sessions) saveToStorage(STORAGE_KEYS.SESSIONS, data.sessions);
    if (data.trials) saveToStorage(STORAGE_KEYS.TRIALS, data.trials);
    if (data.behaviors) saveToStorage(STORAGE_KEYS.BEHAVIORS, data.behaviors);
    if (data.behaviorRecords) saveToStorage(STORAGE_KEYS.BEHAVIOR_RECORDS, data.behaviorRecords);
    if (data.dailyCheckins) saveToStorage(STORAGE_KEYS.DAILY_CHECKINS, data.dailyCheckins);
    if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Legacy exports for backwards compatibility
export const getCheckinsByDateRange = (startDate, endDate) => {
  const checkins = getDailyCheckins();
  return checkins.filter(c => {
    const checkinDate = new Date(c.date);
    return checkinDate >= new Date(startDate) && checkinDate <= new Date(endDate);
  });
};

export const addReinforcer = (reinforcer) => {
  const reinforcers = getReinforcers();
  const newReinforcer = { ...reinforcer, id: uuidv4() };
  reinforcers.push(newReinforcer);
  saveToStorage(STORAGE_KEYS.REINFORCERS, reinforcers);
  return newReinforcer;
};

export const deleteBehavior = async (id) => {
  const behaviors = getBehaviors().filter(b => b.id !== id);
  saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);

  try {
    await fetchAPI(`/behaviors?id=${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting behavior on server:', error);
  }
};
