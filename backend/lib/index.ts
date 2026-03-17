import App from './app.js';
import MovieController from "./controllers/movie.controller.js"
const app = new App([
   new MovieController(),
]);
await app.init();
app.listen();