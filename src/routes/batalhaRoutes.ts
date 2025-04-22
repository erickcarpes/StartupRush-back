import { Router } from "express";
import { BatalhaController } from "../controllers/batalhaController";

const batalhaController = new BatalhaController();
const router = Router();

// ROTA POST PARA CRIAR UMA BATALHA
router.post("/batalha", batalhaController.createBatalha);

// ROTA GET PARA BUSCAR UMA BATALHA POR ID
router.get("/batalha/:id", batalhaController.getBatalhaById);

// ROTA GET PARA BUSCAR TODAS AS BATALHAS
router.get("/batalhas", batalhaController.getAllBatalhas);

// ROTA DELETE PARA DELETAR UMA BATALHA
router.delete("/batalha/:id", batalhaController.deleteBatalha);

// ROTA PARA INICIAR UMA BATALHA
router.post("/batalha/:id/iniciar", batalhaController.iniciarBatalha);

// ROTA PARA ENCERRAR BATALHA
router.post("/batalha/:id/encerrar", batalhaController.encerrarBatalha);

// ROTA PARA PEGAR AS STARTUPS QUE ESTÃO NA BATALHA
router.get("/batalha/:id/startups", batalhaController.getStartupsNaBatalha);

export default router;
