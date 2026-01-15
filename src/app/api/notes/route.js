import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/notes - Listar notas
// Filtros opcionais: ?sessionId=... ou ?patientId=...
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const patientId = searchParams.get('patientId');

        const where = {};
        if (sessionId) where.sessionId = sessionId;
        if (patientId) where.patientId = patientId;

        const notes = await prisma.note.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                session: {
                    select: { startTime: true }
                }
            }
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

// POST /api/notes - Criar nota
export async function POST(request) {
    try {
        const data = await request.json();

        const note = await prisma.note.create({
            data: {
                content: data.content,
                type: data.type || 'general',
                sessionId: data.sessionId, // Opcional
                patientId: data.patientId, // Opcional
            }
        });

        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}

// DELETE /api/notes - Deletar nota
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.note.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}
