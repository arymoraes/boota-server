import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { resolve } from 'path';
import dotenv from 'dotenv';
import router from './router';
import { mongooseConnection } from './database';

dotenv.config({ path: resolve(__dirname, './.env') });

const app = express();

const corsConfig = {
  origin: '*',
  credentials: true,
};

app.use(bodyParser.json());
app.use(cors(corsConfig));
app.use(router);

const server = app.listen(process.env.PORT, (): void => {
  mongooseConnection();
  console.log(`Server running on ${process.env.SERVER_URL}`);
});

module.exports = server;
