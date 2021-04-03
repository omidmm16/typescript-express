import Controller from '../interfaces/controller.interface';
import PostsModel from '../posts/posts.model';
import * as express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import RequestWithUser from 'interfaces/requestWithUser.interface';
import NotAuthorizedException from '../exceptions/NotAuthorizedException';

class UserController implements Controller {
  public path = '/users/';
  public router = express.Router();
  private post = PostsModel;
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `${this.path}/:id/posts`,
      authMiddleware,
      this.getAllPostsOfUser
    );
  }

  private getAllPostsOfUser = async (
    req: RequestWithUser,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const userId = req.params.id;
    if (userId == req.user._id.toString()) {
      const posts = await this.post.find({ author: userId });
      express.response.send(posts);
    }
    next(new NotAuthorizedException());
  };
}

export default UserController;
