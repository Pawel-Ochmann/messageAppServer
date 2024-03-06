/* eslint-disable indent */
import { Server, Socket } from 'socket.io';
import http from 'http';
import { MessageType, ConversationModel } from './models/conversation';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

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
        switch (newMessage.type) {
          case 'text': {
            const conversation = await ConversationModel.findOneAndUpdate(
              {},
              { $push: { messages: newMessage } },
              { new: true }
            );
            if (conversation) io.emit('messages', conversation.messages);
            break;
          }
          case 'gif': {
            const conversation = await ConversationModel.findOneAndUpdate(
              {},
              { $push: { messages: newMessage } },
              { new: true }
            );
            if (conversation) io.emit('messages', conversation.messages);
            break;
          }
          case 'image': {
            const imageData = newMessage.content;

            console.log('working')

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const messageId: string = uuid() as string;
            const user = newMessage.author;
            const imagePath: string = path.join(
              __dirname,
              'public',
              'users',
              user,
              'images',
              messageId
            );

            if (typeof imageData === 'string') {
              fs.writeFileSync(imagePath, Buffer.from(imageData, 'base64'));
            }

            const requestPath = path.join(user, 'images', messageId);

            const updatedMessage = {
              ...newMessage,
              content: requestPath,
              id: messageId,
            };

            const updatedConversation =
              await ConversationModel.findOneAndUpdate(
                {},
                { $push: { messages: updatedMessage } },
                { new: true }
              );

            if (updatedConversation)
              io.emit('messages', updatedConversation.messages);
            break;
          }

          case 'audio':
            // Handle audio message
            break;
          default:
            // Handle unknown message type
            break;
        }
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
