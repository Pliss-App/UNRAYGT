package com.unrayinternational.app.callscreen;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.unrayinternational.app.R;
public class CallForegroundService extends Service {

  public static final String CHANNEL_ID = "067705b6-62da-4acc-af8e-ff070e5b075d";

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    // Intent a FullScreenActivity
    Intent fullScreenIntent = new Intent(this, FullScreenActivity.class);
    fullScreenIntent.putExtras(intent); // pasa todos los extras

    fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

    PendingIntent pendingIntent = PendingIntent.getActivity(
      this, 0, fullScreenIntent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );

    Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Nueva solicitud de viaje")
      .setContentText("Abriendo pantalla de llamada...")
      .setSmallIcon(R.drawable.ic_stat_onesignal_default)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setFullScreenIntent(pendingIntent, true)
      .setAutoCancel(true)
      .build();

    startForeground(8888, notification);

    // Lanzar la activity directamente
    startActivity(fullScreenIntent);

    new android.os.Handler().postDelayed(this::stopSelf, 30000);

    return START_NOT_STICKY;
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }
}
