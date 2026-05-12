import { CapacitorHttp } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { APP_VERSION, UPDATE_REPO } from './app-version.js';

const DEFAULT_AUTH_API_BASE = 'http://132.243.30.159:3000';
const DEFAULT_AUTH_API_FALLBACKS = ['http://83.147.241.28:3000'];
const DEFAULT_TELEGRAM_CHANNEL_URL = 'https://t.me/alterediting';
const DEFAULT_TELEGRAM_BOT_URL = 'https://t.me/AlterEditing_bot';

const PATCH_BYTES = new Uint8Array([0x10, 0x00, 0x00, 0x01]);
const ELST_SIGNATURE = [0x65, 0x6c, 0x73, 0x74, 0x00, 0x00, 0x00, 0x00];
const SUPPORTED_EXTENSIONS = ['.mp4', '.mov'];

let runtimeConfig = null;
let selectedFile = null;
let selectedFileUrl = '';
const progressCallbacks = new Set();
const settingsCallbacks = new Set();
const appStateCallbacks = new Set();

const emitProgress = value => { for (const cb of progressCallbacks) cb(value); };
const extOf = (name = '') => { const i = name.lastIndexOf('.'); return i >= 0 ? name.slice(i).toLowerCase() : ''; };

function notifyAppState(isActive){
  for(const cb of appStateCallbacks){
    try{ cb(Boolean(isActive)); }catch(_){ }
  }
}
try{
  App.addListener('appStateChange', ({ isActive }) => notifyAppState(isActive));
  App.addListener('resume', () => notifyAppState(true));
  App.addListener('pause', () => notifyAppState(false));
}catch(_){ }

const normalizeBaseUrl = v => String(v || '').replace(/\/+$/, '');

function uniqueBases(primary, fallbacks = []) {
  const list = [primary, ...(Array.isArray(fallbacks) ? fallbacks : String(fallbacks || '').split(','))]
    .map(x => normalizeBaseUrl(x.trim()))
    .filter(Boolean);
  return [...new Set(list)];
}

function readLocalConfig() {
  return {
    authApiBase: localStorage.getItem('alter_auth_api_base') || DEFAULT_AUTH_API_BASE,
    authApiFallbacks: JSON.parse(localStorage.getItem('alter_auth_api_fallbacks') || '[]'),
    telegramChannelUrl: localStorage.getItem('alter_telegram_channel_url') || DEFAULT_TELEGRAM_CHANNEL_URL,
    telegramBotUrl: localStorage.getItem('alter_telegram_bot_url') || DEFAULT_TELEGRAM_BOT_URL
  };
}

function saveRuntimeConfig(config = {}) {
  const normalized = {
    authApiBase: normalizeBaseUrl(config.authApiBase || config.auth_api_base || config.ALTERE_AUTH_API_BASE || config.baseUrl || config.base_url || DEFAULT_AUTH_API_BASE),
    authApiFallbacks: Array.isArray(config.authApiFallbacks || config.auth_api_fallbacks || config.ALTERE_AUTH_API_FALLBACKS || config.fallbacks)
      ? (config.authApiFallbacks || config.auth_api_fallbacks || config.ALTERE_AUTH_API_FALLBACKS || config.fallbacks).map(normalizeBaseUrl).filter(Boolean)
      : String(config.authApiFallbacks || config.auth_api_fallbacks || config.ALTERE_AUTH_API_FALLBACKS || config.fallbacks || '').split(',').map(x => normalizeBaseUrl(x.trim())).filter(Boolean),
    telegramChannelUrl: config.telegramChannelUrl || config.telegram_channel_url || config.ALTERE_TELEGRAM_CHANNEL_URL || DEFAULT_TELEGRAM_CHANNEL_URL,
    telegramBotUrl: config.telegramBotUrl || config.telegram_bot_url || config.ALTERE_TELEGRAM_BOT_URL || DEFAULT_TELEGRAM_BOT_URL,
    platform: 'android'
  };
  localStorage.setItem('alter_auth_api_base', normalized.authApiBase);
  localStorage.setItem('alter_auth_api_fallbacks', JSON.stringify(normalized.authApiFallbacks));
  localStorage.setItem('alter_telegram_channel_url', normalized.telegramChannelUrl);
  localStorage.setItem('alter_telegram_bot_url', normalized.telegramBotUrl);
  runtimeConfig = normalized;
  return normalized;
}

async function fetchJsonAbsolute(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  let data = undefined;
  if (typeof options.body === 'string' && options.body.length) {
    try {
      data = JSON.parse(options.body);
    } catch (_) {
      data = options.body;
    }
  } else if (options.body && typeof options.body === 'object') {
    data = options.body;
  }

  try {
    const response = await CapacitorHttp.request({
      url,
      method,
      headers,
      data,
      connectTimeout: 15000,
      readTimeout: 15000
    });

    const status = Number(response.status || 0);

    if (status >= 200 && status < 300) {
      if (typeof response.data === 'string') {
        try {
          return response.data ? JSON.parse(response.data) : {};
        } catch (_) {
          return { raw: response.data };
        }
      }

      return response.data || {};
    }

    throw new Error(`HTTP ${status}: ${typeof response.data === 'string' ? response.data : JSON.stringify(response.data || {})}`);
  } catch (nativeError) {
    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      const text = await res.text();

      let parsed = {};
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch (_) {
        parsed = { raw: text };
      }

      if (res.ok) return parsed;

      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    } catch (fetchError) {
      throw new Error(`NativeHTTP: ${nativeError?.message || nativeError}; Fetch: ${fetchError?.message || fetchError}`);
    }
  }
}

async function getRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig;
  const local = readLocalConfig();
  const bases = uniqueBases(local.authApiBase, local.authApiFallbacks);
  for (const base of bases) {
    try {
      const data = await fetchJsonAbsolute(`${base}/client-config`, { method: 'GET', cache: 'no-store' });
      return saveRuntimeConfig(data);
    } catch (_) {}
  }
  return saveRuntimeConfig(local);
}

async function tryFetch(pathOrUrl, options = {}) {
  if (/^https?:\/\//i.test(pathOrUrl)) return fetchJsonAbsolute(pathOrUrl, options);
  const cfg = await getRuntimeConfig();
  const bases = uniqueBases(cfg.authApiBase, cfg.authApiFallbacks);
  let lastError = null;
  for (const base of bases) {
    try { return await fetchJsonAbsolute(`${base}${pathOrUrl}`, options); }
    catch (e) { lastError = e; }
  }
  throw lastError || new Error('Auth server unavailable');
}

function defaultSettings() {
  const local = readLocalConfig();
  return {
    language: localStorage.getItem('alter_language') || 'en',
    theme: localStorage.getItem('alter_theme') || 'dark',
    performanceMode: localStorage.getItem('alter_performance_mode') || 'auto',
    authorized: localStorage.getItem('alter_authorized') === '1',
    authToken: localStorage.getItem('alter_auth_token') || '',
    authApiBase: local.authApiBase,
    authApiFallbacks: local.authApiFallbacks,
    telegramChannelUrl: local.telegramChannelUrl,
    telegramBotUrl: local.telegramBotUrl
  };
}

async function getStoredSettings() {
  try {
    const { value } = await Preferences.get({ key: 'alter_settings' });
    if (value) return { ...defaultSettings(), ...JSON.parse(value) };
  } catch (_) {}
  return defaultSettings();
}

async function saveSettings(patch) {
  const current = await getStoredSettings();
  const next = { ...current, ...patch };
  localStorage.setItem('alter_language', next.language || 'en');
  localStorage.setItem('alter_theme', next.theme || 'dark');
  localStorage.setItem('alter_performance_mode', next.performanceMode || 'auto');
  localStorage.setItem('alter_authorized', next.authorized ? '1' : '0');
  localStorage.setItem('alter_auth_token', next.authToken || next.token || '');
  try { await Preferences.set({ key: 'alter_settings', value: JSON.stringify(next) }); } catch (_) {}
  for (const cb of settingsCallbacks) cb(next);
  return next;
}

function extractAuthToken(data) {
  return data?.session_token || data?.sessionToken || data?.session_id || data?.sessionId || data?.token || data?.id || data?.authToken || data?.auth_token || '';
}

async function normalizeTelegramUrl(data, token) {
  const cfg = await getRuntimeConfig();
  let url = data?.auth_url || data?.authUrl || data?.telegram_url || data?.telegramUrl || data?.bot_url || data?.botUrl || '';
  if (!url) url = `${cfg.telegramBotUrl || DEFAULT_TELEGRAM_BOT_URL}?start=auth_${encodeURIComponent(token)}`;
  if (url.includes('{token}')) return url.replaceAll('{token}', encodeURIComponent(token));
  if (token && url.includes(token)) return url;
  if (token && /start=auth($|&|#)/i.test(url)) return url.replace(/start=auth/i, `start=auth_${encodeURIComponent(token)}`);
  if (token && !url.includes('start=')) return `${url}${url.includes('?') ? '&' : '?'}start=auth_${encodeURIComponent(token)}`;
  return url;
}

async function normalizeSessionResponse(data) {
  const token = extractAuthToken(data);
  const telegramUrl = await normalizeTelegramUrl(data, token);
  return { ...(data || {}), session_token: token, token, auth_url: telegramUrl, telegram_url: telegramUrl };
}

async function createAuthSession() {
  await getRuntimeConfig();
  const payloads = [{ platform: 'android', source: 'mobile', bot: 'AlterEditing_bot' }, { platform: 'desktop' }, {}];
  const endpoints = ['/auth/request', '/auth/create-session'];
  let lastError = null;
  for (const endpoint of endpoints) {
    for (const payload of payloads) {
      try {
        const result = await tryFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const normalized = await normalizeSessionResponse(result);
        if (normalized?.session_token) return normalized;
        lastError = new Error(`Bad auth session response: ${JSON.stringify(result)}`);
      } catch (e) { lastError = e; }
    }
  }
  throw lastError || new Error('auth_session_not_created');
}

async function getAuthStatus(token) {
  if (!token) throw new Error('missing_auth_token');
  const safe = encodeURIComponent(token);
  const endpoints = [`/auth/session/${safe}`, `/auth/status/${safe}`];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const result = await tryFetch(endpoint);
      const status = String(result?.status || result?.state || result?.result || '').toLowerCase();
      const nestedStatus = String(result?.data?.status || result?.data?.state || result?.data?.result || '').toLowerCase();
      const negativeStatus = ['pending', 'waiting', 'created', 'new', 'requested', 'unauthorized', 'not_authorized', 'denied', 'expired', 'false', 'error'].includes(status)
        || ['pending', 'waiting', 'created', 'new', 'requested', 'unauthorized', 'not_authorized', 'denied', 'expired', 'false', 'error'].includes(nestedStatus);
      const positiveStatus = ['authorized', 'approved', 'verified', 'subscribed', 'member', 'active', 'allowed'].includes(status)
        || ['authorized', 'approved', 'verified', 'subscribed', 'member', 'active', 'allowed'].includes(nestedStatus);
      const positiveFlag = result?.authorized === true
        || result?.access === true
        || result?.subscribed === true
        || result?.subscription === true
        || result?.member === true
        || result?.verified === true
        || result?.approved === true
        || result?.data?.authorized === true
        || result?.data?.access === true
        || result?.data?.subscribed === true
        || result?.data?.subscription === true
        || result?.data?.member === true
        || result?.data?.verified === true
        || result?.data?.approved === true;

      if (!negativeStatus && (positiveStatus || positiveFlag)) {
        return { ...result, authorized: true, status: 'authorized' };
      }

      return { ...(result || {}), authorized: false, status: result?.status || result?.state || result?.data?.status || result?.data?.state || 'pending' };
    } catch (e) { lastError = e; }
  }
  throw lastError || new Error('auth_status_failed');
}

function findElstPatchOffset(bytes) {
  const max = bytes.length - 12;
  for (let i = 0; i <= max; i++) {
    let ok = true;
    for (let j = 0; j < ELST_SIGNATURE.length; j++) {
      if (bytes[i + j] !== ELST_SIGNATURE[j]) { ok = false; break; }
    }
    if (ok) return i + 8;
  }
  return -1;
}

async function patchFileToBlob(file) {
  if (!file) throw new Error('No selected video.');
  const ext = extOf(file.name);
  if (!SUPPORTED_EXTENSIONS.includes(ext)) throw new Error('Only MP4 and MOV are supported.');
  emitProgress(5);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  emitProgress(40);
  const offset = findElstPatchOffset(bytes);
  if (offset < 0) throw new Error('This video format is not supported for patching.');
  const already = PATCH_BYTES.every((b, i) => bytes[offset + i] === b);
  if (already) throw new Error('This video is already patched.');
  bytes.set(PATCH_BYTES, offset);
  emitProgress(85);
  return new Blob([bytes], { type: file.type || 'video/mp4' });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      resolve(value.includes(',') ? value.split(',').pop() : value);
    };
    reader.onerror = () => reject(reader.error || new Error('blob_read_failed'));
    reader.readAsDataURL(blob);
  });
}



function hasNativeChunkedGalleryBridge() {
  const nativeBridge = window.AlterGallery;
  return Boolean(nativeBridge &&
    typeof nativeBridge.beginSaveVideo === 'function' &&
    typeof nativeBridge.appendSaveVideoChunk === 'function' &&
    typeof nativeBridge.finishSaveVideo === 'function');
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const block = 0x8000;
  for (let i = 0; i < bytes.length; i += block) {
    binary += String.fromCharCode(...bytes.subarray(i, i + block));
  }
  return btoa(binary);
}

function findSignatureInBytes(bytes, signature) {
  const max = bytes.length - signature.length;
  for (let i = 0; i <= max; i++) {
    let ok = true;
    for (let j = 0; j < signature.length; j++) {
      if (bytes[i + j] !== signature[j]) { ok = false; break; }
    }
    if (ok) return i;
  }
  return -1;
}

async function patchFileToGalleryStreaming(file, filename) {
  if (!hasNativeChunkedGalleryBridge()) return null;
  if (!file) throw new Error('No selected video.');
  const ext = extOf(file.name);
  if (!SUPPORTED_EXTENSIONS.includes(ext)) throw new Error('Only MP4 and MOV are supported.');

  const nativeBridge = window.AlterGallery;
  const mimeType = file.type || (ext === '.mov' ? 'video/quicktime' : 'video/mp4');
  const token = String(nativeBridge.beginSaveVideo(filename, mimeType) || '');
  if (!token || token.startsWith('ERROR:')) {
    throw new Error(token.replace(/^ERROR:/, '') || 'gallery_begin_failed');
  }

  const chunkSize = ((navigator.deviceMemory && navigator.deviceMemory <= 3) ? 512 : 768) * 1024; // smaller chunks reduce memory spikes on old Android WebViews.
  const overlap = ELST_SIGNATURE.length + PATCH_BYTES.length - 1;
  let pending = new Uint8Array(0);
  let patched = false;

  const appendBytes = bytes => {
    if (!bytes || !bytes.byteLength) return;
    const base64 = arrayBufferToBase64(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    const result = String(nativeBridge.appendSaveVideoChunk(token, base64) || '');
    if (result !== 'OK') throw new Error(result.replace(/^ERROR:/, '') || 'gallery_chunk_failed');
  };

  try {
    for (let start = 0; start < file.size; start += chunkSize) {
      const end = Math.min(file.size, start + chunkSize);
      const originalChunk = new Uint8Array(await file.slice(start, end).arrayBuffer());
      const scan = new Uint8Array(pending.length + originalChunk.length);
      scan.set(pending, 0);
      scan.set(originalChunk, pending.length);

      if (!patched) {
        const sigIndex = findSignatureInBytes(scan, ELST_SIGNATURE);
        if (sigIndex >= 0) {
          const patchStartInScan = sigIndex + ELST_SIGNATURE.length;
          const patchEndInScan = patchStartInScan + PATCH_BYTES.length;
          const current = scan.subarray(patchStartInScan, patchEndInScan);
          const alreadyPatched = current.length === PATCH_BYTES.length && PATCH_BYTES.every((b, i) => current[i] === b);
          if (alreadyPatched) throw new Error('This video is already patched.');
          scan.set(PATCH_BYTES, patchStartInScan);
          patched = true;
        }
      }

      const writeLength = Math.max(0, scan.length - overlap);
      appendBytes(scan.subarray(0, writeLength));
      pending = scan.slice(writeLength);
      emitProgress(Math.min(95, 8 + Math.round((end / file.size) * 84)));
    }

    if (!patched) throw new Error('This video format is not supported for patching.');
    appendBytes(pending);
    pending = new Uint8Array(0);
    const result = String(nativeBridge.finishSaveVideo(token) || '');
    if (result && !result.startsWith('ERROR:')) return result;
    throw new Error(result.replace(/^ERROR:/, '') || 'gallery_finish_failed');
  } catch (error) {
    try { nativeBridge.abortSaveVideo?.(token); } catch (_) {}
    throw error;
  }
}

async function saveVideoToGallery(blob, filename) {
  const nativeBridge = window.AlterGallery;
  if (!nativeBridge) {
    throw new Error('Gallery save bridge is unavailable. Rebuild the APK and install the Android version so the patched video can be saved directly to Gallery.');
  }

  const mimeType = blob.type || 'video/mp4';
  const base64 = await blobToBase64(blob);

  // Prefer the chunked native bridge. Some Android WebView versions throw
  // "Java exception was raised during method invocation" when one very large
  // Base64 string is passed into @JavascriptInterface. Chunks keep the call
  // size small and make saving stable on more phones.
  if (typeof nativeBridge.beginSaveVideo === 'function' &&
      typeof nativeBridge.appendSaveVideoChunk === 'function' &&
      typeof nativeBridge.finishSaveVideo === 'function') {
    const token = String(nativeBridge.beginSaveVideo(filename, mimeType) || '');
    if (!token || token.startsWith('ERROR:')) {
      throw new Error(token.replace(/^ERROR:/, '') || 'gallery_begin_failed');
    }

    const chunkSize = 64 * 1024; // must stay divisible by 4 for Base64 decoding
    try {
      for (let i = 0; i < base64.length; i += chunkSize) {
        const chunk = base64.slice(i, i + chunkSize);
        const part = String(nativeBridge.appendSaveVideoChunk(token, chunk) || '');
        if (part !== 'OK') {
          throw new Error(part.replace(/^ERROR:/, '') || 'gallery_chunk_failed');
        }
      }
      const result = String(nativeBridge.finishSaveVideo(token) || '');
      if (result && !result.startsWith('ERROR:')) return result;
      throw new Error(result.replace(/^ERROR:/, '') || 'gallery_finish_failed');
    } catch (error) {
      try { nativeBridge.abortSaveVideo?.(token); } catch (_) {}
      throw error;
    }
  }

  // Backward fallback for older APK builds.
  if (typeof nativeBridge.saveVideo === 'function') {
    const result = String(nativeBridge.saveVideo(filename, base64, mimeType) || '');
    if (result && !result.startsWith('ERROR:')) return result;
    throw new Error(result.replace(/^ERROR:/, '') || 'gallery_save_failed');
  }

  throw new Error('Gallery save bridge is unavailable. Rebuild the APK and install the Android version so the patched video can be saved directly to Gallery.');
}

window.alterMobile = {
  setSelectedFile(file) {
    selectedFile = file || null;
    if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
    selectedFileUrl = file ? URL.createObjectURL(file) : '';
    return selectedFileUrl;
  },
  getSelectedFile() { return selectedFile; }
};



function nativeMediaAccessStatus() {
  try {
    const result = String(window.AlterMediaPermissions?.hasVideoAccess?.() || 'unavailable');
    return result.startsWith('ERROR:') ? 'unavailable' : result;
  } catch (_) {
    return 'unavailable';
  }
}

function nativeRequestMediaAccess() {
  try {
    const result = String(window.AlterMediaPermissions?.requestMediaAccess?.() || 'unavailable');
    return result.startsWith('ERROR:') ? 'unavailable' : result;
  } catch (_) {
    return 'unavailable';
  }
}

function nativeKeepAliveStart(reason = 'working') {
  try {
    const result = String(window.AlterKeepAlive?.start?.(String(reason)) || '');
    return result && !result.startsWith('ERROR:');
  } catch (_) {
    return false;
  }
}

function nativeKeepAliveStop(reason = 'done') {
  try {
    const result = String(window.AlterKeepAlive?.stop?.(String(reason)) || '');
    return result && !result.startsWith('ERROR:');
  } catch (_) {
    return false;
  }
}

function nativePerformanceProfile() {
  try {
    const raw = String(window.AlterPerformance?.profile?.() || '{}');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function normalizeVersion(value = '') {
  return String(value || '0.0.0')
    .trim()
    .replace(/^v/i, '')
    .replace(/[^0-9.].*$/, '') || '0.0.0';
}

function compareVersions(a, b) {
  const aa = normalizeVersion(a).split('.').map(x => parseInt(x || '0', 10));
  const bb = normalizeVersion(b).split('.').map(x => parseInt(x || '0', 10));
  const len = Math.max(aa.length, bb.length, 3);
  for (let i = 0; i < len; i++) {
    const av = aa[i] || 0;
    const bv = bb[i] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function chooseAndroidApkAsset(release = {}) {
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const apks = assets.filter(a => /\.apk$/i.test(a?.name || '') && a?.browser_download_url);
  if (!apks.length) return null;
  const preferred = apks.find(a => /alter|method|mobile/i.test(a.name) && !/unaligned|unsigned/i.test(a.name));
  return preferred || apks.find(a => !/unaligned|unsigned/i.test(a.name)) || apks[0];
}

async function checkForAppUpdate() {
  const repo = String(UPDATE_REPO || '').trim();
  if (!repo || !repo.includes('/')) return { status: 'disabled', currentVersion: APP_VERSION };
  try {
    const release = await fetchJsonAbsolute(`https://api.github.com/repos/${repo}/releases/latest`, {
      method: 'GET',
      headers: { Accept: 'application/vnd.github+json' }
    });
    const latestVersion = normalizeVersion(release?.tag_name || release?.name || '');
    const asset = chooseAndroidApkAsset(release);
    const hasUpdate = Boolean(asset && latestVersion && compareVersions(latestVersion, APP_VERSION) > 0);
    return {
      status: hasUpdate ? 'available' : 'current',
      currentVersion: APP_VERSION,
      latestVersion,
      repo,
      releaseName: release?.name || release?.tag_name || latestVersion,
      releaseUrl: release?.html_url || `https://github.com/${repo}/releases/latest`,
      apkName: asset?.name || '',
      apkUrl: asset?.browser_download_url || ''
    };
  } catch (error) {
    return { status: 'error', currentVersion: APP_VERSION, repo, error: String(error?.message || error) };
  }
}

async function openUpdateInstall(target) {
  const url = typeof target === 'string' ? target : (target?.apkUrl || target?.releaseUrl || '');
  const name = typeof target === 'string' ? 'AlterEditingMethod-update.apk' : (target?.apkName || 'AlterEditingMethod-update.apk');
  if (!url) return false;

  // Use the native Android installer bridge. Do NOT open the GitHub APK in Browser:
  // Chrome/Custom Tabs can download the file but often cannot open/install it from
  // the notification. Native bridge downloads the APK into app cache and launches
  // Android's package installer directly.
  try {
    const bridge = window.AlterUpdate;
    if (bridge && typeof bridge.installApk === 'function') {
      const result = bridge.installApk(String(url), String(name));
      if (result === 'OK' || result === 'BUSY') return true;
      console.warn('AlterUpdate.installApk returned:', result);
    } else {
      console.warn('AlterUpdate native bridge is unavailable. Rebuild and install the APK with the new native bridge.');
    }
  } catch (error) {
    console.warn('AlterUpdate native bridge failed:', error);
  }

  alert('Не удалось открыть установщик автоматически. Установите APK из уведомления или обновите приложение после новой сборки с native installer.');
  return false;
}

window.alterE = {
  window: { minimize: async () => {}, close: async () => App.exitApp?.() },
  background: {
    start: async reason => nativeKeepAliveStart(reason),
    stop: async reason => nativeKeepAliveStop(reason)
  },
  mediaPermissions: {
    status: async () => nativeMediaAccessStatus(),
    request: async () => nativeRequestMediaAccess()
  },
  performance: {
    profile: async () => nativePerformanceProfile()
  },
  settings: { get: getStoredSettings, update: saveSettings, onChanged: cb => { settingsCallbacks.add(cb); return () => settingsCallbacks.delete(cb); } },
  dialog: { selectVideo: async () => '__mobile_file_picker__', saveOutput: async ({ defaultPath } = {}) => defaultPath || '' },
  video: {
    getPathForFile: file => { window.alterMobile.setSelectedFile(file); return '__mobile_selected_file__'; },
    isSupported: async () => Boolean(selectedFile && SUPPORTED_EXTENSIONS.includes(extOf(selectedFile.name))),
    isAlreadyPatched: async () => {
      if (!selectedFile) return false;
      const chunkSize = 512 * 1024;
      const overlap = ELST_SIGNATURE.length + PATCH_BYTES.length - 1;
      let pending = new Uint8Array(0);
      for (let start = 0; start < selectedFile.size; start += chunkSize) {
        const end = Math.min(selectedFile.size, start + chunkSize);
        const part = new Uint8Array(await selectedFile.slice(start, end).arrayBuffer());
        const scan = new Uint8Array(pending.length + part.length);
        scan.set(pending, 0);
        scan.set(part, pending.length);
        const sigIndex = findSignatureInBytes(scan, ELST_SIGNATURE);
        if (sigIndex >= 0) {
          const patchStart = sigIndex + ELST_SIGNATURE.length;
          return PATCH_BYTES.every((b, i) => scan[patchStart + i] === b);
        }
        pending = scan.slice(Math.max(0, scan.length - overlap));
      }
      return false;
    },
    probe: async () => {
      if (!selectedFile) throw new Error('No selected video.');
      return { path: '__mobile_selected_file__', name: selectedFile.name, extension: extOf(selectedFile.name), sizeBytes: selectedFile.size, durationSeconds: 0, width: 0, height: 0, fps: 0, codec: '', hasAudio: false, videoBitrateKbps: 0, audioBitrateKbps: 0, objectUrl: selectedFileUrl };
    },
    patch: async ({ outputPath } = {}) => {
      if (!selectedFile) throw new Error('No selected video.');
      const ext = extOf(selectedFile.name) || '.mp4';
      const base = selectedFile.name.replace(/\.[^/.]+$/, '');
      const filename = `${base}_AlterE${ext}`;
      const streamedPath = await patchFileToGalleryStreaming(selectedFile, filename);
      if (streamedPath) {
        emitProgress(100);
        return { outputPath: streamedPath || outputPath || filename, mode: 'gallery-stream', outputBitrateKbps: 0 };
      }
      const blob = await patchFileToBlob(selectedFile);
      const savedPath = await saveVideoToGallery(blob, filename);
      emitProgress(100);
      return { outputPath: savedPath || outputPath || filename, mode: 'gallery', outputBitrateKbps: 0 };
    },
    cancel: async () => false,
    onProgress: cb => { progressCallbacks.add(cb); return () => progressCallbacks.delete(cb); }
  },
  shell: {
    openExternal: async url => Browser.open({ url }),
    openTikTokUpload: async url => {
      const target = url || 'https://www.tiktok.com/tiktokstudio/upload';
      try {
        if (window.AlterWeb && typeof window.AlterWeb.openTikTokUpload === 'function') {
          const result = String(window.AlterWeb.openTikTokUpload(target) || '');
          if (!result.startsWith('ERROR:')) return true;
        }
      } catch (_) {}
      return Browser.open({ url: target });
    },
    showItem: async () => {}
  },
  clipboard: { writeText: async text => navigator.clipboard?.writeText(text) },
  logs: { export: async text => { const blob = new Blob([text], { type: 'text/plain' }); downloadBlob(blob, 'alter-editing-logs.txt'); return true; } },
  app: { getRuntimeConfig, respondCloseConfirmation: async () => {}, onRequestCloseConfirmation: () => () => {}, onStateChange: cb => { appStateCallbacks.add(cb); return () => appStateCallbacks.delete(cb); } },
  update: { getState: async () => ({ status: 'idle', currentVersion: APP_VERSION }), check: checkForAppUpdate, download: async info => openUpdateInstall(info), install: async info => openUpdateInstall(info), dismissMandatory: async () => true, onState: () => () => {}, onLog: () => () => {} },
  auth: { createSession: createAuthSession, status: getAuthStatus, onDeepLink: () => () => {} }
};
