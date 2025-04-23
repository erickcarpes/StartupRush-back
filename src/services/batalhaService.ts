import { prisma } from "../prisma/client";
import { calculaFase } from "./torneioService";

interface createBatalha {
  torneio_id: string;
  startup1_id: string;
  startup2_id: string;
}

interface updateBatalha {
  id: string;
  torneio_id?: string;
  startup1_id?: string;
  startup2_id?: string;
}

interface readDeleteBatalha {
  id: string;
}

interface encerrarBatalha {
  id: string;
  eventos: eventosBatalha[];
}

interface eventosBatalha {
  startup_id: string;
  pitchConvincente: boolean;
  produtoComBugs: boolean;
  tracaoUsuarios: boolean;
  investidorIrritado: boolean;
  fakeNews: boolean;
}

class BatalhaService {
  private calcularPontuacao(evento: eventosBatalha): number {
    let pontuacao = 0;
    if (evento.pitchConvincente) pontuacao += 6;
    if (evento.produtoComBugs) pontuacao -= 4;
    if (evento.tracaoUsuarios) pontuacao += 3;
    if (evento.investidorIrritado) pontuacao -= 6;
    if (evento.fakeNews) pontuacao -= 8;
    return pontuacao;
  }

  async createBatalha({ torneio_id, startup1_id, startup2_id }: createBatalha) {
    if (!torneio_id || !startup1_id || !startup2_id) {
      throw new Error(
        "Preencha todos os campos: torneio_id, startup1_id e startup2_id"
      );
    }
    if (startup1_id === startup2_id) {
      throw new Error("As startups não podem ser iguais");
    }

    const startupVivas = await prisma.startupTorneio.findMany({
      where: { torneio_id: torneio_id, status: "ATIVA" },
    });

    const fase = calculaFase(startupVivas.length);
    const batalha = await prisma.batalha.create({
      data: {
        torneio_id: torneio_id,
        rodada: fase,
      },
    });

    await prisma.$transaction([
      prisma.batalhaStartup.create({
        data: { batalha_id: batalha.id, startup_id: startup1_id },
      }),
      prisma.batalhaStartup.create({
        data: { batalha_id: batalha.id, startup_id: startup2_id },
      }),
    ]);
    return batalha;
  }

  async getAllBatalhas() {
    const batalhas = await prisma.batalha.findMany();
    if (!batalhas || batalhas.length === 0) {
      throw new Error("Nenhuma batalha encontrada");
    }
    return batalhas;
  }

  async getBatalhaById({ id }: readDeleteBatalha) {
    const batalha = await prisma.batalha.findUnique({ where: { id } });
    if (!batalha) {
      throw new Error("Batalha não encontrada");
    }
    return batalha;
  }

  async deleteBatalha({ id }: readDeleteBatalha) {
    const deleted = await prisma.batalha.delete({ where: { id } });
    return deleted;
  }

  async iniciarBatalha({ id }: readDeleteBatalha) {
    const ifAlreadyExists = await prisma.batalha.findUnique({
      where: { id },
    });
    if (!ifAlreadyExists) {
      throw new Error("Batalha não encontrada");
    }

    const batalha = await prisma.batalha.update({
      where: { id },
      data: { status: "EM_ANDAMENTO" },
    });

    return batalha;
  }

  async encerrarBatalha({ id, eventos }: encerrarBatalha) {
    const ifNotIniciated = await prisma.batalha.findUnique({ where: { id } });
    if (!ifNotIniciated || ifNotIniciated.status !== "EM_ANDAMENTO") {
      throw new Error("Batalha não encontrada ou já encerrada");
    }
    if (eventos.length !== 2) {
      throw new Error("A batalha deve ter exatamente 2 startups");
    }

    return await prisma.$transaction(async (tx) => {
      const batalha = await tx.batalha.findUnique({ where: { id } });
      if (!batalha) throw new Error("Batalha não encontrada");

      const pontuacaoStartups: {
        startup_id: string;
        nome: string;
        pontos: number;
      }[] = [];

      for (const ev of eventos) {
        const startup = await tx.startup.findUnique({
          where: { id: ev.startup_id },
        });
        if (!startup) throw new Error("Startup não encontrada");

        const startupTorneio = await tx.startupTorneio.findUnique({
          where: {
            unique_startup_torneio: {
              startup_id: ev.startup_id,
              torneio_id: batalha.torneio_id,
            },
          },
        });
        if (!startupTorneio)
          throw new Error("Startup no torneio não encontrada");

        const novaPontuacao = this.calcularPontuacao(ev);

        // Atualiza StartupTorneio
        await tx.startupTorneio.update({
          where: {
            unique_startup_torneio: {
              startup_id: ev.startup_id,
              torneio_id: batalha.torneio_id,
            },
          },
          data: {
            pontos: startupTorneio.pontos + novaPontuacao,
            pitchConvincente:
              startupTorneio.pitchConvincente + Number(ev.pitchConvincente),
            produtoComBugs:
              startupTorneio.produtoComBugs + Number(ev.produtoComBugs),
            tracaoUsuarios:
              startupTorneio.tracaoUsuarios + Number(ev.tracaoUsuarios),
            investidorIrritado:
              startupTorneio.investidorIrritado + Number(ev.investidorIrritado),
            fakeNews: startupTorneio.fakeNews + Number(ev.fakeNews),
          },
        });

        // Atualiza Startup geral
        await tx.startup.update({
          where: { id: ev.startup_id },
          data: {
            pontosTotal: startup.pontosTotal + novaPontuacao,
            pitchConvincenteTotal:
              startup.pitchConvincenteTotal + Number(ev.pitchConvincente),
            produtoComBugsTotal:
              startup.produtoComBugsTotal + Number(ev.produtoComBugs),
            tracaoUsuariosTotal:
              startup.tracaoUsuariosTotal + Number(ev.tracaoUsuarios),
            investidorIrritadoTotal:
              startup.investidorIrritadoTotal + Number(ev.investidorIrritado),
            fakeNewsTotal: startup.fakeNewsTotal + Number(ev.fakeNews),
          },
        });

        // Cria evento
        await tx.eventosBatalha.create({
          data: {
            batalha_id: id,
            startup_id: ev.startup_id,
            pitchConvincente: ev.pitchConvincente,
            produtoComBugs: ev.produtoComBugs,
            tracaoUsuarios: ev.tracaoUsuarios,
            investidorIrritado: ev.investidorIrritado,
            fakeNews: ev.fakeNews,
          },
        });

        pontuacaoStartups.push({
          startup_id: ev.startup_id,
          nome: startup.nome,
          pontos: novaPontuacao,
        });
      }

      const [s1, s2] = pontuacaoStartups;
      let vencedor_id: string;
      let perdedor_id: string;
      let empate = false;

      if (s1.pontos > s2.pontos) {
        vencedor_id = s1.startup_id;
        perdedor_id = s2.startup_id;
      } else if (s2.pontos > s1.pontos) {
        vencedor_id = s2.startup_id;
        perdedor_id = s1.startup_id;
      } else {
        empate = true;
        const sorteado = Math.random() < 0.5 ? s1 : s2;
        vencedor_id = sorteado.startup_id;
        perdedor_id =
          s1.startup_id === sorteado.startup_id ? s2.startup_id : s1.startup_id;
      }

      const startupVencedora = await tx.startup.findUnique({
        where: { id: vencedor_id },
      });
      const startupTorneioVencedora = await tx.startupTorneio.findUnique({
        where: {
          unique_startup_torneio: {
            startup_id: vencedor_id,
            torneio_id: batalha.torneio_id,
          },
        },
      });
      if (!startupVencedora || !startupTorneioVencedora)
        throw new Error("Startup vencedora não encontrada");

      // Pontuação extra por vitória (ou empate)
      const bonus = empate ? 32 : 30;

      await tx.startupTorneio.update({
        where: {
          unique_startup_torneio: {
            startup_id: vencedor_id,
            torneio_id: batalha.torneio_id,
          },
        },
        data: {
          pontos: startupTorneioVencedora.pontos + bonus,
          vitoriasEmBatalha: startupTorneioVencedora.vitoriasEmBatalha + 1,
        },
      });

      await tx.startup.update({
        where: { id: vencedor_id },
        data: {
          pontosTotal: startupVencedora.pontosTotal + bonus,
          vitoriasEmBatalhaTotal: startupVencedora.vitoriasEmBatalhaTotal + 1,
        },
      });

      await tx.startupTorneio.update({
        where: {
          unique_startup_torneio: {
            startup_id: perdedor_id,
            torneio_id: batalha.torneio_id,
          },
        },
        data: {
          status: "ELIMINADA",
        },
      });

      if (batalha.rodada === "FINAL") {
        await tx.torneio.update({
          where: { id: batalha.torneio_id },
          data: {
            status: "FINALIZADO",
            vencedor_id,
          },
        });
      }
      await tx.batalha.update({
        where: { id },
        data: {
          status: "FINALIZADA",
          vencedor_id,
        },
      });

      const vencedor = await tx.startup.findUnique({
        where: { id: vencedor_id },
        select: { nome: true, slogan: true },
      });

      const pontuacaoVencedor = pontuacaoStartups.find(
        (s) => s.startup_id === vencedor_id
      );

      const pontosVencedor = pontuacaoVencedor?.pontos || 0;

      const rodada = batalha.rodada;

      return {
        message: "Batalha encerrada com sucesso!",
        vencedor,
        pontosVencedor,
        rodada,
        pontos: pontuacaoStartups,
        empate,
      };
    });
  }

  async getStartupsNaBatalha({ id }: readDeleteBatalha) {
    const batalhas = await prisma.batalhaStartup.findMany({
      where: { batalha_id: id },
      include: {
        startup: true,
      },
    });

    const torneio = await prisma.torneio.findFirst({
      where: { status: "EM_ANDAMENTO" },
    });

    if (!torneio) {
      throw new Error("Torneio não encontrado ou não está em andamento");
    }

    const startup1Torneio = await prisma.startupTorneio.findUnique({
      where: {
        unique_startup_torneio: {
          startup_id: batalhas[0].startup.id,
          torneio_id: torneio.id,
        },
      },
    });

    const startup2Torneio = await prisma.startupTorneio.findUnique({
      where: {
        unique_startup_torneio: {
          startup_id: batalhas[1].startup.id,
          torneio_id: torneio.id,
        },
      },
    });

    if (!batalhas || batalhas.length === 0) {
      throw new Error("Nenhuma batalha encontrada");
    }
    return { batalhas, startup1Torneio, startup2Torneio };
  }
}

export { BatalhaService };
