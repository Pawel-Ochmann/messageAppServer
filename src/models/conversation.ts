import mongoose from 'mongoose';

type Message = {
  author: string;
  content: string;
  date: Date;
};

type Conversation = {
  messages: Message[];
};

const ConversationSchema = new mongoose.Schema<Conversation>({
  messages: [
    {
      author: { type: String, required: true },
      content: { type: String, required: true },
      date: { type: Date, required: true, default: Date.now },
    },
  ],
});

const ConversationModel = mongoose.model<Conversation>(
  'Conversation',
  ConversationSchema,
);

export { Conversation, Message, ConversationModel };
