/**
 * Dom TEA - AI Insights Service
 * Sistema de análise inteligente para gerar insights e sugestões
 * Analisa padrões nos dados para ajudar terapeutas e famílias
 */

import {
    getPrograms,
    getTrials,
    getBehaviors,
    getBehaviorRecords,
    getDailyCheckins,
    getSessions,
    getTrialStats,
    getBehaviorStats,
    getProgramProgress,
    getTimingAnalytics,
    getTimingByProgram,
} from './dataService';

// Tipos de insights
const INSIGHT_TYPES = {
    SUCCESS: 'success',
    WARNING: 'warning',
    INFO: 'info',
    SUGGESTION: 'suggestion',
    CELEBRATION: 'celebration',
};

// Prioridades
const PRIORITIES = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};

/**
 * Gera todos os insights baseados nos dados atuais
 */
export const generateInsights = () => {
    const insights = [];

    // Análise de programas
    insights.push(...analyzeProgramPerformance());

    // Análise de comportamentos
    insights.push(...analyzeBehaviorTrends());

    // Correlações entre check-in e desempenho
    insights.push(...analyzeCheckinCorrelations());

    // Padrões temporais
    insights.push(...analyzeTemporalPatterns());

    // Análise de timing - NEW
    insights.push(...analyzeTimingPatterns());

    // Sugestões de otimização
    insights.push(...generateOptimizationSuggestions());

    // Celebrações e marcos
    insights.push(...generateCelebrations());

    // Ordena por prioridade
    return insights.sort((a, b) => a.priority - b.priority);
};

/**
 * Analisa desempenho dos programas
 */
const analyzeProgramPerformance = () => {
    const insights = [];
    const programs = getPrograms().filter(p => p.status === 'active');

    programs.forEach(program => {
        const stats = getTrialStats(program.id, 30);
        const progress = getProgramProgress(program.id);

        if (!stats || stats.total < 5) return;

        // Programa atingiu meta
        if (progress?.isAtTarget && stats.accuracy >= program.targetAccuracy) {
            insights.push({
                id: `prog-target-${program.id}`,
                type: INSIGHT_TYPES.CELEBRATION,
                priority: PRIORITIES.MEDIUM,
                title: `🎯 Meta Atingida: ${program.name}`,
                description: `O programa "${program.name}" atingiu a meta de ${program.targetAccuracy}% com ${stats.accuracy}% de acerto!`,
                category: 'program',
                programId: program.id,
                metric: stats.accuracy,
                suggestion: 'Considere aumentar a meta ou adicionar variações mais complexas.',
                timestamp: new Date().toISOString(),
            });
        }

        // Programa com dificuldade (abaixo de 50%)
        if (stats.accuracy < 50 && stats.total >= 10) {
            insights.push({
                id: `prog-difficulty-${program.id}`,
                type: INSIGHT_TYPES.WARNING,
                priority: PRIORITIES.HIGH,
                title: `⚠️ Dificuldade em: ${program.name}`,
                description: `Taxa de acerto de apenas ${stats.accuracy}% nos últimos 30 dias (${stats.total} tentativas).`,
                category: 'program',
                programId: program.id,
                metric: stats.accuracy,
                suggestion: 'Considere simplificar os alvos, aumentar prompts ou revisar a motivação.',
                timestamp: new Date().toISOString(),
            });
        }

        // Programa estagnado
        if (progress?.trend === 'stable' && !progress?.isAtTarget && stats.total >= 20) {
            insights.push({
                id: `prog-stagnant-${program.id}`,
                type: INSIGHT_TYPES.INFO,
                priority: PRIORITIES.MEDIUM,
                title: `📊 Programa Estagnado: ${program.name}`,
                description: `O programa não tem mostrado evolução significativa nas últimas semanas.`,
                category: 'program',
                programId: program.id,
                metric: stats.accuracy,
                suggestion: 'Tente variar os estímulos, materiais ou ambiente de treino.',
                timestamp: new Date().toISOString(),
            });
        }

        // Melhoria significativa
        if (progress?.trend === 'increasing') {
            insights.push({
                id: `prog-improving-${program.id}`,
                type: INSIGHT_TYPES.SUCCESS,
                priority: PRIORITIES.LOW,
                title: `📈 Evolução Positiva: ${program.name}`,
                description: `O desempenho tem melhorado consistentemente neste programa.`,
                category: 'program',
                programId: program.id,
                metric: stats.accuracy,
                suggestion: 'Continue com a estratégia atual, ela está funcionando!',
                timestamp: new Date().toISOString(),
            });
        }

        // Alta dependência de prompt
        if (stats.total >= 10 && stats.independentRate < 30) {
            insights.push({
                id: `prog-prompt-dep-${program.id}`,
                type: INSIGHT_TYPES.WARNING,
                priority: PRIORITIES.MEDIUM,
                title: `🤚 Alta Dependência de Prompt: ${program.name}`,
                description: `Apenas ${stats.independentRate}% das respostas são independentes.`,
                category: 'program',
                programId: program.id,
                metric: stats.independentRate,
                suggestion: 'Trabalhe estratégias de fading de prompt mais gradual.',
                timestamp: new Date().toISOString(),
            });
        }
    });

    return insights;
};

/**
 * Analisa tendências de comportamentos
 */
const analyzeBehaviorTrends = () => {
    const insights = [];
    const behaviors = getBehaviors();

    behaviors.forEach(behavior => {
        const stats = getBehaviorStats(behavior.id, 30);

        if (stats.daysRecorded < 3) return;

        // Comportamento a reduzir está diminuindo
        if (behavior.type === 'decrease' && stats.trend === 'decreasing') {
            insights.push({
                id: `beh-decrease-${behavior.id}`,
                type: INSIGHT_TYPES.SUCCESS,
                priority: PRIORITIES.MEDIUM,
                title: `✅ Redução de: ${behavior.name}`,
                description: `O comportamento "${behavior.name}" está diminuindo! Média de ${stats.avgPerDay} ocorrências/dia.`,
                category: 'behavior',
                behaviorId: behavior.id,
                metric: stats.avgPerDay,
                suggestion: 'Mantenha as estratégias atuais de manejo.',
                timestamp: new Date().toISOString(),
            });
        }

        // Comportamento a reduzir está aumentando
        if (behavior.type === 'decrease' && stats.trend === 'increasing') {
            insights.push({
                id: `beh-increase-${behavior.id}`,
                type: INSIGHT_TYPES.WARNING,
                priority: PRIORITIES.HIGH,
                title: `🚨 Aumento de: ${behavior.name}`,
                description: `O comportamento "${behavior.name}" está aumentando. Média atual: ${stats.avgPerDay}/dia.`,
                category: 'behavior',
                behaviorId: behavior.id,
                metric: stats.avgPerDay,
                suggestion: 'Revise antecedentes, consequências e possíveis gatilhos.',
                timestamp: new Date().toISOString(),
            });
        }

        // Comportamento a aumentar está crescendo
        if (behavior.type === 'increase' && stats.trend === 'increasing') {
            insights.push({
                id: `beh-positive-${behavior.id}`,
                type: INSIGHT_TYPES.CELEBRATION,
                priority: PRIORITIES.LOW,
                title: `🌟 Crescimento Positivo: ${behavior.name}`,
                description: `"${behavior.name}" está aumentando! Média de ${stats.avgPerDay} ocorrências/dia.`,
                category: 'behavior',
                behaviorId: behavior.id,
                metric: stats.avgPerDay,
                suggestion: 'Continue reforçando este comportamento.',
                timestamp: new Date().toISOString(),
            });
        }

        // Comportamento de alta severidade frequente
        if (behavior.severity === 'high' && stats.avgPerDay > 3) {
            insights.push({
                id: `beh-severe-${behavior.id}`,
                type: INSIGHT_TYPES.WARNING,
                priority: PRIORITIES.HIGH,
                title: `⚠️ Frequência Alta: ${behavior.name}`,
                description: `Comportamento de alta severidade ocorrendo ${stats.avgPerDay}x por dia em média.`,
                category: 'behavior',
                behaviorId: behavior.id,
                metric: stats.avgPerDay,
                suggestion: 'Considere uma análise funcional detalhada e intervenção específica.',
                timestamp: new Date().toISOString(),
            });
        }
    });

    return insights;
};

/**
 * Analisa correlações entre check-in diário e desempenho
 */
const analyzeCheckinCorrelations = () => {
    const insights = [];
    const checkins = getDailyCheckins();
    const trials = getTrials();

    if (checkins.length < 7) return insights;

    // Agrupa dados por dia
    const dailyData = {};

    checkins.forEach(checkin => {
        const day = new Date(checkin.date).toDateString();
        dailyData[day] = {
            checkin,
            trials: [],
        };
    });

    trials.forEach(trial => {
        const day = new Date(trial.timestamp).toDateString();
        if (dailyData[day]) {
            dailyData[day].trials.push(trial);
        }
    });

    // Analisa correlações
    const daysWithData = Object.values(dailyData).filter(d => d.trials.length >= 5);

    if (daysWithData.length < 5) return insights;

    // Correlação sono x desempenho
    const sleepCorrelation = analyzeSleepPerformance(daysWithData);
    if (sleepCorrelation) {
        insights.push(sleepCorrelation);
    }

    // Correlação humor x desempenho
    const moodCorrelation = analyzeMoodPerformance(daysWithData);
    if (moodCorrelation) {
        insights.push(moodCorrelation);
    }

    // Correlação saúde x desempenho
    const healthCorrelation = analyzeHealthPerformance(daysWithData);
    if (healthCorrelation) {
        insights.push(healthCorrelation);
    }

    return insights;
};

const analyzeSleepPerformance = (daysWithData) => {
    const goodSleepDays = daysWithData.filter(d => d.checkin.sleep >= 8);
    const poorSleepDays = daysWithData.filter(d => d.checkin.sleep < 6);

    if (goodSleepDays.length < 3 || poorSleepDays.length < 3) return null;

    const goodSleepAccuracy = calculateDaysAccuracy(goodSleepDays);
    const poorSleepAccuracy = calculateDaysAccuracy(poorSleepDays);

    const diff = goodSleepAccuracy - poorSleepAccuracy;

    if (diff > 15) {
        return {
            id: 'corr-sleep',
            type: INSIGHT_TYPES.INFO,
            priority: PRIORITIES.MEDIUM,
            title: '😴 Impacto do Sono no Desempenho',
            description: `Quando dorme bem (8h+), a taxa de acerto é ${Math.round(diff)}% maior do que em dias de sono ruim.`,
            category: 'correlation',
            metrics: { goodSleepAccuracy, poorSleepAccuracy, diff },
            suggestion: 'Priorize uma boa rotina de sono para otimizar as sessões de terapia.',
            timestamp: new Date().toISOString(),
        };
    }

    return null;
};

const analyzeMoodPerformance = (daysWithData) => {
    const happyDays = daysWithData.filter(d => ['happy', 'excited'].includes(d.checkin.mood));
    const sadDays = daysWithData.filter(d => ['sad', 'angry', 'tired'].includes(d.checkin.mood));

    if (happyDays.length < 3 || sadDays.length < 2) return null;

    const happyAccuracy = calculateDaysAccuracy(happyDays);
    const sadAccuracy = calculateDaysAccuracy(sadDays);

    const diff = happyAccuracy - sadAccuracy;

    if (diff > 10) {
        return {
            id: 'corr-mood',
            type: INSIGHT_TYPES.INFO,
            priority: PRIORITIES.MEDIUM,
            title: '😊 Impacto do Humor no Desempenho',
            description: `Em dias de bom humor, o desempenho é ${Math.round(diff)}% superior.`,
            category: 'correlation',
            metrics: { happyAccuracy, sadAccuracy, diff },
            suggestion: 'Inicie as sessões com atividades motivadoras para melhorar o estado emocional.',
            timestamp: new Date().toISOString(),
        };
    }

    return null;
};

const analyzeHealthPerformance = (daysWithData) => {
    const healthyDays = daysWithData.filter(d => d.checkin.health === 'normal');
    const sickDays = daysWithData.filter(d => d.checkin.health !== 'normal');

    if (healthyDays.length < 3 || sickDays.length < 2) return null;

    const healthyAccuracy = calculateDaysAccuracy(healthyDays);
    const sickAccuracy = calculateDaysAccuracy(sickDays);

    const diff = healthyAccuracy - sickAccuracy;

    if (diff > 20) {
        return {
            id: 'corr-health',
            type: INSIGHT_TYPES.INFO,
            priority: PRIORITIES.LOW,
            title: '🏥 Impacto da Saúde no Desempenho',
            description: `Quando está saudável, o desempenho é ${Math.round(diff)}% melhor.`,
            category: 'correlation',
            metrics: { healthyAccuracy, sickAccuracy, diff },
            suggestion: 'Em dias de indisposição, considere sessões mais curtas e leves.',
            timestamp: new Date().toISOString(),
        };
    }

    return null;
};

const calculateDaysAccuracy = (days) => {
    const allTrials = days.flatMap(d => d.trials);
    if (allTrials.length === 0) return 0;
    const correct = allTrials.filter(t => t.result === 'correct').length;
    return Math.round((correct / allTrials.length) * 100);
};

/**
 * Analisa padrões temporais
 */
const analyzeTemporalPatterns = () => {
    const insights = [];
    const sessions = getSessions().filter(s => s.status === 'completed');
    const trials = getTrials();

    if (sessions.length < 10) return insights;

    // Analisa melhor horário
    const hourlyPerformance = {};

    trials.forEach(trial => {
        const hour = new Date(trial.timestamp).getHours();
        if (!hourlyPerformance[hour]) {
            hourlyPerformance[hour] = { correct: 0, total: 0 };
        }
        hourlyPerformance[hour].total++;
        if (trial.result === 'correct') {
            hourlyPerformance[hour].correct++;
        }
    });

    const hoursWithEnoughData = Object.entries(hourlyPerformance)
        .filter(([_, data]) => data.total >= 10)
        .map(([hour, data]) => ({
            hour: parseInt(hour),
            accuracy: Math.round((data.correct / data.total) * 100),
            total: data.total,
        }));

    if (hoursWithEnoughData.length >= 3) {
        const bestHour = hoursWithEnoughData.reduce((best, curr) =>
            curr.accuracy > best.accuracy ? curr : best
        );

        const worstHour = hoursWithEnoughData.reduce((worst, curr) =>
            curr.accuracy < worst.accuracy ? curr : worst
        );

        if (bestHour.accuracy - worstHour.accuracy > 15) {
            insights.push({
                id: 'temporal-best-hour',
                type: INSIGHT_TYPES.INFO,
                priority: PRIORITIES.MEDIUM,
                title: '⏰ Melhor Horário para Terapia',
                description: `O melhor desempenho ocorre às ${bestHour.hour}h (${bestHour.accuracy}% de acerto). Evite ${worstHour.hour}h (${worstHour.accuracy}%).`,
                category: 'temporal',
                metrics: { bestHour, worstHour },
                suggestion: `Tente agendar as sessões principais próximo às ${bestHour.hour}h.`,
                timestamp: new Date().toISOString(),
            });
        }
    }

    // Analisa dias da semana
    const dayPerformance = {};
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    trials.forEach(trial => {
        const day = new Date(trial.timestamp).getDay();
        if (!dayPerformance[day]) {
            dayPerformance[day] = { correct: 0, total: 0 };
        }
        dayPerformance[day].total++;
        if (trial.result === 'correct') {
            dayPerformance[day].correct++;
        }
    });

    const daysWithEnoughData = Object.entries(dayPerformance)
        .filter(([_, data]) => data.total >= 10)
        .map(([day, data]) => ({
            day: parseInt(day),
            dayName: dayNames[parseInt(day)],
            accuracy: Math.round((data.correct / data.total) * 100),
            total: data.total,
        }));

    if (daysWithEnoughData.length >= 3) {
        const bestDay = daysWithEnoughData.reduce((best, curr) =>
            curr.accuracy > best.accuracy ? curr : best
        );

        insights.push({
            id: 'temporal-best-day',
            type: INSIGHT_TYPES.INFO,
            priority: PRIORITIES.LOW,
            title: '📅 Melhor Dia da Semana',
            description: `${bestDay.dayName} é o dia com melhor desempenho: ${bestDay.accuracy}% de acerto.`,
            category: 'temporal',
            metrics: { bestDay },
            suggestion: `Considere programas mais desafiadores para ${bestDay.dayName}.`,
            timestamp: new Date().toISOString(),
        });
    }

    return insights;
};

/**
 * Analisa padrões de timing das tarefas - NEW
 */
const analyzeTimingPatterns = () => {
    const insights = [];
    const timingAnalytics = getTimingAnalytics(null, 30);
    const timingByProgram = getTimingByProgram(30);

    if (!timingAnalytics.hasData) return insights;

    // Melhor horário para desempenho
    if (timingAnalytics.bestPerformanceHour !== null) {
        const hourStr = timingAnalytics.bestPerformanceHour.toString().padStart(2, '0') + ':00';
        insights.push({
            id: 'timing-best-hour',
            type: INSIGHT_TYPES.INFO,
            priority: PRIORITIES.MEDIUM,
            title: `⏰ Melhor Horário para Terapia`,
            description: `O melhor desempenho ocorre às ${hourStr} com ${timingAnalytics.bestPerformanceHourAccuracy}% de acerto.`,
            category: 'timing',
            metrics: timingAnalytics,
            suggestion: `Tente agendar as sessões principais próximo às ${hourStr}.`,
            timestamp: new Date().toISOString(),
        });
    }

    // Tendência de desempenho
    if (timingAnalytics.performanceTrend === 'improving') {
        insights.push({
            id: 'timing-improving',
            type: INSIGHT_TYPES.SUCCESS,
            priority: PRIORITIES.LOW,
            title: `📈 Desempenho Melhorando`,
            description: `A taxa de acerto tem melhorado ao longo das últimas semanas!`,
            category: 'timing',
            metrics: timingAnalytics,
            suggestion: 'Continue com a abordagem atual, está funcionando bem!',
            timestamp: new Date().toISOString(),
        });
    } else if (timingAnalytics.performanceTrend === 'declining') {
        insights.push({
            id: 'timing-declining',
            type: INSIGHT_TYPES.WARNING,
            priority: PRIORITIES.HIGH,
            title: `📉 Desempenho em Queda`,
            description: `A taxa de acerto diminuiu nas últimas semanas.`,
            category: 'timing',
            metrics: timingAnalytics,
            suggestion: 'Considere revisar as estratégias, nível de dificuldade ou motivação.',
            timestamp: new Date().toISOString(),
        });
    }

    // Velocidade de resposta
    if (timingAnalytics.durationTrend === 'faster') {
        insights.push({
            id: 'timing-faster',
            type: INSIGHT_TYPES.SUCCESS,
            priority: PRIORITIES.LOW,
            title: `⚡ Respostas Mais Rápidas`,
            description: `O tempo de resposta está diminuindo - a criança está respondendo mais rápido!`,
            category: 'timing',
            metrics: timingAnalytics,
            suggestion: 'Sinal de aprendizado consolidado. Considere desafios maiores.',
            timestamp: new Date().toISOString(),
        });
    } else if (timingAnalytics.durationTrend === 'slower') {
        insights.push({
            id: 'timing-slower',
            type: INSIGHT_TYPES.WARNING,
            priority: PRIORITIES.MEDIUM,
            title: `🐢 Respostas Mais Lentas`,
            description: `O tempo para completar tarefas aumentou recentemente.`,
            category: 'timing',
            metrics: timingAnalytics,
            suggestion: 'Verifique se há cansaço, distração ou dificuldade adicional.',
            timestamp: new Date().toISOString(),
        });
    }

    // Sugestão de pausa por fadiga
    if (timingAnalytics.suggestedFatigueBreakAt) {
        insights.push({
            id: 'timing-fatigue',
            type: INSIGHT_TYPES.SUGGESTION,
            priority: PRIORITIES.HIGH,
            title: `😴 Detectada Fadiga na Sessão`,
            description: `O desempenho tende a cair após ${timingAnalytics.suggestedFatigueBreakAt} tentativas.`,
            category: 'timing',
            metrics: timingAnalytics,
            suggestion: `Considere pausas após ${timingAnalytics.suggestedFatigueBreakAt} tentativas ou sessões mais curtas.`,
            timestamp: new Date().toISOString(),
        });
    }

    // Análise de programas com tempo mais longo
    if (timingByProgram.length > 0) {
        const slowestProgram = [...timingByProgram].sort((a, b) => b.avgDurationSec - a.avgDurationSec)[0];
        const fastestProgram = [...timingByProgram].sort((a, b) => a.avgDurationSec - b.avgDurationSec)[0];

        if (slowestProgram && slowestProgram.avgDurationSec > 30 && slowestProgram.totalTrials >= 5) {
            insights.push({
                id: `timing-slow-program-${slowestProgram.programId}`,
                type: INSIGHT_TYPES.INFO,
                priority: PRIORITIES.LOW,
                title: `🕐 Programa Mais Demorado: ${slowestProgram.programName}`,
                description: `Este programa leva em média ${slowestProgram.avgDurationSec}s por tentativa.`,
                category: 'timing',
                metrics: slowestProgram,
                suggestion: 'Considere se o tempo é adequado ou se precisa de simplificação.',
                timestamp: new Date().toISOString(),
            });
        }

        if (fastestProgram && fastestProgram !== slowestProgram && fastestProgram.totalTrials >= 5) {
            insights.push({
                id: `timing-fast-program-${fastestProgram.programId}`,
                type: INSIGHT_TYPES.SUCCESS,
                priority: PRIORITIES.LOW,
                title: `⚡ Programa Mais Rápido: ${fastestProgram.programName}`,
                description: `Respostas rápidas! Média de apenas ${fastestProgram.avgDurationSec}s por tentativa.`,
                category: 'timing',
                metrics: fastestProgram,
                suggestion: 'Habilidade bem desenvolvida. Considere aumentar complexidade.',
                timestamp: new Date().toISOString(),
            });
        }
    }

    return insights;
};

/**
 * Gera sugestões de otimização
 */
const generateOptimizationSuggestions = () => {
    const insights = [];
    const programs = getPrograms().filter(p => p.status === 'active');
    const sessions = getSessions();
    const trials = getTrials();

    // Verifica frequência de sessões
    const last14Days = new Date();
    last14Days.setDate(last14Days.getDate() - 14);

    const recentSessions = sessions.filter(s => new Date(s.startTime) >= last14Days);
    const avgSessionsPerWeek = (recentSessions.length / 2);

    if (avgSessionsPerWeek < 3) {
        insights.push({
            id: 'opt-frequency',
            type: INSIGHT_TYPES.SUGGESTION,
            priority: PRIORITIES.MEDIUM,
            title: '📆 Aumentar Frequência de Sessões',
            description: `Apenas ${avgSessionsPerWeek.toFixed(1)} sessões por semana. O ideal é 4-5 sessões semanais.`,
            category: 'optimization',
            metrics: { avgSessionsPerWeek },
            suggestion: 'Tente aumentar gradualmente a frequência das sessões para melhores resultados.',
            timestamp: new Date().toISOString(),
        });
    }

    // Programas não praticados recentemente
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    programs.forEach(program => {
        const programTrials = trials.filter(t =>
            t.programId === program.id && new Date(t.timestamp) >= lastWeek
        );

        if (programTrials.length === 0) {
            const lastTrial = trials
                .filter(t => t.programId === program.id)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            if (lastTrial) {
                const daysSince = Math.floor((new Date() - new Date(lastTrial.timestamp)) / (1000 * 60 * 60 * 24));

                if (daysSince > 7) {
                    insights.push({
                        id: `opt-neglected-${program.id}`,
                        type: INSIGHT_TYPES.SUGGESTION,
                        priority: PRIORITIES.LOW,
                        title: `📝 Retomar: ${program.name}`,
                        description: `Este programa não é praticado há ${daysSince} dias.`,
                        category: 'optimization',
                        programId: program.id,
                        metrics: { daysSince },
                        suggestion: 'Inclua este programa nas próximas sessões para manter a consistência.',
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        }
    });

    // Sugestão de variar reforçadores
    const recentTrials = trials.filter(t => new Date(t.timestamp) >= lastWeek);
    const reinforcersUsed = new Set(recentTrials.map(t => t.reinforcer).filter(Boolean));

    if (reinforcersUsed.size < 3 && recentTrials.length > 20) {
        insights.push({
            id: 'opt-reinforcers',
            type: INSIGHT_TYPES.SUGGESTION,
            priority: PRIORITIES.LOW,
            title: '🎁 Variar Reforçadores',
            description: `Poucos reforçadores diferentes estão sendo usados (${reinforcersUsed.size}).`,
            category: 'optimization',
            metrics: { reinforcersCount: reinforcersUsed.size },
            suggestion: 'Varie os reforçadores para manter a motivação alta e evitar saciedade.',
            timestamp: new Date().toISOString(),
        });
    }

    return insights;
};

/**
 * Gera celebrações e marcos
 */
const generateCelebrations = () => {
    const insights = [];
    const trials = getTrials();
    const sessions = getSessions();

    // Marcos de tentativas
    const totalTrials = trials.length;
    const milestones = [100, 250, 500, 1000, 2500, 5000, 10000];

    milestones.forEach(milestone => {
        if (totalTrials >= milestone && totalTrials < milestone + 50) {
            insights.push({
                id: `milestone-trials-${milestone}`,
                type: INSIGHT_TYPES.CELEBRATION,
                priority: PRIORITIES.LOW,
                title: `🎉 ${milestone} Tentativas!`,
                description: `Parabéns! Vocês já realizaram ${milestone} tentativas de treino!`,
                category: 'milestone',
                metrics: { totalTrials },
                suggestion: 'Continuem assim! Cada tentativa é um passo em direção ao progresso.',
                timestamp: new Date().toISOString(),
            });
        }
    });

    // Marcos de sessões
    const totalSessions = sessions.filter(s => s.status === 'completed').length;
    const sessionMilestones = [10, 25, 50, 100, 250, 500];

    sessionMilestones.forEach(milestone => {
        if (totalSessions >= milestone && totalSessions < milestone + 3) {
            insights.push({
                id: `milestone-sessions-${milestone}`,
                type: INSIGHT_TYPES.CELEBRATION,
                priority: PRIORITIES.LOW,
                title: `🏆 ${milestone} Sessões Completas!`,
                description: `Incrível dedicação! Já são ${milestone} sessões de terapia realizadas.`,
                category: 'milestone',
                metrics: { totalSessions },
                suggestion: 'A consistência é chave para o sucesso na terapia ABA.',
                timestamp: new Date().toISOString(),
            });
        }
    });

    // Sequência de dias consecutivos
    const sessionDays = new Set(
        sessions
            .filter(s => s.status === 'completed')
            .map(s => new Date(s.startTime).toDateString())
    );

    let consecutiveDays = 0;
    let currentDate = new Date();

    while (sessionDays.has(currentDate.toDateString())) {
        consecutiveDays++;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    if (consecutiveDays >= 5) {
        insights.push({
            id: 'streak-days',
            type: INSIGHT_TYPES.CELEBRATION,
            priority: PRIORITIES.LOW,
            title: `🔥 ${consecutiveDays} Dias Consecutivos!`,
            description: `Sequência incrível de ${consecutiveDays} dias seguidos de terapia!`,
            category: 'streak',
            metrics: { consecutiveDays },
            suggestion: 'Mantenham a rotina, mas lembrem-se de descansar quando necessário.',
            timestamp: new Date().toISOString(),
        });
    }

    return insights;
};

/**
 * Gera relatório resumido para a terapeuta
 */
export const generateTherapistReport = (startDate, endDate) => {
    const trials = getTrials().filter(t => {
        const date = new Date(t.timestamp);
        return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const sessions = getSessions().filter(s => {
        const date = new Date(s.startTime);
        return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const behaviorRecords = getBehaviorRecords().filter(r => {
        const date = new Date(r.timestamp);
        return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const programs = getPrograms();

    // Estatísticas gerais
    const totalTrials = trials.length;
    const correctTrials = trials.filter(t => t.result === 'correct').length;
    const overallAccuracy = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    // Estatísticas por programa
    const programStats = {};
    programs.forEach(program => {
        const programTrials = trials.filter(t => t.programId === program.id);
        if (programTrials.length > 0) {
            const correct = programTrials.filter(t => t.result === 'correct').length;
            programStats[program.id] = {
                name: program.name,
                category: program.category,
                trials: programTrials.length,
                accuracy: Math.round((correct / programTrials.length) * 100),
                targetAccuracy: program.targetAccuracy,
                isAtTarget: Math.round((correct / programTrials.length) * 100) >= program.targetAccuracy,
            };
        }
    });

    // Estatísticas de comportamento
    const behaviorStats = {};
    const behaviors = getBehaviors();
    behaviors.forEach(behavior => {
        const records = behaviorRecords.filter(r => r.behaviorId === behavior.id);
        if (records.length > 0) {
            const totalCount = records.reduce((sum, r) => sum + (r.count || 1), 0);
            behaviorStats[behavior.id] = {
                name: behavior.name,
                type: behavior.type,
                occurrences: records.length,
                totalCount,
                trend: getBehaviorStats(behavior.id, 30).trend,
            };
        }
    });

    return {
        period: { startDate, endDate },
        summary: {
            totalSessions: sessions.length,
            totalTrials,
            overallAccuracy,
            programsWorked: Object.keys(programStats).length,
            behaviorsRecorded: Object.keys(behaviorStats).length,
        },
        programStats,
        behaviorStats,
        insights: generateInsights().slice(0, 10),
        generatedAt: new Date().toISOString(),
    };
};

/**
 * Obtém recomendações para próxima sessão
 */
export const getNextSessionRecommendations = () => {
    const recommendations = [];
    const programs = getPrograms().filter(p => p.status === 'active');
    const trials = getTrials();
    const todayCheckin = getDailyCheckins().find(
        c => new Date(c.date).toDateString() === new Date().toDateString()
    );

    // Prioriza programas baseado em desempenho e necessidade
    const programPriorities = programs.map(program => {
        const stats = getTrialStats(program.id, 14);
        const progress = getProgramProgress(program.id);

        let priority = 50; // Base

        // Aumenta prioridade se está abaixo da meta
        if (progress && !progress.isAtTarget) {
            priority += 20;
        }

        // Aumenta prioridade se não praticado recentemente
        const lastTrial = trials
            .filter(t => t.programId === program.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

        if (lastTrial) {
            const daysSince = Math.floor((new Date() - new Date(lastTrial.timestamp)) / (1000 * 60 * 60 * 24));
            priority += Math.min(daysSince * 5, 30);
        } else {
            priority += 30; // Nunca praticado
        }

        // Reduz prioridade se check-in ruim e programa é difícil
        if (todayCheckin) {
            if (todayCheckin.mood === 'tired' || todayCheckin.mood === 'sad') {
                if (stats.accuracy < 50) {
                    priority -= 20; // Evita programas difíceis em dias ruins
                }
            }
        }

        return {
            program,
            priority,
            stats,
            progress,
        };
    });

    // Ordena por prioridade
    programPriorities.sort((a, b) => b.priority - a.priority);

    // Top 5 programas recomendados
    const topPrograms = programPriorities.slice(0, 5);

    topPrograms.forEach(({ program, stats, progress }) => {
        recommendations.push({
            type: 'program',
            programId: program.id,
            name: program.name,
            category: program.category,
            reason: progress?.isAtTarget
                ? 'Manutenção de habilidade adquirida'
                : stats.total < 10
                    ? 'Precisa de mais prática'
                    : stats.accuracy < 50
                        ? 'Dificuldade - trabalhar com mais prompts'
                        : 'Em progresso normal',
            suggestedTrials: 10,
            currentAccuracy: stats.accuracy,
        });
    });

    // Adiciona sugestões baseadas no check-in
    if (todayCheckin) {
        if (todayCheckin.sleep < 6) {
            recommendations.unshift({
                type: 'tip',
                title: 'Sessão mais curta hoje',
                description: 'Sono insuficiente pode afetar o desempenho. Considere uma sessão mais breve.',
            });
        }

        if (todayCheckin.health !== 'normal') {
            recommendations.unshift({
                type: 'tip',
                title: 'Adaptações por saúde',
                description: 'Considere programas mais leves e mais intervalos hoje.',
            });
        }
    }

    return recommendations;
};

export default {
    generateInsights,
    generateTherapistReport,
    getNextSessionRecommendations,
};
