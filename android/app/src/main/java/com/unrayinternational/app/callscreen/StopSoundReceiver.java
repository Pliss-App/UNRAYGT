package com.unrayinternational.app.callscreen;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class StopSoundReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d("StopSoundReceiver", "Broadcast recibido para detener sonido");

    Intent stopIntent = new Intent(context, CallNotificationService.class);
    stopIntent.setAction("STOP_SOUND");
    context.startService(stopIntent);

    Intent stopIntents = new Intent(context, MyFirebaseMessagingService.class);
    stopIntents.setAction("STOP_CALL_SOUND");
    context.startService(stopIntents);
  }
}
