import Controller from '../interfaces/controller.interface';
import * as express from 'express';
import userModel from '../user/user.model';
import LogInDto from './logIn.dto';
import * as bcrypt from 'bcrypt';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import CreateUserDto from '../user/user.dto';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import TokenData from '../interfaces/tokenData.interface';
import User from '../user/user.interface';
import * as jwt from 'jsonwebtoken';
import DataStoredInToken from '../interfaces/dataStoredInToken';

class AuthenticationController implements Controller {
  public path = '/auth';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(`${this.path}/register`, this.registeration);
    this.router.post(`${this.path}/login`, this.logingIn);
    this.router.post(`${this.path}/logout`, this.logingOut);
  }
  private logingOut = (req: express.Request, res: express.Response) => {
    res.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    res.send(200);
  };
  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token};HttpOnly;Max-Age=${tokenData.expiresIn}`;
  }
  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = 'testSecret'; // process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }
  private registeration = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const userData: CreateUserDto = req.body;
    if (await this.user.findOne({ email: userData.email })) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword,
      });
      user.password = undefined;
      const tokenData = this.createToken(user);
      res.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
      res.send({ user, token: tokenData.token });
    }
  };
  private logingIn = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const logInData: LogInDto = req.body;
    const user = await this.user.findOne({ email: logInData.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.password
      );
      if (isPasswordMatching) {
        user.password = undefined;
        const tokenData = this.createToken(user);
        res.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
        res.send({ user, token: tokenData.token });
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };
}

export default AuthenticationController;
