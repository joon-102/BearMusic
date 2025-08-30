import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { startWorker } from './services/Worker';

dotenv.config();

(async () => {
  await mongoose.connect(String(process.env.MONGO_URI));
  await startWorker();
})();