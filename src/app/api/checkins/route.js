import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/checkins - Listar check-ins
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const date = searchParams.get('date'); // Formato: YYYY-MM-DD
        const limit = parseInt(searchParams.get('limit') || '30');

        const where = {};
        if (patientId) where.patientId = patientId;
        if (date) {
            const targetDate = new Date(date);
            where.date = targetDate;
        }

        const checkins = await prisma.dailyCheckin.findMany({
            where,
            orderBy: { date: 'desc' },
            take: limit,
        });

        return NextResponse.json(checkins);
    } catch (error) {
        console.error('Error fetching checkins:', error);
        return NextResponse.json({ error: 'Failed to fetch checkins' }, { status: 500 });
    }
}

// POST /api/checkins - Criar ou atualizar check-in do dia
export async function POST(request) {
    try {
        const data = await request.json();

        if (!data.patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Usar upsert para criar ou atualizar o check-in do dia
        const checkin = await prisma.dailyCheckin.upsert({
            where: {
                patientId_date: {
                    patientId: data.patientId,
                    date: today,
                }
            },
            update: {
                sleep: data.sleep,
                mood: data.mood,
                health: data.health,
                notes: data.notes,
            },
            create: {
                patientId: data.patientId,
                date: today,
                sleep: data.sleep,
                mood: data.mood,
                health: data.health,
                notes: data.notes,
            }
        });

        return NextResponse.json(checkin, { status: 201 });
    } catch (error) {
        console.error('Error creating checkin:', error);
        return NextResponse.json({ error: 'Failed to create checkin' }, { status: 500 });
    }
}

// GET today's checkin
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkin = await prisma.dailyCheckin.findUnique({
            where: {
                patientId_date: {
                    patientId,
                    date: today,
                }
            }
        });

        return NextResponse.json(checkin);
    } catch (error) {
        console.error('Error fetching today checkin:', error);
        return NextResponse.json({ error: 'Failed to fetch checkin' }, { status: 500 });
    }
}
