import { model, Schema, Document } from 'mongoose';
import User from './user.interface';

const addressSchema = new Schema({
  city: String,
  street: String,
});
const userSchema = new Schema({
  name: String,
  password: String,
  email: String,
  address: addressSchema,
  posts: [
    {
      ref: 'Post',
      type: Schema.Types.ObjectId,
    },
  ],
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
