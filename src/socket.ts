import { Server, Socket } from 'socket.io';
import http from 'http';
import {
  MessageType,
  ConversationModel,
} from './models/conversation';

function setupSocketIO(server: http.Server) {
  const io = new Server(server);

  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    socket.on('join', async () => {
      try {
        // Fetch array of messages from MongoDB
        const conversation = await ConversationModel.findOne().lean();
        const messages: MessageType[] = conversation
          ? conversation.messages
          : [];

        // Emit the messages to the client
        socket.emit('messages', messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

export function initializeSocket() {
  const server = new http.Server();
  setupSocketIO(server);
}
