import { Router } from "express";
import { RankingController } from "../controllers/rankingController";

const router = Router();
const controller = new RankingController();

router.get("/ranking", controller.getRanking);

export default router;
