import { Router } from "express";
import { TorneioController } from "../controllers/torneioController";

const router = Router();
const controller = new TorneioController();

// ROTA POST PARA CRIAR UM TORNEIO
router.post("/torneio", controller.createTorneio);

// ROTA GET PARA BUSCAR UM TORNEIO POR ID
router.get("/torneio/:id", controller.getTorneioById);

// ROTA GET PARA BUSCAR O ÚLTIMO TORNEIO
router.get("/torneios/ultimo", controller.getUltimoTorneio);

// ROTA GET PARA BUSCAR TORNEIO AGUARDANDO
router.get("/torneios/aguardando", controller.getTorneioAguardando);

// ROTA GET PARA BUSCAR TORNEIO EM ANDAMENTO
router.get("/torneios/andamento", controller.getTorneioEmAndamento);

// ROTA GET PARA BUSCAR TORNEIO NAO FINALIZADO
router.get("/torneios/nao-finalizado", controller.getTorneioNaoFinalizado);

// ROTA GET PARA BUSCAR TODOS OS TORNEIOS
router.get("/torneios", controller.getAllTorneios);

// ROTA PUT PARA ATUALIZAR UM TORNEIO
router.put("/torneio/:id", controller.updateTorneio);

// ROTA DELETE PARA DELETAR UM TORNEIO
router.delete("/torneio/:id", controller.deleteTorneio);

// ROTA PARA INICIAR UM TORNEIO
router.post("/torneio/:id/iniciar", controller.iniciarTorneio);

// ROTA PARA ADICIONAR STARTUPS A UM TORNEIO
router.post("/torneio/:torneio_id/startup", controller.adicionarStartup);

// ROTA PARA AVANÇAR RODADAS DO TORNEIO
router.post("/torneio/avancar", controller.avancarRodada);

// ROTA PARA PEGAR AS STARTUPS QUE ESTÃO NO TORNEIO
router.get("/torneio/startups/ranking", controller.startupsParticipantes);

// ROTA PARA PEGAR AS STARTUPS QUE NÃO ESTÃO NO TORNEIO
router.get("/torneios/startupsNaoTorneio", controller.startupsNaoParticipantes);

// ROTA PARA PEGAR AS STARTUPS DE CADA RODADA DO TORNEIO
router.get("/torneio/:id/batalhas", controller.getBatalhasPorRodada);

export default router;
