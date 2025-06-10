package com.unrayinternational.app.callscreen;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {


  private static final String TAG = "FCMService";

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    Log.d(TAG, "Mensaje recibido");
    super.onMessageReceived(remoteMessage);

    if (remoteMessage.getData().size() > 0) {
      String type = remoteMessage.getData().get("type");

      if ("incoming_trip".equals(type)) {
        String origin = remoteMessage.getData().get("origin");
        String destination = remoteMessage.getData().get("destination");
        String price = remoteMessage.getData().get("price");
        String url = remoteMessage.getData().get("url");
        String user = remoteMessage.getData().get("user");
        String idViaje = remoteMessage.getData().get("idViaje");
        String idUser = remoteMessage.getData().get("idUser");

        Intent serviceIntent = new Intent(this, CallNotificationService.class);
        serviceIntent.putExtra("origin", origin);
        serviceIntent.putExtra("destination", destination);
        serviceIntent.putExtra("price", price);
        serviceIntent.putExtra("url", url);
        serviceIntent.putExtra("user", user);
        serviceIntent.putExtra("idViaje", idViaje);
        serviceIntent.putExtra("idUser", idUser);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          startForegroundService(serviceIntent);
          Log.d(TAG, "Entro aqui 1");
        } else {
          startService(serviceIntent);
          Log.d(TAG, "Entro aqui 2");
        }
      }
    }
  }

  @Override
  public void onNewToken(@NonNull String token) {
    super.onNewToken(token);
    Log.d(TAG, "Nuevo token FCM: " + token);
    // Envía el token al backend si es necesario
  }
}
