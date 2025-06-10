import { registerPlugin } from '@capacitor/core';

  interface CallActionPluginType {
  getAccionViaje(): Promise<{ accion: string, idViaje: string }>;
  limpiarAccionViaje(): Promise<{ success: boolean }>;
}

const CallActionPlugin = registerPlugin<CallActionPluginType>('CallActionPlugin');

export  default CallActionPlugin