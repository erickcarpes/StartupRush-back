import { Request, Response, NextFunction } from "express";
import { TorneioService } from "../services/torneioService";
import { RODADA } from "@prisma/client";

const torneioService = new TorneioService();

class TorneioController {

  // ROTA POST PARA CRIAR UM TORNEIO
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

  // ROTA GET PARA BUSCAR UM TORNEIO POR ID
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

  // ROTA GET PARA BUSCAR O ÚLTIMO TORNEIO A SER CRIADO
  async getUltimoTorneio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const torneio = await torneioService.getUltimoTorneio();
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro buscando último torneio:", error);
      next(error);
    }
  }

  // ROTA GET PARA BUSCAR O TORNEIO AGUARDANDO
  async getTorneioAguardando(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const torneio = await torneioService.getTorneioAguardando();
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro buscando torneio em andamento:", error);
      next(error);
    }
  }

  // ROTA GET PARA BUSCAR O TORNEIO EM ANDAMENTO
  async getTorneioEmAndamento(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const torneio = await torneioService.getTorneioEmAndamento();
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro buscando torneio em andamento:", error);
      next(error);
    }
  }

  // ROTA GET PARA BUSCAR O TORNEIO NAO FINALIZADO
  async getTorneioNaoFinalizado(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const torneio = await torneioService.getTorneioNaoFinalizado();
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro buscando torneio em andamento:", error);
      next(error);
    }
  }

  // ROTA GET PARA BUSCAR TODOS OS TORNEIOS
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

  // ROTA PUT PARA ATUALIZAR UM TORNEIO
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

  // ROTA DELETE PARA DELETAR UM TORNEIO
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

  // ROTA POST PARA INICIAR UM TORNEIO
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

  // ROTA POST PARA ADICIONAR STARTUPS A UM TORNEIO
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

  // ROTA POST PARA AVANÇAR RODADAS DO TORNEIO
  async avancarRodada(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const torneio = await torneioService.avancarRodada();
      res.status(200).json(torneio);
    } catch (error) {
      console.error("Erro avançando rodada do torneio:", error);
      next(error);
    }
  }

  // ROTA GET PARA PEGAR AS STARTUPS NÃO QUE ESTÃO NO TORNEIO
  async startupsNaoParticipantes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const startups = await torneioService.startupsNaoParticipantes();
      res.status(200).json(startups);
    } catch (error) {
      console.error("Erro buscando startups não participantes:", error);
      next(error);
    }
  }

  // ROTA GET PARA PEGAR AS STARTUPS QUE ESTÃO NO TORNEIO
  async startupsParticipantes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const startups = await torneioService.startupsParticipantes();
      res.status(200).json(startups);
    } catch (error) {
      console.error("Erro buscando startups participantes:", error);
      next(error);
    }
  }

  // ROTA GET PARA PEGAR TODAS AS BATALHAS DE CADA RODADA DO TORNEIO
  async getBatalhasPorRodada(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const startups = await torneioService.getBatalhasPorRodada(id);
      res.status(200).json(startups);
    } catch (error) {
      console.error("Erro buscando startups por rodada:", error);
      next(error);
    }
  }
}

export { TorneioController };
