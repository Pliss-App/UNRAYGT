package com.unrayinternational.app.callscreen;

import static android.service.controls.ControlsProviderService.TAG;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.unrayinternational.app.R;

public class CallNotificationService extends Service {
  private Intent originalIntent;
  private static final String CHANNEL_ID = "067705b6-62da-4acc-af8e-ff070e5b075d";
  private MediaPlayer mediaPlayer;
  private Vibrator vibrator;
  private Handler timeoutHandler;

  @Override
  public void onCreate() {
    super.onCreate();
    createNotificationChannel();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent == null) return START_NOT_STICKY;

    this.originalIntent = intent;

    // Detener sonido y vibración si se recibe acción específica
    if ("STOP_SOUND".equals(intent.getAction())) {
      stopSoundAndVibration();
      stopSelf();
      return START_NOT_STICKY;
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      NotificationManager notificationManager = getSystemService(NotificationManager.class);
      if (!notificationManager.areNotificationsEnabled()) {
        // Solo registrar el problema pero continuar
        Log.w(TAG, "Notificaciones no permitidas en Android 13+");
      }
    }


    // Recuperar extras del intent
    String origin = intent.getStringExtra("origin");
    String destination = intent.getStringExtra("destination");
    String price = intent.getStringExtra("price");
    String idViaje = intent.getStringExtra("idViaje");
    String idUser = intent.getStringExtra("idUser");
    String imageUrl = intent.getStringExtra("url");
    // Intent para abrir la actividad de pantalla completa
    Intent fullScreenIntent = new Intent(this, FullScreenActivity.class);
    fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    fullScreenIntent.putExtras(intent.getExtras());

    PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
      this,
      0,
      fullScreenIntent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );

    Intent openAppIntent = new Intent(this, com.unrayinternational.app.MainActivity.class);
    openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    openAppIntent.putExtra("idViaje", idViaje);
    openAppIntent.putExtra("idUser", idUser);

    PendingIntent acceptPendingIntent = PendingIntent.getActivity(
      this,
      1,
      openAppIntent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );


    Intent rejectIntent = new Intent(this, CallActionReceiver.class);
    rejectIntent.setAction("com.unrayinternational.REJECT");
    rejectIntent.putExtra("idViaje", idViaje);
    rejectIntent.putExtra("idUser", idUser);
    PendingIntent rejectPendingIntent = PendingIntent.getBroadcast(
      this, 2, rejectIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );


    // Crear la notificación tipo llamada
    Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_stat_onesignal_default)
      .setContentTitle("Nueva solicitud de viaje | Q" + price)
      .setContentText("Salida: " + origin + " → Destino: " + destination)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_ALARM) //.setCategory(NotificationCompat.CATEGORY_CALL)
      .setFullScreenIntent(fullScreenPendingIntent, true)
      .setAutoCancel(true)
      .setOngoing(true)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .addAction(new NotificationCompat.Action.Builder(
        android.R.drawable.ic_menu_close_clear_cancel,
        "Rechazar",
        rejectPendingIntent
      ).build())
      .addAction(new NotificationCompat.Action.Builder(
        android.R.drawable.ic_menu_call,
        "Aceptar",
        acceptPendingIntent
      ).build())
      .build();

    // Iniciar el servicio en primer plano con la notificación
    startForeground(1, notification);

    // Iniciar sonido y vibración
    startSoundAndVibration();

    // Abrir FullScreenActivity manualmente con un pequeño delay
    new Handler(Looper.getMainLooper()).postDelayed(() -> {
      startActivity(fullScreenIntent);
    }, 300);

    return START_NOT_STICKY;
  }

  private void startSoundAndVibration() {
    try {
      mediaPlayer = new MediaPlayer();
      AssetFileDescriptor afd = getResources().openRawResourceFd(R.raw.soli);
      mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
      afd.close();

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_NOTIFICATION) // antes: USAGE_ALARM
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION) // antes: MUSIC
          .build());
      } else {
        mediaPlayer.setAudioStreamType(android.media.AudioManager.STREAM_NOTIFICATION);
      }

      mediaPlayer.setLooping(true);
      mediaPlayer.prepare();
      mediaPlayer.start();
    } catch (Exception e) {
      e.printStackTrace();
    }

    vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
    if (vibrator != null && vibrator.hasVibrator()) {
      long[] pattern = {0, 1000, 1000}; // vibrar, esperar, vibrar...
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
      } else {
        vibrator.vibrate(pattern, 0);
      }
    }

    // Detener sonido y vibración automáticamente tras 30 segundos
    timeoutHandler = new Handler(Looper.getMainLooper());
    timeoutHandler.postDelayed(() -> {
      stopSoundAndVibration();
      // Enviar acción de rechazo automáticamente
      if (originalIntent != null) {
        String idViaje = originalIntent.getStringExtra("idViaje");
        String idUser = originalIntent.getStringExtra("idUser");

        Intent rejectIntent = new Intent(this, CallActionReceiver.class);
        rejectIntent.setAction("com.unrayinternational.REJECT");
        rejectIntent.putExtra("idViaje", idViaje);
        rejectIntent.putExtra("idUser", idUser);
        sendBroadcast(rejectIntent);
      }
      stopSelf();
    }, 30_000);
  }

  private void stopSoundAndVibration() {
    if (mediaPlayer != null) {
      try {
        if (mediaPlayer.isPlaying()) {
          mediaPlayer.stop();
        }
        mediaPlayer.release();
      } catch (Exception ignored) {}
      mediaPlayer = null;
    }

    if (vibrator != null) {
      vibrator.cancel();
      vibrator = null;
    }

    if (timeoutHandler != null) {
      timeoutHandler.removeCallbacksAndMessages(null);
      timeoutHandler = null;
    }
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "Servicio de Llamadas",
        NotificationManager.IMPORTANCE_HIGH
      );
      channel.setDescription("Canal para llamadas entrantes");
      channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

      NotificationManager manager = getSystemService(NotificationManager.class);
      if (manager != null) {
        manager.createNotificationChannel(channel);
      }
    }
  }

  @Override
  public void onTaskRemoved(Intent rootIntent) {
    // Enviar acción de rechazo automáticamente si se desliza
    if (originalIntent != null) {
      String idViaje = originalIntent.getStringExtra("idViaje");
      String idUser = originalIntent.getStringExtra("idUser");

      Intent rejectIntent = new Intent(this, CallActionReceiver.class);
      rejectIntent.setAction("com.unrayinternational.REJECT");
      rejectIntent.putExtra("idViaje", idViaje);
      rejectIntent.putExtra("idUser", idUser);
      sendBroadcast(rejectIntent);
    }

    stopSoundAndVibration(); // detener sonido si aún estaba sonando
    stopSelf();

    super.onTaskRemoved(rootIntent);
  }

  @Override
  public void onDestroy() {
    stopSoundAndVibration();
    super.onDestroy();
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }
}
