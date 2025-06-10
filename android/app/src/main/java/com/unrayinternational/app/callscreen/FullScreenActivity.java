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

public class FullScreenActivity extends Activity {
  private final Handler timeoutHandler = new Handler(Looper.getMainLooper());
  private MediaPlayer mediaPlayer;
  private Vibrator vibrator;

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
    // Habilitar mostrar sobre pantalla bloqueada y encender pantalla
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true);
      setTurnScreenOn(true);
    }

    // Solicitar desbloqueo de pantalla
    KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
    if (keyguardManager != null && keyguardManager.isKeyguardLocked()) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Método moderno (API 26+)
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
        // Método alternativo para versiones anteriores (API < 26)
        // Usamos flags de ventana en lugar de requestDismissKeyguard
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
      guardarAccion("aceptar", idViaje, idUser);
      emitirEventoJS("aceptar", idViaje, idUser);
      Log.d("CALLSCREEN", "Viaje aceptado");
      // Abrir la app (MainActivity)
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
      guardarAccion("rechazar", idViaje, idUser);
      emitirEventoJS("rechazar", idViaje, idUser);
      Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
      if (launchIntent != null) {
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(launchIntent);
      }
      Log.d("CALLSCREEN", "Viaje rechazado");
      finishCallScreen();
    });
  }
  private void guardarAccion(String accion,  String idViaje, String idUser) {
    getSharedPreferences("CALLSCREEN_PREF", MODE_PRIVATE)
      .edit()
      .putString("accion", accion)
      .putString("idViaje", idViaje)// "aceptar" o "rechazar"
      .putString("idUser", idUser)
      .apply();

    Log.d("CALLSCREEN", "Viaje : " + " "+ accion);
  }

  private void guardarIdViaje(String idViaje) {
    getSharedPreferences("CALLSCREEN_PREF", MODE_PRIVATE)
      .edit()
      .putString("idViaje", idViaje)
      .apply(); // o .apply()
  }
  private void finishCallScreen() {
    timeoutHandler.removeCallbacksAndMessages(null);
    stopService(new Intent(this, CallNotificationService.class));
    finish();
  }

  private void setupTimeout() {
    long tiempoRestante = getIntent().getLongExtra("tiempo_restante", 30);
    Log.d("CALLSCREEN", "Tiempo restante para cerrar: " + tiempoRestante + " segundos");

    timeoutHandler.postDelayed(() -> {
      stopRingtone();
      stopVibration();
      Log.d("CALLSCREEN", "Pantalla cerrada por timeout");
      finishCallScreen();
    },  tiempoRestante * 1000);
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

  private void emitirEventoJS(String accion, String idViaje, String idUser) {
    Intent intent = new Intent("CALLSCREEN_ACCION");
    intent.putExtra("accion", accion);
    intent.putExtra("idViaje", idViaje);
    intent.putExtra("idUser", idUser);
    sendBroadcast(intent); // Esto lo atrapa el plugin y lanza a JS
  }
  @Override
  public void onBackPressed() {
    // Bloquear botón atrás si es necesario
    // super.onBackPressed(); // Comenta esta línea para bloquear el botón atrás
  }
}
