import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js'; 
import  GameService  from '../services/game.service.js';
import { optionalAuthMiddleware, AuthRequest, authMiddleware } from '../middlewares/auth.middleware.js';

class GameController implements Controller { 
  public path = 'game';
  public router = Router();
  public gameService = new GameService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/guess`, optionalAuthMiddleware, this.takeGuess);
    this.router.get(`${this.path}/hint`, optionalAuthMiddleware, this.getHint);
    this.router.get(`${this.path}/current`, authMiddleware, this.getCurrentGameState);
  }
    
  private takeGuess = async (req: AuthRequest, res: Response): Promise<void> => {
      const { categorySlug, guessMovieId } = req.body;

      if (!categorySlug || !guessMovieId) {
          res.status(400).json({ error: 'Both "categorySlug" and "guessMovieId" are required' });
          return;
      }

      const userId = req.user?.userId || null;

      const dateStr = new Date().toISOString().split('T')[0];

      try {
          const evaluation = await this.gameService.checkGuess(Number(guessMovieId), categorySlug, dateStr, userId);
          res.status(200).json(evaluation); 
      }
      catch (error) {
          console.error('Error in takeGuess:', error);
          const message = (error as Error).message;
          
          if (message.includes('Goście mogą grać tylko')) {
              res.status(403).json({ error: message });
              return;
          }
          
          res.status(400).json({ error: message || 'Internal server error' });
      }
  }

  private getHint = async (req: AuthRequest, res: Response): Promise<void> => {
      const { categorySlug, hintIndex, guestAttempts } = req.query;
      const attemptsForGuest = Number(guestAttempts) || 0;
      if (!categorySlug || !hintIndex) {
          res.status(400).json({ error: 'Both "categorySlug" and "hintIndex" are required' });
          return;
      }
      const userId = req.user?.userId || null;
      const dateStr = new Date().toISOString().split('T')[0];

      try {
        const hint = await this.gameService.getHint(String(categorySlug), String(dateStr), Number(hintIndex), userId, attemptsForGuest);
        res.status(200).json(hint);

      }
      catch (error) {
          console.error('Error in getHint:', error);
          res.status(400).json({ error: (error as Error).message }); 
      }

  }

  private getCurrentGameState = async (req: AuthRequest, res: Response): Promise<void> => {
    const {categorySlug } = req.query;
    if (!categorySlug) {
        res.status(400).json({ error: '"categorySlug" is required' });
        return;
    }
    const userId = req.user?.userId || null;
    const dateStr = new Date().toISOString().split('T')[0];
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {        
        const gameState = await this.gameService.getGameState(String(categorySlug), dateStr, userId);
        res.status(200).json(gameState);
    }
    catch (error) {
        console.error('Error in getCurrentGameState:', error);
        res.status(400).json({ error: (error as Error).message }); 
    }
    }
}

export default GameController;