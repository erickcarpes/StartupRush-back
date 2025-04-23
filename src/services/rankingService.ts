import { prisma } from "../prisma/client";

class RankingService {

  // Método para calcular o ranking dos startups
  async getRanking() {
    const startups = await prisma.startup.findMany();

    const ranking = startups.map((startup) => {
      const plusMinus =
        startup.pitchConvincenteTotal +
        startup.tracaoUsuariosTotal -
        startup.produtoComBugsTotal -
        startup.investidorIrritadoTotal -
        startup.fakeNewsTotal;
      return {
        ...startup,
        plusMinus,
      };
    });
    return ranking.sort((a, b) => b.plusMinus - a.plusMinus);
  }
}

export { RankingService };
