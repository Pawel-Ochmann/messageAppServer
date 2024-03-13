import mongoose from 'mongoose';

const Schema = mongoose.Schema;



export interface UserDocument extends mongoose.Document {
  name: string;
  password: string;
  lastVisited: Date;
  conversations: { ref: mongoose.Types.ObjectId; name: string }[];
  groupConversations: { ref: mongoose.Types.ObjectId; name: string }[];
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
      ref: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],

  groupConversations: [
    {
      ref: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model<UserDocument>('User', UserSchema);
