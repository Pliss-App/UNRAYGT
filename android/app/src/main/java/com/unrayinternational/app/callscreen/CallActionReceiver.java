package com.unrayinternational.app.callscreen;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class CallActionReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    String accion = intent.getAction();
    String idViaje = intent.getStringExtra("idViaje");
    String idUser = intent.getStringExtra("idUser");
    String idConductor = intent.getStringExtra("idConductor");

    if (idViaje == null || idUser == null || idConductor == null) {
      Log.e("CallActionReceiver", "❌ Datos incompletos: idViaje=" + idViaje + ", idUser=" + idUser + ", idConductor=" + idConductor);
      return;
    }

    if ("com.unrayinternational.ACCEPT".equals(accion)) {
      NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
      if (notificationManager != null) {
        notificationManager.cancel(1); // Asegúrate que el ID sea correcto
      }

      context.stopService(new Intent(context, CallNotificationService.class));
      Log.e("CallActionReceiver", "✅ Usuario ACEPTÓ el viaje");
      guardarAccion(context, "aceptar", idViaje, idUser, idConductor);
      context.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE)
        .edit()
        .putLong("incoming_trip_time", System.currentTimeMillis())
        .apply();
      abrirApp(context, idViaje, idUser, idConductor);
      detenerSonido(context);
    } else if ("com.unrayinternational.REJECT".equals(accion)) {
      Log.e("CallActionReceiver", "❌ Usuario RECHAZÓ el viaje");
      guardarAccion(context, "rechazar", idViaje, idUser, idConductor);
      context.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE)
        .edit()
        .putLong("incoming_trip_time", System.currentTimeMillis())
        .apply();
      abrirApp(context, idViaje, idUser, idConductor);
      detenerSonido(context);
    }
  }
  private void guardarAccion(Context context, String accion, String idViaje,String idUser, String idConductor) {
    context.getSharedPreferences("CALLSCREEN_PREF", Context.MODE_PRIVATE)
      .edit()
      .putString("accion", accion)
      .putString("idViaje", idViaje)
      .putString("idUser", idUser)
      .putString("idConductor", idConductor)
      .apply();

    enviarRespuestaViaje(accion, idViaje,  idUser, idConductor);
    // 🔔 Emitir evento al plugin si está activo
    if (CallActionPlugin.pluginInstance != null) {
     // CallActionPlugin.pluginInstance.emitirAccionDesdeContexto(accion, idViaje, idUser);

      CallActionPlugin.emitirAccionDesdeContexto(context, accion, idViaje, idUser,  idConductor);
      Log.d("CallActionReceiver", "Evento emitido al plugin: " + accion);
    } else {
      CallActionPlugin.emitirAccionDesdeContexto(context, accion, idViaje, idUser,  idConductor);
      Log.w("CallActionReceiver", "pluginInstance es null — no se pudo emitir evento");
    }
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
        Log.d("CallActionReceiver", "✅ App lanzada forzadamente con flags NEW_TASK + CLEAR_TASK");
      } else {
        Log.e("CallActionReceiver", "❌ No se encontró launchIntent");
      }
    } catch (Exception e) {
      Log.e("CallActionReceiver", "❌ Error al lanzar la app", e);
    }
  }

  private void enviarRespuestaViaje(String accion, String idViaje, String idUser, String idConductor) {
    // 1. Petición HTTP
    if ("aceptar".equals(accion)) {
      try {
        JSONObject json = new JSONObject();
        json.put("solicitudId", idViaje);
        json.put("conductorId", idConductor);
        json.put("idUser", idUser);

        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
          .url("https://unrayappserver.onrender.com/api/viaje/aceptar_solicitud") // tu endpoint real aquí
          .post(body)
          .build();

        OkHttpClient client = new OkHttpClient();
        client.newCall(request).enqueue(new Callback() {
          @Override
          public void onFailure(Call call, IOException e) {
            Log.e("HTTP", "Error en aceptarSolicitud", e);
          }

          @Override
          public void onResponse(Call call, Response response) throws IOException {
            Log.d("HTTP", "Respuesta aceptada: " + response.body().string());
          }
        });

      } catch (Exception e) {
        Log.e("enviarRespuestaViaje", "Error creando JSON", e);
      }

      // 2. Emitir evento socket
      try {
        // Configuración con manejo de errores mejorado
        IO.Options options = new IO.Options();
        options.forceNew = true;
        options.secure = true;
        options.reconnection = true;
        options.reconnectionAttempts = 5;
        options.reconnectionDelay = 1000;
        options.timeout = 20000;
        options.transports = new String[]{"websocket"};
        options.path = "/api/socket";

        // Conexión con try-catch específico
        final Socket mSocket = IO.socket("https://unrayappserver.onrender.com", options);

        mSocket.on(Socket.EVENT_CONNECT, args -> {
          try {
            JSONObject payload = new JSONObject();
            payload.put("estado", accion.equals("aceptar") ? "Aceptado" : "Rechazado");
            payload.put("solicitudId", idViaje);
            payload.put("conductorId", idConductor);
            payload.put("idUser", idUser);

            mSocket.emit("respuesta_solicitud", payload);

            new Handler(Looper.getMainLooper()).postDelayed(() -> {
              mSocket.disconnect();
              mSocket.close();
              Log.d("SocketIO", "Socket desconectado tras retraso");
            }, 1000);

            Log.d("SocketIO", "Socket emitido y desconectado");
          } catch (JSONException e) {
            Log.e("SocketIO", "Error JSON", e);
          }
        });

        mSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
          for (Object arg : args) {
            Log.e("SocketIO", "Connect error: " + arg.toString());
          }
        });

        mSocket.connect();

      } catch (URISyntaxException e) {
        Log.e("SocketIO", "URI error", e);
      } catch (Exception e) {
        Log.e("SocketIO", "General exception", e);
      }

    } else {

      try {
        JSONObject json = new JSONObject();
        json.put("id", idConductor);

        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
          .url("https://unrayappserver.onrender.com/api/solicitudes/update-estado-usuario") // tu endpoint real aquí
          .post(body)
          .build();

        OkHttpClient client = new OkHttpClient();
        client.newCall(request).enqueue(new Callback() {
          @Override
          public void onFailure(Call call, IOException e) {
            Log.e("HTTP", "Error en aceptarSolicitud", e);
          }

          @Override
          public void onResponse(Call call, Response response) throws IOException {
            Log.d("HTTP", "Respuesta aceptada: " + response.body().string());
          }
        });

      } catch (Exception e) {
        Log.e("enviarRespuestaViaje", "Error creando JSON", e);
      }
      try {
        // Configuración con manejo de errores mejorado
        IO.Options options = new IO.Options();
        options.forceNew = true;
        options.secure = true;
        options.reconnection = true;
        options.reconnectionAttempts = 5;
        options.reconnectionDelay = 1000;
        options.timeout = 20000;
        options.transports = new String[]{"websocket"};
        options.path = "/api/socket";

        // Conexión con try-catch específico
        final Socket mSocket = IO.socket("https://unrayappserver.onrender.com", options);

        mSocket.on(Socket.EVENT_CONNECT, args -> {
          try {
            JSONObject payload = new JSONObject();
            payload.put("estado", accion.equals("aceptar") ? "Aceptado" : "Rechazado");
            payload.put("solicitudId", idViaje);
            payload.put("conductorId", idConductor);
            payload.put("idUser", idUser);

            mSocket.emit("respuesta_solicitud", payload);
            cambiaStatus(idConductor);

            new Handler(Looper.getMainLooper()).postDelayed(() -> {
              mSocket.disconnect();
              mSocket.close();
              Log.d("SocketIO", "Socket desconectado tras retraso");
            }, 1000);
          } catch (JSONException e) {
            Log.e("SocketIO", "Error JSON", e);
          }
        });

        mSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
          for (Object arg : args) {
            Log.e("SocketIO", "Connect error: " + arg.toString());
          }
        });

        mSocket.connect();

      } catch (URISyntaxException e) {
        Log.e("SocketIO", "URI error", e);
      } catch (Exception e) {
        Log.e("SocketIO", "General exception", e);
      }
    }
  }

  private void cambiaStatus(String idConductor) {
    try {
      IO.Options options = new IO.Options();
      options.forceNew = true;
      options.reconnection = true;
      options.reconnectionAttempts = 10;
      options.reconnectionDelay = 2000;
      options.transports = new String[]{ "websocket" };
      options.path = "/api/socket";

      Socket mSocket = IO.socket("https://unrayappserver.onrender.com", options);
      mSocket.connect();

      JSONObject payload = new JSONObject();
      payload.put("driverId", idConductor);
      payload.put("estado", 1);

      mSocket.emit("cambiar_estado", payload);
      Log.d("SocketIO", "Evento enviado: " + payload.toString());

      // Opcional: desconectar después de unos segundos
      new Handler(Looper.getMainLooper()).postDelayed(() -> {
      //  mSocket.disconnect();
      }, 2000);

    } catch (URISyntaxException | JSONException e) {
      Log.e("SocketIO", "Error al emitir socket", e);
    }
  }

}
