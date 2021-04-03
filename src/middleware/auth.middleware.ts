import RequestWithUser from '../interfaces/requestWithUser.interface';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import userModel from '../user/user.model';
import WrongAuhenticationTokenException from '../exceptions/WrongAuthenticationTokenException';

async function authMiddleware(
  request: RequestWithUser,
  response: express.Response,
  next: express.NextFunction
) {
  const cookies = request.cookies;
  console.log('test');
  console.log(cookies.Authorization);
  if (cookies && cookies.Authorization) {
    const secret = 'testSecret'; //process.env.JWT_SECRET;
    try {
      const verificationResponse = jwt.verify(
        cookies.Authorization,
        secret
      ) as DataStoredInToken;
      const id = verificationResponse._id;
      const user = await userModel.findById(id);
      if (user) {
        request.user = user;
        next();
      } else {
        next(new WrongAuhenticationTokenException());
      }
    } catch (error) {
      next(new WrongAuhenticationTokenException());
    }
  }
}

export default authMiddleware;
