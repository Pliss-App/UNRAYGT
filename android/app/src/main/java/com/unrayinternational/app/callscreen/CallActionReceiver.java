package com.unrayinternational.app.callscreen;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class CallActionReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    String accion = intent.getAction();
    String idViaje = intent.getStringExtra("idViaje");
    String idUser = intent.getStringExtra("idUser");

    if ("com.unrayinternational.ACCEPT".equals(accion)) {
      NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
      if (notificationManager != null) {
        notificationManager.cancel(1); // Asegúrate que el ID sea correcto
      }

      context.stopService(new Intent(context, CallNotificationService.class));
      Log.e("CallActionReceiver", "✅ Usuario ACEPTÓ el viaje");
      guardarAccion(context, "aceptar", idViaje, idUser);
      abrirApp(context, idViaje, idUser);
      detenerSonido(context);
    } else if ("com.unrayinternational.REJECT".equals(accion)) {
      Log.e("CallActionReceiver", "❌ Usuario RECHAZÓ el viaje");
      guardarAccion(context, "rechazar", idViaje, idUser);
      detenerSonido(context);
    }
  }
  private void guardarAccion(Context context, String accion, String idViaje, String idUser) {
    context.getSharedPreferences("CALLSCREEN_PREF", Context.MODE_PRIVATE)
      .edit()
      .putString("accion", accion)
      .putString("idViaje", idViaje)
      .putString("idUser", idUser)
      .apply();
    // 🔔 Emitir evento al plugin si está activo
    if (CallActionPlugin.pluginInstance != null) {
      CallActionPlugin.pluginInstance.emitirAccionDesdeNativo(accion, idViaje, idUser);
      Log.d("CallActionReceiver", "Evento emitido al plugin: " + accion);
    } else {
      Log.w("CallActionReceiver", "pluginInstance es null — no se pudo emitir evento");
    }
  }

  private void detenerSonido(Context context) {
    Intent stopIntent = new Intent(context, CallNotificationService.class);
    stopIntent.setAction("STOP_SOUND");
    context.startService(stopIntent);
  }

  private void abrirApp(Context context, String idViaje, String idUser) {
    try {
      Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage("com.unrayinternational.app");

      if (launchIntent != null) {
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        launchIntent.putExtra("idViaje", idViaje);
        launchIntent.putExtra("idUser", idUser);
        context.startActivity(launchIntent);
        Log.d("CallActionReceiver", "✅ App lanzada forzadamente con flags NEW_TASK + CLEAR_TASK");
      } else {
        Log.e("CallActionReceiver", "❌ No se encontró launchIntent");
      }
    } catch (Exception e) {
      Log.e("CallActionReceiver", "❌ Error al lanzar la app", e);
    }
  }
}
