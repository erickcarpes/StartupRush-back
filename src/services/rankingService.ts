import { prisma } from "../prisma/client";

class RankingService {
  async getRanking() {
    const startups = await prisma.startup.findMany();

    const ranking = startups.map((startup) => {
      const plusMinus =
        startup.pitchConvincente * 6 +
        startup.tracaoUsuarios * 3 -
        startup.produtoComBugs * 4 -
        startup.investidorIrritado * 6 -
        startup.fakeNews * 8;
      return {
        ...startup,
        plusMinus,
      };
    });
    return ranking.sort((a, b) => b.plusMinus - a.plusMinus);
  }
}

export { RankingService };
