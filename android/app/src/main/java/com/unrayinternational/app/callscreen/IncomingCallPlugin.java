package com.unrayinternational.app.callscreen;

import android.content.Intent;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "IncomingCall")
public class IncomingCallPlugin extends Plugin {

  @PluginMethod
  public void launch(PluginCall call) {
    String origin = call.getString("origin");
    String destination = call.getString("destination");
    String price = call.getString("price");
    String imageUrl = call.getString("imageUrl");

    Intent intent = new Intent(getContext(), FullScreenActivity.class);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    intent.putExtra("origin", origin);
    intent.putExtra("destination", destination);
    intent.putExtra("price", price);
    intent.putExtra("imageUrl", imageUrl);
    getContext().startActivity(intent);

    call.resolve();
  }
}
