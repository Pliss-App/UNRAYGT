package com.unrayinternational.app.callscreen;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CallActionPlugin")
public class CallActionPlugin extends Plugin {

  private static final String TAG = "CallActionPlugin";
  private static final String PREFS_NAME = "CALLSCREEN_PREF";
  public static CallActionPlugin pluginInstance;
  private BroadcastReceiver accionReceiver;

  @Override
  public void load() {
    super.load();
    pluginInstance = this;

    Log.d(TAG, "Inicializando plugin");
    unregisterBroadcastReceiver();
    registerBroadcastReceiver();
  }

  @Override
  protected void handleOnResume() {
    super.handleOnResume();
    // Volver a registrar si es necesario
    if (accionReceiver == null) {
      registerBroadcastReceiver();
    }
  }

  @Override
  public void handleOnDestroy() {
    super.handleOnDestroy();
    unregisterBroadcastReceiver();
    pluginInstance = null; // Prevenir memory leak
  }

  private void registerBroadcastReceiver() {
    accionReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        String accion = intent.getStringExtra("accion");
        String idViaje = intent.getStringExtra("idViaje");
        String idUser = intent.getStringExtra("idUser");
        String idConductor = intent.getStringExtra("idConductor");
        try {
          SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
          prefs.edit()
            .putString("accion", accion)
            .putString("idViaje", idViaje)
            .putString("idUser", idUser)
            .putString("idConductor", idConductor)
            .apply();
        } catch (Exception e) {
          Log.e(TAG, "Error guardando en SharedPreferences", e);
        }

        // 👉 Lanzar la app si está cerrada
        try {
          Intent launchIntent = context.getPackageManager()
            .getLaunchIntentForPackage(context.getPackageName());
          if (launchIntent != null) {
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            context.startActivity(launchIntent);
          }
        } catch (Exception e) {
          Log.e(TAG, "Error al lanzar la app desde BroadcastReceiver", e);
        }

        // emitirAccionDesdeNativo(accion, idViaje, idUser);
        CallActionPlugin.emitirAccionDesdeContexto(context, accion, idViaje, idUser, idConductor);
      }
    };

    try {
      IntentFilter filter = new IntentFilter("CALLSCREEN_ACCION");

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        // Android 12+ (API 31+)
        getContext().registerReceiver(
          accionReceiver,
          filter,
          Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ?
            Context.RECEIVER_NOT_EXPORTED : Context.RECEIVER_EXPORTED
        );
      } else {
        // Versiones anteriores
        getContext().registerReceiver(accionReceiver, filter);
      }
    } catch (Exception e) {
      Log.e(TAG, "Error al registrar BroadcastReceiver", e);
    }
  }

  private void unregisterBroadcastReceiver() {
    try {
      if (accionReceiver != null) {
        getContext().unregisterReceiver(accionReceiver);
        accionReceiver = null;
        Log.d(TAG, "BroadcastReceiver desregistrado");
      }
    } catch (Exception e) {
      Log.e(TAG, "Error al desregistrar BroadcastReceiver", e);
    }
  }

  @PluginMethod
  public void getAccionViaje(PluginCall call) {
    Log.d(TAG, "Obteniendo acción de viaje");
    SharedPreferences prefs = getActivity().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

    JSObject ret = new JSObject();
    ret.put("accion", prefs.getString("accion", null));
    ret.put("idViaje", prefs.getString("idViaje", null));
    ret.put("idUser", prefs.getString("idUser", null));
    ret.put("idConductor", prefs.getString("idConductor", null));
    call.resolve(ret);
  }

  @PluginMethod
  public void limpiarAccionViaje(PluginCall call) {
    Log.d(TAG, "Limpiando acción de viaje");
    SharedPreferences prefs = getActivity().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    prefs.edit()
      .remove("accion")
      .remove("idViaje")
      .remove("idUser")
      .remove("idConductor")
      .apply();

    JSObject ret = new JSObject();
    ret.put("success", true);
    call.resolve(ret);
  }

  public void emitirAccionDesdeNativo(String accion, String idViaje, String idUser, String idConductor) {
    if (hasListeners("viaje:accion")) {
      Log.d(TAG, "Emitting event to JS - Acción: " + accion + ", Viaje: " + idViaje);
      JSObject data = new JSObject();
      data.put("accion", accion);
      data.put("idViaje", idViaje);
      data.put("idUser", idUser);
      data.put("idConductor", idConductor);
      notifyListeners("viaje:accion", data);
    } else {
      Log.w(TAG, "No hay listeners para viaje:accion. Acción: " + accion + " idViaje: "+ idViaje + "  iUser: "+idUser);
      JSObject data = new JSObject();
      data.put("accion", accion);
      data.put("idViaje", idViaje);
      data.put("idUser", idUser);
      data.put("idConductor", idConductor);
      notifyListeners("viaje:accion", data);
    }
  }

  public static void emitirAccionDesdeContexto(Context context, String accion, String idViaje, String idUser, String idConductor) {
    SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    prefs.edit()
      .putString("accion", accion)
      .putString("idViaje", idViaje)
      .putString("idUser", idUser)
      .putString("idConductor", idConductor)
      .apply();

    if (pluginInstance != null) {
      pluginInstance.emitirAccionDesdeNativo(accion, idViaje, idUser, idConductor);
    } else {
      Log.w(TAG, "pluginInstance es null — acción guardada, pero no se pudo emitir evento.");
    }
  }
}
