import User from 'user/user.interface';
import * as express from 'express';

interface RequestWithUser extends express.Request {
  user: User;
}

export default RequestWithUser;
