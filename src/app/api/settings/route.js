import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/settings - Buscar configurações
export async function GET() {
    try {
        // Buscar a primeira (e única) configuração
        let settings = await prisma.settings.findFirst();

        // Se não existe, criar com valores padrão
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    theme: 'dark',
                    sessionGoalMinutes: 45,
                    showTimers: true,
                    showLatency: true,
                    celebrateSuccess: true,
                    enableOfflineSync: true,
                    autoBackup: true,
                    notificationsEnabled: true,
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT /api/settings - Atualizar configurações
export async function PUT(request) {
    try {
        const data = await request.json();

        // Buscar configuração existente
        let settings = await prisma.settings.findFirst();

        if (settings) {
            // Atualizar
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: {
                    theme: data.theme,
                    sessionGoalMinutes: data.sessionGoalMinutes,
                    showTimers: data.showTimers,
                    showLatency: data.showLatency,
                    celebrateSuccess: data.celebrateSuccess,
                    enableOfflineSync: data.enableOfflineSync,
                    autoBackup: data.autoBackup,
                    notificationsEnabled: data.notificationsEnabled,
                }
            });
        } else {
            // Criar nova
            settings = await prisma.settings.create({
                data: {
                    theme: data.theme || 'dark',
                    sessionGoalMinutes: data.sessionGoalMinutes || 45,
                    showTimers: data.showTimers ?? true,
                    showLatency: data.showLatency ?? true,
                    celebrateSuccess: data.celebrateSuccess ?? true,
                    enableOfflineSync: data.enableOfflineSync ?? true,
                    autoBackup: data.autoBackup ?? true,
                    notificationsEnabled: data.notificationsEnabled ?? true,
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
