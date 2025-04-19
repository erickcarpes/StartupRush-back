import { prisma } from "../prisma/client";

interface createStartup {
  nome: string;
  slogan: string;
  anoFundacao: number;
}

interface updateStartup {
  id: string;
  nome?: string;
  slogan?: string;
  anoFundacao?: number;
}

interface readDeleteStartup {
  id: string;
}
class StartupService {
  async createStartup({ nome, slogan, anoFundacao }: createStartup) {
    if (!nome || !slogan || !anoFundacao) {
      throw new Error(
        "Preencha todos os campos: nome, slogan e ano de fundação"
      );
    }
    if (anoFundacao < 1800 || anoFundacao > new Date().getFullYear()) {
      throw new Error("Ano de fundação inválido");
    }
    const existingStartup = await prisma.startup.findUnique({
      where: { nome },
    });
    if (existingStartup) {
      throw new Error("Startup já existe com esse nome");
    }
    const data = {
      nome,
      slogan,
      anoFundacao,
    };

    const startup = await prisma.startup.create({
      data,
    });
    return startup;
  }

  async getAllStartups() {
    const startups = await prisma.startup.findMany();
    if (!startups || startups.length === 0) {
      throw new Error("Nenhuma startup encontrada");
    }
    return startups;
  }

  async getStartupById({ id }: readDeleteStartup) {
    if (!id) {
      throw new Error("ID da startup não fornecido");
    }

    const startup = await prisma.startup.findUnique({
      where: { id },
    });
    if (!startup) {
      throw new Error("Startup não encontrada");
    }
    return startup;
  }

  async updateStartup({ id, nome, slogan, anoFundacao }: updateStartup) {
    if (!id) {
      throw new Error("ID da startup não fornecido");
    }
    if (!nome && !slogan && !anoFundacao) {
      throw new Error("Nenhum campo para atualizar fornecido");
    }
    if (
      anoFundacao &&
      (anoFundacao < 1800 || anoFundacao > new Date().getFullYear())
    ) {
      throw new Error("Ano de fundação inválido");
    }
    if (nome) {
      const existingStartup = await prisma.startup.findUnique({
        where: { nome, NOT: { id: id } },
      });
      if (existingStartup) {
        throw new Error("Startup já existe com esse nome");
      }
    }
    const data: Partial<updateStartup> = {};
    if (nome) data.nome = nome;
    if (slogan) data.slogan = slogan;
    if (anoFundacao) data.anoFundacao = anoFundacao;

    const startup = await prisma.startup.update({
      where: { id },
      data,
    });
    return startup;
  }

  async deleteStartup({ id }: readDeleteStartup) {
    await prisma.batalhaStartup.deleteMany({
      where: { startup_id: id },
    });
    
    const startup = await prisma.startup.delete({
      where: { id },
    });
    if (!startup) {
      throw new Error("Startup não encontrada");
    }
    return startup;
  }

  async deleteAllStartups() {
    const startups = await prisma.startup.deleteMany({});
    if (!startups) {
      throw new Error("Nenhuma startup encontrada para deletar");
    }
    return startups;
  }
}

export { StartupService };
