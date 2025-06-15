package com.unrayinternational.app.callscreen;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.unrayinternational.app.R;

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

public class FullScreenActivity extends Activity {
  private final Handler timeoutHandler = new Handler(Looper.getMainLooper());
  private MediaPlayer mediaPlayer;
  private Vibrator vibrator;
  private SocketManager socketManager;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Intent stopIntent = new Intent("com.unrayinternational.app.STOP_RINGTONE");
    sendBroadcast(stopIntent);

    Intent stopIntents = new Intent(this, CallNotificationService.class);
    stopIntents.setAction("STOP_SOUND");
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      startForegroundService(stopIntents);
    } else {
      startService(stopIntents);
    }

    // Inicializar SocketManager
    socketManager = SocketManager.getInstance();

    // Configuración para pantalla bloqueada
    setupScreenLockParameters();

    // Configuración de ventana
    setupWindowParameters();
    setFinishOnTouchOutside(false);
    setContentView(R.layout.activity_incoming_call);

    // Inicializar UI
    initUI();

    // Reproducir sonido y vibración
    playRingtone();
    startVibration();

    // Configurar timeout
    setupTimeout();
  }

  private void setupScreenLockParameters() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true);
      setTurnScreenOn(true);
    }

    KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
    if (keyguardManager != null && keyguardManager.isKeyguardLocked()) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        keyguardManager.requestDismissKeyguard(this, new KeyguardManager.KeyguardDismissCallback() {
          @Override
          public void onDismissSucceeded() {
            Log.d("CALLSCREEN", "Pantalla desbloqueada");
          }

          @Override
          public void onDismissError() {
            Log.e("CALLSCREEN", "Error al desbloquear pantalla");
          }
        });
      } else {
        getWindow().addFlags(
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );
      }
    }
  }

  private void setupWindowParameters() {
    getWindow().addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
        WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON |
        WindowManager.LayoutParams.FLAG_FULLSCREEN
    );
  }

  private void initUI() {
    TextView origin = findViewById(R.id.origin);
    TextView destination = findViewById(R.id.destination);
    TextView price = findViewById(R.id.price);
    TextView user = findViewById(R.id.user);
    ImageView url = findViewById(R.id.url);
    Button btnAccept = findViewById(R.id.btnAccept);
    Button btnReject = findViewById(R.id.btnReject);

    // Obtener datos del intent
    String idViaje = getIntent().getStringExtra("idViaje");
    String _origin = getIntent().getStringExtra("origin");
    String _destination = getIntent().getStringExtra("destination");
    String _price = getIntent().getStringExtra("price");
    String _user = getIntent().getStringExtra("user");
    String imageUrl = getIntent().getStringExtra("url");
    String idUser = getIntent().getStringExtra("idUser");
    String idConductor = getIntent().getStringExtra("idConductor");

    origin.setText("Salida: " + _origin);
    destination.setText("Destino: " + _destination);
    price.setText("Q" + _price);
    user.setText(_user);

    Glide.with(this)
      .load(imageUrl)
      .placeholder(R.drawable.ic_launcher_foreground)
      .error(R.drawable.ic_launcher_foreground)
      .circleCrop()
      .into(url);

    btnAccept.setOnClickListener(v -> {
      stopRingtone();
      stopVibration();
      guardarAccion("aceptar", idViaje, idUser, idConductor);
      emitirEventoJS("aceptar", idViaje, idUser, idConductor);
      Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
      if (launchIntent != null) {
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(launchIntent);
      }
      finishCallScreen();
    });

    btnReject.setOnClickListener(v -> {
      stopRingtone();
      stopVibration();
      guardarAccion("rechazar", idViaje, idUser, idConductor);
      emitirEventoJS("rechazar", idViaje, idUser, idConductor);
      Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
      if (launchIntent != null) {
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(launchIntent);
      }
      finishCallScreen();
    });
  }

  private void guardarAccion(String accion, String idViaje, String idUser, String idConductor) {
    getSharedPreferences("CALLSCREEN_PREF", MODE_PRIVATE)
      .edit()
      .putString("accion", accion)
      .putString("idViaje", idViaje)
      .putString("idUser", idUser)
      .putString("idConductor", idConductor)
      .apply();
    enviarRespuestaViaje(accion, idViaje, idUser, idConductor);
  }

  private void finishCallScreen() {
    timeoutHandler.removeCallbacksAndMessages(null);
    stopService(new Intent(this, CallNotificationService.class));
    finish();
  }

  private void setupTimeout() {
    long tiempoRestante = getIntent().getLongExtra("tiempo_restante", 30);
    timeoutHandler.postDelayed(() -> {
      stopRingtone();
      stopVibration();
      finishCallScreen();
    }, tiempoRestante * 1000);
  }

  private void playRingtone() {
    try {
      if (mediaPlayer != null) {
        mediaPlayer.release();
      }

      mediaPlayer = new MediaPlayer();
      AssetFileDescriptor afd = getResources().openRawResourceFd(R.raw.soli);
      if (afd == null) return;

      mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
      afd.close();

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
          .build());
      } else {
        mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
      }

      mediaPlayer.setLooping(true);
      mediaPlayer.prepare();
      mediaPlayer.start();
    } catch (Exception e) {
      Log.e("CALLSCREEN", "Error al reproducir sonido: " + e.getMessage());
    }
  }

  private void stopRingtone() {
    if (mediaPlayer != null) {
      if (mediaPlayer.isPlaying()) {
        mediaPlayer.stop();
      }
      mediaPlayer.release();
      mediaPlayer = null;
    }
  }

  private void startVibration() {
    vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
    if (vibrator != null && vibrator.hasVibrator()) {
      long[] pattern = {0, 1000, 1000};
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        VibrationEffect effect = VibrationEffect.createWaveform(pattern, 0);
        vibrator.vibrate(effect);
      } else {
        vibrator.vibrate(pattern, 0);
      }
    } else {
      Log.e("CALLSCREEN", "No se detecta hardware de vibración.");
    }
  }

  private void stopVibration() {
    if (vibrator != null) {
      vibrator.cancel();
    }
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    stopRingtone();
    stopVibration();
    timeoutHandler.removeCallbacksAndMessages(null);
  }

  private void emitirEventoJS(String accion, String idViaje, String idUser, String idConductor) {
    Intent intent = new Intent("CALLSCREEN_ACCION");
    intent.putExtra("accion", accion);
    intent.putExtra("idViaje", idViaje);
    intent.putExtra("idUser", idUser);
    intent.putExtra("idConductor", idConductor);
    sendBroadcast(intent);
  }

  private void enviarRespuestaViaje(String accion, String idViaje, String idUser, String idConductor) {
    // 1. Petición HTTP
    enviarPeticionHTTP(accion, idViaje, idUser, idConductor);

    // 2. Emitir evento por socket usando SocketManager
    socketManager.emitRespuestaSolicitud(accion, idViaje, idUser, idConductor, success -> {
      if (success) {
        Log.d("FullScreenActivity", "Evento emitido con éxito");
        socketManager.emitCambiarEstado(idConductor, 1, statusSuccess -> {
          if (statusSuccess) {
            Log.d("FullScreenActivity", "Estado del conductor actualizado");
          } else {
            Log.e("FullScreenActivity", "Error al actualizar estado del conductor");
          }
        });
      } else {
        Log.e("FullScreenActivity", "Error al emitir evento de respuesta");
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
      Log.e("FullScreenActivity", "Error en petición HTTP", e);
    }
  }

  @Override
  public void onBackPressed() {
    // Bloquear botón atrás si es necesario
    // super.onBackPressed();
  }
}
