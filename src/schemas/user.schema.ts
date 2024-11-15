import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: false,
  },
  profileImg: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const USER = model('user', userSchema);

export default USER;
