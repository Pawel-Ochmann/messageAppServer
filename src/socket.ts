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
        const conversation = await ConversationModel.findOne();
        const messages: MessageType[] = conversation
          ? conversation.messages
          : [];

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
          case 'image':
            {
              console.log(newMessage);
              const user = newMessage.author;
              const messageId = uuid();

              const imagePath: string = path.join(
                __dirname,
                'public',
                'users',
                user,
                'images',
                `${messageId}`
              );
                  console.log('Received new message:', newMessage);

                  const fileData = newMessage.content as Buffer;
                  fs.writeFile(imagePath, fileData, (err) => {
                    if (err) {
                      console.error('Error writing file:', err);
                      return;
                    }
                    console.log('File written successfully:', imagePath);
                  });

              const requestPath = `/users/${user}/images/${messageId}`;
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
            }
            break;

          case 'audio':
                 {
                   const user = newMessage.author;
                   const messageId = uuid();

                   const audioPath: string = path.join(
                     __dirname,
                     'public',
                     'users',
                     user,
                     'audio',
                     `${messageId}`
                   );
                   console.log('Received new message:', newMessage);

                   const fileData = newMessage.content as Buffer;
                   fs.writeFile(audioPath, fileData, (err) => {
                     if (err) {
                       console.error('Error writing file:', err);
                       return;
                     }
                     console.log('File written successfully:', audioPath);
                   });

                   const requestPath = `/users/${user}/audio/${messageId}`;
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
                 }
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
