import { prisma } from "../prisma/client";

class RankingService {
  async getRanking() {
    const startups = await prisma.startup.findMany();

    const ranking = startups.map((startup) => {
      const plusMinus =
        startup.pitchConvincenteTotal * 6 +
        startup.tracaoUsuariosTotal * 3 -
        startup.produtoComBugsTotal * 4 -
        startup.investidorIrritadoTotal * 6 -
        startup.fakeNewsTotal * 8;
      return {
        ...startup,
        plusMinus,
      };
    });
    return ranking.sort((a, b) => b.plusMinus - a.plusMinus);
  }
}

export { RankingService };
