import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface.js'; 
import { AuthRequest, authMiddleware } from '../middlewares/auth.middleware.js';
import AvatarShopService from '../services/avatarShop.service.js';
class AvatarShopController implements Controller { 
  public path = '/avatar-shop';
  public router = Router();
  public avatarShopService = new AvatarShopService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.get(`${this.path}/avatars`, authMiddleware, this.getShopItems);
    this.router.get(`${this.path}/owned-avatars`, authMiddleware, this.getOwnedAvatars);
    this.router.post(`${this.path}/purchase`, authMiddleware, this.purchaseAvatar);
  }
    
  private getShopItems = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Brak autoryzacji' });
            return;
        }
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const filters = {
                ownership: req.query.ownership as 'all' | 'owned' | 'unowned' | undefined,
                sortYear: req.query.sortYear as 'asc' | 'desc' | undefined,
                genre: req.query.genre ? parseInt(req.query.genre as string) : undefined,
                search: req.query.search as string | undefined
            };
            const result = await this.avatarShopService.getShopItems(userId, page, limit, filters);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
  }

  private getOwnedAvatars = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
      if (!userId) {
          res.status(401).json({ error: 'Brak autoryzacji' });
          return;
      }
      try {
          const ownedAvatars = await this.avatarShopService.getOwnedAvatars(userId);
          res.status(200).json(ownedAvatars);
      } catch (error) {
          res.status(500).json({ error: (error as Error).message });
      }
  }

  private purchaseAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { movieId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Brak autoryzacji' });
      return;
    }

    try {
      await this.avatarShopService.purchaseAvatar(userId, movieId);
      res.status(200).json({ message: 'Avatar zakupiony pomyślnie' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }


}

export default AvatarShopController;