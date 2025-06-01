package com.unrayinternational.app.callscreen;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.unrayinternational.app.R;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

  private static final String TAG = "FCMService";
  private static final String CHANNEL_ID = "067705b6-62da-4acc-af8e-ff070e5b075d";
  private static final int NOTIFICATION_ID = 9999;

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    Log.d(TAG, "... Entro");
    super.onMessageReceived(remoteMessage);
    Log.d(TAG, "Data payload: " + remoteMessage.getData());
    if (remoteMessage.getData().size() > 0) {
      Log.d(TAG, "Data payload: " + remoteMessage.getData());

      String type = remoteMessage.getData().get("type");

      if ("incoming_trip".equals(type)) {
        String origin = remoteMessage.getData().get("origin");
        String destination = remoteMessage.getData().get("destination");
        String price = remoteMessage.getData().get("price");
        String url = remoteMessage.getData().get("url");
        String user = remoteMessage.getData().get("user");

        // Intent para abrir la actividad full screen
        Intent fullScreenIntent = new Intent(this, FullScreenActivity.class);
        fullScreenIntent.putExtra("origin", origin);
        fullScreenIntent.putExtra("destination", destination);
        fullScreenIntent.putExtra("price", price);
        fullScreenIntent.putExtra("url", url);
        fullScreenIntent.putExtra("user", user);
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
          this,
          0,
          fullScreenIntent,
          PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        ) ;

        // Crear canal si es necesario
        createNotificationChannel();

        NotificationCompat.Builder notificationBuilder =
          new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_onesignal_default) // Debe existir
            .setContentTitle("Nueva solicitud de viaje | Q"+price )
            .setContentText("Salida: " + origin + " → Destino: " + destination)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setContentIntent(fullScreenPendingIntent)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setAutoCancel(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        NotificationManager notificationManager =
          (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        notificationManager.notify(NOTIFICATION_ID, notificationBuilder.build());

        new android.os.Handler(Looper.getMainLooper()).postDelayed(() -> {
          NotificationManager cancelManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
          cancelManager.cancel(NOTIFICATION_ID); // Cancelar la notificación
          Log.d(TAG, "⏱ Notificación cancelada automáticamente tras 30 segundos");

          // Opcional: lanzar evento, broadcast o acción adicional aquí
          Intent timeoutIntent = new Intent("com.unrayinternational.app.CALL_TIMEOUT");
          sendBroadcast(timeoutIntent);
        }, 30_000);
      }
    }
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager notificationManager =
        (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "Llamadas entrantes",
        NotificationManager.IMPORTANCE_HIGH);
      channel.setDescription("Canal para solicitudes de viaje tipo llamada");
      channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

      notificationManager.createNotificationChannel(channel);
    }
  }

  @Override
  public void onNewToken(@NonNull String token) {
    super.onNewToken(token);
    Log.d(TAG, "📱 Nuevo token FCM: " + token);
    // Envía token a backend si es necesario
/*
    // Guardar en SharedPreferences
    SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
    SharedPreferences.Editor editor = prefs.edit();
    editor.putString("fcm_token", token);
    editor.apply(); */
  }
}
