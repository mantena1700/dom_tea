import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/patients - Listar pacientes
export async function GET() {
    try {
        const patients = await prisma.patient.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { sessions: true, programs: true }
                }
            }
        });
        return NextResponse.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }
}

// POST /api/patients - Criar paciente
export async function POST(request) {
    try {
        const data = await request.json();

        const patient = await prisma.patient.create({
            data: {
                name: data.name,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                photo: data.photo,
                diagnosis: data.diagnosis,
                notes: data.notes,
                preferences: data.preferences,
            }
        });

        return NextResponse.json(patient, { status: 201 });
    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
    }
}

// PUT /api/patients - Atualizar paciente (usando query param ?id=)
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        const data = await request.json();

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                name: data.name,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                photo: data.photo,
                diagnosis: data.diagnosis,
                notes: data.notes,
                preferences: data.preferences,
            }
        });

        return NextResponse.json(patient);
    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
    }
}

// DELETE /api/patients - Deletar paciente (usando query param ?id=)
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        await prisma.patient.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting patient:', error);
        return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
    }
}
