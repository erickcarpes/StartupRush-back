import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function gerarEventoAleatorio() {
  return {
    pitchConvincente: Math.random() < 0.5,
    produtoComBugs: Math.random() < 0.5,
    tracaoUsuarios: Math.random() < 0.5,
    investidorIrritado: Math.random() < 0.5,
    fakeNews: Math.random() < 0.5,
  };
}
function calcularPontuacao(evento: any): number {
  let pontuacao = 0;
  if (evento.pitchConvincente) pontuacao += 6;
  if (evento.produtoComBugs) pontuacao -= 4;
  if (evento.tracaoUsuarios) pontuacao += 3;
  if (evento.investidorIrritado) pontuacao -= 6;
  if (evento.fakeNews) pontuacao -= 8;
  return pontuacao;
}

async function main() {
  // Criação de startups
  const startup1 = await prisma.startup.create({
    data: { nome: "Startup Alpha", slogan: "Alpha", anoFundacao: 2007 },
  });
  const startup2 = await prisma.startup.create({
    data: { nome: "Startup Beta", slogan: "Beta", anoFundacao: 2008 },
  });
  const startup3 = await prisma.startup.create({
    data: { nome: "Startup Gamma", slogan: "Gamma", anoFundacao: 2009 },
  });
  const startup4 = await prisma.startup.create({
    data: { nome: "Startup Delta", slogan: "Delta", anoFundacao: 2010 },
  });
  const startup5 = await prisma.startup.create({
    data: { nome: "Startup Epsilon", slogan: "Epsilon", anoFundacao: 2011 },
  });
  const startup6 = await prisma.startup.create({
    data: { nome: "Startup Zeta", slogan: "Zeta", anoFundacao: 2012 },
  });
  const startup7 = await prisma.startup.create({
    data: { nome: "Startup Eta", slogan: "Eta", anoFundacao: 2013 },
  });
  const startup8 = await prisma.startup.create({
    data: { nome: "Startup Theta", slogan: "Theta", anoFundacao: 2014 },
  });
  
  // Criação de torneio
  const torneio = await prisma.torneio.create({
    data: { nome: "Torneio de Teste" },
  });

  const startups = [
    startup1,
    startup2,
    startup3,
    startup4,
    startup5,
    startup6,
  ];

  // Vincula startups ao torneio
  await prisma.startupTorneio.createMany({
    data: startups.map((s) => ({
      startup_id: s.id,
      torneio_id: torneio.id,
      status: "ATIVA",
      nome: s.nome,
    })),
  });

  await prisma.torneio.update({
    where: { id: torneio.id },
    data: { status: "EM_ANDAMENTO" },
  });

  // Embaralha as startups para batalhas
  const shuffledStartups = startups.sort(() => Math.random() - 0.5);

  for (let i = 0; i < 6; i += 2) {
    const startupA = shuffledStartups[i];
    const startupB = shuffledStartups[i + 1];
  
    const batalha = await prisma.batalha.create({
      data: {
        torneio_id: torneio.id,
        rodada: "QUARTAS",
        status: "FINALIZADA",
      },
    });
  
    await prisma.$transaction([
      prisma.batalhaStartup.create({
        data: { batalha_id: batalha.id, startup_id: startupA.id },
      }),
      prisma.batalhaStartup.create({
        data: { batalha_id: batalha.id, startup_id: startupB.id },
      }),
    ]);
  
    // Gera eventos aleatórios
    const eventoA = gerarEventoAleatorio
    const eventoB = gerarEventoAleatorio
  
    await prisma.eventosBatalha.createMany({
      data: [
        {
          batalha_id: batalha.id,
          startup_id: startupA.id,
          ...gerarEventoAleatorio
        },
        {
          batalha_id: batalha.id,
          startup_id: startupB.id,
          ...gerarEventoAleatorio
        }
      ]
    });
  
    // Calcula pontuação
    const pontosA = calcularPontuacao(eventoA);
    const pontosB = calcularPontuacao(eventoB);
  
    // Decide quem perde
    let perdedora;
    if (pontosA > pontosB) {
      perdedora = startupB;
    } else if (pontosB > pontosA) {
      perdedora = startupA;
    } else {
      // Empate
      perdedora = Math.random() < 0.5 ? startupA : startupB;
    }
  
    // Atualiza status da perdedora
    await prisma.startupTorneio.update({
      where: {
        unique_startup_torneio: {
          startup_id: perdedora.id,
          torneio_id: torneio.id,
        },
      },
      data: {
        status: "ELIMINADA",
      },
    });
  
    console.log(
      `Batalha ${batalha.id}: ${startupA.nome} (${pontosA}) vs ${startupB.nome} (${pontosB}) => ${perdedora.nome} ELIMINADA`
    );
  }
}
  

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
