package com.unrayinternational.app.callscreen;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
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
    registerBroadcastReceiver();
  }

  @Override
  public void handleOnDestroy() {
    super.handleOnDestroy();
    unregisterBroadcastReceiver();
    pluginInstance = null; // Prevenir memory leak
    Log.d(TAG, "Plugin destruido");
  }

  private void registerBroadcastReceiver() {
    accionReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        String accion = intent.getStringExtra("accion");
        String idViaje = intent.getStringExtra("idViaje");
        String idUser = intent.getStringExtra("idUser");
        Log.d(TAG, "Broadcast recibido - Acción: " + accion + ", Viaje: " + idViaje);
        try {
          SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
          prefs.edit()
            .putString("accion", accion)
            .putString("idViaje", idViaje)
            .putString("idUser", idUser)
            .apply();
          Log.d(TAG, "Acción guardada en SharedPreferences");
        } catch (Exception e) {
          Log.e(TAG, "Error guardando en SharedPreferences", e);
        }
        
        emitirAccionDesdeNativo(accion, idViaje, idUser);
      }
    };

    try {
      IntentFilter filter = new IntentFilter("CALLSCREEN_ACCION");
      getContext().registerReceiver(accionReceiver, filter);
      Log.d(TAG, "BroadcastReceiver registrado");
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
      .apply();

    JSObject ret = new JSObject();
    ret.put("success", true);
    call.resolve(ret);
  }

  public void emitirAccionDesdeNativo(String accion, String idViaje, String idUser) {
    if (hasListeners("viaje:accion")) {
      Log.d(TAG, "Emitting event to JS - Acción: " + accion + ", Viaje: " + idViaje);
      JSObject data = new JSObject();
      data.put("accion", accion);
      data.put("idViaje", idViaje);
      data.put("idUser", idUser);
      notifyListeners("viaje:accion", data);
    } else {
      Log.w(TAG, "No hay listeners para viaje:accion. Acción: " + accion);
    }
  }
}
