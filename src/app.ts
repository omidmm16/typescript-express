import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import errorMiddleware from './middleware/error.middleware';
import cookieParser = require('cookie-parser');

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers, port) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.connectToTheDatabase();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }
  connectToTheDatabase() {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
    mongoose.connect(`mongodb://localhost:27017/demo5`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
  private initializeMiddlewares() {
    this.app.use(cookieParser());
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;
