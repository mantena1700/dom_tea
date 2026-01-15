'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Medal,
    Star,
    Flame,
    Zap,
    Target,
    Crown,
    Award,
    Clock,
    TrendingUp,
    CheckCircle2,
    Lock,
    Sparkles,
} from 'lucide-react';
import { getTrials, getSessions, getPrograms, getSettings, updateSettings } from '@/lib/dataService';

// Achievement definitions
const ACHIEVEMENTS = [
    // Speed achievements
    {
        id: 'speed-demon',
        name: 'Velocista',
        description: 'Complete uma tarefa em menos de 3 segundos',
        icon: Zap,
        color: 'from-yellow-400 to-orange-500',
        condition: (stats) => stats.fastestTime && stats.fastestTime < 3000,
        points: 100,
    },
    {
        id: 'quick-learner',
        name: 'Aprendiz Rápido',
        description: 'Complete 10 tarefas em menos de 5 segundos cada',
        icon: Clock,
        color: 'from-blue-400 to-cyan-500',
        condition: (stats) => stats.fastTrials >= 10,
        points: 200,
    },
    {
        id: 'lightning-fast',
        name: 'Raio',
        description: '50 tarefas rápidas completadas',
        icon: Flame,
        color: 'from-orange-400 to-red-500',
        condition: (stats) => stats.fastTrials >= 50,
        points: 500,
    },

    // Accuracy achievements
    {
        id: 'perfect-10',
        name: 'Nota 10',
        description: 'Complete 10 tentativas seguidas sem errar',
        icon: Star,
        color: 'from-yellow-400 to-amber-500',
        condition: (stats) => stats.longestStreak >= 10,
        points: 150,
    },
    {
        id: 'accuracy-master',
        name: 'Mestre da Precisão',
        description: 'Alcance 90% de acerto em um programa',
        icon: Target,
        color: 'from-green-400 to-emerald-500',
        condition: (stats) => stats.hasHighAccuracy,
        points: 200,
    },
    {
        id: 'perfect-session',
        name: 'Sessão Perfeita',
        description: 'Complete uma sessão inteira sem erros',
        icon: Crown,
        color: 'from-purple-400 to-pink-500',
        condition: (stats) => stats.perfectSessions >= 1,
        points: 300,
    },

    // Consistency achievements
    {
        id: 'first-steps',
        name: 'Primeiros Passos',
        description: 'Complete sua primeira sessão',
        icon: Medal,
        color: 'from-gray-400 to-slate-500',
        condition: (stats) => stats.totalSessions >= 1,
        points: 50,
    },
    {
        id: 'dedicated',
        name: 'Dedicado',
        description: 'Complete 10 sessões',
        icon: Trophy,
        color: 'from-amber-400 to-yellow-500',
        condition: (stats) => stats.totalSessions >= 10,
        points: 200,
    },
    {
        id: 'champion',
        name: 'Campeão',
        description: 'Complete 50 sessões',
        icon: Crown,
        color: 'from-violet-400 to-purple-500',
        condition: (stats) => stats.totalSessions >= 50,
        points: 500,
    },
    {
        id: 'legend',
        name: 'Lenda',
        description: 'Complete 100 sessões',
        icon: Sparkles,
        color: 'from-pink-400 to-rose-500',
        condition: (stats) => stats.totalSessions >= 100,
        points: 1000,
    },

    // Trial achievements
    {
        id: 'hundred-trials',
        name: 'Centenário',
        description: 'Complete 100 tentativas',
        icon: Award,
        color: 'from-teal-400 to-cyan-500',
        condition: (stats) => stats.totalTrials >= 100,
        points: 100,
    },
    {
        id: 'thousand-trials',
        name: 'Milionário',
        description: 'Complete 1000 tentativas',
        icon: Star,
        color: 'from-indigo-400 to-blue-500',
        condition: (stats) => stats.totalTrials >= 1000,
        points: 500,
    },

    // Improvement achievements
    {
        id: 'improving',
        name: 'Evoluindo',
        description: 'Melhore a taxa de acerto por 3 dias seguidos',
        icon: TrendingUp,
        color: 'from-green-400 to-lime-500',
        condition: (stats) => stats.improvingDays >= 3,
        points: 150,
    },
];

export default function GamificationPanel() {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState(null);
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showCelebration, setShowCelebration] = useState(null);

    useEffect(() => {
        setMounted(true);
        calculateStats();
    }, []);

    const calculateStats = () => {
        const trials = getTrials();
        const sessions = getSessions().filter(s => s.status === 'completed');
        const programs = getPrograms();
        const settings = getSettings();

        // Calculate various stats for achievements
        const fastTrials = trials.filter(t => t.durationMs && t.durationMs < 5000).length;
        const fastestTime = trials.reduce((min, t) => {
            if (t.durationMs && t.result === 'correct' && (min === null || t.durationMs < min)) {
                return t.durationMs;
            }
            return min;
        }, null);

        // Calculate longest streak
        let longestStreak = 0;
        let currentStreak = 0;
        const sortedTrials = [...trials].sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );
        sortedTrials.forEach(t => {
            if (t.result === 'correct') {
                currentStreak++;
                if (currentStreak > longestStreak) longestStreak = currentStreak;
            } else {
                currentStreak = 0;
            }
        });

        // Check for high accuracy in any program
        let hasHighAccuracy = false;
        programs.forEach(program => {
            const programTrials = trials.filter(t => t.programId === program.id);
            if (programTrials.length >= 10) {
                const correct = programTrials.filter(t => t.result === 'correct').length;
                if ((correct / programTrials.length) * 100 >= 90) {
                    hasHighAccuracy = true;
                }
            }
        });

        // Perfect sessions
        let perfectSessions = 0;
        sessions.forEach(session => {
            const sessionTrials = trials.filter(t => t.sessionId === session.id);
            if (sessionTrials.length >= 5) {
                const allCorrect = sessionTrials.every(t => t.result === 'correct');
                if (allCorrect) perfectSessions++;
            }
        });

        // Calculate improving days (simplified)
        let improvingDays = 0;

        const calculatedStats = {
            totalTrials: trials.length,
            totalSessions: sessions.length,
            fastTrials,
            fastestTime,
            longestStreak,
            hasHighAccuracy,
            perfectSessions,
            improvingDays,
        };

        setStats(calculatedStats);

        // Check which achievements are unlocked
        const unlocked = ACHIEVEMENTS.filter(a => a.condition(calculatedStats));
        setUnlockedAchievements(unlocked);

        // Calculate total points
        const points = unlocked.reduce((sum, a) => sum + a.points, 0);
        setTotalPoints(points);

        // Save to settings
        const previousUnlocked = settings.unlockedAchievements || [];
        const newAchievements = unlocked.filter(a =>
            !previousUnlocked.includes(a.id)
        );

        if (newAchievements.length > 0) {
            // Show celebration for new achievements
            setShowCelebration(newAchievements[0]);
            setTimeout(() => setShowCelebration(null), 3000);

            // Save new achievements
            updateSettings({
                unlockedAchievements: unlocked.map(a => a.id),
                totalPoints: points,
            });
        }
    };

    const getLevel = (points) => {
        if (points >= 3000) return { level: 10, name: 'Mestre Supremo', color: 'text-pink-500' };
        if (points >= 2000) return { level: 9, name: 'Lenda Viva', color: 'text-purple-500' };
        if (points >= 1500) return { level: 8, name: 'Campeão', color: 'text-indigo-500' };
        if (points >= 1000) return { level: 7, name: 'Expert', color: 'text-blue-500' };
        if (points >= 700) return { level: 6, name: 'Avançado', color: 'text-cyan-500' };
        if (points >= 500) return { level: 5, name: 'Intermediário', color: 'text-teal-500' };
        if (points >= 300) return { level: 4, name: 'Aprendiz', color: 'text-green-500' };
        if (points >= 150) return { level: 3, name: 'Iniciante', color: 'text-lime-500' };
        if (points >= 50) return { level: 2, name: 'Novato', color: 'text-yellow-500' };
        return { level: 1, name: 'Começando', color: 'text-gray-500' };
    };

    const getNextLevelPoints = (currentPoints) => {
        const thresholds = [50, 150, 300, 500, 700, 1000, 1500, 2000, 3000, 5000];
        return thresholds.find(t => t > currentPoints) || 5000;
    };

    if (!mounted) {
        return <div className="animate-pulse p-8">Carregando...</div>;
    }

    const level = getLevel(totalPoints);
    const nextLevel = getNextLevelPoints(totalPoints);
    const progress = Math.round((totalPoints / nextLevel) * 100);

    return (
        <div className="space-y-6">
            {/* Header with Level */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="chart-container bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Modo Competição</h2>
                            <p className="text-white/80">Conquiste recordes e desbloqueie conquistas!</p>
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <div className="flex items-center gap-2 justify-center md:justify-end">
                            <Crown className={`w-6 h-6 ${level.color}`} />
                            <span className="text-xl font-bold">Nível {level.level}</span>
                        </div>
                        <p className={`text-sm ${level.color}`}>{level.name}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>{totalPoints} pontos</span>
                        <span>Próximo nível: {nextLevel} pts</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-white rounded-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacityp: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card text-center"
                >
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-3xl font-bold">{unlockedAchievements.length}</p>
                    <p className="text-sm text-neutral-500">Conquistas</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card text-center"
                >
                    <Star className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-3xl font-bold">{totalPoints}</p>
                    <p className="text-sm text-neutral-500">Pontos</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card text-center"
                >
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-3xl font-bold">{stats?.longestStreak || 0}</p>
                    <p className="text-sm text-neutral-500">Melhor Sequência</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="stat-card text-center"
                >
                    <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-3xl font-bold">
                        {stats?.fastestTime ? `${(stats.fastestTime / 1000).toFixed(1)}s` : '--'}
                    </p>
                    <p className="text-sm text-neutral-500">Tempo Recorde</p>
                </motion.div>
            </div>

            {/* Achievements Grid */}
            <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-yellow-500" />
                    Conquistas ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ACHIEVEMENTS.map((achievement, index) => {
                        const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
                        const Icon = achievement.icon;

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-xl border-2 transition-all ${isUnlocked
                                    ? 'border-transparent bg-gradient-to-br ' + achievement.color + ' text-white shadow-lg'
                                    : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked
                                        ? 'bg-white/20'
                                        : 'bg-neutral-200 dark:bg-neutral-700'
                                        }`}>
                                        {isUnlocked ? (
                                            <Icon className="w-6 h-6" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-neutral-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold">{achievement.name}</h4>
                                        <p className={`text-sm mt-1 ${isUnlocked ? 'text-white/80' : 'text-neutral-500'}`}>
                                            {achievement.description}
                                        </p>
                                        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isUnlocked ? 'text-white' : 'text-neutral-400'
                                            }`}>
                                            <Star className="w-4 h-4" />
                                            {achievement.points} pontos
                                        </div>
                                    </div>
                                    {isUnlocked && (
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* New Achievement Celebration */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="text-center bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-2xl">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{ repeat: 2, duration: 0.5 }}
                                className="text-6xl mb-4"
                            >
                                🏆
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-2">Nova Conquista!</h2>
                            <p className="text-lg text-primary-600 font-semibold">{showCelebration.name}</p>
                            <p className="text-neutral-500 mt-1">+{showCelebration.points} pontos</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
