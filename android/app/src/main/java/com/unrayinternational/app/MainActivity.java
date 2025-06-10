package com.unrayinternational.app;


import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
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
  /*public MainActivity() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.S) { // Android 12 o inferior
      registerPlugin(CallActionPlugin.class);
      Log.d(TAG, "Plugin registrado en constructor (Android <= 12)");
    }
  }
 */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    registerPlugin(CallActionPlugin.class);
    Log.d("MainActivity", "Plugin registrado");
    // Solicitar permiso en Android 13+
    /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
        requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_CODE_POST_NOTIFICATIONS);
      }
    } */
    super.onCreate(savedInstanceState);


    // Registro para Android 13+
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.S) {
      getWindow().getDecorView().post(() -> {
        registerPlugin(CallActionPlugin.class);
        Log.d(TAG, "Plugin registrado en onCreate (Android >= 13)");
      });
    }

    // Manejo inicial del intent
    processIntent(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    processIntent(intent);
  }

  private void processIntent(Intent intent) {
    if (intent == null) {
      Log.w(TAG, "Intent recibido es nulo");
      return;
    }

    String idViaje = intent.getStringExtra("idViaje");
    String idUser = intent.getStringExtra("idUser");

    if (idViaje == null || idUser == null) {
      Log.w(TAG, "idViaje o idUser es nulo. Intent extras: " + intent.getExtras());
      return;
    }

    Log.d(TAG, "Procesando intent con idViaje: " + idViaje);

    // Guardar en SharedPreferences
    getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
      .edit()
      .putString("accion", "aceptar")
      .putString("idViaje", idViaje)
      .putString("idUser", idUser)
      .apply();

    // Intentar emitir la acción
    if (CallActionPlugin.pluginInstance != null) {
      Log.d(TAG, "Emisión directa a través de pluginInstance");
      CallActionPlugin.pluginInstance.emitirAccionDesdeNativo("aceptar", idViaje, idUser);
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
        Log.d(TAG, "Notificación cancelada");
      }
    } catch (Exception e) {
      Log.e(TAG, "Error al cancelar notificación", e);
    }
  }

  private void stopCallService() {
    try {
      Intent stopServiceIntent = new Intent(this, CallNotificationService.class);
      stopService(stopServiceIntent);
      Log.d(TAG, "Servicio detenido");
    } catch (Exception e) {
      Log.e(TAG, "Error al detener servicio", e);
    }
  }

  @Override
  public void onResume() {
    super.onResume();
    // Verificación adicional por si el plugin no se registró correctamente
    if (CallActionPlugin.pluginInstance == null) {
      Log.w(TAG, "Reintentando registro de plugin en onResume");
      registerPlugin(CallActionPlugin.class);
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);

    if (requestCode == REQUEST_CODE_POST_NOTIFICATIONS) {
      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        Log.d(TAG, "Permiso POST_NOTIFICATIONS concedido");
      } else {
        Log.w(TAG, "Permiso POST_NOTIFICATIONS denegado");
        // Opcional: notificar al usuario o deshabilitar funcionalidad
      }
    }
  }
}
