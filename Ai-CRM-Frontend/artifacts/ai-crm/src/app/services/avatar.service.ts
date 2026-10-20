import { Injectable } from '@angular/core';

/**
 * Resolves a profile image for any user/client: the backend-stored photoUrl
 * takes priority, otherwise a deterministic generated avatar image (DiceBear)
 * is used as a fallback.
 */
@Injectable({ providedIn: 'root' })
export class AvatarService {
  generatedUrl(seed: string | number): string {
    const encoded = encodeURIComponent(String(seed));
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encoded}&backgroundType=gradientLinear&fontWeight=600`;
  }

  resolve(photoUrl: string | null | undefined, seed: string | number): string {
    return photoUrl || this.generatedUrl(seed);
  }
}
