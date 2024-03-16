import mongoose from 'mongoose';
const Schema = mongoose.Schema;

type MessageType = {
  author: string;
  content: string | Buffer;
  type: 'text' | 'image' | 'gif' | 'audio';
  date: Date;
  id?: string;
};

type ConversationType = {
  messages: MessageType[];
  participants: mongoose.Types.ObjectId[];
  group: boolean;
  name?: string;
};

const ConversationSchema = new mongoose.Schema<ConversationType>({
  messages: [
    {
      author: { type: String, required: true },
      content: { type: String },
      type: {
        type: String,
        enum: ['text', 'image', 'gif', 'audio'],
        required: true,
      },
      date: { type: Date, required: true, default: Date.now },
    },
  ],
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  group: { type: Boolean, required: true },
  name: { type: String },
});

const ConversationModel = mongoose.model<ConversationType>(
  'Conversation',
  ConversationSchema
);

export { ConversationType, MessageType, ConversationModel };
