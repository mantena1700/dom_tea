import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/behaviors - Listar comportamentos
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const type = searchParams.get('type'); // decrease, increase, monitor

        const where = {};
        if (patientId) where.patientId = patientId;
        if (type) where.type = type;

        const behaviors = await prisma.behavior.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { records: true }
                }
            }
        });

        return NextResponse.json(behaviors);
    } catch (error) {
        console.error('Error fetching behaviors:', error);
        return NextResponse.json({ error: 'Failed to fetch behaviors' }, { status: 500 });
    }
}

// POST /api/behaviors - Criar comportamento
export async function POST(request) {
    try {
        const data = await request.json();

        const behavior = await prisma.behavior.create({
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                severity: data.severity || 'medium',
                color: data.color || '#F59E0B',
                patientId: data.patientId,
            }
        });

        return NextResponse.json(behavior, { status: 201 });
    } catch (error) {
        console.error('Error creating behavior:', error);
        return NextResponse.json({ error: 'Failed to create behavior' }, { status: 500 });
    }
}

// PUT /api/behaviors - Atualizar comportamento
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Behavior ID is required' }, { status: 400 });
        }

        const data = await request.json();

        const behavior = await prisma.behavior.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                severity: data.severity,
                color: data.color,
            }
        });

        return NextResponse.json(behavior);
    } catch (error) {
        console.error('Error updating behavior:', error);
        return NextResponse.json({ error: 'Failed to update behavior' }, { status: 500 });
    }
}

// DELETE /api/behaviors - Deletar comportamento
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Behavior ID is required' }, { status: 400 });
        }

        await prisma.behavior.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting behavior:', error);
        return NextResponse.json({ error: 'Failed to delete behavior' }, { status: 500 });
    }
}
