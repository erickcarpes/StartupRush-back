import { StartupService } from "../services/startupService";
import { Request, Response, NextFunction } from "express";

const startupService = new StartupService();

class StartupController {
  async createStartup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { nome, slogan, anoFundacao } = req.body;
      const startup = await startupService.createStartup({
        nome,
        slogan,
        anoFundacao,
      });
      res.status(201).json(startup);
    } catch (error) {
      console.error("Erro criando startup:", error);
      next(error);
    }
  }

  async getStartupById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const startup = await startupService.getStartupById({
        id,
      });
      res.status(200).json(startup);
    } catch (error) {
      console.error("Erro buscando startup:", error);
      next(error);
    }
  }

  async getAllStartups(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const startups = await startupService.getAllStartups();
      res.status(200).json(startups);
    } catch (error) {
      console.error("Erro buscando startups:", error);
      next(error);
    }
  }

  async updateStartup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const { nome, slogan, anoFundacao } = req.body;
      const startup = await startupService.updateStartup({
        id,
        nome,
        slogan,
        anoFundacao,
      });
      res.status(200).json(startup);
    } catch (error) {
      console.error("Erro atualizando startup:", error);
      next(error);
    }
  }

  async deleteStartup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      await startupService.deleteStartup({ id });
      res.status(200).send({ message: "Startup deletada com sucesso" });
    } catch (error) {
      console.error("Erro deletando startup:", error);
      next(error);
    }
  }
}

export { StartupController };
