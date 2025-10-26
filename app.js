import express from 'express'
import path from "path";
import expressConfig from './config/express';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

expressConfig(app)
export default app