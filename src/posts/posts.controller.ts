import * as express from 'express';
import Post from './post.interface';
import PostsModel from './posts.model';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import CreatePostDto from './post.dto';
import authMiddleware from '../middleware/auth.middleware';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import userModel from '../user/user.model';

class PostsController {
  public path = '/posts';
  public router = express.Router();
  private post = PostsModel;
  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreatePostDto, true),
        this.modifyPost
      )
      .delete(`${this.path}/:id`, this.deletePost)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreatePostDto),
        this.createPost
      );
  }

  getAllPosts = async (
    request: express.Request,
    response: express.Response
  ) => {
    const posts = await PostsModel.find().populate('author', '-password');
    response.send(posts);
  };

  private getPostById = (
    request: express.Request,
    response: express.Response
  ) => {
    const id = request.params.id;
    const post = PostsModel.findById(id);
    response.send(post);
  };

  private deletePost = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const id = request.params.id;
    PostsModel.findByIdAndDelete(id).then((successResponse) => {
      if (successResponse) {
        response.send(200);
      } else {
        next(new PostNotFoundException(id));
      }
    });
  };
  private modifyPost = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const id = request.params.id;
    const postData: Post = request.body;
    PostsModel.findByIdAndUpdate(id, postData, { new: true }).then(
      (savedPost) => {
        if (savedPost) {
          response.send(savedPost);
        } else {
          next(new PostNotFoundException(id));
        }
      }
    );
  };

  private createPost = async (
    request: RequestWithUser,
    response: express.Response
  ) => {
    const postData: CreatePostDto = request.body;
    console.log(postData);
    const createdPost = new this.post({
      ...postData,
      author: request.user._id,
    });
    const user = await userModel.findById(request.user._id);
    user.posts = [...user.posts, createdPost._id];
    const savedPost = await createdPost.save();
    await savedPost.populate('author', '-password').execPopulate();
    response.send(savedPost);
  };
}

export default PostsController;
