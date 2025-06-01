package com.unrayinternational.app.callscreen;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
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
  private Handler timeoutHandler = new Handler(Looper.getMainLooper());
  private MediaPlayer mediaPlayer;
  private Vibrator vibrator;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Mostrar encima de pantalla bloqueada y prender pantalla
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true);
      setTurnScreenOn(true);



    } else {
      getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
    setContentView(R.layout.activity_incoming_call);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
      if (keyguardManager != null && keyguardManager.isKeyguardLocked()) {
        keyguardManager.requestDismissKeyguard(this, null);
      }
    }

    TextView origin = findViewById(R.id.origin);
    TextView destination = findViewById(R.id.destination);
    TextView price = findViewById(R.id.price);
    TextView user = findViewById(R.id.user);
    ImageView url = findViewById(R.id.url);
    Button btnAccept = findViewById(R.id.btnAccept);
    Button btnReject = findViewById(R.id.btnReject);

    // Obtener datos del intent
    String _origin = getIntent().getStringExtra("origin");
    String _destination = getIntent().getStringExtra("destination");
    String _price = getIntent().getStringExtra("price");
    String _user = getIntent().getStringExtra("user");
    String imageUrl = getIntent().getStringExtra("url");

    // origin.setText("Salida: " + origin + " hasta " + destination + "\nPrecio: $" + price);
    origin.setText("Salida: " + _origin);
    destination.setText("Destino: " + _destination);
    price.setText("Q" + _price);
    user.setText(_user);

    Glide.with(this)
      .load(imageUrl)
      .placeholder(R.drawable.ic_launcher_foreground) // Imagen temporal
      .error(R.drawable.ic_launcher_foreground)       // Imagen en caso de error
      .circleCrop()
      .into(url);
    //url.setImageURI(_url);
    playRingtone();
    startVibration();
    btnAccept.setOnClickListener(v -> {
      stopRingtone();
      stopVibration();
      Log.d("CALLSCREEN", "✅ Viaje aceptado");
      timeoutHandler.removeCallbacksAndMessages(null);
      // Aquí puedes agregar lógica para aceptar el viaje
      finish();
    });

    btnReject.setOnClickListener(v -> {
      stopRingtone();
      stopVibration();
      Log.d("CALLSCREEN", "❌ Viaje rechazado");
      timeoutHandler.removeCallbacksAndMessages(null);
      // Aquí puedes agregar lógica para rechazar el viaje
      finish();
    });

    timeoutHandler.postDelayed(() -> {
      stopRingtone();
      stopVibration();
      Log.d("CALLSCREEN", "⏱️ Se cerró la pantalla automáticamente por timeout");
      finish();
    }, 30_000);
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
          .setUsage(AudioAttributes.USAGE_ALARM) // o USAGE_NOTIFICATION_RINGTONE
          .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
          .build());
      } else {
        mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
      }

      mediaPlayer.setLooping(true);
      mediaPlayer.prepare();
      mediaPlayer.start();

    } catch (Exception e) {
      Log.e("CALLSCREEN", "❌ Error al reproducir sonido: " + e.getMessage());
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
      Log.e("CALLSCREEN", "❌ No se detecta hardware de vibración.");
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
  @Override
  public void onBackPressed() {
    // Opcional: evita cerrar la pantalla con el botón atrás si quieres forzar acción
    // super.onBackPressed();  <-- comenta para bloquear atrás
  }
}
