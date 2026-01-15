import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trials - Listar tentativas
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const programId = searchParams.get('programId');
        const limit = parseInt(searchParams.get('limit') || '100');
        const days = parseInt(searchParams.get('days') || '30');

        const where = {};
        if (sessionId) where.sessionId = sessionId;
        if (programId) where.programId = programId;

        // Filtrar por período
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        where.timestamp = { gte: startDate };

        const trials = await prisma.trial.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limit,
            include: {
                program: {
                    select: { name: true, category: true }
                }
            }
        });

        return NextResponse.json(trials);
    } catch (error) {
        console.error('Error fetching trials:', error);
        return NextResponse.json({ error: 'Failed to fetch trials' }, { status: 500 });
    }
}

// POST /api/trials - Criar tentativa
export async function POST(request) {
    try {
        const data = await request.json();

        const trial = await prisma.trial.create({
            data: {
                sessionId: data.sessionId,
                programId: data.programId,
                targetId: data.targetId,
                result: data.result, // correct, incorrect, no_response
                promptLevel: data.promptLevel, // I, V, G, FP, FT
                latency: data.latency,
                duration: data.duration,
                notes: data.notes,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            }
        });

        return NextResponse.json(trial, { status: 201 });
    } catch (error) {
        console.error('Error creating trial:', error);
        return NextResponse.json({ error: 'Failed to create trial' }, { status: 500 });
    }
}

// POST /api/trials/bulk - Criar múltiplas tentativas
export async function PUT(request) {
    try {
        const { trials } = await request.json();

        if (!Array.isArray(trials) || trials.length === 0) {
            return NextResponse.json({ error: 'Trials array is required' }, { status: 400 });
        }

        const createdTrials = await prisma.trial.createMany({
            data: trials.map(t => ({
                sessionId: t.sessionId,
                programId: t.programId,
                targetId: t.targetId,
                result: t.result,
                promptLevel: t.promptLevel,
                latency: t.latency,
                duration: t.duration,
                notes: t.notes,
                timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
            }))
        });

        return NextResponse.json({ count: createdTrials.count });
    } catch (error) {
        console.error('Error creating bulk trials:', error);
        return NextResponse.json({ error: 'Failed to create trials' }, { status: 500 });
    }
}

// DELETE /api/trials - Deletar tentativa
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Trial ID is required' }, { status: 400 });
        }

        await prisma.trial.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting trial:', error);
        return NextResponse.json({ error: 'Failed to delete trial' }, { status: 500 });
    }
}
