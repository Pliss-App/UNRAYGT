package com.unrayinternational.app.callscreen;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class CallActionReceiver extends BroadcastReceiver {
  private SocketManager socketManager;

  @Override
  public void onReceive(Context context, Intent intent) {
    // Inicializar SocketManager
    socketManager = SocketManager.getInstance();

    String accion = intent.getAction();
    String idViaje = intent.getStringExtra("idViaje");
    String idUser = intent.getStringExtra("idUser");
    String idConductor = intent.getStringExtra("idConductor");

    if (idViaje == null || idUser == null || idConductor == null) {
      return;
    }

    if ("com.unrayinternational.ACCEPT".equals(accion)) {
      handleAcceptAction(context, idViaje, idUser, idConductor);
    } else if ("com.unrayinternational.REJECT".equals(accion)) {
      handleRejectAction(context, idViaje, idUser, idConductor);
    }
  }

  private void handleAcceptAction(Context context, String idViaje, String idUser, String idConductor) {
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    if (notificationManager != null) {
      notificationManager.cancel(1);
    }

    context.stopService(new Intent(context, CallNotificationService.class));
    guardarAccion(context, "aceptar", idViaje, idUser, idConductor);
    context.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE)
      .edit()
      .putLong("incoming_trip_time", System.currentTimeMillis())
      .apply();
    abrirApp(context, idViaje, idUser, idConductor);
    detenerSonido(context);
  }

  private void handleRejectAction(Context context, String idViaje, String idUser, String idConductor) {
    guardarAccion(context, "rechazar", idViaje, idUser, idConductor);
    context.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE)
      .edit()
      .putLong("incoming_trip_time", System.currentTimeMillis())
      .apply();
    abrirApp(context, idViaje, idUser, idConductor);
    detenerSonido(context);
  }

  private void guardarAccion(Context context, String accion, String idViaje, String idUser, String idConductor) {
    context.getSharedPreferences("CALLSCREEN_PREF", Context.MODE_PRIVATE)
      .edit()
      .putString("accion", accion)
      .putString("idViaje", idViaje)
      .putString("idUser", idUser)
      .putString("idConductor", idConductor)
      .apply();

    if (CallActionPlugin.pluginInstance != null) {
      CallActionPlugin.emitirAccionDesdeContexto(context, accion, idViaje, idUser, idConductor);
    } else {
      CallActionPlugin.emitirAccionDesdeContexto(context, accion, idViaje, idUser, idConductor);
    }
    enviarRespuestaViaje(accion, idViaje, idUser, idConductor);
  }

  private void detenerSonido(Context context) {
    Intent stopIntent = new Intent(context, CallNotificationService.class);
    stopIntent.setAction("STOP_SOUND");
    context.startService(stopIntent);
  }

  private void abrirApp(Context context, String idViaje, String idUser, String idConductor) {
    try {
      Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage("com.unrayinternational.app");
      if (launchIntent != null) {
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launchIntent.putExtra("idViaje", idViaje);
        launchIntent.putExtra("idUser", idUser);
        launchIntent.putExtra("idConductor", idConductor);
        context.startActivity(launchIntent);
      } else {
        Log.e("CallActionReceiver", "❌ No se encontró launchIntent");
      }
    } catch (Exception e) {
      Log.e("CallActionReceiver", "❌ Error al lanzar la app", e);
    }
  }

  private void enviarRespuestaViaje(String accion, String idViaje, String idUser, String idConductor) {
    // 1. Enviar petición HTTP
    enviarPeticionHTTP(accion, idViaje, idUser, idConductor);

    // 2. Emitir evento por socket usando SocketManager
    socketManager.emitRespuestaSolicitud(accion, idViaje, idUser, idConductor, success -> {
      if (success) {
        socketManager.emitCambiarEstado(idConductor, 1, statusSuccess -> {
          if (statusSuccess) {
            Log.d("CallActionReceiver", "Estado del conductor actualizado");
          } else {
            Log.e("CallActionReceiver", "Error al actualizar estado del conductor");
          }
        });
      } else {
        Log.e("CallActionReceiver", "Error al emitir evento de respuesta");
      }
    });
  }

  private void enviarPeticionHTTP(String accion, String idViaje, String idUser, String idConductor) {
    try {
      String url;
      JSONObject json = new JSONObject();

      if ("aceptar".equals(accion)) {
        url = "https://unrayappserver.onrender.com/api/viaje/aceptar_solicitud";
        json.put("solicitudId", idViaje);
        json.put("conductorId", idConductor);
        json.put("idUser", idUser);
      } else {
        url = "https://unrayappserver.onrender.com/api/solicitudes/update-estado-usuario";
        json.put("id", idConductor);
      }

      RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
      Request request = new Request.Builder()
        .url(url)
        .post(body)
        .build();

      new OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()
        .newCall(request)
        .enqueue(new Callback() {
          @Override
          public void onFailure(Call call, IOException e) {
            Log.e("HTTP", "Error en la petición", e);
          }

          @Override
          public void onResponse(Call call, Response response) throws IOException {
            Log.d("HTTP", "Respuesta recibida: " + response.body().string());
          }
        });
    } catch (Exception e) {
      Log.e("CallActionReceiver", "Error en petición HTTP", e);
    }
  }
}
