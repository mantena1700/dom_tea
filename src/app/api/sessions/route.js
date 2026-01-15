import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/sessions - Listar sessões
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where = {};
        if (patientId) where.patientId = patientId;
        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate);
            if (endDate) where.startTime.lte = new Date(endDate);
        }

        const sessions = await prisma.session.findMany({
            where,
            orderBy: { startTime: 'desc' },
            take: limit,
            include: {
                _count: {
                    select: { trials: true, behaviorRecords: true }
                },
                trials: {
                    select: {
                        result: true,
                        promptLevel: true,
                    }
                }
            }
        });

        // Calcular estatísticas de cada sessão
        const sessionsWithStats = sessions.map(session => {
            const trials = session.trials;
            const correctTrials = trials.filter(t => t.result === 'correct').length;
            const accuracy = trials.length > 0 ? Math.round((correctTrials / trials.length) * 100) : 0;
            const independentTrials = trials.filter(t => t.promptLevel === 'I').length;
            const independentRate = trials.length > 0 ? Math.round((independentTrials / trials.length) * 100) : 0;

            return {
                ...session,
                stats: {
                    totalTrials: trials.length,
                    correctTrials,
                    accuracy,
                    independentRate,
                }
            };
        });

        return NextResponse.json(sessionsWithStats);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}

// POST /api/sessions - Criar sessão
export async function POST(request) {
    try {
        const data = await request.json();

        const session = await prisma.session.create({
            data: {
                patientId: data.patientId,
                startTime: data.startTime ? new Date(data.startTime) : new Date(),
                therapistName: data.therapistName,
                notes: data.notes,
            }
        });

        return NextResponse.json(session, { status: 201 });
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}

// PUT /api/sessions - Atualizar/Finalizar sessão
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const data = await request.json();

        // Calcular duração se endTime foi fornecido
        let duration = data.duration;
        if (data.endTime && !duration) {
            const session = await prisma.session.findUnique({ where: { id } });
            if (session) {
                duration = Math.floor((new Date(data.endTime) - session.startTime) / 1000);
            }
        }

        const updatedSession = await prisma.session.update({
            where: { id },
            data: {
                endTime: data.endTime ? new Date(data.endTime) : undefined,
                duration,
                notes: data.notes,
                therapistName: data.therapistName,
            }
        });

        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error('Error updating session:', error);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
}

// DELETE /api/sessions - Deletar sessão
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        await prisma.session.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }
}
