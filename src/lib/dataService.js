/**
 * Dom TEA - Data Service COMPLETO
 * Serviço de gerenciamento de dados com PostgreSQL via APIs
 * TODAS as operações salvam no banco de dados
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
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error (${endpoint}):`, response.status, errorData);
      throw new Error(errorData.error || `API Error: ${response.status}`);
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
  INITIALIZED: 'domtea_initialized',
};

const isBrowser = typeof window !== 'undefined';

const getFromStorage = (key) => {
  if (!isBrowser) return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const saveToStorage = (key, data) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage:', e);
  }
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

const seedBehaviors = [
  { id: 'b1', name: 'Autolesão', type: 'decrease', description: 'Comportamentos de autoagressão', severity: 'high', color: '#EF4444' },
  { id: 'b2', name: 'Estereotipia motora', type: 'decrease', description: 'Movimentos repetitivos', severity: 'medium', color: '#F59E0B' },
  { id: 'b3', name: 'Estereotipia vocal', type: 'decrease', description: 'Vocalizações repetitivas', severity: 'medium', color: '#F59E0B' },
  { id: 'b4', name: 'Ecolalia', type: 'monitor', description: 'Repetição de palavras/frases', severity: 'low', color: '#3B82F6' },
  { id: 'b5', name: 'Birra/Crise', type: 'decrease', description: 'Episódios de choro intenso/gritos', severity: 'high', color: '#EF4444' },
  { id: 'b6', name: 'Comunicação espontânea', type: 'increase', description: 'Iniciativa de comunicação', severity: 'positive', color: '#10B981' },
];

const seedPrograms = [
  { id: 'mand-1', name: 'Pedir objetos', category: 'MAND', therapyType: 'ABA', description: 'Pedir objetos do dia a dia', targetAccuracy: 80, status: 'active' },
  { id: 'tact-1', name: 'Nomear objetos', category: 'TACT', therapyType: 'ABA', description: 'Identificar e nomear objetos', targetAccuracy: 85, status: 'active' },
  { id: 'rec-1', name: 'Seguir instruções', category: 'RECEPTIVO', therapyType: 'ABA', description: 'Executar comandos simples', targetAccuracy: 85, status: 'active' },
  { id: 'social-1', name: 'Contato visual', category: 'SOCIAL', therapyType: 'ABA', description: 'Manter contato visual', targetAccuracy: 70, status: 'active' },
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

// ==================== SINCRONIZAÇÃO COM SERVIDOR ====================
let syncQueue = [];
let isSyncing = false;

const addToSyncQueue = (action) => {
  syncQueue.push(action);
  processSyncQueue();
};

const processSyncQueue = async () => {
  if (isSyncing || syncQueue.length === 0) return;

  isSyncing = true;

  while (syncQueue.length > 0) {
    const action = syncQueue.shift();
    try {
      await action();
    } catch (error) {
      console.error('Sync error:', error);
      // Re-add to queue for retry
      syncQueue.unshift(action);
      break;
    }
  }

  isSyncing = false;
};

// ==================== INICIALIZAÇÃO ====================
export const initializeData = async () => {
  if (!isBrowser) return;

  // Inicializa dados locais
  if (!getFromStorage(STORAGE_KEYS.PROMPTS)) {
    saveToStorage(STORAGE_KEYS.PROMPTS, seedPrompts);
  }
  if (!getFromStorage(STORAGE_KEYS.REINFORCERS)) {
    saveToStorage(STORAGE_KEYS.REINFORCERS, seedReinforcers);
  }
  if (!getFromStorage(STORAGE_KEYS.SETTINGS)) {
    saveToStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
  }
  if (!getFromStorage(STORAGE_KEYS.SESSIONS)) {
    saveToStorage(STORAGE_KEYS.SESSIONS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.TRIALS)) {
    saveToStorage(STORAGE_KEYS.TRIALS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.BEHAVIOR_RECORDS)) {
    saveToStorage(STORAGE_KEYS.BEHAVIOR_RECORDS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.DAILY_CHECKINS)) {
    saveToStorage(STORAGE_KEYS.DAILY_CHECKINS, []);
  }

  // Sincroniza com servidor
  try {
    await syncFromServer();
  } catch (error) {
    console.log('Offline mode - using local data');
  }
};

const syncFromServer = async () => {
  try {
    // Sincroniza paciente
    const patients = await fetchAPI('/patients');
    if (patients && patients.length > 0) {
      saveToStorage(STORAGE_KEYS.PATIENT, patients[0]);
    }

    // Sincroniza programas
    const programs = await fetchAPI('/programs');
    if (programs) {
      saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
    }

    // Sincroniza comportamentos
    const behaviors = await fetchAPI('/behaviors');
    if (behaviors) {
      saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);
    }

    // Sincroniza sessões
    const sessions = await fetchAPI('/sessions');
    if (sessions) {
      saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    }

  } catch (error) {
    console.error('Error syncing from server:', error);
  }
};

// ==================== PATIENT ====================
export const getPatient = () => {
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
  } catch (error) {
    console.error('Error fetching patient:', error);
  }
  return getFromStorage(STORAGE_KEYS.PATIENT);
};

export const savePatient = async (patient) => {
  const localPatient = getFromStorage(STORAGE_KEYS.PATIENT);

  // Prepara dados para salvar
  const patientData = {
    ...patient,
    updatedAt: new Date().toISOString(),
  };

  // Salva localmente primeiro
  saveToStorage(STORAGE_KEYS.PATIENT, patientData);

  // Salva no servidor
  try {
    if (localPatient?.id) {
      // Atualiza paciente existente
      const updated = await fetchAPI(`/patients?id=${localPatient.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: patientData.name,
          birthDate: patientData.birthDate,
          photo: patientData.photo,
          diagnosis: patientData.diagnosis,
          notes: patientData.notes,
          preferences: {
            nickname: patientData.nickname,
            diagnosisLevel: patientData.diagnosisLevel,
            diagnosisDate: patientData.diagnosisDate,
            communicationStyle: patientData.communicationStyle,
            doctors: patientData.doctors,
            medications: patientData.medications,
            allergies: patientData.allergies,
            interests: patientData.interests,
            strengths: patientData.strengths,
            challenges: patientData.challenges,
            sensoryPreferences: patientData.sensoryPreferences,
            emergencyContact: patientData.emergencyContact,
          },
        }),
      });
      const fullPatient = { ...patientData, ...updated };
      saveToStorage(STORAGE_KEYS.PATIENT, fullPatient);
      return fullPatient;
    } else {
      // Cria novo paciente
      const created = await fetchAPI('/patients', {
        method: 'POST',
        body: JSON.stringify({
          name: patientData.name || 'Meu Filho',
          birthDate: patientData.birthDate,
          photo: patientData.photo,
          diagnosis: patientData.diagnosis,
          notes: patientData.notes,
          preferences: {
            nickname: patientData.nickname,
            diagnosisLevel: patientData.diagnosisLevel,
            diagnosisDate: patientData.diagnosisDate,
            communicationStyle: patientData.communicationStyle,
            doctors: patientData.doctors,
            medications: patientData.medications,
            allergies: patientData.allergies,
            interests: patientData.interests,
            strengths: patientData.strengths,
            challenges: patientData.challenges,
            sensoryPreferences: patientData.sensoryPreferences,
            emergencyContact: patientData.emergencyContact,
          },
        }),
      });
      const fullPatient = { ...patientData, ...created };
      saveToStorage(STORAGE_KEYS.PATIENT, fullPatient);
      return fullPatient;
    }
  } catch (error) {
    console.error('Error saving patient to server:', error);
    return patientData;
  }
};

export const updatePatient = async (data) => {
  const patient = getPatient() || {};
  return await savePatient({ ...patient, ...data });
};

// ==================== PROGRAMS ====================
export const getPrograms = () => {
  const programs = getFromStorage(STORAGE_KEYS.PROGRAMS);
  if (!programs || programs.length === 0) {
    // Retorna seed programs se não houver nenhum
    saveToStorage(STORAGE_KEYS.PROGRAMS, seedPrograms);
    return seedPrograms;
  }
  return programs;
};

export const getProgramsAsync = async () => {
  try {
    const programs = await fetchAPI('/programs');
    if (programs && programs.length > 0) {
      saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
      return programs;
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
  }
  return getPrograms();
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
    id: program.id || uuidv4(),
    status: program.status || 'active',
    createdAt: new Date().toISOString(),
  };

  // Salva localmente
  const programs = getPrograms();
  programs.push(newProgram);
  saveToStorage(STORAGE_KEYS.PROGRAMS, programs);

  // Salva no servidor
  try {
    const created = await fetchAPI('/programs', {
      method: 'POST',
      body: JSON.stringify({
        name: newProgram.name,
        category: newProgram.category,
        description: newProgram.description,
        targetAccuracy: newProgram.targetAccuracy || 80,
        status: newProgram.status,
      }),
    });

    // Atualiza com dados do servidor
    const index = programs.findIndex(p => p.id === newProgram.id);
    if (index !== -1) {
      programs[index] = { ...newProgram, ...created };
      saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
      return programs[index];
    }
  } catch (error) {
    console.error('Error saving program:', error);
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
      console.error('Error updating program:', error);
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
    console.error('Error deleting program:', error);
  }
};

// ==================== SESSIONS ====================
export const getSessions = () => {
  return getFromStorage(STORAGE_KEYS.SESSIONS) || [];
};

export const getSessionsAsync = async () => {
  try {
    const sessions = await fetchAPI('/sessions');
    if (sessions) {
      saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
      return sessions;
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }
  return getSessions();
};

export const getSessionById = (id) => {
  return getSessions().find(s => s.id === id);
};

export const getSessionsByDate = (date) => {
  const targetDate = new Date(date).toDateString();
  return getSessions().filter(s => new Date(s.startTime).toDateString() === targetDate);
};

export const getSessionsInRange = (startDate, endDate) => {
  return getSessions().filter(s => {
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

  // Salva localmente
  const sessions = getSessions();
  sessions.push(newSession);
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

  // Salva no servidor
  try {
    const created = await fetchAPI('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        patientId: patient?.id || 'default',
        therapistName: therapistId,
      }),
    });

    // Atualiza com ID do servidor
    const index = sessions.findIndex(s => s.id === newSession.id);
    if (index !== -1 && created?.id) {
      sessions[index] = { ...sessions[index], serverId: created.id };
      saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    }
  } catch (error) {
    console.error('Error starting session:', error);
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

    const serverId = sessions[index].serverId || id;
    try {
      await fetchAPI(`/sessions?id=${serverId}`, {
        method: 'PUT',
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          notes,
        }),
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }

    return sessions[index];
  }
  return null;
};

export const getActiveSession = () => {
  return getSessions().find(s => s.status === 'active');
};

// ==================== TRIALS ====================
export const getTrials = () => {
  return getFromStorage(STORAGE_KEYS.TRIALS) || [];
};

export const getTrialsBySession = (sessionId) => {
  return getTrials().filter(t => t.sessionId === sessionId);
};

export const getTrialsByProgram = (programId) => {
  return getTrials().filter(t => t.programId === programId);
};

export const getTrialsByProgramAndDateRange = (programId, startDate, endDate) => {
  return getTrials().filter(t => {
    const trialDate = new Date(t.timestamp);
    return t.programId === programId &&
      trialDate >= new Date(startDate) &&
      trialDate <= new Date(endDate);
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

  // Salva localmente
  const trials = getTrials();
  trials.push(newTrial);
  saveToStorage(STORAGE_KEYS.TRIALS, trials);

  // Salva no servidor
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
    console.error('Error saving trial:', error);
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

  return {
    total,
    correct,
    incorrect,
    prompted,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    independentRate: total > 0 ? Math.round(((total - prompted) / total) * 100) : 0,
  };
};

// ==================== BEHAVIORS ====================
export const getBehaviors = () => {
  const behaviors = getFromStorage(STORAGE_KEYS.BEHAVIORS);
  if (!behaviors || behaviors.length === 0) {
    saveToStorage(STORAGE_KEYS.BEHAVIORS, seedBehaviors);
    return seedBehaviors;
  }
  return behaviors;
};

export const getBehaviorsAsync = async () => {
  try {
    const behaviors = await fetchAPI('/behaviors');
    if (behaviors && behaviors.length > 0) {
      saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);
      return behaviors;
    }
  } catch (error) {
    console.error('Error fetching behaviors:', error);
  }
  return getBehaviors();
};

export const getBehaviorById = (id) => {
  return getBehaviors().find(b => b.id === id);
};

export const addBehavior = async (behavior) => {
  const newBehavior = {
    ...behavior,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  // Salva localmente
  const behaviors = getBehaviors();
  behaviors.push(newBehavior);
  saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);

  // Salva no servidor
  try {
    await fetchAPI('/behaviors', {
      method: 'POST',
      body: JSON.stringify({
        name: newBehavior.name,
        type: newBehavior.type,
        description: newBehavior.description,
        severity: newBehavior.severity,
        color: newBehavior.color,
      }),
    });
  } catch (error) {
    console.error('Error saving behavior:', error);
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
      console.error('Error updating behavior:', error);
    }

    return behaviors[index];
  }
  return null;
};

export const deleteBehavior = async (id) => {
  const behaviors = getBehaviors().filter(b => b.id !== id);
  saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);

  try {
    await fetchAPI(`/behaviors?id=${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting behavior:', error);
  }
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
  return getBehaviorRecords().filter(r => r.behaviorId === behaviorId);
};

export const getBehaviorRecordsByDate = (date) => {
  const targetDate = new Date(date).toDateString();
  return getBehaviorRecords().filter(r => new Date(r.timestamp).toDateString() === targetDate);
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
  const today = new Date().toDateString();
  return getDailyCheckins().find(c => new Date(c.date).toDateString() === today);
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

  // Salva no servidor
  try {
    const patient = getPatient();
    await fetchAPI('/checkins', {
      method: 'POST',
      body: JSON.stringify({
        patientId: patient?.id || 'default',
        sleep: parseInt(checkin.sleep) || 8,
        mood: checkin.mood || 'neutral',
        health: checkin.health || 'normal',
        notes: checkin.notes,
      }),
    });
  } catch (error) {
    console.error('Error saving checkin:', error);
  }

  return newCheckin;
};

export const getCheckinsByDateRange = (startDate, endDate) => {
  return getDailyCheckins().filter(c => {
    const checkinDate = new Date(c.date);
    return checkinDate >= new Date(startDate) && checkinDate <= new Date(endDate);
  });
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
    console.error('Error saving settings:', error);
  }

  return updated;
};

// ==================== PROMPTS & REINFORCERS ====================
export const getPrompts = () => getFromStorage(STORAGE_KEYS.PROMPTS) || seedPrompts;

export const getReinforcers = () => {
  return getFromStorage(STORAGE_KEYS.REINFORCERS) || seedReinforcers;
};

export const getReinforcersAsync = async () => {
  try {
    const reinforcers = await fetchAPI('/reinforcers');
    if (reinforcers) {
      saveToStorage(STORAGE_KEYS.REINFORCERS, reinforcers);
      return reinforcers;
    }
  } catch (error) {
    console.error('Error fetching reinforcers:', error);
  }
  return getReinforcers();
};

export const addReinforcer = async (reinforcer) => {
  const newReinforcer = { ...reinforcer, id: uuidv4() };

  // Salva localmente
  const reinforcers = getReinforcers();
  reinforcers.push(newReinforcer);
  saveToStorage(STORAGE_KEYS.REINFORCERS, reinforcers);

  // Salva no servidor
  try {
    const created = await fetchAPI('/reinforcers', {
      method: 'POST',
      body: JSON.stringify(reinforcer),
    });

    // Atualiza com dados do servidor
    const index = reinforcers.findIndex(r => r.id === newReinforcer.id);
    if (index !== -1) {
      reinforcers[index] = created;
      saveToStorage(STORAGE_KEYS.REINFORCERS, reinforcers);
      return created;
    }
  } catch (error) {
    console.error('Error saving reinforcer:', error);
  }

  return newReinforcer;
};

export const deleteReinforcer = async (id) => {
  const reinforcers = getReinforcers().filter(r => r.id !== id);
  saveToStorage(STORAGE_KEYS.REINFORCERS, reinforcers);

  try {
    await fetchAPI(`/reinforcers?id=${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting reinforcer:', error);
  }
};

// ==================== NOTES ====================
export const getNotes = () => {
  return getFromStorage('domtea_notes') || []; // Usando chave temporária ou implementar cache
};

export const getNotesAsync = async (sessionId = null) => {
  try {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    const notes = await fetchAPI(`/notes${query}`);
    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const addNote = async (note) => {
  try {
    const created = await fetchAPI('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
    return created;
  } catch (error) {
    console.error('Error adding note:', error);
    // Fallback local simples se necessário
    return { ...note, id: uuidv4(), createdAt: new Date().toISOString() };
  }
};

export const deleteNote = async (id) => {
  try {
    await fetchAPI(`/notes?id=${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};
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

  const recentTrials = trials.filter(t =>
    new Date(t.timestamp) >= startDate && t.durationMs > 0
  );

  if (recentTrials.length === 0) {
    return { hasData: false };
  }

  return {
    hasData: true,
    totalTrialsWithTiming: recentTrials.length,
    performanceTrend: 'stable',
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
  if (!values || values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  if (firstHalf.length === 0 || secondHalf.length === 0) return 'stable';

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = avgSecond - avgFirst;
  if (diff > 5) return 'increasing';
  if (diff < -5) return 'decreasing';
  return 'stable';
};

// ==================== LEGACY EXPORTS ====================
export const getTherapists = () => [];
export const addTherapist = (t) => t;
export const updateTherapist = (id, data) => data;
export const deleteTherapist = (id) => { };

export const getNotesBySession = (sessionId) => [];


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
    if (isBrowser) localStorage.removeItem(key);
  });
};
