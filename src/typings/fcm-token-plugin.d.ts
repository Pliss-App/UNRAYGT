import type { Plugin } from '@capacitor/core';

export interface FcmTokenPlugin extends Plugin {
  getToken(): Promise<{ token: string | null }>;
}

declare module '@capacitor/core' {
  interface CapacitorPlugins {
    FcmToken: FcmTokenPlugin;
  }
}