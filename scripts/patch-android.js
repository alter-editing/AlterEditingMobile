import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.join('android', 'app', 'src', 'main', 'AndroidManifest.xml');
const xmlDir = path.join('android', 'app', 'src', 'main', 'res', 'xml');
const networkConfigPath = path.join(xmlDir, 'network_security_config.xml');
const fileProviderPathsPath = path.join(xmlDir, 'file_paths.xml');

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

fs.writeFileSync(fileProviderPathsPath, `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <cache-path name="cache" path="." />
    <external-cache-path name="external_cache" path="." />
    <external-files-path name="external_files" path="." />
    <files-path name="files" path="." />
</paths>
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



if (!manifest.includes('android:name="androidx.core.content.FileProvider"')) {
  manifest = manifest.replace(
    '</application>',
    `    <provider
        android:name="androidx.core.content.FileProvider"
        android:authorities="${applicationId}.fileprovider"
        android:exported="false"
        android:grantUriPermissions="true">
        <meta-data
            android:name="android.support.FILE_PROVIDER_PATHS"
            android:resource="@xml/file_paths" />
    </provider>
</application>`
  );
}

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
        getBridge().getWebView().addJavascriptInterface(new UpdateBridge(this), "AlterUpdate");
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


  fs.writeFileSync(path.join(packageDir, 'UpdateBridge.java'), `package ${packageName};

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class UpdateBridge {
    private final Activity activity;
    private volatile boolean installing = false;

    public UpdateBridge(Activity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public String installApk(String apkUrl, String apkName) {
        if (apkUrl == null || apkUrl.trim().isEmpty()) return "ERROR:EMPTY_URL";
        if (installing) return "BUSY";
        installing = true;
        final String url = apkUrl.trim();
        final String name = sanitizeName(apkName == null || apkName.trim().isEmpty() ? "AlterEditingMethod-update.apk" : apkName.trim());
        toast("Скачиваем обновление...");
        new Thread(() -> {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !activity.getPackageManager().canRequestPackageInstalls()) {
                    installing = false;
                    toast("Разрешите установку из этого приложения и нажмите обновление ещё раз");
                    Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.getPackageName()));
                    settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(settingsIntent);
                    return;
                }
                File dir = new File(activity.getCacheDir(), "updates");
                if (!dir.exists()) dir.mkdirs();
                File apk = new File(dir, name.endsWith(".apk") ? name : name + ".apk");
                download(url, apk);
                if (!apk.exists() || apk.length() < 1024) throw new Exception("Downloaded APK is empty");
                activity.runOnUiThread(() -> openInstaller(apk));
            } catch (Exception e) {
                installing = false;
                toast("Не удалось скачать или открыть APK: " + e.getMessage());
            }
        }).start();
        return "OK";
    }

    private void download(String urlText, File outFile) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(urlText).openConnection();
        conn.setInstanceFollowRedirects(false);
        conn.setConnectTimeout(20000);
        conn.setReadTimeout(120000);
        conn.setRequestProperty("User-Agent", "AlterEditingMobileUpdater");
        conn.setRequestProperty("Accept", "application/octet-stream,*/*");
        conn.connect();
        int code = conn.getResponseCode();
        if (code >= 300 && code < 400) {
            String loc = conn.getHeaderField("Location");
            conn.disconnect();
            if (loc != null && !loc.isEmpty()) {
                download(loc, outFile);
                return;
            }
        }
        if (code < 200 || code >= 300) throw new Exception("HTTP " + code);
        try (InputStream in = conn.getInputStream(); FileOutputStream out = new FileOutputStream(outFile, false)) {
            byte[] buf = new byte[64 * 1024];
            int n;
            while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
            out.flush();
        } finally {
            conn.disconnect();
        }
    }

    private void openInstaller(File apk) {
        try {
            installing = false;
            Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", apk);
            Intent intent = new Intent(Intent.ACTION_INSTALL_PACKAGE);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true);
            intent.putExtra(Intent.EXTRA_RETURN_RESULT, false);
            activity.startActivity(intent);
        } catch (Exception first) {
            try {
                Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", apk);
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(uri, "application/vnd.android.package-archive");
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(intent);
            } catch (Exception second) {
                toast("Не удалось открыть установщик APK");
            } finally {
                installing = false;
            }
        }
    }

    private String sanitizeName(String name) {
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private void toast(String text) {
        try {
            activity.runOnUiThread(() -> Toast.makeText(activity, text, Toast.LENGTH_LONG).show());
        } catch (Exception ignored) {}
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
                        "var st=document.getElementById('alter-tiktok-safe-view-fix');" +
                        "if(!st){st=document.createElement('style');st.id='alter-tiktok-safe-view-fix';document.head.appendChild(st);}" +
                        "if(isStudio){" +
                        "var W=1280;var bg='#fff';" +
                        "m.content='width='+W+', initial-scale=1, maximum-scale=4, minimum-scale=0.25, user-scalable=yes';" +
                        "document.documentElement.style.minWidth=W+'px';document.documentElement.style.width=W+'px';document.documentElement.style.height='auto';document.documentElement.style.overflowX='auto';document.documentElement.style.overflowY='auto';document.documentElement.style.background=bg;" +
                        "document.body.style.minWidth=W+'px';document.body.style.width=W+'px';document.body.style.height='auto';document.body.style.minHeight='100vh';document.body.style.overflowX='auto';document.body.style.overflowY='auto';document.body.style.background=bg;document.body.style.paddingBottom='24px';" +
                        "st.textContent='html,body{min-width:1280px!important;width:1280px!important;height:auto!important;min-height:100vh!important;overflow-x:auto!important;overflow-y:auto!important;background:#fff!important;}body{padding-bottom:24px!important;}body>div,#__next,#app,[id*=root],[class*=layout],[class*=container]{background:#fff!important;}*{-webkit-text-size-adjust:100%!important;}';" +
                        "function txt(e){return ((e&&e.innerText)||'').replace(/\s+/g,' ').trim().toLowerCase();}" +
                        "function css(e,k,v){try{if(e)e.style.setProperty(k,v,'important');}catch(x){}}" +
                        "function fixUploadChooserCard(){try{" +
                        "var paneBg='#f3f3f3';" +
                        "css(document.documentElement,'background','#fff');css(document.body,'background','#fff');" +
                        "var keys=['выберите видео для загрузки','select video','choose video'];" +
                        "var nodes=[].slice.call(document.querySelectorAll('div,section,article'));" +
                        "nodes.forEach(function(n){try{" +
                        "var t=txt(n);var hit=false;for(var i=0;i<keys.length;i++){if(t.indexOf(keys[i])>=0){hit=true;break;}}if(!hit)return;" +
                        "var r=n.getBoundingClientRect();if(!r||r.width<120||r.height<60||r.width>700||r.height>420)return;" +
                        "css(n,'background',paneBg);css(n,'background-color',paneBg);css(n,'box-shadow','none');css(n,'border','0');css(n,'outline','0');" +
                        "var ch=[].slice.call(n.children||[]);ch.forEach(function(c){var ct=txt(c);if(ct.indexOf('выбрать видео')>=0||ct.indexOf('select video')>=0||ct.indexOf('choose video')>=0){return;}css(c,'background','transparent');css(c,'background-color','transparent');css(c,'box-shadow','none');css(c,'border','0');});" +
                        "var p=n.parentElement;for(var j=0;j<3&&p;j++){var pr=p.getBoundingClientRect();if(pr&&pr.width>r.width&&pr.height>r.height){css(p,'background',paneBg);css(p,'background-color',paneBg);}p=p.parentElement;}" +
                        "}catch(x){}});" +
                        "}catch(x){}}" +
                        "fixUploadChooserCard();var c=0;var timer=setInterval(function(){fixUploadChooserCard();c++;if(c>40)clearInterval(timer);},120);" +
                        "setTimeout(fixUploadChooserCard,400);setTimeout(fixUploadChooserCard,1000);setTimeout(fixUploadChooserCard,2200);setTimeout(fixUploadChooserCard,5000);" +
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
