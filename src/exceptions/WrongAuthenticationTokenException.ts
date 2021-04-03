import HttpException from './HttpException';

class WrongAuhenticationTokenException extends HttpException {
  constructor() {
    super(401, 'Wrong athentication token');
  }
}

export default WrongAuhenticationTokenException;
