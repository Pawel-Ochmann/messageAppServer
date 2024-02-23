import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
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

export default mongoose.model('User', UserSchema);
