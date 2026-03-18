import App from './app.js';
import MovieController from './controllers/movie.controller.js';
import AuthController from './controllers/auth.controller.js';
import AdminController from './controllers/admin.controller.js';
import UserController from './controllers/user.controller.js';
import GameController from './controllers/game.controller.js';

const app = new App([
    new MovieController(),
    new AuthController(),
    new AdminController(),
    new UserController(),
    new GameController(),

]);

await app.init();
app.listen();