package com.unrayinternational.app.callscreen;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {


  private static final String TAG = "FCMService";

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
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
        String idConductor = remoteMessage.getData().get("idConductor");
        SharedPreferences sharedPreferences = getSharedPreferences("MyPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putLong("incoming_trip_time", System.currentTimeMillis());
        editor.apply();

        Intent serviceIntent = new Intent(this, CallNotificationService.class);
        serviceIntent.putExtra("origin", origin);
        serviceIntent.putExtra("destination", destination);
        serviceIntent.putExtra("price", price);
        serviceIntent.putExtra("url", url);
        serviceIntent.putExtra("user", user);
        serviceIntent.putExtra("idViaje", idViaje);
        serviceIntent.putExtra("idUser", idUser);
        serviceIntent.putExtra("idConductor", idConductor);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          startForegroundService(serviceIntent);
        } else {
          startService(serviceIntent);
        }
      }
    }
  }

  @Override
  public void onNewToken(@NonNull String token) {
    super.onNewToken(token);
  }
}
