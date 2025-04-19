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
    if (!ifAlreadyExists || ifAlreadyExists.status !== "PENDENTE") {
      throw new Error("Batalha não encontrada ou já iniciada");
    }

    const batalha = await prisma.batalha.update({
      where: { id },
      data: { status: "EM_ANDAMENTO" },
    });

    return batalha;
  }

  async encerrarBatalha({ id, eventos }: encerrarBatalha) {
    const ifNotIniciated = await prisma.batalha.findUnique({
      where: { id },
    });
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
          where: { id: String(ev.startup_id) },
        });
        if (!startup) throw new Error("Startup não encontrada");

        const novaPontuacao = this.calcularPontuacao(ev);

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
        let pontosAtualizados = startupTorneio.pontos + novaPontuacao;
        const startupAtualizada = await tx.startup.update({
          where: { id: ev.startup_id },
          data: {
            pitchConvincente:
              startup.pitchConvincente + (ev.pitchConvincente ? 1 : 0),
            produtoComBugs:
              startup.produtoComBugs + (ev.produtoComBugs ? 1 : 0),
            tracaoUsuarios:
              startup.tracaoUsuarios + (ev.tracaoUsuarios ? 1 : 0),
            investidorIrritado:
              startup.investidorIrritado + (ev.investidorIrritado ? 1 : 0),
            fakeNews: startup.fakeNews + (ev.fakeNews ? 1 : 0),
          },
        });
        await tx.startupTorneio.update({
          where: {
            unique_startup_torneio: {
              startup_id: ev.startup_id,
              torneio_id: batalha.torneio_id,
            },
          },
          data: {
            pontos: pontosAtualizados,
          },
        });

        pontuacaoStartups.push({
          startup_id: startupAtualizada.id,
          nome: startupAtualizada.nome,
          pontos: novaPontuacao,
        });

        await tx.eventosBatalha.create({
          data: {
            batalha_id: id,
            startup_id: startupAtualizada.id,
            pitchConvincente: ev.pitchConvincente,
            produtoComBugs: ev.produtoComBugs,
            tracaoUsuarios: ev.tracaoUsuarios,
            investidorIrritado: ev.investidorIrritado,
            fakeNews: ev.fakeNews,
          },
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
        const sorteado = Math.random() < 0.5 ? s1 : s2;

        vencedor_id = sorteado.startup_id;
        perdedor_id =
          s1.startup_id === sorteado.startup_id ? s2.startup_id : s1.startup_id;
        empate = true;

        const startupVencedora = await tx.startup.findUnique({
          where: { id: sorteado.startup_id },
        });
        if (!startupVencedora) {
          throw new Error("Startup vencedora não encontrada");
        }
        await tx.startup.update({
          where: { id: sorteado.startup_id },
          data: { vitoriasEmBatalha: { increment: 1 } },
        });
        const startupTorneioVencedora = await tx.startupTorneio.findUnique({
          where: {
            unique_startup_torneio: {
              startup_id: sorteado.startup_id,
              torneio_id: batalha.torneio_id,
            },
          },
        });
        if (!startupTorneioVencedora) {
          throw new Error("Startup no torneio não encontrada");
        }
        await tx.startupTorneio.update({
          where: {
            unique_startup_torneio: {
              startup_id: sorteado.startup_id,
              torneio_id: batalha.torneio_id,
            },
          },
          data: {
            pontos: startupTorneioVencedora.pontos + 30,
          },
        });
      }

      if (!empate) {
        const startupVencedora = await tx.startup.findUnique({
          where: { id: vencedor_id },
        });

        if (!startupVencedora) {
          throw new Error("Startup vencedora não encontrada");
        }

        await tx.startup.update({
          where: { id: vencedor_id },
          data: {
            vitoriasEmBatalha: startupVencedora.vitoriasEmBatalha + 1,
          },
        });
        const startupTorneioVencedora = await tx.startupTorneio.findUnique({
          where: {
            unique_startup_torneio: {
              startup_id: vencedor_id,
              torneio_id: batalha.torneio_id,
            },
          },
        });
        if (!startupTorneioVencedora) {
          throw new Error("Startup no torneio não encontrada");
        }
        await tx.startupTorneio.update({
          where: {
            unique_startup_torneio: {
              startup_id: vencedor_id,
              torneio_id: batalha.torneio_id,
            },
          },
          data: {
            pontos: startupTorneioVencedora.pontos + 30,
          },
        });
      }

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
            vencedor_id: vencedor_id,
          },
        });
      } else {
        await tx.batalha.update({
          where: { id },
          data: {
            status: "FINALIZADA",
            vencedor_id: vencedor_id,
          },
        });
      }

      return {
        message: "Batalha encerrada com sucesso!",
        vencedor_id,
        pontos: pontuacaoStartups,
        empate,
      };
    });
  }
}

export { BatalhaService };
