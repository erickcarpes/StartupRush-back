import express, { Request, Response, NextFunction } from "express";
import startupRoutes from "./routes/startupRoutes";
import torneioRoutes from "./routes/torneioRoutes";
import batalhaRoutes from "./routes/batalhaRoutes";
import rankingRoutes from "./routes/rankingRoutes";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/teste", (req, res) => {
  res.send("Testando!");
});

app.use(cors());

app.use("/", startupRoutes);
app.use("/", torneioRoutes);
app.use("/", batalhaRoutes);
app.use("/", rankingRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`🎯 Servidor rodando em http://localhost:${port}`);
});
