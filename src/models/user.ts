import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface UserDocument extends mongoose.Document {
  name: string;
  password: string;
  lastVisited: Date;
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
});

export default mongoose.model<UserDocument>('User', UserSchema);
