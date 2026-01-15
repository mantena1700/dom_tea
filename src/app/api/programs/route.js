import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/programs - Listar programas
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const status = searchParams.get('status');

        const where = {};
        if (patientId) where.patientId = patientId;
        if (status) where.status = status;

        const programs = await prisma.program.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { trials: true, targets: true }
                }
            }
        });
        return NextResponse.json(programs);
    } catch (error) {
        console.error('Error fetching programs:', error);
        return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
    }
}

// POST /api/programs - Criar programa
export async function POST(request) {
    try {
        const data = await request.json();

        const program = await prisma.program.create({
            data: {
                name: data.name,
                category: data.category,
                description: data.description,
                targetAccuracy: data.targetAccuracy || 80,
                status: data.status || 'active',
                patientId: data.patientId,
            }
        });

        return NextResponse.json(program, { status: 201 });
    } catch (error) {
        console.error('Error creating program:', error);
        return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
    }
}

// PUT /api/programs - Atualizar programa
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
        }

        const data = await request.json();

        const program = await prisma.program.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                description: data.description,
                targetAccuracy: data.targetAccuracy,
                status: data.status,
            }
        });

        return NextResponse.json(program);
    } catch (error) {
        console.error('Error updating program:', error);
        return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
    }
}

// DELETE /api/programs - Deletar programa
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
        }

        await prisma.program.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting program:', error);
        return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
    }
}
