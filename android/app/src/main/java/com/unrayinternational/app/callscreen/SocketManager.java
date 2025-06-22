package com.unrayinternational.app.callscreen;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

public class SocketManager {
  private static SocketManager instance;
  private Socket mSocket;
  private boolean isConnected = false;
  private static final String SERVER_URL = "https://unrayappserver.onrender.com";
  private static final String SOCKET_PATH = "/api/socket";

  // Interface para callbacks
  public interface SocketCallback {
    void onEventEmitted(boolean success);
  }

  private SocketManager() {
    setupSocket();
  }

  public static synchronized SocketManager getInstance() {
    if (instance == null) {
      instance = new SocketManager();
    }
    return instance;
  }

  private void setupSocket() {
    try {
      IO.Options options = new IO.Options();
      options.forceNew = false;
      options.secure = true;
      options.reconnection = true;
      options.reconnectionAttempts = Integer.MAX_VALUE;
      options.reconnectionDelay = 1000;
      options.reconnectionDelayMax = 5000;
      options.timeout = 20000;
      options.transports = new String[]{"websocket"};
      options.path = SOCKET_PATH;

      if (mSocket != null) {
        mSocket.disconnect();
        mSocket.off();
      }

      mSocket = IO.socket(SERVER_URL, options);

      mSocket.on(Socket.EVENT_CONNECT, args -> {
        isConnected = true;
      });

      mSocket.on(Socket.EVENT_DISCONNECT, args -> {
        isConnected = false;
      });

      mSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
        isConnected = false;
      });

      mSocket.connect();

    } catch (URISyntaxException e) {
      Log.e("SocketManager", "❌ Error en la URI del socket", e);
    }
  }

  public void emitRespuestaSolicitud(String accion, String idViaje, String idUser, String idConductor, SocketCallback callback) {
    try {
      JSONObject payload = new JSONObject();
      payload.put("estado", accion.equals("aceptar") ? "Aceptado" : "Rechazado");
      payload.put("solicitudId", idViaje);
      payload.put("conductorId", idConductor);
      payload.put("idUser", idUser);

      if (mSocket != null && mSocket.connected()) {
        mSocket.emit("respuesta_solicitud", payload);
        if (callback != null) callback.onEventEmitted(true);
      } else {
        reconnectAndEmit(accion, idViaje, idUser, idConductor, callback);
      }
    } catch (JSONException e) {
      if (callback != null) callback.onEventEmitted(false);
    }
  }

  public void emitCambiarEstado(String idConductor, int estado, SocketCallback callback) {
    try {
      JSONObject payload = new JSONObject();
      payload.put("driverId", idConductor);
      payload.put("estado", estado);

      if (mSocket != null && mSocket.connected()) {
        mSocket.emit("cambiar_estado", payload);
        if (callback != null) callback.onEventEmitted(true);
      } else {
        if (callback != null) callback.onEventEmitted(false);
      }
    } catch (JSONException e) {
      if (callback != null) callback.onEventEmitted(false);
    }
  }

  private void reconnectAndEmit(String accion, String idViaje, String idUser, String idConductor, SocketCallback callback) {
    if (mSocket != null) {
      mSocket.disconnect();
      mSocket.connect();

      mSocket.once(Socket.EVENT_CONNECT, args -> {
        emitRespuestaSolicitud(accion, idViaje, idUser, idConductor, callback);
      });
    } else {
      setupSocket();
      if (callback != null) callback.onEventEmitted(false);
    }
  }

  public void disconnect() {
    if (mSocket != null) {
      mSocket.disconnect();
      mSocket.off();
      isConnected = false;
    }
  }
}
