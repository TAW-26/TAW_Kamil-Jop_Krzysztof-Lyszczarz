import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js';
import AutoCompleteService from '../services/autocomplete.service.js';

class MovieController implements Controller {
  public path = '/movies';
  public router = Router();

  constructor(private readonly autoCompleteService: AutoCompleteService) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/search`, this.searchMovies);
  }

  private searchMovies = async (req: Request, res: Response) : Promise<void> => {
    const query = req.query.q as string;
    const categorySlug = req.query.category as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }
    if (!categorySlug) {
      res.status(400).json({ error: 'Query parameter "category" is required' });
      return;
    }
    try {
      const results = await this.autoCompleteService.searchMovie(query, categorySlug);
      res.status(200).json(results); 
    }
    catch (error) {
      console.error('Error in searchMovies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}


export default MovieController;