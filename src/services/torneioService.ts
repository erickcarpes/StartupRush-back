import { RODADA } from "@prisma/client";
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

  // Método para criar um novo torneio
  // Verifica se o nome foi fornecido
  // Se não foi, lança um erro
  // Se o nome foi fornecido, verifica se já existe um torneio em andamento
  // Se já existe, lança um erro
  // Se não existe, cria um novo torneio no banco de dados
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

  // Métodos para ler todos os torneios
  // Verifica se existem torneios no banco de dados
  // Se não houver, lança um erro
  // Se houver, retorna todos os torneios
  async getAllTorneios() {
    const torneios = await prisma.torneio.findMany();
    if (!torneios || torneios.length === 0) {
      throw new Error("Nenhum torneio encontrado");
    }
    return torneios;
  }

  // Método para ler o último torneio criado
  // Busca o torneio mais recente no banco de dados
  // Se não houver torneios, lança um erro
  // Se houver, retorna o torneio mais recente
  async getUltimoTorneio() {
    const torneios = await prisma.torneio.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!torneios) {
      throw new Error("Nenhum torneio encontrado");
    }
    return torneios;
  }

  // Métodos para ler torneios com status AGUARDANDO
  // Verifica se existem torneios com status AGUARDANDO no banco de dados
  // Se não houver, lança um erro
  // Se houver, retorna o torneio mais recente com status AGUARDANDO
  async getTorneioAguardando() {
    const torneio = await prisma.torneio.findFirst({
      where: { status: { equals: "AGUARDANDO" } },
      orderBy: { createdAt: "desc" },
    });
    if (!torneio) {
      throw new Error("Nenhum torneio aguardando encontrado");
    }
    return torneio;
  }

  // Métodos para ler torneios com status EM_ANDAMENTO
  // Verifica se existem torneios com status EM_ANDAMENTO no banco de dados
  // Se não houver, lança um erro
  // Se houver, retorna o torneio mais recente com status EM_ANDAMENTO
  async getTorneioEmAndamento() {
    const torneio = await prisma.torneio.findFirst({
      where: { status: { equals: "EM_ANDAMENTO" } },
      orderBy: { createdAt: "desc" },
    });
    if (!torneio) {
      throw new Error("Nenhum torneio em andamento encontrado");
    }
    return torneio;
  }

  // Métodos para ler torneios com status AGUARDANDO ou EM_ANDAMENTO
  // Verifica se existem torneios com status AGUARDANDO ou EM_ANDAMENTO no banco de dados
  // Se não houver, lança um erro
  // Se houver, retorna o torneio mais recente com status AGUARDANDO ou EM_ANDAMENTO
  async getTorneioNaoFinalizado() {
    const torneio = await prisma.torneio.findFirst({
      where: { status: { not: "FINALIZADO" } },
      orderBy: { createdAt: "desc" },
    });
    if (!torneio) {
      throw new Error("Nenhum torneio não finalizado encontrado");
    }
    return torneio;
  }

  // Método para ler um torneio específico pelo ID
  // Verifica se o ID foi fornecido
  // Se não foi, lança um erro
  // Se o ID foi fornecido, busca o torneio no banco de dados
  // Se o torneio não for encontrado, lança um erro
  // Se o torneio for encontrado, retorna o torneio
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

  // Método para atualizar um torneio
  // Verifica se o ID foi fornecido
  // Se não foi, lança um erro
  // Se o ID foi fornecido, verifica se o nome foi fornecido
  // Se o nome não foi, lança um erro
  // Se o nome foi fornecido, verifica se já existe um torneio com esse nome
  // Se já existe, lança um erro
  // Se não existe, atualiza o torneio no banco de dados
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

  // Método para deletar um torneio por ID
  // Busca o torneio no banco de dados pelo ID
  // Se o torneio não for encontrado, lança um erro
  // Se o torneio for encontrado, deleta ele e todas as startups associadas a ele
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

  // Método para deletar todos os torneios
  // Busca todos os torneios no banco de dados
  // Se não houver torneios, lança um erro
  // Se houver, deleta todos os torneios
  async deleteAllTorneios() {
    const torneios = await prisma.torneio.deleteMany();
    if (!torneios) {
      throw new Error("Nenhum torneio encontrado para deletar");
    }
    return torneios;
  }

  // Método para iniciar um torneio
  // Busca o torneio no banco de dados pelo ID
  // Se o torneio não for encontrado, lança um erro
  // Se o tonrneio não estiver com status AGUARDANDO, lança um erro
  // Se o torneio estiver com status AGUARDANDO, busca as startups ativas
  // Verifica se o número de startups ativas é par e entre 4 e 8
  // Se não for, lança um erro
  // Se for, embaralha as startups e cria as batalhas
  // Atualiza o status do torneio para EM_ANDAMENTO
  // Retorna o torneio atualizado
  async iniciarTorneio({ id }: readDeleteTorneio) {
    const torneio = await prisma.torneio.findFirst({
      where: { id },
    });

    if (!torneio) {
      throw new Error("Torneio não encontrado");
    }
    if (torneio.status !== "AGUARDANDO") {
      throw new Error("O torneio já foi iniciado");
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
        "O torneio deve ter entre 4 e 8 participantes."
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

  // Método para adicionar uma startup a um torneio
  // Verifica se o torneio existe e está com status AGUARDANDO
  // Se não estiver, lança um erro
  // Verifica se a startup já está adicionada ao torneio
  // Se já estiver, lança um erro
  // Se não estiver, verifica se a startup existe
  // Se não existir, lança um erro
  // Se existir, cria a startupTorneio no banco de dados
  // Verifica se existem startups na lista de espera
  // Se houverem 2 startups na lista de espera, atualiza o status delas para ATIVA
  // Retorna a startupTorneio criada
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

    const startup = await prisma.startup.findUnique({
      where: { id: startup_id },
    });
    if (!startup) {
      throw new Error("Startup não encontrada");
    }

    const startupTorneio = await prisma.startupTorneio.create({
      data: {
        torneio_id,
        startup_id,
        nome: startup.nome,
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
                startup_id: startup.startup_id,
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

  // Método para avançar a rodada do torneio
  // Verifica se o torneio existe e está com status EM_ANDAMENTO
  // Se não estiver, lança um erro
  // Verifica se existem startups ativas no torneio
  // Calcula a fase do torneio com base no número de startups ativas
  // Se houver apenas uma startup, finaliza o torneio e atualiza o status para FINALIZADO
  // Se houver mais de uma startup, verifica se já existem batalhas pendentes
  // Se houver, lança um erro
  // Se não houver, embaralha as startups vencedoras e cria as novas batalhas
  // Verifica se o número de startups ativas é par
  // Se for, cria as batalhas normalmente
  // Se não for, escolhe uma startup para desempate e passa ela para a próxima fase
  async avancarRodada() {
    const torneio = await prisma.torneio.findFirst({
      where: { status: "EM_ANDAMENTO" },
      orderBy: { createdAt: "desc" },
    });
    if (!torneio) {
      throw new Error("Nenhum torneio encontrado em andamento");
    }

    const startupVivas = await prisma.startupTorneio.findMany({
      where: { torneio_id: torneio.id, status: "ATIVA" },
    });

    const fase = calculaFase(startupVivas.length);

    if (startupVivas.length < 2 && fase === "FINAL") {
      await prisma.torneio.update({
        where: { id: torneio.id },
        data: { status: "FINALIZADO", vencedor_id: startupVivas[0].startup_id },
      });
      await prisma.startup.update({
        where: { id: startupVivas[0].startup_id },
        data: { vitoriasEmTorneioTotal: { increment: 1 } },
      });
      await prisma.startupTorneio.updateMany({
        where: { torneio_id: torneio.id },
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
        torneio_id: torneio.id,
        status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
      },
      select: { id: true, vencedor_id: true },
    });
    if (batalhas.length > 0)
      throw new Error(
        "Ainda existem batalhas pendentes ou em andamento nesta fase."
      );

    const startupsTorneioAtivas = await prisma.startupTorneio.findMany({
      where: { torneio_id: torneio.id, status: "ATIVA" },
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
            torneio_id: torneio.id,
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
        where: { startup_id: { in: classificados } },
        orderBy: { pontos: "desc" },
        take: 1,
      });
      desempate_id = startupDesempate[0].startup_id;

      await prisma.startupTorneio.update({
        where: {
          unique_startup_torneio: {
            torneio_id: torneio.id,
            startup_id: desempate_id,
          },
        },
        data: { pontos: { increment: 30 } },
      });

      classificados = classificados.filter((id) => id !== desempate_id);

      await prisma.startup.update({
        where: { id: desempate_id },
        data: { pontosTotal: { increment: 30 } },
      });

      for (let i = 0; i < classificados.length; i += 2) {
        const batalha = await prisma.batalha.create({
          data: {
            torneio_id: torneio.id,
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
      const batalhaDesempate = await prisma.batalha.create({
        data: {
          torneio_id: torneio.id,
          rodada: "SEMIFINAL",
          vencedor_id: desempate_id,
          status: "FINALIZADA",
        },
      });
      await prisma.batalhaStartup.create({
        data: {
          batalha_id: batalhaDesempate.id,
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

  async startupsNaoParticipantes() {
    const torneio = await prisma.torneio.findFirst({
      where: { status: "AGUARDANDO" },
      orderBy: { createdAt: "desc" },
    });
    if (!torneio) {
      throw new Error("Torneio não encontrado");
    }

    const startupsNaoParticipantes = await prisma.startup.findMany({
      where: {
        StartupTorneio: {
          none: {
            torneio_id: torneio.id,
          },
        },
      },
    });

    if (!startupsNaoParticipantes || startupsNaoParticipantes.length === 0) {
      throw new Error("Nenhuma startup encontrada que não participe do torneio");
    }

    return startupsNaoParticipantes;
  }

  async startupsParticipantes() {
    const torneio = await prisma.torneio.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!torneio) {
      throw new Error("Torneio não encontrado");
    }

    const startupsParticipantes = await prisma.startupTorneio.findMany({
      where: { torneio_id: torneio.id, status: { not: "ESPERA" } },
      include: {
        startup: true,
      },
      orderBy: {
        pontos: "desc",
      },
    });

    if (!startupsParticipantes || startupsParticipantes.length === 0) {
      return {
        message: "Nenhuma startup encontrada que participe do torneio",
      };
    }

    return startupsParticipantes;
  }

  // Função para buscar as batalhas da rodada
  // Busca as batalhas do torneio
  // Em ordem de prioridade: FINAL, SEMIFINAL, QUARTAS
  // Se não houver batalhas, retorna um erro
  // Se houver, retorna as batalhas com os dados das startups
  async getBatalhasPorRodada(torneioId: string) {
    const rodadasPrioritarias: RODADA[] = ["FINAL", "SEMIFINAL", "QUARTAS"];

    let batalhasCompletas: Array<{
      id: string;
      rodada: RODADA;
      participantes: {
        startup: {
          nome: string;
          id: string;
        };
      }[];
    }> = [];

    for (const rodada of rodadasPrioritarias) {
      const batalhas = await prisma.batalha.findMany({
        where: {
          torneio_id: torneioId,
          rodada,
          status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
        },
        include: {
          participantes: {
            include: {
              startup: true,
            },
          },
        },
      });

      if (batalhas.length > 0) {
        batalhasCompletas = batalhas;
        break;
      }
    }

    if (batalhasCompletas.length === 0) {
      throw new Error("Nenhuma batalha encontrada para a rodada atual.");
    }

    // Mapeia as batalhas para retornar os dados das startups (nome)
    const batalhasComStartups = batalhasCompletas.map((batalha) => ({
      id: batalha.id,
      participantes: batalha.participantes.map((participante) => ({
        startup_id: participante.startup.id,
        nome: participante.startup.nome,
      })),
    }));

    return batalhasComStartups;
  }
}

// Função para calcular a fase do torneio com base no número de startups
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
