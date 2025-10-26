import 'express-async-errors'
import http from "http";
import * as dotenv from 'dotenv'
import app from './app';
dotenv.config()

const port = process.env.PORT || 4500;

const server = http.createServer(app);

// Bootstrap express
server.listen(port); 
logger.info(`🚀 Server running on http://localhost:${port}`);
logger.info(`📊 API available at http://localhost:${port}/api/v1`);
logger.info(`🗄️  Using PostgreSQL database`);
logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info('='.repeat(50));
logger.info('\n📡 Available Endpoints:');
logger.info('  Sessions:');
logger.info('    GET    /api/sessions');
logger.info('    GET    /api/sessions/current');
logger.info('    POST   /api/sessions');
logger.info('    PUT    /api/sessions/:id');
logger.info('    PUT    /api/sessions/:id/current');
logger.info('    DELETE /api/sessions/:id');
logger.info('  Experiments:');
logger.info('    GET    /api/experiments');
logger.info('    GET    /api/experiments/:id');
logger.info('    POST   /api/experiments');
logger.info('    PUT    /api/experiments/:id');
logger.info('    DELETE /api/experiments/:id');
logger.info('  Utility:');
logger.info('    GET    /health');
logger.info('\n' + '='.repeat(50));

export default app;
