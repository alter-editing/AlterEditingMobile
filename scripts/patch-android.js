import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.join('android', 'app', 'src', 'main', 'AndroidManifest.xml');
const xmlDir = path.join('android', 'app', 'src', 'main', 'res', 'xml');
const networkConfigPath = path.join(xmlDir, 'network_security_config.xml');

if (!fs.existsSync(manifestPath)) {
  throw new Error(`AndroidManifest.xml not found: ${manifestPath}`);
}

fs.mkdirSync(xmlDir, { recursive: true });

fs.writeFileSync(networkConfigPath, `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">132.243.30.159</domain>
        <domain includeSubdomains="true">83.147.241.28</domain>
    </domain-config>
</network-security-config>
`, 'utf8');

let manifest = fs.readFileSync(manifestPath, 'utf8');

function ensurePermission(xml, permissionLine) {
  const permissionName = (permissionLine.match(/android:name="([^"]+)"/) || [])[1];
  if (permissionName && xml.includes(`android:name="${permissionName}"`)) return xml;
  return xml.replace(
    '<manifest xmlns:android="http://schemas.android.com/apk/res/android">',
    `<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    ${permissionLine}`
  );
}

manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.INTERNET" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.READ_MEDIA_VISUAL_USER_SELECTED" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />');
manifest = ensurePermission(manifest, '<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />');

manifest = manifest.replace(/<application\b([^>]*)>/, (match, attrs) => {
  let next = attrs;

  if (!next.includes('android:usesCleartextTraffic=')) {
    next += '\n        android:usesCleartextTraffic="true"';
  }

  if (!next.includes('android:networkSecurityConfig=')) {
    next += '\n        android:networkSecurityConfig="@xml/network_security_config"';
  }

  if (!next.includes('android:hardwareAccelerated=')) {
    next += '\n        android:hardwareAccelerated="true"';
  }

  if (!next.includes('android:largeHeap=')) {
    next += '\n        android:largeHeap="true"';
  }

  if (!next.includes('android:killAfterRestore=')) {
    next += '\n        android:killAfterRestore="false"';
  }

  if (!next.includes('android:resizeableActivity=')) {
    next += '\n        android:resizeableActivity="true"';
  }

  if (!next.includes('android:requestLegacyExternalStorage=')) {
    next += '\n        android:requestLegacyExternalStorage="true"';
  }

  if (!next.includes('android:supportsRtl=')) {
    next += '\n        android:supportsRtl="true"';
  }

  // Force the generated APK to use the custom launcher icon.
  if (next.includes('android:icon=')) {
    next = next.replace(/android:icon="[^"]*"/, 'android:icon="@mipmap/ic_launcher"');
  } else {
    next += '\n        android:icon="@mipmap/ic_launcher"';
  }

  if (next.includes('android:roundIcon=')) {
    next = next.replace(/android:roundIcon="[^"]*"/, 'android:roundIcon="@mipmap/ic_launcher_round"');
  } else {
    next += '\n        android:roundIcon="@mipmap/ic_launcher_round"';
  }

  return `<application${next}>`;
});


if (!manifest.includes('android:name=".TikTokWebActivity"')) {
  manifest = manifest.replace(
    '</application>',
    `    <activity
        android:name=".TikTokWebActivity"
        android:exported="false"
        android:screenOrientation="portrait"
        android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboard|keyboardHidden|navigation|uiMode"
        android:hardwareAccelerated="true"
        android:launchMode="singleTop" />
</application>`
  );
}


if (!manifest.includes('android:name=".KeepAliveService"')) {
  manifest = manifest.replace(
    '</application>',
    `    <service
        android:name=".KeepAliveService"
        android:exported="false"
        android:enabled="true"
        android:foregroundServiceType="dataSync" />
</application>`
  );
}

if (!manifest.includes('<supports-screens')) {
  manifest = manifest.replace(
    '</manifest>',
    `    <supports-screens
        android:anyDensity="true"
        android:smallScreens="true"
        android:normalScreens="true"
        android:largeScreens="true"
        android:xlargeScreens="true" />
</manifest>`
  );
}


// Keep the main WebView activity alive as much as possible while Android opens
// the gallery picker or Telegram. This reduces instant UI resets on aggressive
// vendor firmware and older/low-memory devices.
manifest = manifest.replace(/<activity\b([^>]*android:name="[^"]*MainActivity"[^>]*)>/, (match, attrs) => {
  let next = attrs;
  const setAttr = (name, value) => {
    const re = new RegExp(`${name}="[^"]*"`);
    if (re.test(next)) next = next.replace(re, `${name}="${value}"`);
    else next += `\n            ${name}="${value}"`;
  };
  setAttr('android:launchMode', 'singleTask');
  setAttr('android:alwaysRetainTaskState', 'true');
  setAttr('android:configChanges', 'orientation|screenSize|screenLayout|smallestScreenSize|keyboard|keyboardHidden|navigation|uiMode');
  return `<activity${next}>`;
});

fs.writeFileSync(manifestPath, manifest, 'utf8');


// Keep Android versionCode/versionName aligned with GitHub releases so sideloaded
// APK updates can install over the previous version. The APK signature must also
// stay the same between releases.
function versionCodeFromVersion(version, fallback) {
  const clean = String(version || '1.0.0').replace(/^v/i, '').replace(/[^0-9.].*$/, '');
  const parts = clean.split('.').map(x => parseInt(x || '0', 10));
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;
  const calculated = major * 10000 + minor * 100 + patch;
  return Number(process.env.VERSION_CODE || calculated || fallback || 1);
}

function patchGradleVersionsAndSigning() {
  const gradlePath = path.join('android', 'app', 'build.gradle');
  if (!fs.existsSync(gradlePath)) return;

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const appVersion = String(process.env.APP_VERSION || pkg.version || '1.0.0').replace(/^v/i, '');
  const versionCode = versionCodeFromVersion(appVersion, process.env.GITHUB_RUN_NUMBER || 1);
  let gradle = fs.readFileSync(gradlePath, 'utf8');

  // Some generated Capacitor/Gradle combinations can miss compileSdk in app/build.gradle.
  // Add it inside android {} without touching the rest of the generated file.
  if (!/\bcompileSdk(?:Version)?\b/.test(gradle)) {
    gradle = gradle.replace(/android\s*\{/, 'android {\n    compileSdkVersion rootProject.ext.compileSdkVersion');
  }

  if (/versionCode\s+\d+/.test(gradle)) gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  else gradle = gradle.replace(/defaultConfig\s*\{/, `defaultConfig {\n        versionCode ${versionCode}`);

  if (/versionName\s+["'][^"']+["']/.test(gradle)) gradle = gradle.replace(/versionName\s+["'][^"']+["']/, `versionName "${appVersion}"`);
  else gradle = gradle.replace(/defaultConfig\s*\{/, `defaultConfig {\n        versionName "${appVersion}"`);

  // Only enable release signing after the workflow has decoded the keystore file.
  // Do not key this off ANDROID_KEYSTORE_BASE64, because that value is not visible
  // to Gradle and should never be written into build.gradle.
  const signingRequested = Boolean(process.env.ANDROID_KEYSTORE_PATH);

  if (signingRequested && !/signingConfigs\s*\{/.test(gradle)) {
    gradle = gradle.replace(/android\s*\{/, `android {\n    signingConfigs {\n        release {\n            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")\n            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: ""\n            keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: ""\n            keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: ""\n        }\n    }`);
  }

  if (signingRequested) {
    // Add signingConfig only to buildTypes.release. The previous patch matched the
    // first `release { ... }` block, which could be signingConfigs.release and breaks Gradle.
    if (/buildTypes\s*\{[\s\S]*?release\s*\{/.test(gradle)) {
      gradle = gradle.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{)([\s\S]*?)(\n\s*\})/, (m, start, body, end) => {
        if (body.includes('signingConfig signingConfigs.release')) return m;
        return `${start}${body}\n            signingConfig signingConfigs.release${end}`;
      });
    } else {
      gradle = gradle.replace(/android\s*\{/, `android {\n    buildTypes {\n        release {\n            signingConfig signingConfigs.release\n            minifyEnabled false\n        }\n    }`);
    }
  }

  fs.writeFileSync(gradlePath, gradle, 'utf8');
  console.log(`Android versionName=${appVersion}, versionCode=${versionCode}`);
  if (signingRequested) console.log('Release signing config enabled from environment.');
}

patchGradleVersionsAndSigning();



// Copy custom launcher icons generated in assets/android-icons into the generated Android project.
const iconSourceRoot = path.join('assets', 'android-icons');
const resRoot = path.join('android', 'app', 'src', 'main', 'res');
if (fs.existsSync(iconSourceRoot) && fs.existsSync(resRoot)) {
  for (const dir of fs.readdirSync(iconSourceRoot)) {
    const srcDir = path.join(iconSourceRoot, dir);
    const dstDir = path.join(resRoot, dir);
    if (!fs.statSync(srcDir).isDirectory()) continue;
    fs.mkdirSync(dstDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      fs.copyFileSync(path.join(srcDir, file), path.join(dstDir, file));
    }
  }
  const valuesDir = path.join(resRoot, 'values');
  fs.mkdirSync(valuesDir, { recursive: true });

  // Capacitor/Android can generate this resource in different files.
  // Keep exactly ONE ic_launcher_background definition to avoid Gradle
  // "Duplicate resources" errors during :app:mergeDebugResources.
  const launcherBackgroundPath = path.join(valuesDir, 'ic_launcher_background.xml');
  if (fs.existsSync(launcherBackgroundPath)) {
    fs.rmSync(launcherBackgroundPath, { force: true });
  }

  const colorsPath = path.join(valuesDir, 'colors.xml');
  let colorsXml = fs.existsSync(colorsPath)
    ? fs.readFileSync(colorsPath, 'utf8')
    : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';

  colorsXml = colorsXml.replace(/\s*<color\s+name=["']ic_launcher_background["'][^>]*>.*?<\/color>/gs, '');
  colorsXml = colorsXml.replace('</resources>', '    <color name="ic_launcher_background">#05080A</color>\n</resources>');
  fs.writeFileSync(colorsPath, colorsXml, 'utf8');

  console.log('Custom launcher icons copied.');
}



// Add a tiny native bridge so patched videos are written to Android Gallery/Movies, not just downloaded.
function walk(dir, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walk(full, found);
    else found.push(full);
  }
  return found;
}

const javaRoot = path.join('android', 'app', 'src', 'main', 'java');
const mainActivityPath = walk(javaRoot).find(p => /MainActivity\.java$/.test(p));
if (mainActivityPath) {
  const mainSrc = fs.readFileSync(mainActivityPath, 'utf8');
  const pkgMatch = mainSrc.match(/package\s+([\w.]+);/);
  const packageName = pkgMatch ? pkgMatch[1] : 'com.alterediting.method';
  const packageDir = mainActivityPath.slice(0, mainActivityPath.lastIndexOf(path.sep));

  fs.writeFileSync(mainActivityPath, `package ${packageName};

import android.os.Bundle;
import android.os.Build;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.content.ComponentCallbacks2;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = getBridge().getWebView();
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        WebSettings settings = webView.getSettings();
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setTextZoom(100);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(false);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        }
        getBridge().getWebView().addJavascriptInterface(new GalleryBridge(this), "AlterGallery");
        getBridge().getWebView().addJavascriptInterface(new WebBridge(this), "AlterWeb");
        getBridge().getWebView().addJavascriptInterface(new KeepAliveBridge(this), "AlterKeepAlive");
        getBridge().getWebView().addJavascriptInterface(new MediaPermissionBridge(this), "AlterMediaPermissions");
        getBridge().getWebView().addJavascriptInterface(new PerformanceBridge(this), "AlterPerformance");
    }

    @Override
    public void onTrimMemory(int level) {
        // Do not destroy the WebView on moderate memory pressure; the app uses
        // streaming patching and can survive by clearing caches instead.
        if (level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW) {
            try { getBridge().getWebView().clearCache(false); } catch (Exception ignored) {}
        }
        super.onTrimMemory(level);
    }
}
`, 'utf8');


  fs.writeFileSync(path.join(packageDir, 'MediaPermissionBridge.java'), `package ${packageName};

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.webkit.JavascriptInterface;

public class MediaPermissionBridge {
    private static final int REQ_MEDIA_ACCESS = 7314;
    private final Activity activity;

    public MediaPermissionBridge(Activity activity) {
        this.activity = activity;
    }

    private boolean hasPermission(String permission) {
        if (permission == null || permission.trim().isEmpty()) return true;
        if (Build.VERSION.SDK_INT < 23) return true;
        try { return activity.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED; }
        catch (Exception e) { return true; }
    }

    @JavascriptInterface
    public String hasVideoAccess() {
        try {
            if (Build.VERSION.SDK_INT >= 33) {
                if (hasPermission(Manifest.permission.READ_MEDIA_VIDEO)) return "granted";
                if (Build.VERSION.SDK_INT >= 34 && hasPermission("android.permission.READ_MEDIA_VISUAL_USER_SELECTED")) return "limited";
                return "denied";
            }
            if (Build.VERSION.SDK_INT >= 23) {
                return hasPermission(Manifest.permission.READ_EXTERNAL_STORAGE) ? "granted" : "denied";
            }
            return "granted";
        } catch (Exception e) {
            return "ERROR:" + e.getMessage();
        }
    }

    @JavascriptInterface
    public String requestMediaAccess() {
        try {
            if (Build.VERSION.SDK_INT < 23) return "granted";

            if (Build.VERSION.SDK_INT >= 33) {
                boolean videoGranted = hasPermission(Manifest.permission.READ_MEDIA_VIDEO);
                boolean imageGranted = hasPermission(Manifest.permission.READ_MEDIA_IMAGES);
                boolean limitedGranted = Build.VERSION.SDK_INT >= 34 && hasPermission("android.permission.READ_MEDIA_VISUAL_USER_SELECTED");
                if (videoGranted && imageGranted) return "granted";
                if (limitedGranted) return "limited";

                activity.runOnUiThread(new Runnable() {
                    @Override public void run() {
                        if (Build.VERSION.SDK_INT >= 33) {
                            activity.requestPermissions(new String[] {
                                Manifest.permission.READ_MEDIA_VIDEO,
                                Manifest.permission.READ_MEDIA_IMAGES
                            }, REQ_MEDIA_ACCESS);
                        }
                    }
                });
                return "requesting";
            }

            if (!hasPermission(Manifest.permission.READ_EXTERNAL_STORAGE)) {
                activity.runOnUiThread(new Runnable() {
                    @Override public void run() {
                        activity.requestPermissions(new String[] { Manifest.permission.READ_EXTERNAL_STORAGE }, REQ_MEDIA_ACCESS);
                    }
                });
                return "requesting";
            }

            return "granted";
        } catch (Exception e) {
            return "ERROR:" + e.getMessage();
        }
    }
}
`, 'utf8');

  fs.writeFileSync(path.join(packageDir, 'KeepAliveBridge.java'), `package ${packageName};

import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.webkit.JavascriptInterface;

public class KeepAliveBridge {
    private final Activity activity;

    public KeepAliveBridge(Activity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public String start(String reason) {
        try {
            Intent intent = new Intent(activity, KeepAliveService.class);
            intent.setAction(KeepAliveService.ACTION_START);
            intent.putExtra("reason", reason == null ? "working" : reason);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                activity.startForegroundService(intent);
            } else {
                activity.startService(intent);
            }
            return "OK";
        } catch (Exception e) {
            return "ERROR:" + e.getMessage();
        }
    }

    @JavascriptInterface
    public String stop(String reason) {
        try {
            Intent intent = new Intent(activity, KeepAliveService.class);
            intent.setAction(KeepAliveService.ACTION_STOP);
            intent.putExtra("reason", reason == null ? "done" : reason);
            activity.stopService(intent);
            return "OK";
        } catch (Exception e) {
            return "ERROR:" + e.getMessage();
        }
    }
}
`, 'utf8');

  fs.writeFileSync(path.join(packageDir, 'KeepAliveService.java'), `package ${packageName};

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

public class KeepAliveService extends Service {
    public static final String ACTION_START = "${packageName}.KEEP_ALIVE_START";
    public static final String ACTION_STOP = "${packageName}.KEEP_ALIVE_STOP";
    private static final String CHANNEL_ID = "alter_keep_alive";
    private static final int NOTIFICATION_ID = 4207;

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? ACTION_START : intent.getAction();
        if (ACTION_STOP.equals(action)) {
            stopForegroundCompat();
            stopSelf();
            return START_NOT_STICKY;
        }
        startForegroundCompat(buildNotification());
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        stopForegroundCompat();
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Alter Editing Method",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps Alter Editing Method stable while Telegram or file picker is open.");
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setShowBadge(false);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pendingIntent = null;
        if (launchIntent != null) {
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_UPDATE_CURRENT;
            pendingIntent = PendingIntent.getActivity(this, 0, launchIntent, flags);
        }

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);

        builder.setSmallIcon(android.R.drawable.stat_sys_upload_done)
            .setContentTitle("Alter Editing Method")
            .setContentText("Работает в фоне")
            .setOngoing(true)
            .setShowWhen(false)
            .setOnlyAlertOnce(true)
            .setPriority(Notification.PRIORITY_LOW)
            .setCategory(Notification.CATEGORY_SERVICE);

        if (pendingIntent != null) builder.setContentIntent(pendingIntent);

        // Compatible quiet notification setup for older AndroidX/SDK builder variants.
        // Do not use builder.setSilent(true): some GitHub Actions Android dependencies
        // compile against a Builder API where this method is unavailable.
        builder.setDefaults(0);
        builder.setSound(null);
        builder.setVibrate(new long[] { 0L });

        return builder.build();
    }

    private void startForegroundCompat(Notification notification) {
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
    }
}
`, 'utf8');

  fs.writeFileSync(path.join(packageDir, 'PerformanceBridge.java'), `package ${packageName};

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.os.Build;
import android.webkit.JavascriptInterface;

public class PerformanceBridge {
    private final Activity activity;
    public PerformanceBridge(Activity activity) { this.activity = activity; }

    private static String q(String value) {
        return String.valueOf((char) 34) + value + String.valueOf((char) 34);
    }

    private static String escape(String value) {
        if (value == null) return "";
        String slash = String.valueOf((char) 92);
        return value.replace(slash, slash + slash).replace(String.valueOf((char) 34), slash + String.valueOf((char) 34));
    }

    @JavascriptInterface
    public String profile() {
        try {
            ActivityManager.MemoryInfo info = new ActivityManager.MemoryInfo();
            ActivityManager manager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
            if (manager != null) manager.getMemoryInfo(info);
            long totalMb = Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN ? info.totalMem / 1024L / 1024L : 0L;
            long availMb = info.availMem / 1024L / 1024L;
            return "{" + q("sdk") + ":" + Build.VERSION.SDK_INT
                + "," + q("totalRamMb") + ":" + totalMb
                + "," + q("availRamMb") + ":" + availMb
                + "," + q("lowMemory") + ":" + info.lowMemory + "}";
        } catch (Exception e) {
            return "{" + q("error") + ":" + q(escape(e.getMessage())) + "}";
        }
    }
}
`, 'utf8');

  fs.writeFileSync(path.join(packageDir, 'WebBridge.java'), `package ${packageName};

import android.app.Activity;
import android.content.Intent;
import android.webkit.JavascriptInterface;

public class WebBridge {
    private final Activity activity;

    public WebBridge(Activity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public String openTikTokUpload(String url) {
        try {
            Intent intent = new Intent(activity, TikTokWebActivity.class);
            intent.putExtra("url", url == null || url.trim().isEmpty() ? "https://www.tiktok.com/tiktokstudio/upload" : url);
            activity.startActivity(intent);
            return "OK";
        } catch (Exception e) {
            return "ERROR:" + e.getMessage();
        }
    }
}
`, 'utf8');

  fs.writeFileSync(path.join(packageDir, 'TikTokWebActivity.java'), `package ${packageName};

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;

public class TikTokWebActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 2417;
    private static final String DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        webView.setBackgroundColor(Color.BLACK);
        webView.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportZoom(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        // TikTok Studio is a desktop web app. Keep a real desktop viewport instead of
        // forcing width=device-width. Forcing mobile-width after upload can make the
        // editor calculate a broken tall canvas and hide the bottom action buttons.
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        settings.setUserAgentString(DESKTOP_USER_AGENT);
        webView.setInitialScale(70);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (url != null && url.toLowerCase().contains("tiktok.com")) {
                    view.evaluateJavascript("(function(){" +
                        "try{" +
                        "var U=(location.href||'').toLowerCase();" +
                        "var isStudio=(U.indexOf('tiktokstudio')>=0||U.indexOf('/creator-center/upload')>=0||U.indexOf('/upload')>=0)&&U.indexOf('/login')<0;" +
                        "var m=document.querySelector('meta[name=viewport]');" +
                        "if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}" +
                        "var st=document.getElementById('alter-tiktok-desktop-fix');" +
                        "if(!st){st=document.createElement('style');st.id='alter-tiktok-desktop-fix';document.head.appendChild(st);}" +
                        "if(isStudio){" +
                        "var W=1280;" +
                        "m.content='width='+W+', initial-scale=1, maximum-scale=4, minimum-scale=0.25, user-scalable=yes';" +
                        "var pageBg='#fff';" +
                        "document.documentElement.style.minWidth=W+'px';document.documentElement.style.width=W+'px';document.documentElement.style.height='auto';document.documentElement.style.overflowX='auto';document.documentElement.style.overflowY='auto';document.documentElement.style.background=pageBg;" +
                        "document.body.style.minWidth=W+'px';document.body.style.width=W+'px';document.body.style.height='auto';document.body.style.minHeight='100vh';document.body.style.overflowX='auto';document.body.style.overflowY='auto';document.body.style.background=pageBg;document.body.style.paddingBottom='24px';" +
                        "st.textContent='html,body{min-width:1280px!important;width:1280px!important;height:auto!important;min-height:100vh!important;overflow-x:auto!important;overflow-y:auto!important;background:#fff!important;background-color:#fff!important;}body{padding-bottom:24px!important;background:#fff!important;background-color:#fff!important;}body>div,#__next,#app,main,form,section,[id*=root],[class*=layout],[class*=container],[class*=content],[class*=Content],[class*=upload],[class*=Upload]{background:#fff!important;background-color:#fff!important;}*{-webkit-text-size-adjust:100%!important;}[data-alter-actions-wrap]{background:#fff!important;background-color:#fff!important;border:0!important;box-shadow:none!important;}[data-alter-actions-wrap] *{box-sizing:border-box!important;}';" +
                        "if(!window.__alterTikTokActionFix){window.__alterTikTokActionFix=1;" +
                        "var texts=['опубликовать','публикация','запланировать','сохранить','черновик','удалить','publish','post','schedule','save','draft','delete'];" +
                        "function txt(e){return ((e&&e.innerText)||'').replace(/\s+/g,' ').trim().toLowerCase();}" +
                        "function hasAction(e){var t=txt(e);for(var i=0;i<texts.length;i++){if(t.indexOf(texts[i])>=0)return true;}return false;}" +
                        "function clearFixed(el){try{el.style.position='relative';el.style.left='auto';el.style.right='auto';el.style.top='auto';el.style.bottom='auto';el.style.inset='auto';el.style.zIndex='1';el.style.transform='none';el.style.visibility='visible';el.style.opacity='1';el.style.pointerEvents='auto';el.style.maxHeight='none';el.style.overflow='visible';}catch(e){}}" +
                        "function cardOf(el){try{var c=el;for(var i=0;i<7&&c&&c.parentElement;i++){var r=c.getBoundingClientRect();var t=txt(c);if(r.height>80&&(t.indexOf('провер')>=0||t.indexOf('copyright')>=0||t.indexOf('быстрая')>=0||t.indexOf('checks')>=0)){return c;}c=c.parentElement;}}catch(e){}return el;}" +
                        "function findAnchor(bar){var best=null;[].slice.call(document.querySelectorAll('section,div,form')).forEach(function(x){try{if(!x||x===bar||x.contains(bar)||bar.contains(x))return;var r=x.getBoundingClientRect();if(r.height<40)return;var t=txt(x);if(t.indexOf('провер')>=0||t.indexOf('copyright')>=0||t.indexOf('быстрая')>=0||t.indexOf('checks')>=0){if(!best||r.bottom>best.getBoundingClientRect().bottom)best=x;}}catch(e){}});return cardOf(best);}" +
                        "function normalizePageBg(node){try{var bg='#fff';document.documentElement.style.background=bg;document.documentElement.style.backgroundColor=bg;document.body.style.background=bg;document.body.style.backgroundColor=bg;var roots=[document.querySelector('#root'),document.querySelector('#app'),document.querySelector('#__next'),document.body.firstElementChild,document.querySelector('main'),document.querySelector('form')];roots.forEach(function(r){if(r){r.style.background=bg;r.style.backgroundColor=bg;}});var p=node;for(var i=0;i<8&&p;i++){p.style.background=bg;p.style.backgroundColor=bg;if(p.style.boxShadow&&p.getAttribute('data-alter-actions-wrap')==='1')p.style.boxShadow='none';p=p.parentElement;}}catch(e){}}" +
                        "function unifyPageBg(){try{var bg='#fff';[].slice.call(document.querySelectorAll('body>div,#__next,#app,main,form,section,[id*=root],[class*=layout],[class*=Layout],[class*=container],[class*=Container],[class*=content],[class*=Content],[class*=upload],[class*=Upload]')).forEach(function(el){try{var r=el.getBoundingClientRect();if(r.width>250&&r.height>50){el.style.background=bg;el.style.backgroundColor=bg;}}catch(e){}});}catch(e){}}function fixActions(){try{if(!(location.href||'').toLowerCase().match(/tiktokstudio|creator-center|upload/))return;unifyPageBg();var all=[].slice.call(document.querySelectorAll('button,[role=button],a'));var actions=all.filter(hasAction);if(!actions.length)return;var bar=actions[0];for(var d=0;d<10&&bar&&bar.parentElement;d++){var p=bar.parentElement;var bc=p.querySelectorAll('button,[role=button],a').length;var w=p.getBoundingClientRect().width;if(bc>=2&&w>250){bar=p;break;}bar=p;}if(!bar)return;var anchor=findAnchor(bar);var wrap=document.querySelector('[data-alter-actions-wrap]');if(!wrap){wrap=document.createElement('div');wrap.setAttribute('data-alter-actions-wrap','1');}if(anchor&&anchor.parentElement&&wrap.parentElement!==anchor.parentElement){anchor.parentElement.insertBefore(wrap,anchor.nextSibling);}if(bar.parentElement!==wrap){wrap.appendChild(bar);}normalizePageBg(wrap);clearFixed(wrap);clearFixed(bar);var ar=anchor?anchor.getBoundingClientRect():null;wrap.style.display='block';wrap.style.width=ar&&ar.width>300?ar.width+'px':'100%';wrap.style.maxWidth='100%';wrap.style.margin='24px 0 44px 0';wrap.style.padding='0';wrap.style.border='0';wrap.style.borderRadius='0';wrap.style.boxShadow='none';wrap.style.background='#fff';wrap.style.backgroundColor='#fff';wrap.style.overflow='visible';bar.setAttribute('data-alter-fixed-actions','inline');bar.style.display='grid';bar.style.gridTemplateColumns='minmax(220px,1fr) minmax(260px,1fr) minmax(110px,.42fr)';bar.style.gap='16px';bar.style.alignItems='center';bar.style.width='100%';bar.style.maxWidth='100%';bar.style.margin='0';bar.style.padding='0';bar.style.background='transparent';bar.style.backgroundColor='transparent';bar.style.border='0';bar.style.borderRadius='0';bar.style.boxShadow='none';bar.style.overflow='visible';actions.forEach(function(btn){try{btn.style.position='relative';btn.style.left='auto';btn.style.right='auto';btn.style.top='auto';btn.style.bottom='auto';btn.style.width='auto';btn.style.minWidth='0';btn.style.maxWidth='100%';btn.style.margin='0';btn.style.transform='none';btn.style.whiteSpace='nowrap';btn.style.overflow='hidden';btn.style.textOverflow='ellipsis';btn.style.visibility='visible';btn.style.opacity='1';}catch(e){}});document.body.style.paddingBottom='24px';}catch(e){}}" +
                        "setInterval(fixActions,700);setTimeout(fixActions,500);setTimeout(fixActions,1200);setTimeout(fixActions,2600);setTimeout(fixActions,5200);}" +
                        "}else{" +
                        "m.content='width=device-width, initial-scale=1, maximum-scale=3, minimum-scale=1, user-scalable=yes, viewport-fit=cover';" +
                        "document.documentElement.style.minWidth='0';document.documentElement.style.width='100%';document.documentElement.style.height='100%';document.documentElement.style.minHeight='100%';document.documentElement.style.overflowX='hidden';document.documentElement.style.overflowY='auto';document.documentElement.style.background='#111';" +
                        "document.body.style.minWidth='0';document.body.style.width='100%';document.body.style.height='100%';document.body.style.minHeight='100vh';document.body.style.overflowX='hidden';document.body.style.overflowY='auto';document.body.style.background='#111';document.body.style.paddingBottom='0';" +
                        "st.textContent='html,body{min-width:0!important;width:100%!important;height:100%!important;min-height:100vh!important;overflow-x:hidden!important;overflow-y:auto!important;background:#111!important;}body>div,#__next,#app{min-height:100vh!important;background:#111!important;}*{-webkit-text-size-adjust:100%!important;}';" +
                        "}" +
                        "}catch(e){}" +
                        "})()", null);                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                return handleUrl(view, request.getUrl().toString());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(view, url);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> filePath, WebChromeClient.FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = filePath;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("video/*");
                try {
                    startActivityForResult(Intent.createChooser(intent, "Select video"), FILE_CHOOSER_REQUEST);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (savedInstanceState != null) {
            try {
                if (webView.restoreState(savedInstanceState) != null) return;
            } catch (Exception ignored) {}
        }

        String url = getIntent().getStringExtra("url");
        if (url == null || url.trim().isEmpty()) {
            url = "https://www.tiktok.com/tiktokstudio/upload";
        }
        webView.loadUrl(forceDesktopTikTokUrl(url));
    }

    private boolean handleUrl(WebView view, String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        if (lower.startsWith("intent:") || lower.startsWith("snssdk") || lower.startsWith("tiktok://")) {
            return true;
        }
        if (lower.startsWith("http://") || lower.startsWith("https://")) {
            String forced = forceDesktopTikTokUrl(url);
            if (!forced.equals(url)) {
                view.loadUrl(forced);
                return true;
            }
            return false;
        }
        return true;
    }

    private String forceDesktopTikTokUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "https://www.tiktok.com/tiktokstudio/upload";
        }
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (host == null) return url;
            String lowerHost = host.toLowerCase();
            if (lowerHost.equals("m.tiktok.com") || lowerHost.equals("vm.tiktok.com") || lowerHost.equals("vt.tiktok.com")) {
                Uri.Builder builder = uri.buildUpon();
                builder.authority("www.tiktok.com");
                return builder.build().toString();
            }
        } catch (Exception ignored) {}
        return url;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                Uri uri = data.getData();
                if (uri != null) results = new Uri[]{uri};
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) {
            try { webView.saveState(outState); } catch (Exception ignored) {}
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
            filePathCallback = null;
        }
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
`, 'utf8');

  fs.writeFileSync(path.join(packageDir, 'GalleryBridge.java'), `package ${packageName};

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import java.io.File;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class GalleryBridge {
    private final Context context;
    private final Map<String, SaveSession> sessions = new HashMap<>();

    private static class SaveSession {
        Uri uri;
        OutputStream out;
        SaveSession(Uri uri, OutputStream out) {
            this.uri = uri;
            this.out = out;
        }
    }

    public GalleryBridge(Context context) {
        this.context = context.getApplicationContext();
    }

    private String cleanFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) return "AlterE_video.mp4";
        StringBuilder cleaned = new StringBuilder();
        for (int i = 0; i < filename.length(); i++) {
            char c = filename.charAt(i);
            int code = (int) c;
            boolean bad = code == 92 || code == 47 || code == 58 || code == 42 || code == 63 || code == 34 || code == 60 || code == 62 || code == 124;
            cleaned.append(bad ? '_' : c);
        }
        return cleaned.toString();
    }

    private String cleanMimeType(String mimeType) {
        if (mimeType == null || mimeType.trim().isEmpty()) return "video/mp4";
        if (!mimeType.startsWith("video/")) return "video/mp4";
        return mimeType;
    }

    private Uri createVideoUri(String filename, String mimeType) throws Exception {
        ContentResolver resolver = context.getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, cleanFilename(filename));
        values.put(MediaStore.MediaColumns.MIME_TYPE, cleanMimeType(mimeType));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/Alter Editing Method");
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);
        } else {
            File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "Alter Editing Method");
            if (!dir.exists()) dir.mkdirs();
            File file = new File(dir, cleanFilename(filename));
            values.put(MediaStore.MediaColumns.DATA, file.getAbsolutePath());
        }

        Uri uri = resolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values);
        if (uri == null) throw new Exception("media_insert_failed");
        return uri;
    }

    private void markCompleted(Uri uri) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && uri != null) {
            ContentValues done = new ContentValues();
            done.put(MediaStore.MediaColumns.IS_PENDING, 0);
            context.getContentResolver().update(uri, done, null, null);
        }
    }

    private void deleteUri(Uri uri) {
        try {
            if (uri != null) context.getContentResolver().delete(uri, null, null);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public synchronized String beginSaveVideo(String filename, String mimeType) {
        try {
            Uri uri = createVideoUri(filename, mimeType);
            OutputStream out = context.getContentResolver().openOutputStream(uri);
            if (out == null) {
                deleteUri(uri);
                return "ERROR:stream_open_failed";
            }
            String token = UUID.randomUUID().toString();
            sessions.put(token, new SaveSession(uri, out));
            return token;
        } catch (Exception e) {
            return "ERROR:" + e.getMessage();
        }
    }

    @JavascriptInterface
    public synchronized String appendSaveVideoChunk(String token, String base64Chunk) {
        SaveSession session = sessions.get(token);
        if (session == null) return "ERROR:session_not_found";
        try {
            byte[] bytes = Base64.decode(base64Chunk, Base64.DEFAULT);
            session.out.write(bytes);
            return "OK";
        } catch (Exception e) {
            try { session.out.close(); } catch (Exception ignored) {}
            sessions.remove(token);
            deleteUri(session.uri);
            return "ERROR:" + e.getMessage();
        }
    }

    @JavascriptInterface
    public synchronized String finishSaveVideo(String token) {
        SaveSession session = sessions.get(token);
        if (session == null) return "ERROR:session_not_found";
        try {
            session.out.flush();
            session.out.close();
            markCompleted(session.uri);
            sessions.remove(token);
            return session.uri.toString();
        } catch (Exception e) {
            try { session.out.close(); } catch (Exception ignored) {}
            sessions.remove(token);
            deleteUri(session.uri);
            return "ERROR:" + e.getMessage();
        }
    }

    @JavascriptInterface
    public synchronized String abortSaveVideo(String token) {
        SaveSession session = sessions.get(token);
        if (session == null) return "OK";
        try { session.out.close(); } catch (Exception ignored) {}
        sessions.remove(token);
        deleteUri(session.uri);
        return "OK";
    }

    @JavascriptInterface
    public String saveVideo(String filename, String base64, String mimeType) {
        String token = beginSaveVideo(filename, mimeType);
        if (token == null || token.startsWith("ERROR:")) return token;
        String chunkResult = appendSaveVideoChunk(token, base64);
        if (!"OK".equals(chunkResult)) {
            abortSaveVideo(token);
            return chunkResult;
        }
        return finishSaveVideo(token);
    }
}
`, 'utf8');
  console.log('Android GalleryBridge patched.');
}

console.log('Android cleartext/network config patched.');
