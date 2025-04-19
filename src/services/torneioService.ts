import { prisma } from "../prisma/client";

interface createTorneio {
  nome: string;
}

interface updateTorneio {
  id: string;
  nome: string;
}

interface readDeleteTorneio {
  id: string;
}

interface adicionarStartup {
  torneio_id: string;
  startup_id: string;
}

class TorneioService {
  async createTorneio({ nome }: createTorneio) {
    if (!nome) {
      throw new Error("Preencha o campo: nome");
    }
    const existingTorneio = await prisma.torneio.findFirst({
      where: { status: "AGUARDANDO" },
    });
    if (existingTorneio) {
      throw new Error("já existe um torneio em andamento");
    }
    const data = {
      nome,
    };

    const torneio = await prisma.torneio.create({
      data,
    });
    return torneio;
  }

  async getAllTorneios() {
    const torneios = await prisma.torneio.findMany();
    if (!torneios || torneios.length === 0) {
      throw new Error("Nenhum torneio encontrado");
    }
    return torneios;
  }

  async getTorneioById({ id }: readDeleteTorneio) {
    if (!id) {
      throw new Error("ID do torneio não fornecido");
    }

    const torneio = await prisma.torneio.findUnique({
      where: { id },
    });
    if (!torneio) {
      throw new Error("Torneio não encontrado");
    }
    return torneio;
  }

  async updateTorneio({ id, nome }: updateTorneio) {
    if (!id) {
      throw new Error("ID do torneio não fornecido");
    }
    if (!nome) {
      throw new Error("Nenhum campo para atualizar fornecido");
    }
    if (nome) {
      const existingTorneio = await prisma.torneio.findUnique({
        where: { nome, NOT: { id: id } },
      });
      if (existingTorneio) {
        throw new Error("Torneio já existe com esse nome");
      }
    }
    const data: Partial<updateTorneio> = {};
    if (nome) data.nome = nome;

    const torneio = await prisma.torneio.update({
      where: { id },
      data: { nome },
    });
    return torneio;
  }

  async deleteTorneio({ id }: readDeleteTorneio) {
    const torneioExistente = await prisma.torneio.findUnique({ where: { id } });

    if (!torneioExistente) {
      throw new Error("Torneio não encontrado");
    }

    await prisma.startupTorneio.deleteMany({
      where: { torneio_id: id },
    });

    await prisma.torneio.delete({
      where: { id },
    });
    return { message: "Torneio deletado com sucesso" };
  }

  async deleteAllTorneios() {
    const torneios = await prisma.torneio.deleteMany();
    if (!torneios) {
      throw new Error("Nenhum torneio encontrado para deletar");
    }
    return torneios;
  }

  async iniciarTorneio({ id }: readDeleteTorneio) {
    const torneio = await prisma.torneio.findFirst({
      where: { id },
    });

    if (!torneio || torneio.status !== "AGUARDANDO") {
      throw new Error("Torneio não encontrado ou já iniciado/finalizado");
    }

    const torneioParticipantes = await prisma.startupTorneio.findMany({
      where: { torneio_id: id, status: "ATIVA" },
      include: {
        startup: true,
      },
    });

    if (
      torneioParticipantes.length < 4 ||
      torneioParticipantes.length > 8 ||
      torneioParticipantes.length % 2 !== 0
    ) {
      throw new Error(
        "O torneio deve ter entre 4 e 8 participantes, e o número de participantes deve ser par."
      );
    }

    const embaralhados = torneioParticipantes.sort(() => Math.random() - 0.5);

    for (let i = 0; i < embaralhados.length; i += 2) {
      const batalha = await prisma.batalha.create({
        data: {
          torneio_id: id,
          rodada: embaralhados.length === 4 ? "SEMIFINAL" : "QUARTAS",
        },
      });

      await prisma.$transaction([
        prisma.batalhaStartup.create({
          data: {
            batalha_id: batalha.id,
            startup_id: embaralhados[i].startup.id,
          },
        }),
        prisma.batalhaStartup.create({
          data: {
            batalha_id: batalha.id,
            startup_id: embaralhados[i + 1].startup.id,
          },
        }),
      ]);
    }

    await prisma.torneio.update({
      where: { id },
      data: { status: "EM_ANDAMENTO" },
    });

    return torneio;
  }

  async adicionarStartup({ torneio_id, startup_id }: adicionarStartup) {
    const torneio = await prisma.torneio.findUnique({
      where: { id: torneio_id },
    });
    if (!torneio) {
      throw new Error("Torneio não encontrado");
    }
    if (torneio.status !== "AGUARDANDO") {
      throw new Error("O torneio já foi iniciado ou finalizado");
    }

    const jaAdicionado = await prisma.startupTorneio.findFirst({
      where: {
        id: torneio_id,
        startup_id: startup_id,
      },
    });
    if (jaAdicionado) {
      throw new Error("Startup já adicionada ao torneio");
    }

    const startupTorneio = await prisma.startupTorneio.create({
      data: {
        torneio_id,
        startup_id,
      },
    });

    const listaEspera = await prisma.startupTorneio.findMany({
      where: { torneio_id: torneio_id, status: "ESPERA" },
      include: {
        startup: true,
      },
    });

    if (listaEspera.length === 2) {
      await prisma.$transaction(
        listaEspera.map((startup) =>
          prisma.startupTorneio.update({
            where: {
              unique_startup_torneio: {
                torneio_id: torneio_id,
                startup_id: startup.id,
              },
            },
            data: { status: "ATIVA" },
          })
        )
      );
    }

    return {
      message: "Startup adicionada com sucesso ao torneio",
      startupTorneio,
    };
  }

  async avancarRodada({ id }: readDeleteTorneio) {
    const startupVivas = await prisma.startupTorneio.findMany({
      where: { torneio_id: id, status: "ATIVA" },
    });

    const fase = calculaFase(startupVivas.length);

    if (startupVivas.length < 2 && fase === "FINAL") {
      await prisma.torneio.update({
        where: { id },
        data: { status: "FINALIZADO", vencedor_id: startupVivas[0].startup_id },
      });
      await prisma.startup.update({
        where: { id: startupVivas[0].startup_id },
        data: { vitoriasEmTorneio: { increment: 1 } },
      });
      await prisma.startupTorneio.updateMany({
        where: { torneio_id: id },
        data: { status: "FINALIZADA" },
      });
      return {
        message: "Torneio finalizado com sucesso",
        fase,
        vencedor_id: startupVivas[0].startup_id,
      };
    }

    // Verifica se já existem batalhas pendentes na fase atual
    let batalhas = await prisma.batalha.findMany({
      where: {
        torneio_id: id,
        status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
      },
      select: { id: true, vencedor_id: true },
    });
    if (batalhas.length > 0)
      throw new Error(
        "Ainda existem batalhas pendentes ou em andamento nesta fase."
      );

    const startupsTorneioAtivas = await prisma.startupTorneio.findMany({
      where: { torneio_id: id, status: "ATIVA" },
      include: {
        startup: true,
      },
    });

    let desempate_id: string | null = null;
    let classificados: string[] = startupsTorneioAtivas.map(
      (s) => s.startup_id
    );
    if (classificados.length % 2 === 0) {
      const startups = [...startupVivas.map((s) => s.startup_id)];
      startups.sort(() => Math.random() - 0.5);

      for (let i = 0; i < startups.length; i += 2) {
        const startupA = startups[i];
        const startupB = startups[i + 1];

        if (!startupB) break;

        const batalha = await prisma.batalha.create({
          data: {
            torneio_id: id,
            rodada: fase,
            status: "PENDENTE",
          },
        });

        await prisma.$transaction([
          prisma.batalhaStartup.create({
            data: {
              batalha_id: batalha.id,
              startup_id: startupA,
            },
          }),
          prisma.batalhaStartup.create({
            data: {
              batalha_id: batalha.id,
              startup_id: startupB,
            },
          }),
        ]);
      }
    } else if (classificados.length % 2 !== 0) {
      const startupDesempate = await prisma.startupTorneio.findMany({
        where: { id: { in: classificados } },
        orderBy: { pontos: "desc" },
        take: 1,
      });
      desempate_id = startupDesempate[0].id;
      classificados = classificados.filter((id) => id !== desempate_id);

      for (let i = 0; i < classificados.length; i += 2) {
        const batalha = await prisma.batalha.create({
          data: {
            torneio_id: id,
            rodada: "SEMIFINAL",
          },
        });

        await prisma.$transaction([
          prisma.batalhaStartup.create({
            data: {
              batalha_id: batalha.id,
              startup_id: classificados[i],
            },
          }),
          prisma.batalhaStartup.create({
            data: {
              batalha_id: batalha.id,
              startup_id: classificados[i + 1],
            },
          }),
        ]);
      }
      await prisma.batalha.create({
        data: {
          torneio_id: id,
          rodada: "SEMIFINAL",
          vencedor_id: desempate_id,
          status: "FINALIZADA",
        },
      });
      await prisma.batalhaStartup.create({
        data: {
          batalha_id: id,
          startup_id: desempate_id,
        },
      });
    }

    return {
      message: "Rodada avançada com sucesso",
      classificados,
      fase,
      desempate_id,
    };
  }
}

export function calculaFase(qtdStartups: number) {
  switch (qtdStartups) {
    case 1:
    case 2:
      return "FINAL";
    case 3:
    case 4:
      return "SEMIFINAL";
    case 6:
    case 8:
      return "QUARTAS";
    default:
      throw new Error("Número inválido de startups para determinar a fase.");
  }
}

export { TorneioService };
