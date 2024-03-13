import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface UserDocument extends mongoose.Document {
  name: string;
  password: string;
  lastVisited: Date;
  conversations: mongoose.Types.ObjectId[];
  groupConversations: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  lastVisited: {
    type: Date,
    default: Date.now,
  },

  conversations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
  ],

  groupConversations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'GroupConversation',
    },
  ],
});

export default mongoose.model<UserDocument>('User', UserSchema);
