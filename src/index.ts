import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import dashboardRouter from './panel/panel';
import { startWorker } from './services/Worker';

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use('/', dashboardRouter);

(async () => {
  await mongoose.connect(String(process.env.MONGO_URI));
  await startWorker();
})();

app.listen(process.env.PORT, () => {
  console.log(`[Panel] 패널 실행 중: http://localhost:${process.env.PORT}`);
});