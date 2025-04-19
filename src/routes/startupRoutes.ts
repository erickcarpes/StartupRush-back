import { Router } from "express";
import { StartupController } from "../controllers/startupController";

const router = Router();
const controller = new StartupController();

router.post("/startup", controller.createStartup);

router.get("/startup/:id", controller.getStartupById);

router.get("/startups", controller.getAllStartups);

router.put("/startup/:id", controller.updateStartup);

router.delete("/startup/:id", controller.deleteStartup);

export default router;
