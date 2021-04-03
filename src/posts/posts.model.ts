import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';

const postSchema = new Schema({
  content: String,
  title: String,
  author: {
    ref: 'User',
    type: Schema.Types.ObjectId,
  },
});

const PostsModel = mongoose.model('Post', postSchema);

export default PostsModel;
