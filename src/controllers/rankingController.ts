import { Request, Response, NextFunction } from "express";
import { RankingService } from "../services/rankingService";

const rankingService = new RankingService();

class RankingController {
  async getRanking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const ranking = await rankingService.getRanking();
      res.status(200).json(ranking);
    } catch (error) {
      console.error("Erro buscando startup");
      next();
    }
  }
}

export { RankingController };
