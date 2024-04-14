/* eslint-disable indent */
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import {
  MessageType,
  ConversationModel,
  ConversationType,
} from './models/conversation';
import UserModel from './models/user';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

export function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    socket.on('join', async (userName: string) => {
      await socket.join(userName);

      try {
        await UserModel.findOneAndUpdate(
          { name: userName },
          { lastVisited: new Date() },
          { new: true }
        );
      } catch (error) {
        console.error('Error updating user last visited:', error);
      }
    });

    socket.on(
      'createNewConversation',
      async (
        chatOpen: ConversationType,
        callback: (confirmation: boolean) => void
      ) => {
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
          callback(true);
          for (const participant of populatedParticipants) {
            await participant.populate('conversations');
            io.to(participant.name).emit('updatedUserDocument', participant);
          }
        } catch (error) {
          console.error('Error creating new chat:', error);
          callback(false);
        }
      }
    );

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
          UserModel.findOneAndUpdate(
            { name: newMessage.author },
            { lastVisited: new Date() },
            { new: true }
          );

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
          console.log('participants: ', participants.length);



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

    socket.on(
      'getStatus',
      async (otherParticipant: string, callback: (status: string) => void) => {
        try {
          if (io.sockets.adapter.rooms.has(otherParticipant)) {
            callback('active');
          } else {
            const user = await UserModel.findOne({ name: otherParticipant });

            if (user) {
              const lastVisitedString = user.lastVisited.toString();
              callback(lastVisitedString);
            } else {
              callback('');
            }
          }
        } catch (error) {
          console.error('Error handling getStatus event:', error);
          callback('');
        }
      }
    );

    socket.on('typing', (userName: string, sender: string) => {
      if (io.sockets.adapter.rooms.has(userName)) {
        io.to(userName).emit('typing', sender);
      }
    });

    socket.on('disconnect', () => {
      socket.removeAllListeners();
    });
  });
}


