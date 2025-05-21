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

  // Método para criar uma nova startup
  // Verifica se o nome, slogan e ano de fundação foram fornecidos
  // Verifica se o ano de fundação é válido (entre 1800 e o ano atual)
  // Verifica se já existe uma startup com o mesmo nome
  // Se tudo estiver correto, cria a startup no banco de dados
  // Retorna a startup criada
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

  // Métodos para ler todas as tartups
  // Verifica se existem startups no banco de dados
  // Se não houver, lança um erro
  // Se houver, retorna todas as startups
  async getAllStartups() {
    const startups = await prisma.startup.findMany();
    if (!startups || startups.length === 0) {
      throw new Error("Nenhuma startup encontrada");
    }
    return startups;
  }

  // Método para ler uma startup específica pelo ID
  // Verifica se o ID foi fornecido
  // Se não foi, lança um erro
  // Se o ID foi fornecido, busca a startup no banco de dados
  // Se a startup não for encontrada, lança um erro
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

  // Método para atualizar uma startup
  // Verifica se o ID foi fornecido
  // Verifica se pelo menos um campo para atualização foi fornecido
  // Verifica se o ano de fundação é válido (entre 1800 e o ano atual)
  // Verifica se já existe uma startup com o mesmo nome (exceto a que está sendo atualizada)
  // Se tudo estiver correto, atualiza a startup no banco de dados
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

  // Método para deletar uma startup
  // Verifica se o ID foi fornecido
  // Se não foi, lança um erro
  // Se o ID foi fornecido, busca a startup no banco de dados
  // Se a startup não for encontrada, lança um erro
  // Se a startup for encontrada, deleta a startup do banco de dados
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

  // Método para deletar todas as startups
  // Busca todas as startups no banco de dados
  // Se não houver startups, lança um erro
  // Se houver, deleta todas as startups do banco de dados
  async deleteAllStartups() {
    const startups = await prisma.startup.deleteMany({});
    if (!startups) {
      throw new Error("Nenhuma startup encontrada para deletar");
    }
    return startups;
  }
}

export { StartupService };
