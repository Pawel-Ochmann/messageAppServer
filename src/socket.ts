/* eslint-disable indent */
import { Server, Socket } from 'socket.io';
import http from 'http';
import {
  MessageType,
  ConversationModel,
  ConversationType,
} from './models/conversation';
import UserModel from './models/user';
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

    socket.on('join', (userName: string) => {
      socket.join(userName);
    });

    socket.on('createNewConversation', async (chatOpen: ConversationType) => {
      try {
        const existingConversation = await ConversationModel.findOne({
          key: chatOpen.key,
        });

        if (existingConversation) {
          socket.emit('createNewChatConfirmation', false);
          return;
        }

        const newConversation = await ConversationModel.create({
          key: chatOpen.key,
          messages: [],
          participants: chatOpen.participants,
          group: chatOpen.group,
          name: chatOpen.name,
        });

        const participants = await UserModel.find({
          _id: { $in: chatOpen.participants },
        });

        for (const participant of participants) {
          participant.conversations.push(newConversation._id);
          await participant.save();
        }
        const populatedParticipants = await UserModel.populate(participants, {
          path: 'conversations.ref',
          model: 'Conversation',
        });

        for (const participant of populatedParticipants) {
          socket.to(participant.name).emit('updatedUserDocument', participant);
        }

        socket.emit('createNewChatConfirmation', true);
      } catch (error) {
        console.error('Error creating new chat:', error);
        socket.emit('createNewChatConfirmation', false);
      }
    });

    socket.on('setGroupImage', (conversationKey: string, image: Buffer) => {
      const imagePath = path.join(
        __dirname,
        'public',
        'groupImages',
        `${conversationKey}`
      );
      const groupImagesDirectory = path.join(
        __dirname,
        'public',
        'groupImages'
      );
      if (!fs.existsSync(groupImagesDirectory)) {
        fs.mkdirSync(groupImagesDirectory);
      }

      fs.writeFile(imagePath, image, (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('File written successfully:', imagePath);
      });
    });

    socket.on(
      'newMessage',
      async (newMessage: MessageType, conversationKey: string) => {
        try {
          const conversation = await ConversationModel.findOne({
            key: conversationKey,
          });
          if (!conversation) {
            console.error('Conversation not found');
            return;
          }
          const participants = await UserModel.find({
            _id: { $in: conversation.participants },
          });


          switch (newMessage.type) {
            case 'text': {
              conversation.messages.push(newMessage);
              await conversation.save();
              participants.forEach((participant) => {
                io.to(participant.name).emit('message', conversation);
              });
              break;
            }
            case 'gif': {
              conversation.messages.push(newMessage);
              await conversation.save();
              participants.forEach((participant) => {
                io.to(participant.name).emit('message', conversation);
              });
              break;
            }
            case 'image':
              {
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

                conversation.messages.push(updatedMessage);
                await conversation.save();
                participants.forEach((participant) => {
                  io.to(participant.name).emit('message', conversation);
                });
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

                conversation.messages.push(updatedMessage);
                await conversation.save();
                participants.forEach((participant) => {
                  io.to(participant.name).emit('message', conversation);
                });
              }
              break;
            default:
              // Handle unknown message type
              break;
          }
        } catch (error) {
          console.error('Error saving new message:', error);
        }
      }
    );

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
