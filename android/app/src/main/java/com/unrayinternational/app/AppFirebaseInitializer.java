package com.unrayinternational.app;


import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import com.google.firebase.messaging.FirebaseMessaging;
public class AppFirebaseInitializer {
  public static void init(Context context) {
    FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
      if (!task.isSuccessful()) {
        return;
      }

      String token = task.getResult();

      SharedPreferences prefsss = PreferenceManager.getDefaultSharedPreferences(context);
      SharedPreferences.Editor editor = prefsss.edit();
      editor.putString("fcm_token_id", token);
      editor.apply();

      // Guardar en SharedPreferences
      SharedPreferences prefss = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
      prefss.edit().putString("fcm_token", token).apply();

      SharedPreferences prefs = context.getSharedPreferences("fcm", Context.MODE_PRIVATE);
      prefs.edit().putString("fcm_token", token).apply();

    });
  }
}
