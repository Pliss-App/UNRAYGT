# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Previene que R8 elimine clases necesarias para Capacitor plugins
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.geolocation.** { *; }
-dontwarn com.getcapacitor.**

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Capacitor Preferences
-keep class com.getcapacitor.plugin.preferences.** { *; }

# Mantener todas las clases de tu plugin nativo personalizado
-keep class com.unrayinternational.plugin.fcm.** { *; }

# Evita que R8 elimine métodos anotados con @Keep
-keep @interface androidx.annotation.Keep
-keep class ** {
    @androidx.annotation.Keep *;
}

# Mantener el plugin personalizado de Capacitor
-keep class com.unrayinternational.app.FcmTokenPlugin { *; }
-keep class com.unrayinternational.app.FcmTokenPlugin$* { *; }


# Mantener el FirebaseMessagingService personalizado
-keep class com.unrayinternational.app.MyFirebaseMessagingService { *; }
-keep class com.unrayinternational.app.MyFirebaseMessagingService$* { *; }

-keep class com.unrayinternational.app.callscreen.MyFirebaseMessagingService { *; }
-keep class com.unrayinternational.app.callscreen.MyFirebaseMessagingService$* { *; }



# Evitar que se pierdan anotaciones que Capacitor necesita
-keepattributes RuntimeVisibleAnnotations
-keep @interface com.getcapacitor.annotation.CapacitorPlugin
-keep @interface com.getcapacitor.PluginMethod

# Extensiones de Plugin
-keepclassmembers class * extends com.getcapacitor.Plugin {
    public *;
}


-keep public class com.unrayinternational.app.FcmTokenPlugin {
    public <init>();
    public *;
}
-keepclassmembers class com.unrayinternational.app.FcmTokenPlugin {
    @com.getcapacitor.PluginMethod <methods>;
}

-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin *;
    @com.getcapacitor.PluginMethod *;
}

-keep class com.google.android.gms.** { *; }


# Conservar clases de Capacitor Plugin
-keepclassmembers class * {
    @com.getcapacitor.annotation.PluginMethod <methods>;
}
-keepclassmembers class com.unrayinternational.app.callscreen.CallActionPlugin { *; }

# Conservar cualquier clase usada por reflección
-keepclassmembers class * {
    public <init>(...);
}


-keep class com.unrayinternational.** { *; }
-keepclassmembers class * {
    public static <fields>;
}

-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

-keepclassmembers class com.unrayinternational.app.callscreen.CallActionPlugin { *; }


# No eliminar métodos de tu plugin Capacitor personalizado
-keep class com.unrayinternational.app.callscreen.CallActionPlugin { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
}
-keepattributes *Annotation*

-keep class org.json.** { *; }
-keep class io.socket.** { *; }