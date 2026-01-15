import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reinforcers - Listar reforçadores
export async function GET() {
    try {
        const reinforcers = await prisma.reinforcer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(reinforcers);
    } catch (error) {
        console.error('Error fetching reinforcers:', error);
        return NextResponse.json({ error: 'Failed to fetch reinforcers' }, { status: 500 });
    }
}

// POST /api/reinforcers - Criar reforçador
export async function POST(request) {
    try {
        const data = await request.json();

        const reinforcer = await prisma.reinforcer.create({
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive ?? true,
            }
        });

        return NextResponse.json(reinforcer, { status: 201 });
    } catch (error) {
        console.error('Error creating reinforcer:', error);
        return NextResponse.json({ error: 'Failed to create reinforcer' }, { status: 500 });
    }
}

// DELETE /api/reinforcers - Deletar reforçador
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.reinforcer.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting reinforcer:', error);
        return NextResponse.json({ error: 'Failed to delete reinforcer' }, { status: 500 });
    }
}
