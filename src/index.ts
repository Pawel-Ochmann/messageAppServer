import './pre-start'; // Must be the first import
import logger from 'jet-logger';

import { initializeSocket } from './socket';
import server from './server';

// **** Run **** //

const PORT = 3000; 

const SERVER_START_MSG = 'Express server started on port: ' + PORT.toString();

const httpServer = server.listen(PORT, '0.0.0.0', () => {
  logger.info(SERVER_START_MSG);
  console.log('server is running');
});

initializeSocket(httpServer);
