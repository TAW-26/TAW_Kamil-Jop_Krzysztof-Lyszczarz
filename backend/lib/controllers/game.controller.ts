import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js'; 
import  GameService  from '../services/game.service.js';

class GameController implements Controller { 
  public path = '/api/game';
  public router = Router();
  public gameService = new GameService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/guess`, this.takeGuess);
  }

private takeGuess = async (req: Request, res: Response): Promise<void> => {
    const { categorySlug, guessMovieId } = req.body;

    if (!categorySlug || !guessMovieId) {
        res.status(400).json({ error: 'Both "categorySlug" and "guessMovieId" are required' });
        return;
    }

    const dateStr = new Date().toISOString().split('T')[0];

    try {
        const evaluation = await this.gameService.checkGuess(Number(guessMovieId), categorySlug, dateStr);
        res.status(200).json(evaluation); 
    }
    catch (error) {
        console.error('Error in takeGuess:', error);
        res.status(500).json({ error: (error as Error).message || 'Internal server error' });
    }
}

}
export default GameController;