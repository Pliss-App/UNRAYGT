package com.unrayinternational.app;


import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.BridgeActivity;
import com.unrayinternational.app.callscreen.CallActionPlugin;
import com.unrayinternational.app.callscreen.CallNotificationService;
public class MainActivity extends BridgeActivity {
  private static final String TAG = "MainActivity";
  private static final String PREFS_NAME = "CALLSCREEN_PREF";
  private static final int REQUEST_CODE_POST_NOTIFICATIONS = 101;
  // Solución híbrida para registro de plugin
  public MainActivity() {
      registerPlugin(CallActionPlugin.class);
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    processIntent(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent); // muy importante para actualizar el intent activo
    processIntent(intent); // asegúrate de tener este método
    checkPendingAccion();
  }

  private void processIntent(Intent intent) {
    if (intent == null) {
      return;
    }

    String idViaje = intent.getStringExtra("idViaje");
    String idUser = intent.getStringExtra("idUser");
    String idConductor = intent.getStringExtra("idConductor");

    if (idViaje == null || idUser == null || idConductor == null) {
      return;
    }

    // 🔍 Verificar si la notificación no ha expirado (30 segundos)
    SharedPreferences sharedPreferences = getSharedPreferences("MyPrefs", MODE_PRIVATE);
    long timestamp = sharedPreferences.getLong("incoming_trip_time", 0);
    long now = System.currentTimeMillis();
    long elapsed = now - timestamp;

    if (timestamp == 0 || elapsed > 30_000) {
      return;
    }

    getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
      .edit()
      .putString("accion", "aceptar")
      .putString("idViaje", idViaje)
      .putString("idUser", idUser)
      .putString("idConductor", idConductor)
      .apply();

    // Intentar emitir la acción
    if (CallActionPlugin.pluginInstance != null) {
      CallActionPlugin.emitirAccionDesdeContexto(this, "aceptar", idViaje, idUser, idConductor);
    } else {
      Log.w(TAG, "pluginInstance es nulo, se guardó en SharedPrefs para recuperación posterior");
    }

    // Cancelar notificación
    cancelNotification();

    // Detener servicio
    stopCallService();
  }

  private void cancelNotification() {
    try {
      NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      if (notificationManager != null) {
        notificationManager.cancel(1);
      }
    } catch (Exception e) {
      Log.e(TAG, "Error al cancelar notificación", e);
    }
  }

  private void stopCallService() {
    try {
      Intent stopServiceIntent = new Intent(this, CallNotificationService.class);
      stopService(stopServiceIntent);
    } catch (Exception e) {
      Log.e(TAG, "Error al detener servicio", e);
    }
  }

  @Override
  public void onResume() {
    super.onResume();
    // Verificación adicional por si el plugin no se registró correctamente
    if (CallActionPlugin.pluginInstance == null) {
      registerPlugin(CallActionPlugin.class);
    }

    checkPendingAccion();
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);

    if (requestCode == REQUEST_CODE_POST_NOTIFICATIONS) {
      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
      } else {
        Log.w(TAG, "Permiso POST_NOTIFICATIONS denegado");
        // Opcional: notificar al usuario o deshabilitar funcionalidad
      }
    }
  }

  private void checkPendingAccion() {
    SharedPreferences prefs = getSharedPreferences("CALLSCREEN_PREF", MODE_PRIVATE);
    String accion = prefs.getString("accion", null);
    String idViaje = prefs.getString("idViaje", null);
    String idUser = prefs.getString("idUser", null);
    String idConductor = prefs.getString("idConductor", null);

    if (accion != null && idViaje != null && idUser != null) {
      // Emitir al plugin
      if (CallActionPlugin.pluginInstance != null) {
        CallActionPlugin.emitirAccionDesdeContexto(this, accion, idViaje, idUser, idConductor);
        // Limpiar después de emitir
        prefs.edit().clear().apply();
      } else {
        Log.w(TAG, "⛔ pluginInstance sigue siendo null en checkPendingAccion()");
      }
    }
  }
}
