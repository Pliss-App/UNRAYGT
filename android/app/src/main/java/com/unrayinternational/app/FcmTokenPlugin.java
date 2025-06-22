package com.unrayinternational.app;


import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FcmToken")
public class FcmTokenPlugin extends Plugin {

  @PluginMethod
  public void getToken(PluginCall call) {

    Context appContext = getContext().getApplicationContext();
    SharedPreferences prefs = appContext.getSharedPreferences("fcm", Context.MODE_PRIVATE);
    String token = prefs.getString("fcm_token", null);
    JSObject ret = new JSObject();
    ret.put("token", token);
    call.resolve(ret);
  }
}
