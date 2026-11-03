import { sendGAEvent } from '@next/third-parties/google';

// Manda un evento a Google Analytics; sin NEXT_PUBLIC_GA_ID no hace nada.
export function track(name: string, params: Record<string, string | undefined> = {}) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  sendGAEvent('event', name, params);
}
