import { Request, Response, NextFunction } from "express";
import { TorneioService } from "../services/torneioService";

const torneioService = new TorneioService();

class TorneioController {
  async createTorneio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { nome } = req.body;
      const torneio = await torneioService.createTorneio({ nome });
      res.status(201).json(torneio);
    } catch (error) {
      console.error("Erro criando torneio:", error);
      next(error);
    }
  }

  async getTorneioById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const torneio = await torneioService.getTorneioById({
        id,
      });
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro buscando torneio:", error);
      next(error);
    }
  }

  async getAllTorneios(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const torneios = await torneioService.getAllTorneios();
      res.status(200).json(torneios);
    } catch (error) {
      console.error("Erro buscando torneios:", error);
      next(error);
    }
  }

  async updateTorneio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      const torneio = await torneioService.updateTorneio({
        id,
        nome,
      });
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro atualizando torneio:", error);
      next(error);
    }
  }

  async deleteTorneio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const deleted = await torneioService.deleteTorneio({ id });
      res.status(204).send(deleted);
    } catch (error) {
      console.error("Erro deletando torneio:", error);
      next(error);
    }
  }

  async iniciarTorneio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const torneio = await torneioService.iniciarTorneio({
        id,
      });
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro iniciando torneio:", error);
      next(error);
    }
  }

  async adicionarStartup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { torneio_id } = req.params;
      const { startup_id } = req.body;
      const torneio = await torneioService.adicionarStartup({
        torneio_id,
        startup_id,
      });
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro adicionando startup ao torneio:", error);
      next(error);
    }
  }

  async avancarRodada(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const torneio = await torneioService.avancarRodada({ id });
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro avançando rodada do torneio:", error);
      next(error);
    }
  }
}

export { TorneioController };
