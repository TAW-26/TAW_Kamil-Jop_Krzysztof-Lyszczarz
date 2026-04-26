import { SafeUser } from '../interfaces/auth.interface';
import { OwnedAvatar } from '../interfaces/avatar-shop.interface';
import { tmdbPosterUrl } from './tmdb-poster.util';

export function equippedAvatarImageUrl(
  user: SafeUser | null | undefined,
  ownedAvatars: readonly OwnedAvatar[],
): string | null {
  if (!user) {
    return null;
  }
  const fromUser = tmdbPosterUrl(user.equipped_avatar_url ?? null);
  if (fromUser) {
    return fromUser;
  }
  const id = user.equipped_avatar_id;
  if (id == null) {
    return null;
  }
  const owned = ownedAvatars.find((a) => a.id === id);
  return tmdbPosterUrl(owned?.posterPath ?? null);
}
