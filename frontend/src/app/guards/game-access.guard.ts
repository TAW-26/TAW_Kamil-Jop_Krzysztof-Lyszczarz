import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isDailyCategoryKey, resolveGameCategoryKey } from '../utils/game-category.util';

export const gameAccessGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const key = resolveGameCategoryKey(
    route.paramMap.get('category'),
    route.queryParamMap.get('category')
  );

  if (isDailyCategoryKey(key)) {
    return true;
  }

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
