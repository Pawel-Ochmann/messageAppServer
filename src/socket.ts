import { Server, Socket } from 'socket.io';
import http from 'http';
import { MessageType, ConversationModel } from './models/conversation';

function setupSocketIO(server: http.Server) {

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  console.log('connected to socket');
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    socket.on('join', async () => {
      try {
        // Fetch array of messages from MongoDB
        const conversation = await ConversationModel.findOne();
        const messages: MessageType[] = conversation
          ? conversation.messages
          : [];

        // Emit the messages to the client
        socket.emit('messages', messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    socket.on('newMessage', async (newMessage: MessageType) => {
      try {
        const conversation = await ConversationModel.findOneAndUpdate(
          {},
          { $push: { messages: newMessage } },
          { upsert: true, new: true }
        );

        const updatedMessages: MessageType[] = conversation.messages;

        io.emit('messages', updatedMessages);
      } catch (error) {
        console.error('Error saving new message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

export function initializeSocket(port: number) {
  const server = new http.Server();
  setupSocketIO(server);
  server.listen(port, () => {
    console.log(`Socket server is running on port ${port}`);
  });
}
