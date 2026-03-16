import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js'; 
import { prisma } from '../app.js';

class MovieController implements Controller { 
  public path = '/api/movies';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

  }
}


export default MovieController;