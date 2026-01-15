/**
 * Dom TEA - Data Service
 * Serviço de gerenciamento de dados com LocalStorage
 * Preparado para futura integração com banco de dados
 */

import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  PATIENT: 'neurotrack_patient',
  THERAPISTS: 'neurotrack_therapists',
  PROGRAMS: 'neurotrack_programs',
  SESSIONS: 'neurotrack_sessions',
  TRIALS: 'neurotrack_trials',
  BEHAVIORS: 'neurotrack_behaviors',
  BEHAVIOR_RECORDS: 'neurotrack_behavior_records',
  DAILY_CHECKINS: 'neurotrack_daily_checkins',
  SETTINGS: 'neurotrack_settings',
  PROMPTS: 'neurotrack_prompts',
  REINFORCERS: 'neurotrack_reinforcers',
  NOTES: 'neurotrack_notes',
};

// Utilitários
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
  { id: 'r6', name: 'Cócegas', type: 'physical', icon: '😆' },
  { id: 'r7', name: 'Brincadeira física', type: 'physical', icon: '🏃' },
  { id: 'r8', name: 'Adesivo/Figurinha', type: 'token', icon: '⭐' },
];

const seedPrograms = [
  // MAND (Requisição) - ABA
  { id: 'mand-1', name: 'Pedir objetos', category: 'MAND', therapyType: 'ABA', description: 'Pedir objetos do dia a dia de forma funcional', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },
  { id: 'mand-2', name: 'Pedir ações', category: 'MAND', therapyType: 'ABA', description: 'Pedir para realizar ações específicas', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },
  { id: 'mand-3', name: 'Pedir ajuda', category: 'MAND', therapyType: 'ABA', description: 'Solicitar ajuda quando necessário', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },

  // TACT (Nomeação) - ABA
  { id: 'tact-1', name: 'Nomear objetos', category: 'TACT', therapyType: 'ABA', description: 'Identificar e nomear objetos', targetAccuracy: 85, status: 'active', createdAt: new Date().toISOString() },
  { id: 'tact-2', name: 'Nomear ações', category: 'TACT', therapyType: 'ABA', description: 'Identificar e descrever ações', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },
  { id: 'tact-3', name: 'Nomear cores', category: 'TACT', therapyType: 'ABA', description: 'Identificar e nomear cores', targetAccuracy: 90, status: 'active', createdAt: new Date().toISOString() },
  { id: 'tact-4', name: 'Nomear emoções', category: 'TACT', therapyType: 'ABA', description: 'Identificar emoções em si e nos outros', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },

  // RECEPTIVO - ABA
  { id: 'rec-1', name: 'Seguir instruções simples', category: 'RECEPTIVO', therapyType: 'ABA', description: 'Executar comandos de uma etapa', targetAccuracy: 85, status: 'active', createdAt: new Date().toISOString() },
  { id: 'rec-2', name: 'Seguir instruções complexas', category: 'RECEPTIVO', therapyType: 'ABA', description: 'Executar comandos de múltiplas etapas', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },
  { id: 'rec-3', name: 'Identificar objetos', category: 'RECEPTIVO', therapyType: 'ABA', description: 'Apontar/pegar objetos nomeados', targetAccuracy: 90, status: 'active', createdAt: new Date().toISOString() },

  // SOCIAL - ABA
  { id: 'social-1', name: 'Contato visual', category: 'SOCIAL', therapyType: 'ABA', description: 'Manter contato visual durante interações', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },
  { id: 'social-2', name: 'Atenção compartilhada', category: 'SOCIAL', therapyType: 'ABA', description: 'Compartilhar foco de atenção com outros', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },
  { id: 'social-3', name: 'Esperar a vez', category: 'SOCIAL', therapyType: 'ABA', description: 'Aguardar sua vez em atividades', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },

  // FONOAUDIOLOGIA
  { id: 'fono-1', name: 'Articulação de fonemas', category: 'FONO', therapyType: 'FONO', description: 'Produção correta de sons da fala', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },
  { id: 'fono-2', name: 'Vocabulário expressivo', category: 'FONO', therapyType: 'FONO', description: 'Ampliação do vocabulário ativo', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },
  { id: 'fono-3', name: 'Compreensão auditiva', category: 'FONO', therapyType: 'FONO', description: 'Entender instruções e perguntas', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },
  { id: 'fono-4', name: 'Construção de frases', category: 'FONO', therapyType: 'FONO', description: 'Formar frases com 2-3 palavras', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },
  { id: 'fono-5', name: 'Respiração e sopro', category: 'FONO', therapyType: 'FONO', description: 'Exercícios de respiração para fala', targetAccuracy: 85, status: 'active', createdAt: new Date().toISOString() },

  // TERAPIA OCUPACIONAL
  { id: 'to-1', name: 'Coordenação motora fina', category: 'TO', therapyType: 'TO', description: 'Movimentos precisos com mãos e dedos', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },
  { id: 'to-2', name: 'Coordenação motora grossa', category: 'TO', therapyType: 'TO', description: 'Movimentos amplos do corpo', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },
  { id: 'to-3', name: 'Integração sensorial', category: 'TO', therapyType: 'TO', description: 'Processar informações sensoriais', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },
  { id: 'to-4', name: 'AVDs - Alimentação', category: 'TO', therapyType: 'TO', description: 'Atividades de vida diária - comer', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },
  { id: 'to-5', name: 'AVDs - Higiene', category: 'TO', therapyType: 'TO', description: 'Atividades de higiene pessoal', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },
  { id: 'to-6', name: 'AVDs - Vestir-se', category: 'TO', therapyType: 'TO', description: 'Colocar e tirar roupas', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },
  { id: 'to-7', name: 'Grafomotricidade', category: 'TO', therapyType: 'TO', description: 'Habilidade de segurar lápis e desenhar', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },

  // PSICOLOGIA
  { id: 'psi-1', name: 'Regulação emocional', category: 'PSI', therapyType: 'PSI', description: 'Identificar e regular emoções', targetAccuracy: 65, status: 'active', createdAt: new Date().toISOString() },
  { id: 'psi-2', name: 'Tolerância à frustração', category: 'PSI', therapyType: 'PSI', description: 'Lidar com situações frustrantes', targetAccuracy: 60, status: 'active', createdAt: new Date().toISOString() },
  { id: 'psi-3', name: 'Flexibilidade cognitiva', category: 'PSI', therapyType: 'PSI', description: 'Adaptar-se a mudanças de rotina', targetAccuracy: 65, status: 'active', createdAt: new Date().toISOString() },
  { id: 'psi-4', name: 'Habilidades sociais', category: 'PSI', therapyType: 'PSI', description: 'Interações sociais apropriadas', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },

  // MUSICOTERAPIA
  { id: 'music-1', name: 'Ritmo e batida', category: 'MUSIC', therapyType: 'MUSIC', description: 'Acompanhar ritmos musicais', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },
  { id: 'music-2', name: 'Cantar músicas', category: 'MUSIC', therapyType: 'MUSIC', description: 'Cantar letras de músicas conhecidas', targetAccuracy: 70, status: 'active', createdAt: new Date().toISOString() },
  { id: 'music-3', name: 'Expressão musical', category: 'MUSIC', therapyType: 'MUSIC', description: 'Expressar emoções através da música', targetAccuracy: 65, status: 'active', createdAt: new Date().toISOString() },

  // INTRAVERBAL - ABA
  { id: 'intra-1', name: 'Completar frases', category: 'INTRAVERBAL', therapyType: 'ABA', description: 'Completar frases conhecidas', targetAccuracy: 80, status: 'active', createdAt: new Date().toISOString() },
  { id: 'intra-2', name: 'Responder perguntas', category: 'INTRAVERBAL', therapyType: 'ABA', description: 'Responder perguntas simples', targetAccuracy: 75, status: 'active', createdAt: new Date().toISOString() },
];

const seedBehaviors = [
  { id: 'b1', name: 'Autolesão', type: 'decrease', description: 'Comportamentos de autoagressão', severity: 'high', color: '#EF4444' },
  { id: 'b2', name: 'Estereotipia motora', type: 'decrease', description: 'Movimentos repetitivos', severity: 'medium', color: '#F59E0B' },
  { id: 'b3', name: 'Estereotipia vocal', type: 'decrease', description: 'Vocalizações repetitivas', severity: 'medium', color: '#F59E0B' },
  { id: 'b4', name: 'Ecolalia', type: 'monitor', description: 'Repetição de palavras/frases', severity: 'low', color: '#3B82F6' },
  { id: 'b5', name: 'Birra/Crise', type: 'decrease', description: 'Episódios de choro intenso/gritos', severity: 'high', color: '#EF4444' },
  { id: 'b6', name: 'Fuga', type: 'decrease', description: 'Tentativas de sair de situações', severity: 'medium', color: '#F59E0B' },
  { id: 'b7', name: 'Agressão', type: 'decrease', description: 'Comportamentos agressivos com outros', severity: 'high', color: '#EF4444' },
  { id: 'b8', name: 'Comunicação espontânea', type: 'increase', description: 'Iniciativa de comunicação', severity: 'positive', color: '#10B981' },
  { id: 'b9', name: 'Interação social', type: 'increase', description: 'Busca por interação', severity: 'positive', color: '#10B981' },
  { id: 'b10', name: 'Atenção na tarefa', type: 'increase', description: 'Tempo de foco em atividades', severity: 'positive', color: '#10B981' },
];

const defaultSettings = {
  theme: 'light',
  sessionDuration: 60, // minutos
  trialsPerProgram: 10,
  showCelebrations: true,
  soundEnabled: true,
  language: 'pt-BR',
  autoSave: true,
};

// ==================== INICIALIZAÇÃO ====================
export const initializeData = () => {
  if (typeof window === 'undefined') return;

  // Inicializa dados seed se não existirem
  if (!getFromStorage(STORAGE_KEYS.PROMPTS)) {
    saveToStorage(STORAGE_KEYS.PROMPTS, seedPrompts);
  }
  if (!getFromStorage(STORAGE_KEYS.REINFORCERS)) {
    saveToStorage(STORAGE_KEYS.REINFORCERS, seedReinforcers);
  }
  if (!getFromStorage(STORAGE_KEYS.PROGRAMS)) {
    saveToStorage(STORAGE_KEYS.PROGRAMS, seedPrograms);
  }
  if (!getFromStorage(STORAGE_KEYS.BEHAVIORS)) {
    saveToStorage(STORAGE_KEYS.BEHAVIORS, seedBehaviors);
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
  if (!getFromStorage(STORAGE_KEYS.THERAPISTS)) {
    saveToStorage(STORAGE_KEYS.THERAPISTS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.NOTES)) {
    saveToStorage(STORAGE_KEYS.NOTES, []);
  }
};

// ==================== PATIENT ====================
export const getPatient = () => getFromStorage(STORAGE_KEYS.PATIENT);

export const savePatient = (patient) => {
  saveToStorage(STORAGE_KEYS.PATIENT, {
    ...patient,
    updatedAt: new Date().toISOString(),
  });
  return patient;
};

export const updatePatient = (data) => {
  const patient = getPatient();
  const updated = {
    ...patient,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.PATIENT, updated);
  return updated;
};

// ==================== THERAPISTS ====================
export const getTherapists = () => getFromStorage(STORAGE_KEYS.THERAPISTS) || [];

export const addTherapist = (therapist) => {
  const therapists = getTherapists();
  const newTherapist = {
    ...therapist,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  therapists.push(newTherapist);
  saveToStorage(STORAGE_KEYS.THERAPISTS, therapists);
  return newTherapist;
};

export const updateTherapist = (id, data) => {
  const therapists = getTherapists();
  const index = therapists.findIndex(t => t.id === id);
  if (index !== -1) {
    therapists[index] = { ...therapists[index], ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.THERAPISTS, therapists);
    return therapists[index];
  }
  return null;
};

export const deleteTherapist = (id) => {
  const therapists = getTherapists().filter(t => t.id !== id);
  saveToStorage(STORAGE_KEYS.THERAPISTS, therapists);
};

// ==================== PROGRAMS ====================
export const getPrograms = () => getFromStorage(STORAGE_KEYS.PROGRAMS) || [];

export const getProgramById = (id) => {
  const programs = getPrograms();
  return programs.find(p => p.id === id);
};

export const getProgramsByCategory = (category) => {
  const programs = getPrograms();
  return programs.filter(p => p.category === category);
};

export const addProgram = (program) => {
  const programs = getPrograms();
  const newProgram = {
    ...program,
    id: uuidv4(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  programs.push(newProgram);
  saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
  return newProgram;
};

export const updateProgram = (id, data) => {
  const programs = getPrograms();
  const index = programs.findIndex(p => p.id === id);
  if (index !== -1) {
    programs[index] = { ...programs[index], ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
    return programs[index];
  }
  return null;
};

export const deleteProgram = (id) => {
  const programs = getPrograms().filter(p => p.id !== id);
  saveToStorage(STORAGE_KEYS.PROGRAMS, programs);
};

// ==================== SESSIONS ====================
export const getSessions = () => getFromStorage(STORAGE_KEYS.SESSIONS) || [];

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

export const startSession = (therapistId = null) => {
  const sessions = getSessions();
  const newSession = {
    id: uuidv4(),
    therapistId,
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'active',
    notes: '',
  };
  sessions.push(newSession);
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  return newSession;
};

export const endSession = (id, notes = '') => {
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
    return sessions[index];
  }
  return null;
};

export const getActiveSession = () => {
  const sessions = getSessions();
  return sessions.find(s => s.status === 'active');
};

// ==================== TRIALS ====================
export const getTrials = () => getFromStorage(STORAGE_KEYS.TRIALS) || [];

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

export const addTrial = (trial) => {
  const trials = getTrials();
  const newTrial = {
    ...trial,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    // Timing data - added for task timing feature
    latencyMs: trial.latencyMs || 0, // Time from instruction to response
    durationMs: trial.durationMs || 0, // Total time to complete task
    taskStartTime: trial.taskStartTime || null,
    taskEndTime: trial.taskEndTime || null,
  };
  trials.push(newTrial);
  saveToStorage(STORAGE_KEYS.TRIALS, trials);
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
  const prompted = recentTrials.filter(t => t.promptLevel && t.promptLevel !== 'ind').length;

  // Timing analytics
  const trialsWithTiming = recentTrials.filter(t => t.durationMs > 0);
  const avgDurationMs = trialsWithTiming.length > 0
    ? Math.round(trialsWithTiming.reduce((sum, t) => sum + t.durationMs, 0) / trialsWithTiming.length)
    : 0;
  const avgLatencyMs = trialsWithTiming.length > 0
    ? Math.round(trialsWithTiming.reduce((sum, t) => sum + (t.latencyMs || 0), 0) / trialsWithTiming.length)
    : 0;

  return {
    total,
    correct,
    incorrect,
    prompted,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    independentRate: total > 0 ? Math.round(((total - prompted) / total) * 100) : 0,
    avgDurationMs,
    avgLatencyMs,
    avgDurationSec: Math.round(avgDurationMs / 1000),
    avgLatencySec: Math.round(avgLatencyMs / 1000),
  };
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

  // Group by hour of day
  const byHour = {};
  recentTrials.forEach(t => {
    const hour = new Date(t.timestamp).getHours();
    if (!byHour[hour]) byHour[hour] = { trials: [], correct: 0 };
    byHour[hour].trials.push(t);
    if (t.result === 'correct') byHour[hour].correct++;
  });

  // Find best performance hour
  let bestHour = null;
  let bestAccuracy = 0;
  Object.entries(byHour).forEach(([hour, data]) => {
    const accuracy = data.trials.length > 0 ? (data.correct / data.trials.length) * 100 : 0;
    if (accuracy > bestAccuracy && data.trials.length >= 3) {
      bestAccuracy = accuracy;
      bestHour = parseInt(hour);
    }
  });

  // Performance trend (first half vs second half of period)
  const sorted = [...recentTrials].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstHalfAccuracy = firstHalf.length > 0
    ? (firstHalf.filter(t => t.result === 'correct').length / firstHalf.length) * 100
    : 0;
  const secondHalfAccuracy = secondHalf.length > 0
    ? (secondHalf.filter(t => t.result === 'correct').length / secondHalf.length) * 100
    : 0;

  // Duration trend
  const avgDurationFirstHalf = firstHalf.length > 0
    ? firstHalf.reduce((sum, t) => sum + t.durationMs, 0) / firstHalf.length
    : 0;
  const avgDurationSecondHalf = secondHalf.length > 0
    ? secondHalf.reduce((sum, t) => sum + t.durationMs, 0) / secondHalf.length
    : 0;

  // Fatigue detection (performance drop after X trials in a session)
  const sessionGroups = {};
  recentTrials.forEach(t => {
    if (!sessionGroups[t.sessionId]) sessionGroups[t.sessionId] = [];
    sessionGroups[t.sessionId].push(t);
  });

  let fatiguePoint = null;
  Object.values(sessionGroups).forEach(sessionTrials => {
    if (sessionTrials.length >= 10) {
      // Check if accuracy drops significantly after certain point
      for (let i = 5; i < sessionTrials.length - 3; i++) {
        const before = sessionTrials.slice(0, i).filter(t => t.result === 'correct').length / i;
        const after = sessionTrials.slice(i).filter(t => t.result === 'correct').length / (sessionTrials.length - i);
        if (before - after > 0.2) { // 20% drop
          if (!fatiguePoint || i < fatiguePoint) fatiguePoint = i;
        }
      }
    }
  });

  return {
    hasData: true,
    totalTrialsWithTiming: recentTrials.length,
    bestPerformanceHour: bestHour,
    bestPerformanceHourAccuracy: Math.round(bestAccuracy),
    performanceTrend: secondHalfAccuracy - firstHalfAccuracy > 5 ? 'improving' :
      secondHalfAccuracy - firstHalfAccuracy < -5 ? 'declining' : 'stable',
    durationTrend: avgDurationSecondHalf < avgDurationFirstHalf * 0.9 ? 'faster' :
      avgDurationSecondHalf > avgDurationFirstHalf * 1.1 ? 'slower' : 'consistent',
    suggestedFatigueBreakAt: fatiguePoint,
    avgSessionDuration: Math.round(avgDurationSecondHalf / 1000),
  };
};

// Get timing by program for reports
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
      minDurationSec: programTrials.length > 0
        ? Math.round(Math.min(...programTrials.map(t => t.durationMs)) / 1000)
        : 0,
      maxDurationSec: programTrials.length > 0
        ? Math.round(Math.max(...programTrials.map(t => t.durationMs)) / 1000)
        : 0,
    };
  }).filter(p => p.totalTrials > 0);
};

// ==================== BEHAVIORS ====================
export const getBehaviors = () => getFromStorage(STORAGE_KEYS.BEHAVIORS) || [];

export const getBehaviorById = (id) => {
  const behaviors = getBehaviors();
  return behaviors.find(b => b.id === id);
};

export const addBehavior = (behavior) => {
  const behaviors = getBehaviors();
  const newBehavior = {
    ...behavior,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  behaviors.push(newBehavior);
  saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);
  return newBehavior;
};

export const updateBehavior = (id, data) => {
  const behaviors = getBehaviors();
  const index = behaviors.findIndex(b => b.id === id);
  if (index !== -1) {
    behaviors[index] = { ...behaviors[index], ...data };
    saveToStorage(STORAGE_KEYS.BEHAVIORS, behaviors);
    return behaviors[index];
  }
  return null;
};

// ==================== BEHAVIOR RECORDS ====================
export const getBehaviorRecords = () => getFromStorage(STORAGE_KEYS.BEHAVIOR_RECORDS) || [];

export const addBehaviorRecord = (record) => {
  const records = getBehaviorRecords();
  const newRecord = {
    ...record,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };
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

  // Agrupa por dia
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
export const getDailyCheckins = () => getFromStorage(STORAGE_KEYS.DAILY_CHECKINS) || [];

export const getTodayCheckin = () => {
  const checkins = getDailyCheckins();
  const today = new Date().toDateString();
  return checkins.find(c => new Date(c.date).toDateString() === today);
};

export const saveDailyCheckin = (checkin) => {
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
  return newCheckin;
};

export const getCheckinsByDateRange = (startDate, endDate) => {
  const checkins = getDailyCheckins();
  return checkins.filter(c => {
    const checkinDate = new Date(c.date);
    return checkinDate >= new Date(startDate) && checkinDate <= new Date(endDate);
  });
};

// ==================== NOTES ====================
export const getNotes = () => getFromStorage(STORAGE_KEYS.NOTES) || [];

export const addNote = (note) => {
  const notes = getNotes();
  const newNote = {
    ...note,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  notes.push(newNote);
  saveToStorage(STORAGE_KEYS.NOTES, notes);
  return newNote;
};

export const getNotesBySession = (sessionId) => {
  const notes = getNotes();
  return notes.filter(n => n.sessionId === sessionId);
};

export const deleteNote = (id) => {
  const notes = getNotes().filter(n => n.id !== id);
  saveToStorage(STORAGE_KEYS.NOTES, notes);
};

// ==================== PROMPTS & REINFORCERS ====================
export const getPrompts = () => getFromStorage(STORAGE_KEYS.PROMPTS) || seedPrompts;
export const getReinforcers = () => getFromStorage(STORAGE_KEYS.REINFORCERS) || seedReinforcers;

export const addReinforcer = (reinforcer) => {
  const reinforcers = getReinforcers();
  const newReinforcer = {
    ...reinforcer,
    id: uuidv4(),
  };
  reinforcers.push(newReinforcer);
  saveToStorage(STORAGE_KEYS.REINFORCERS, reinforcers);
  return newReinforcer;
};

// ==================== SETTINGS ====================
export const getSettings = () => getFromStorage(STORAGE_KEYS.SETTINGS) || defaultSettings;

export const updateSettings = (settings) => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  return updated;
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

  // Agrupa por dia para calcular tendência
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
    targetAccuracy: program.targetAccuracy,
    currentAccuracy,
    totalTrials: recentTrials.length,
    isAtTarget: currentAccuracy >= program.targetAccuracy,
    trend: calculateTrend(dailyAccuracies),
    dailyData: byDay,
  };
};

export const getAllProgramsProgress = () => {
  const programs = getPrograms().filter(p => p.status === 'active');
  return programs.map(p => getProgramProgress(p.id)).filter(Boolean);
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

// ==================== DATA EXPORT/IMPORT ====================
export const exportAllData = () => {
  const data = {
    patient: getPatient(),
    therapists: getTherapists(),
    programs: getPrograms(),
    sessions: getSessions(),
    trials: getTrials(),
    behaviors: getBehaviors(),
    behaviorRecords: getBehaviorRecords(),
    dailyCheckins: getDailyCheckins(),
    notes: getNotes(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    if (data.patient) saveToStorage(STORAGE_KEYS.PATIENT, data.patient);
    if (data.therapists) saveToStorage(STORAGE_KEYS.THERAPISTS, data.therapists);
    if (data.programs) saveToStorage(STORAGE_KEYS.PROGRAMS, data.programs);
    if (data.sessions) saveToStorage(STORAGE_KEYS.SESSIONS, data.sessions);
    if (data.trials) saveToStorage(STORAGE_KEYS.TRIALS, data.trials);
    if (data.behaviors) saveToStorage(STORAGE_KEYS.BEHAVIORS, data.behaviors);
    if (data.behaviorRecords) saveToStorage(STORAGE_KEYS.BEHAVIOR_RECORDS, data.behaviorRecords);
    if (data.dailyCheckins) saveToStorage(STORAGE_KEYS.DAILY_CHECKINS, data.dailyCheckins);
    if (data.notes) saveToStorage(STORAGE_KEYS.NOTES, data.notes);
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
