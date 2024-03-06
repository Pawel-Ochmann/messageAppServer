import mongoose from 'mongoose';

type MessageType = {
  author: string;
  content: string | ArrayBufferView;
  type: 'text' | 'image' | 'gif' | 'audio';
  date: Date;
  id?:string
};

type ConversationType = {
  messages: MessageType[];
};

const ConversationSchema = new mongoose.Schema<ConversationType>({
  messages: [
    {
      author: { type: String, required: true },
      content: { type: String},
      type: {
        type: String,
        enum: ['text', 'image', 'gif', 'audio'],
        required: true,
      },
      date: { type: Date, required: true, default: Date.now },
    },
  ],
});

const ConversationModel = mongoose.model<ConversationType>(
  'Conversation',
  ConversationSchema,
);

export { ConversationType, MessageType, ConversationModel };
