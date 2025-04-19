import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.eventosBatalha.deleteMany({});
  await prisma.batalhaStartup.deleteMany({});
  await prisma.batalha.deleteMany({});
  await prisma.startupTorneio.deleteMany({});
  await prisma.startup.deleteMany({});
  await prisma.torneio.deleteMany({});
}

main()
  .then(() => {
    console.log("Todas as tabelas foram limpas com sucesso.");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });