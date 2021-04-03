import ReportController from './report/report.controller';
import App from './app';
import PostsController from './posts/posts.controller';
import { validateEnv } from './utils/ValidateEnv';
import AuthenticationController from './authentication/authentication.controller';

//validateEnv();
// const app = new App([new PostsController()], 5000);

// app.listen();

const app = new App(
  [
    new PostsController(),
    new ReportController(),
    new AuthenticationController(),
  ],
  5000
);
app.listen();
