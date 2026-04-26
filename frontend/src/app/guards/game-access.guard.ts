import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { isDailyCategoryKey, resolveGameCategoryKey } from '../utils/game-category.util';

export const gameAccessGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

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

  toast.show('You need to be logged in to access this category.');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
