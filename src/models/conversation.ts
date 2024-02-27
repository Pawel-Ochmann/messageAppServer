import mongoose from 'mongoose';

type MessageType = {
  author: string;
  content: string;
  date: Date;
};

type ConversationType = {
  messages: MessageType[];
};

const ConversationSchema = new mongoose.Schema<ConversationType>({
  messages: [
    {
      author: { type: String, required: true },
      content: { type: String, required: true },
      date: { type: Date, required: true, default: Date.now },
    },
  ],
});

const ConversationModel = mongoose.model<ConversationType>(
  'Conversation',
  ConversationSchema,
);

export { ConversationType, MessageType, ConversationModel };
