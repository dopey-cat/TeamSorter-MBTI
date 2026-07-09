import express from "express";
import cors from "cors";
import mbtiRoutes from "./routes/mbtiRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '50mb' }));
app.use('/api/mbti', mbtiRoutes);

app.use(express.static(path.join(__dirname, '../dist')));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
