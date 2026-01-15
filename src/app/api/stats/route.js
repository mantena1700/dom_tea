import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/stats - Estatísticas gerais
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Sessões de hoje
        const todaySessions = await prisma.session.count({
            where: {
                patientId: patientId || undefined,
                startTime: { gte: today }
            }
        });

        // Total de sessões no período
        const totalSessions = await prisma.session.count({
            where: {
                patientId: patientId || undefined,
                startTime: { gte: startDate }
            }
        });

        // Trials do período para calcular taxa de acerto
        const trials = await prisma.trial.findMany({
            where: {
                timestamp: { gte: startDate },
                session: patientId ? { patientId } : undefined
            },
            select: {
                result: true,
                promptLevel: true,
                timestamp: true,
            }
        });

        // Calcular estatísticas
        const totalTrials = trials.length;
        const correctTrials = trials.filter(t => t.result === 'correct').length;
        const independentTrials = trials.filter(t => t.promptLevel === 'I').length;

        const accuracy = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
        const independentRate = totalTrials > 0 ? Math.round((independentTrials / totalTrials) * 100) : 0;

        // Trials de hoje
        const todayTrials = trials.filter(t => new Date(t.timestamp) >= today);
        const todayCorrect = todayTrials.filter(t => t.result === 'correct').length;
        const todayAccuracy = todayTrials.length > 0 ? Math.round((todayCorrect / todayTrials.length) * 100) : 0;

        // Trials da semana (últimos 7 dias)
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekTrials = trials.filter(t => new Date(t.timestamp) >= weekStart);
        const weekCorrect = weekTrials.filter(t => t.result === 'correct').length;
        const weekAccuracy = weekTrials.length > 0 ? Math.round((weekCorrect / weekTrials.length) * 100) : 0;

        // Calcular média de sessões por dia
        const sessionsPerDay = days > 0 ? (totalSessions / days).toFixed(1) : 0;

        // Duração média das sessões
        const sessionsWithDuration = await prisma.session.aggregate({
            where: {
                patientId: patientId || undefined,
                startTime: { gte: startDate },
                duration: { not: null }
            },
            _avg: { duration: true }
        });
        const avgSessionDuration = Math.round(sessionsWithDuration._avg.duration || 0);

        // Comportamentos registrados hoje
        const behaviorsToday = await prisma.behaviorRecord.count({
            where: {
                timestamp: { gte: today },
                behavior: patientId ? { patientId } : undefined
            }
        });

        return NextResponse.json({
            today: {
                sessions: todaySessions,
                trials: todayTrials.length,
                accuracy: todayAccuracy,
                behaviorsRecorded: behaviorsToday,
            },
            week: {
                trials: weekTrials.length,
                accuracy: weekAccuracy,
            },
            period: {
                days,
                totalSessions,
                totalTrials,
                accuracy,
                independentRate,
                sessionsPerDay: parseFloat(sessionsPerDay),
                avgSessionDuration, // em segundos
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
