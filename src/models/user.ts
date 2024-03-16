import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface UserType extends mongoose.Document {
  name: string;
  password: string;
  lastVisited: Date;
  conversations: mongoose.Types.ObjectId[];
}

const UserModel = new Schema<UserType>({
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
      required:true,
    },
  ],
});

export default mongoose.model<UserType>('User', UserModel);
