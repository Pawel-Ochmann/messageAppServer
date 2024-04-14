import './pre-start'; // Must be the first import
import logger from 'jet-logger';

import EnvVars from '@src/constants/EnvVars';
import server from './server';
import { initializeSocket } from './socket';

// **** Run **** //

const SERVER_START_MSG =
  'Express server started on port: ' + EnvVars.Port.toString();

const httpServer = server.listen(EnvVars.Port, () => {
  logger.info(SERVER_START_MSG);
  console.log('server is running');
});

initializeSocket(httpServer);
