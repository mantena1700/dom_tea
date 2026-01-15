const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- DIAGNÓSTICO DO BANCO DE DADOS ---');

        // Testa conexão
        await prisma.$connect();
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso.');

        // Conta registros
        const patients = await prisma.patient.count();
        const programs = await prisma.program.count();
        const sessions = await prisma.session.count();
        const trials = await prisma.trial.count();
        const behaviors = await prisma.behavior.count();
        const reinforcers = await prisma.reinforcer.count();
        const notes = await prisma.note.count();

        console.log('\n--- CONTAGEM DE REGISTROS ---');
        console.log(`Pacientes:    ${patients}`);
        console.log(`Programas:    ${programs}`);
        console.log(`Sessões:      ${sessions}`);
        console.log(`Tentativas:   ${trials}`);
        console.log(`Comportam.:   ${behaviors}`);
        console.log(`Reforçadores: ${reinforcers}`);
        console.log(`Notas:        ${notes}`);

        console.log('\n--- ÚLTIMO PACIENTE SALVO ---');
        if (patients > 0) {
            const lastPatient = await prisma.patient.findFirst({
                orderBy: { updatedAt: 'desc' }
            });
            console.log(`Nome: ${lastPatient.name}`);
            console.log(`ID: ${lastPatient.id}`);
            console.log(`Foto salva? ${lastPatient.photo ? 'SIM (Tamanho: ' + lastPatient.photo.length + ' chars)' : 'NÃO'}`);
            console.log(`Atualizado em: ${lastPatient.updatedAt}`);
        } else {
            console.log('Nenhum paciente encontrado.');
        }

    } catch (error) {
        console.error('❌ ERRO AO CONECTAR OU LER O BANCO:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
