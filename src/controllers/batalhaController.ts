import { Request, Response, NextFunction } from "express";
import { BatalhaService } from "../services/batalhaService";

const batalhaService = new BatalhaService();

class BatalhaController {
  
  // ROTA POST PARA CRIAR UMA BATALHA
  async createBatalha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { torneio_id, startup1_id, startup2_id } = req.body;
      const batalha = await batalhaService.createBatalha({
        torneio_id: torneio_id,
        startup1_id: startup1_id,
        startup2_id: startup2_id,
      });
      res.status(201).json(batalha);
    } catch (error) {
      console.error("Erro criando batalha:", error);
      next(error);
    }
  }

  // ROTA GET PARA BUSCAR UMA BATALHA POR ID
  async getBatalhaById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { id } = req.params;
    try {
      const batalha = await batalhaService.getBatalhaById({ id });
      return res.status(200).json(batalha);
    } catch (error) {
      next(error);
    }
  }

  // ROTA GET PARA BUSCAR TODAS AS BATALHAS
  async getAllBatalhas(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const batalhas = await batalhaService.getAllBatalhas();
      res.status(200).json(batalhas);
    } catch (error) {
      console.error("Erro buscando batalhas:", error);
      next(error);
    }
  }

  // ROTA DELETE PARA DELETAR UMA BATALHA
  async deleteBatalha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { id } = req.params;
    try {
      await batalhaService.deleteBatalha({ id });
      res.status(200).send({ message: "Batalha deletada com sucesso" });
    } catch (error) {
      console.error("Erro deletando batalha:", error);
      next(error);
    }
  }

  // ROTA PARA INICIAR UMA BATALHA
  async iniciarBatalha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { id } = req.params;
    try {
      const batalha = await batalhaService.iniciarBatalha({ id });
      res.status(200).json(batalha);
    } catch (error) {
      console.error("Erro iniciando batalha:", error);
      next(error);
    }
  }

  // ROTA PARA ENCERRAR BATALHA
  async encerrarBatalha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { id } = req.params;
    const { eventos } = req.body;
    try {
      const batalha = await batalhaService.encerrarBatalha({ id, eventos });
      res.status(200).json(batalha);
    } catch (error) {
      console.error("Erro encerrando batalha:", error);
      next(error);
    }
  }

  // ROTA PARA PEGAR AS STARTUPS QUE ESTÃO NA BATALHA
  async getStartupsNaBatalha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { id } = req.params;
    try {
      const startups = await batalhaService.getStartupsNaBatalha({ id });
      res.status(200).json(startups);
    } catch (error) {
      console.error("Erro buscando startups na batalha:", error);
      next(error);
    }
  }
}

export { BatalhaController };
