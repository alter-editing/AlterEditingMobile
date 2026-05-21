const $ = id => document.getElementById(id);

const i18n = {
  en:{selectVideo:'Select video',changeVideo:'Change video',loaded:'Video loaded',noVideo:'Select a video first.',started:'Patch started',completed:'Patch completed',saved:'File saved:',failed:'Patch failed',unsupported:'Only MP4 and MOV videos are supported.',authorize:'Authorization',authText:'Confirm Telegram subscription to sign in.',authChecking:'Checking authorization...',authWaiting:'Confirm subscription in Telegram and return here.',authSuccess:'Successful authorization',authSuccessShort:'Successful authorization',authFailed:'Authorization failed. Try again.',settings:'Settings',logs:'Logs',language:'Language',themeDark:'Dark theme',themeLight:'Light theme',howToUse:'How to use',tutorialTitle:'How to use',tutorialText:'Select your video and press the "Patch" button, then you can publish the video.',logout:'Logout',copy:'Copy',export:'Export',noLogs:'Logs will appear after app actions.',patch:'Patch',upload:'Upload',dropTitle:'Select video',dropHint:'Drag a file here or tap to select',selectFromGallery:'Select from gallery',unsupportedPatchFormat:'The video is recorded in an incorrect MP4 container. Please transcode it or render it through CapCut or another convenient app.',processedSaved:'Processed video saved to gallery.',videoTooLarge:'This video is larger than 165 MB. The patcher cannot accept videos over 165 MB.',mediaAccessTitle:'Media access',mediaAccessText:'Allow access to all videos so the gallery can show your full video library.',performanceAuto:'Performance: Auto',performanceQuality:'Performance: Full visual',performanceLite:'Performance: Weak phone',updateAvailable:'New version available',updateText:'Version {version} is available. Install the update now.',installUpdate:'Install',later:'Later',currentVersion:'Current version',desktopUploadTitle:'Turn on full site mode',desktopUploadText:'Brave will open. If Brave is not installed, Google Play will open so you can install it. Follow the screenshot below after opening Brave.',desktopUploadStep1Title:'Instruction screenshot',desktopUploadStep1Text:'The screenshot shows which menu button to tap and which full-site button to choose.',desktopUploadStep2Title:'Step 2',desktopUploadStep2Text:'Continue uploading your video after switching to the full site.',desktopUploadConfirm:'Open Brave',desktopUploadCancel:'Cancel'},
  ru:{selectVideo:'Выбрать видео',changeVideo:'Выбрать другое видео',loaded:'Видео загружено',noVideo:'Сначала выберите видео.',started:'Патч запущен',completed:'Патч завершён',saved:'Файл сохранён:',failed:'Ошибка патча',unsupported:'Поддерживаются только MP4 и MOV видео.',authorize:'Авторизация',authText:'Подтвердите подписку в Telegram чтобы войти.',authChecking:'Проверяем авторизацию...',authWaiting:'Подтвердите подписку в Telegram и вернитесь сюда.',authSuccess:'Успешная авторизация',authSuccessShort:'Успешная авторизация',authFailed:'Ошибка авторизации. Попробуйте снова.',settings:'Настройки',logs:'Логи',language:'Язык',themeDark:'Тёмная тема',themeLight:'Светлая тема',howToUse:'Как использовать',tutorialTitle:'Как использовать',tutorialText:'Выберите ваше видео и нажмите кнопку "Patch", после чего вы можете опубликовать видео',logout:'Выйти',copy:'Копировать',export:'Экспорт',noLogs:'Логи появятся после действий в приложении.',patch:'Patch',upload:'Upload',dropTitle:'Выберите видео',dropHint:'Перетащите файл сюда или нажмите для выбора',selectFromGallery:'Выбрать из галереи',unsupportedPatchFormat:'Видео записано в неправильном контейнере mp4. Пожалуйста, перекодируйте его или зарендерите его через CapCut или другое удобное приложение',processedSaved:'Обработанное видео сохранено в галерее.',videoTooLarge:'Видео весит больше 165 МБ. Патчер не может принимать видео больше 165 МБ.',mediaAccessTitle:'Доступ к медиа',mediaAccessText:'Разрешите доступ ко всем видео, чтобы галерея показывала всю библиотеку.',performanceAuto:'Производительность: Авто',performanceQuality:'Производительность: Красиво',performanceLite:'Производительность: Слабый телефон',updateAvailable:'Вышла новая версия',updateText:'Доступна версия {version}. Установить обновление сейчас?',installUpdate:'Установить',later:'Позже',currentVersion:'Текущая версия',desktopUploadTitle:'Включите полную версию сайта',desktopUploadText:'Откроется Brave. Если Brave не установлен, откроется Google Play для установки. После открытия Brave следуйте скриншоту ниже.',desktopUploadStep1Title:'Скриншот-инструкция',desktopUploadStep1Text:'На скриншоте показано, какую кнопку меню нажать и какой пункт полной версии сайта выбрать.',desktopUploadStep2Title:'Шаг 2',desktopUploadStep2Text:'После переключения на полную версию сайта продолжите загрузку видео.',desktopUploadConfirm:'Понятно, открыть Brave',desktopUploadCancel:'Отмена'},
  tr:{selectVideo:'Video seç',changeVideo:'Başka video seç',loaded:'Video yüklendi',noVideo:'Önce bir video seçin.',started:'Patch başladı',completed:'Patch tamamlandı',saved:'Dosya kaydedildi:',failed:'Patch başarısız',unsupported:'Yalnızca MP4 ve MOV videolar desteklenir.',authorize:'Yetkilendirme',authText:'Giriş yapmak için Telegram aboneliğini onaylayın.',authChecking:'Yetki kontrol ediliyor...',authWaiting:'Telegram aboneliğini onaylayın ve buraya dönün.',authSuccess:'Başarılı yetkilendirme',authSuccessShort:'Başarılı yetkilendirme',authFailed:'Yetkilendirme başarısız. Tekrar deneyin.',settings:'Ayarlar',logs:'Kayıtlar',language:'Dil',themeDark:'Koyu tema',themeLight:'Açık tema',howToUse:'Nasıl kullanılır',tutorialTitle:'Nasıl kullanılır',tutorialText:'Videonuzu seçin ve "Patch" düğmesine basın, ardından videoyu yayınlayabilirsiniz.',logout:'Çıkış yap',copy:'Kopyala',export:'Dışa aktar',noLogs:'Uygulama işlemlerinden sonra kayıtlar burada görünecek.',patch:'Patch',upload:'Upload',dropTitle:'Video seç',dropHint:'Dosyayı buraya sürükleyin veya seçmek için dokunun',selectFromGallery:'Galeriden seç',unsupportedPatchFormat:'Video yanlış MP4 konteynerinde kaydedilmiş. Lütfen CapCut veya başka uygun bir uygulama ile yeniden kodlayın ya da render alın.',processedSaved:'İşlenen video galeriye kaydedildi.',videoTooLarge:'Bu video 165 MB’den büyük. Patcher 165 MB’den büyük videoları kabul edemez.',mediaAccessTitle:'Medya erişimi',mediaAccessText:'Galerinin tüm video kitaplığını göstermesi için tüm videolara erişime izin verin.',performanceAuto:'Performans: Otomatik',performanceQuality:'Performans: Tam görsel',performanceLite:'Performans: Zayıf telefon',updateAvailable:'Yeni sürüm çıktı',updateText:'{version} sürümü mevcut. Güncellemeyi şimdi yükleyin.',installUpdate:'Yükle',later:'Sonra',currentVersion:'Geçerli sürüm',desktopUploadTitle:'Tam site sürümünü açın',desktopUploadText:'Brave açılacak. Brave yüklü değilse yüklemek için Google Play açılacak. Brave açıldıktan sonra aşağıdaki ekran görüntüsünü takip edin.',desktopUploadStep1Title:'Talimat ekran görüntüsü',desktopUploadStep1Text:'Ekran görüntüsünde hangi menü düğmesine dokunacağınız ve hangi tam site seçeneğini seçeceğiniz gösteriliyor.',desktopUploadStep2Title:'Adım 2',desktopUploadStep2Text:'Tam siteye geçtikten sonra video yüklemeye devam edin.',desktopUploadConfirm:'Brave’i aç',desktopUploadCancel:'İptal'}
};

const state = { settings:null, file:null, fileUrl:'', working:false, logs:[], filePickerActive:false, externalAuthActive:false };
const UPDATE_DISMISSED_THIS_SESSION = new Set();
let lastUpdateCheckAt = 0;
const PERF = {
  lowEnd: (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4),
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  nativeProfile: {},
  saveTimer: 0
};
const VISUAL_RUNTIME = {
  paused: false,
  particlesStart: null,
  particlesStop: null
};
const AUTH_POLL_MAX_MS = 90 * 1000;
const AUTH_POLL_INTERVAL_MS = 2500;
let authPollActive = false;
let authClickLockedUntil = 0;
let authTapInProgress = false;
let lastLifecycleResumeAt = 0;
const MAX_ACCEPTED_VIDEO_BYTES = 165 * 1024 * 1024;
let fileInput;

function t(k){return (i18n[state.settings?.language || 'en'] || i18n.en)[k] || i18n.en[k] || k;}


function playAuthButtonAnimation(){
  const btn = $('authButton');
  if(!btn) return;
  btn.classList.remove('auth-button-tap-anim');
  void btn.offsetWidth;
  btn.classList.add('auth-button-tap-anim');
  setTimeout(()=>btn.classList.remove('auth-button-tap-anim'), 420);
}

function resetAuthButtonState(){
  const btn = $('authButton');
  if(btn){
    btn.disabled = false;
    btn.removeAttribute('disabled');
    btn.removeAttribute('aria-disabled');
    btn.classList.remove('is-disabled','disabled');
    btn.style.pointerEvents = 'auto';
    btn.style.touchAction = 'manipulation';
  }
  const overlay = $('authOverlay');
  if(overlay){
    overlay.style.pointerEvents = '';
  }
}


const DESKTOP_UPLOAD_IMAGES = {
  en:{
    step1:new URL('./assets/instructions/edge_full_instruction_en.jpg', import.meta.url).href,
    step2:''
  },
  ru:{
    step1:new URL('./assets/instructions/edge_full_instruction_ru.jpg', import.meta.url).href,
    step2:''
  },
  tr:{
    step1:new URL('./assets/instructions/edge_full_instruction_tr.jpg', import.meta.url).href,
    step2:''
  }
};

function applyDesktopInstructionImages(){
  const lang = state.settings?.language || 'en';
  const pack = DESKTOP_UPLOAD_IMAGES[lang] || DESKTOP_UPLOAD_IMAGES.en;
  const img1 = $('desktopUploadStep1Image');
  const img2 = $('desktopUploadStep2Image');
  if(img1){ img1.src = pack.step1; img1.alt = t('desktopUploadStep1Title'); }
  if(img2){
    if(pack.step2){ img2.src = pack.step2; img2.alt = t('desktopUploadStep2Title'); }
    else { img2.removeAttribute('src'); img2.alt = ''; }
  }
}

function isServerAuthorized(st){
  if(!st || typeof st !== 'object') return false;
  const status = String(st.status || st.state || st.result || '').toLowerCase();
  const nestedStatus = String(st.data?.status || st.data?.state || st.data?.result || '').toLowerCase();
  const positiveStatus = ['authorized','approved','verified','subscribed','member','active','allowed'].includes(status)
    || ['authorized','approved','verified','subscribed','member','active','allowed'].includes(nestedStatus);
  const positiveFlag = st.authorized === true
    || st.access === true
    || st.subscribed === true
    || st.subscription === true
    || st.member === true
    || st.verified === true
    || st.approved === true
    || st.data?.authorized === true
    || st.data?.access === true
    || st.data?.subscribed === true
    || st.data?.subscription === true
    || st.data?.member === true
    || st.data?.verified === true
    || st.data?.approved === true;
  const negativeStatus = ['pending','waiting','created','new','requested','unauthorized','not_authorized','denied','expired','false','error'].includes(status)
    || ['pending','waiting','created','new','requested','unauthorized','not_authorized','denied','expired','false','error'].includes(nestedStatus);
  return !negativeStatus && (positiveStatus || positiveFlag);
}
function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function fmt(bytes){if(!bytes)return '-';const mb=bytes/1024/1024;return `${mb.toFixed(mb>=100?0:1)} MB`;}
function isVideoTooLarge(file){return Boolean(file && Number(file.size) > MAX_ACCEPTED_VIDEO_BYTES);}
function showTooLargeToast(){toast(t('failed'),t('videoTooLarge'));}

async function readFileHeaderBytes(file, start, length){
  const buf = await file.slice(start, Math.min(file.size, start + length)).arrayBuffer();
  return new Uint8Array(buf);
}
function atomTypeFromHeader(bytes, offset=4){
  return String.fromCharCode(bytes[offset]||0, bytes[offset+1]||0, bytes[offset+2]||0, bytes[offset+3]||0);
}
async function hasValidMp4MovStructure(file){
  if(!file || !file.size || file.size < 24) return false;
  let offset = 0;
  let foundFtyp = false;
  let foundMoov = false;
  let foundMdat = false;
  let boxes = 0;
  while(offset + 8 <= file.size && boxes < 4096){
    boxes += 1;
    const head = await readFileHeaderBytes(file, offset, 16).catch(()=>null);
    if(!head || head.length < 8) return false;
    const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
    let size = view.getUint32(0, false);
    const type = atomTypeFromHeader(head, 4);
    if(type === 'ftyp') foundFtyp = true;
    if(type === 'moov') foundMoov = true;
    if(type === 'mdat') foundMdat = true;
    if(size === 1){
      if(head.length < 16) return false;
      const high = view.getUint32(8, false);
      const low = view.getUint32(12, false);
      size = high * 4294967296 + low;
    }else if(size === 0){
      if(type === 'mdat') foundMdat = true;
      break;
    }
    if(!type || /[^A-Za-z0-9 _-]/.test(type) || !Number.isFinite(size) || size < 8) return false;
    offset += size;
    if(foundFtyp && foundMoov && foundMdat) return true;
  }
  return Boolean(foundFtyp && foundMoov && foundMdat);
}
function showInvalidMp4MovToast(fileName=''){
  toast(t('failed'), t('unsupportedPatchFormat'));
  log('error','unsupportedPatchFormat',fileName);
}
function resetFilePicker(){
  if(fileInput){
    try{fileInput.value='';}catch(_){fileInput.type='text';fileInput.type='file';fileInput.accept='video/mp4,video/quicktime,.mp4,.mov';}
  }
}

async function requestFullMediaAccess({force=false,silent=false}={}){
  try{
    const api=window.alterE?.mediaPermissions;
    if(!api?.request) return 'unavailable';
    const status=await api.status?.().catch(()=>'unavailable');
    if(status==='granted' || status==='limited') return status;
    const prompted=localStorage.getItem('alter_media_permission_prompted')==='1';
    if(!force && prompted) return status || 'denied';
    localStorage.setItem('alter_media_permission_prompted','1');
    if(!silent) toast(t('mediaAccessTitle'),t('mediaAccessText'));
    return await api.request().catch(()=>'unavailable');
  }catch(_){return 'unavailable';}
}

async function openVideoPicker(){
  try{ await window.alterE?.background?.start?.('file-picker'); }catch(_){ }

  // First ask Android for full media access. Do not open the gallery while the
  // system permission sheet is still closing: on Samsung/Android 14 this caused
  // the file picker bottom sheet to immediately cover the permission dialog.
  const statusBefore=await window.alterE?.mediaPermissions?.status?.().catch(()=>'unavailable');
  const needsPermission = statusBefore === 'denied';

  if(needsPermission){
    markExternalTransition('file',true);
    const result=await requestFullMediaAccess({force:true,silent:false});
    markExternalTransition('file',false);
    try{ setTimeout(()=>window.alterE?.background?.stop?.('file-permission'),900); }catch(_){ }

    // Native requestPermissions returns before the user fully finishes the system
    // UI. Keep the action stable and let the next tap open the gallery.
    if(result==='requesting' || result==='denied' || result==='limited' || result==='unavailable') return;
  }

  markExternalTransition('file',true);
  const open=()=>{ try{ resetFilePicker(); fileInput.click(); }catch(_){ markExternalTransition('file',false); } };
  requestAnimationFrame(open);
}
function toast(title,text=''){const h=$('toastHost');if(!h)return;title=cleanUiText(title);text=cleanUiText(text);const e=document.createElement('div');e.className='toast';e.innerHTML=`<strong>${esc(title)}</strong>${text?`<span>${esc(text)}</span>`:''}`;h.appendChild(e);requestAnimationFrame(()=>e.classList.add('is-visible'));const life = Math.min(6200, 2800 + Math.max(String(text||'').length, String(title||'').length) * 45);
  setTimeout(()=>{e.classList.remove('is-visible');setTimeout(()=>e.remove(),360)},life);}
function log(level,key,details=''){state.logs.unshift({time:new Date().toLocaleTimeString(),level,key,details});state.logs=state.logs.slice(0,120);renderLogs();}
function logo(c){if(!c)return;const x=c.getContext('2d'),w=c.width;x.clearRect(0,0,w,w);x.save();x.translate(w/2,w/2);x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=Math.max(2,w/26);x.shadowColor='rgba(142,230,255,.45)';x.shadowBlur=w/8;x.beginPath();x.arc(0,0,w*.28,0,Math.PI*2);x.stroke();x.beginPath();x.moveTo(-w*.18,w*.18);x.lineTo(0,-w*.26);x.lineTo(w*.2,w*.18);x.stroke();x.restore();}
function pauseVisualMedia(){
  const v=$('videoPreview');
  if(v){ try{ v.pause?.(); }catch(_){ } }
}

function setVisualPaused(paused){
  const next=Boolean(paused || document.hidden);
  if(VISUAL_RUNTIME.paused===next) return;
  VISUAL_RUNTIME.paused=next;
  document.body.classList.toggle('is-background-paused',next);
  pauseVisualMedia();
  try{
    if(next) VISUAL_RUNTIME.particlesStop?.(true);
    else VISUAL_RUNTIME.particlesStart?.();
  }catch(_){ }
}

function particles(){
  const c=$('particles');
  if(!c)return;
  const x=c.getContext('2d',{alpha:true});
  let d=[],raf=0,last=0;
  const isLowPower=()=>document.body.classList.contains('is-low-end-device')||PERF.reducedMotion;
  const isPaused=()=>VISUAL_RUNTIME.paused || document.hidden || document.body.classList.contains('is-external-transition');
  const r=()=>{
    const lowPower=isLowPower();
    const ratio=Math.min(devicePixelRatio||1,lowPower?1.1:1.65);
    c.width=Math.ceil(innerWidth*ratio);
    c.height=Math.ceil(innerHeight*ratio);
    const base=Math.floor(innerWidth/(lowPower?70:26));
    const count=Math.min(lowPower?6:18,Math.max(lowPower?3:8,base));
    d=Array.from({length:count},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.05+.3,s:Math.random()*.18+.045}));
  };
  const stop=(clear=false)=>{
    if(raf){cancelAnimationFrame(raf);raf=0;}
    if(clear){try{x.clearRect(0,0,c.width,c.height);}catch(_){ }}
  };
  const start=()=>{
    if(raf || isPaused()) return;
    last=0;
    raf=requestAnimationFrame(tick);
  };
  const tick=(now=0)=>{
    raf=0;
    if(isPaused()){stop(true);return;}
    const lowPower=isLowPower();
    const frameGap=lowPower?140:48;
    if(now-last<frameGap){raf=requestAnimationFrame(tick);return;}
    last=now;
    if(document.body.classList.contains('theme-fast-switch')){x.clearRect(0,0,c.width,c.height);raf=requestAnimationFrame(tick);return;}
    x.clearRect(0,0,c.width,c.height);
    const light=document.body.dataset.theme==='light';
    const ratio=Math.min(devicePixelRatio||1,lowPower?1.1:1.65);
    x.fillStyle=light?'rgba(0,0,0,.38)':'rgba(255,255,255,.50)';
    x.globalAlpha=light?.09:.14;
    for(const p of d){p.y+=p.s*ratio*(lowPower ? .65 : .9);if(p.y>c.height){p.y=-8;p.x=Math.random()*c.width}x.beginPath();x.arc(p.x,p.y,p.r*ratio,0,Math.PI*2);x.fill()}
    raf=requestAnimationFrame(tick);
  };
  r();
  VISUAL_RUNTIME.particlesStart=start;
  VISUAL_RUNTIME.particlesStop=stop;
  VISUAL_RUNTIME.particlesResize=()=>{stop(true);r();};
  addEventListener('resize',()=>{stop(true);r();start();},{passive:true});
  document.addEventListener('visibilitychange',()=>{setVisualPaused(document.hidden);},{passive:true});
  start();
}


function saveUiSnapshotSoon(){
  clearTimeout(PERF.saveTimer);
  PERF.saveTimer=setTimeout(saveUiSnapshot,120);
}
function saveUiSnapshot(){
  try{
    const snap={
      hasFile:Boolean(state.file),
      fileName:state.file?.name||'',
      fileSize:state.file?.size||0,
      fileType:state.file?.type||'',
      filePickerActive:Boolean(state.filePickerActive),
      authInProgress:Boolean(state.settings?.authInProgress),
      pendingAuthToken:state.settings?.pendingAuthToken||'',
      ts:nowMs()
    };
    sessionStorage.setItem('alter_ui_snapshot',JSON.stringify(snap));
    localStorage.setItem('alter_ui_snapshot',JSON.stringify(snap));
  }catch(_){ }
}
function readUiSnapshot(){
  try{return JSON.parse(sessionStorage.getItem('alter_ui_snapshot')||localStorage.getItem('alter_ui_snapshot')||'{}')||{};}catch(_){return {};}
}
function markExternalTransition(kind,active=true){
  if(kind==='file') state.filePickerActive=active;
  if(kind==='auth') state.externalAuthActive=active;
  document.body.classList.toggle('is-external-transition', Boolean(active));
  try{
    if(active) window.alterE?.background?.start?.(kind||'external');
    else setTimeout(()=>window.alterE?.background?.stop?.(kind||'external'), kind==='auth'?1800:700);
  }catch(_){ }
  saveUiSnapshot();
}
function getPerformanceMode(){
  const value=String(state.settings?.performanceMode || localStorage.getItem('alter_performance_mode') || 'auto').toLowerCase();
  return ['auto','quality','performance'].includes(value)?value:'auto';
}
function shouldUseLiteVisuals(){
  const mode=getPerformanceMode();
  if(mode==='performance') return true;
  if(mode==='quality') return false;
  const mem=Number(navigator.deviceMemory || 0);
  const cores=Number(navigator.hardwareConcurrency || 0);
  const nativeRam=Number(PERF.nativeProfile?.totalRamMb || 0);
  const nativeSdk=Number(PERF.nativeProfile?.sdk || 0);
  const nativeLow=Boolean(PERF.nativeProfile?.lowMemory);
  return Boolean(PERF.lowEnd || PERF.reducedMotion || nativeLow || (mem && mem<=4) || (cores && cores<=4) || (nativeRam && nativeRam<=4600) || (nativeSdk && nativeSdk<=29));
}
function applyPerformanceProfile(){
  const mode=getPerformanceMode();
  const lite=shouldUseLiteVisuals();
  document.body.classList.toggle('is-low-end-device', lite);
  document.body.classList.toggle('is-performance-mode', lite);
  document.body.classList.toggle('is-quality-mode', mode==='quality' && !lite);
  document.body.classList.toggle('is-reduced-motion', Boolean(PERF.reducedMotion));
  document.documentElement.style.setProperty('--panel-blur', lite?'0px':'14px');
  document.documentElement.style.setProperty('--heavy-shadow', lite?'0 8px 18px rgba(0,0,0,.14)':'0 20px 54px rgba(0,0,0,.24)');
  document.documentElement.style.setProperty('--particle-frame-gap', lite?'140':'48');
  document.documentElement.style.setProperty('--particle-ratio', lite?'1.1':'1.65');
  document.documentElement.style.setProperty('--particle-count-max', lite?'6':'18');
  document.documentElement.style.setProperty('--ui-transition-fast', lite?'.12s':'.20s');
}
function performanceLabel(){
  const mode=getPerformanceMode();
  if(mode==='performance') return t('performanceLite');
  if(mode==='quality') return t('performanceQuality');
  return t('performanceAuto');
}
async function cyclePerformanceMode(){
  const order=['auto','performance','quality'];
  const current=getPerformanceMode();
  const next=order[(order.indexOf(current)+1)%order.length];
  localStorage.setItem('alter_performance_mode',next);
  state.settings=await window.alterE.settings.update({performanceMode:next});
  applyPerformanceProfile();
  applyText();
  try{ VISUAL_RUNTIME.particlesStop?.(true); VISUAL_RUNTIME.particlesResize?.(); VISUAL_RUNTIME.particlesStart?.(); }catch(_){ }
}

function nowMs(){return Date.now ? Date.now() : new Date().getTime();}
function authSessionIsFresh(settings){
  const started=Number(settings?.pendingAuthStartedAt||0);
  return Boolean(settings?.pendingAuthToken && started && (nowMs()-started)<AUTH_POLL_MAX_MS);
}
async function clearPendingAuth(extra={}){
  state.settings=await window.alterE.settings.update({pendingAuthToken:'',pendingAuthUrl:'',pendingAuthStartedAt:0,authInProgress:false,...extra});
  return state.settings;
}
async function savePendingAuth(token,url){
  state.settings=await window.alterE.settings.update({pendingAuthToken:token,pendingAuthUrl:url||'',pendingAuthStartedAt:nowMs(),authInProgress:true});
  return state.settings;
}
async function completeAuthorization(token){
  state.settings=await clearPendingAuth({authorized:true,authToken:token});
  state.logs=[];
  state.externalAuthActive=false;
  document.body.classList.remove('is-external-transition');
  try{ setTimeout(()=>window.alterE?.background?.stop?.('auth'),900); }catch(_){ }
  log('success','authSuccessShort','');
  toast(t('authSuccessShort'));
  applyText();
  renderAuth();
  saveUiSnapshot();
}
async function pollAuthorization(token,{silent=false}={}){
  if(!token || authPollActive) return false;
  authPollActive=true;
  const b=$('authButton');
  if(b) b.disabled=true;
  if(!silent && $('authText')) $('authText').textContent=t('authWaiting');
  try{
    const started=nowMs();
    while(nowMs()-started < AUTH_POLL_MAX_MS){
      const fresh=await window.alterE.settings.get().catch(()=>state.settings);
      if(fresh?.authorized) { state.settings=fresh; state.externalAuthActive=false; document.body.classList.remove('is-external-transition'); renderAuth(); saveUiSnapshot(); return true; }
      if(!fresh?.pendingAuthToken && token!==fresh?.authToken) return false;
      const st=await window.alterE.auth.status(token).catch(()=>null);
      if(isServerAuthorized(st)){
        await completeAuthorization(token);
        return true;
      }
      await new Promise(r=>setTimeout(r,AUTH_POLL_INTERVAL_MS));
    }
    return false;
  }finally{
    authPollActive=false;
    if(b) b.disabled=false;
  }
}
async function resumeAppState(){
  const stamp=nowMs();
  if(stamp-lastLifecycleResumeAt<800) return;
  lastLifecycleResumeAt=stamp;
  state.settings=await window.alterE.settings.get().catch(()=>state.settings);
  PERF.nativeProfile=await window.alterE?.performance?.profile?.().catch(()=>PERF.nativeProfile) || PERF.nativeProfile;
  document.body.dataset.theme=state.settings?.theme||'dark';
  document.documentElement.dataset.theme=state.settings?.theme||'dark';
  applyPerformanceProfile();
  applyText();
  renderAuth();
  setTimeout(()=>checkAppUpdateSoon({force:true}), 700);
  if(state.file) renderVideo();
  setTimeout(()=>{ if(state.filePickerActive){ state.filePickerActive=false; document.body.classList.remove('is-external-transition'); saveUiSnapshotSoon(); } },1200);
  if(authSessionIsFresh(state.settings) && !state.settings.authorized){
    if($('authText')) $('authText').textContent=t('authWaiting');
    pollAuthorization(state.settings.pendingAuthToken,{silent:true});
  }else{
    try{ setTimeout(()=>window.alterE?.background?.stop?.('resume'),1200); }catch(_){ }
  }
}
function bindLifecycleResume(){
  clearStaleAuthProgress();
  window.alterE?.app?.onStateChange?.(active=>{
    setVisualPaused(!active);
    if(active) resumeAppState();
    else saveUiSnapshotSoon();
  });
  document.addEventListener('visibilitychange',()=>{
    setVisualPaused(document.hidden);
    if(!document.hidden) resumeAppState();
    else saveUiSnapshotSoon();
  },{passive:true});
  window.addEventListener('blur',()=>{ if(document.hidden) setVisualPaused(true); },{passive:true});
  window.addEventListener('focus',()=>{ setVisualPaused(false); resumeAppState(); },{passive:true});
  window.addEventListener('pagehide',()=>{ setVisualPaused(true); saveUiSnapshotSoon(); },{passive:true});
  window.addEventListener('pageshow',()=>{ setVisualPaused(false); resumeAppState(); },{passive:true});
}

function formatUpdateText(template, info){
  return String(template || '').replace('{version}', info?.latestVersion || info?.releaseName || '');
}

function buildUpdatePrompt(info){
  let overlay=document.getElementById('updateOverlay');
  if(overlay) overlay.remove();
  overlay=document.createElement('div');
  overlay.id='updateOverlay';
  overlay.className='update-overlay';
  overlay.innerHTML=`<div class="update-card" role="dialog" aria-modal="true">
    <h2>${esc(cleanUiText(t('updateAvailable')))}</h2>
    <p>${esc(cleanUiText(formatUpdateText(t('updateText'),info)))}</p>
    <div class="update-actions">
      <button id="updateLaterButton" type="button">${esc(cleanUiText(t('later')))}</button>
      <button id="updateInstallButton" type="button">${esc(cleanUiText(t('installUpdate')))}</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(()=>overlay.classList.add('is-visible'));
  overlay.querySelector('#updateLaterButton')?.addEventListener('click',()=>{
    const versionKey=String(info?.latestVersion||info?.releaseName||'');
    if(versionKey) UPDATE_DISMISSED_THIS_SESSION.add(versionKey);
    overlay.classList.remove('is-visible');
    setTimeout(()=>overlay.remove(),220);
  });
  overlay.querySelector('#updateInstallButton')?.addEventListener('click',async()=>{
    try{ const ok=await window.alterE?.update?.install?.(info); if(!ok) toast(t('failed'),'Не удалось открыть установщик обновления.'); }catch(e){ toast(t('failed'),String(e?.message||e)); }
  });
}

async function checkAppUpdateSoon({force=false}={}){
  try{
    if(!window.alterE?.update?.check) return;
    const stamp=nowMs();
    if(!force && stamp-lastUpdateCheckAt<30000) return;
    lastUpdateCheckAt=stamp;
    const info=await window.alterE.update.check();
    if(info?.status!=='available') return;
    const versionKey=String(info.latestVersion||info.releaseName||'');
    if(versionKey && UPDATE_DISMISSED_THIS_SESSION.has(versionKey)) return;
    buildUpdatePrompt(info);
  }catch(_){ }
}

async function init(){
  state.settings=await window.alterE.settings.get();
  PERF.nativeProfile=await window.alterE?.performance?.profile?.().catch(()=>({})) || {};
  state.settings.theme = state.settings.theme || 'dark';
  const previousSnapshot=readUiSnapshot();
  if(previousSnapshot?.authInProgress && authSessionIsFresh(state.settings)){ state.settings.authInProgress=true; }
  document.body.dataset.theme = state.settings.theme;
  document.documentElement.dataset.theme = state.settings.theme;
  applyPerformanceProfile();
  particles();
  fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='video/mp4,video/quicktime,.mp4,.mov';fileInput.hidden=true;document.body.appendChild(fileInput);
  fileInput.addEventListener('change',()=>{const f=fileInput.files?.[0];markExternalTransition('file',false);if(f)handleFile(f);else saveUiSnapshotSoon();});
  bind();bindLifecycleResume();applyText();await validateStoredAuthorization();renderAuth();renderVideo();renderLogs();
  if(authSessionIsFresh(state.settings) && !state.settings.authorized){pollAuthorization(state.settings.pendingAuthToken,{silent:true});}
  setTimeout(()=>{$('bootScreen')?.classList.add('is-hiding');document.body.classList.remove('is-booting')},450);
  if(!authSessionIsFresh(state.settings)){ try{ setTimeout(()=>window.alterE?.background?.stop?.('init'),1600); }catch(_){ } }
  setTimeout(()=>checkAppUpdateSoon({force:true}), 1800);
}


let lastAuthButtonEventAt = 0;
function hardAuthTapHandler(event){
  try{
    event?.preventDefault?.();
    event?.stopPropagation?.();
  }catch(_){}
  const stamp = Date.now();
  if(stamp - lastAuthButtonEventAt < 700) return;
  lastAuthButtonEventAt = stamp;
  playAuthButtonAnimation();
  resetAuthButtonState();
  authorize();
}


function bindAuthOverlaySafety(){
  const overlay = $('authOverlay');
  const btn = $('authButton');
  if(!overlay || !btn) return;
  overlay.addEventListener('touchend', e=>{
    if(e.target === btn || btn.contains(e.target)) hardAuthTapHandler(e);
  }, {passive:false});
  overlay.addEventListener('pointerup', e=>{
    if(e.target === btn || btn.contains(e.target)) hardAuthTapHandler(e);
  }, {passive:false});
}

function bind(){
  $('dropZone')?.addEventListener('click',openVideoPicker);
  $('dropZone')?.addEventListener('dragover',e=>{e.preventDefault();$('dropZone').classList.add('is-dragover')});
  $('dropZone')?.addEventListener('dragleave',()=>$('dropZone').classList.remove('is-dragover'));
  $('dropZone')?.addEventListener('drop',e=>{e.preventDefault();$('dropZone').classList.remove('is-dragover');const f=e.dataTransfer?.files?.[0];if(f)handleFile(f)});
  $('patchButton')?.addEventListener('click',patch);
  $('telegramLink')?.addEventListener('click',()=>window.alterE.shell.openExternal('https://t.me/alterediting'));
  $('settingsButton')?.addEventListener('click',()=>{animateTap('settingsButton','spin');togglePanel('settingsPanel')});
  $('logsButton')?.addEventListener('click',()=>{animateTap('logsButton','shake');togglePanel('logsPanel')});
  $('uploadButton')?.addEventListener('click',openTikTokStudio);
  $('desktopUploadConfirmButton')?.addEventListener('click',confirmTikTokDesktopUpload);
  $('desktopUploadCancelButton')?.addEventListener('click',()=>setDesktopUploadOverlay(false));
  $('desktopUploadCloseButton')?.addEventListener('click',()=>setDesktopUploadOverlay(false));
  $('desktopUploadOverlay')?.addEventListener('click',e=>{if(e.target===$('desktopUploadOverlay'))setDesktopUploadOverlay(false);});
  $('languageButton')?.addEventListener('click',switchLanguage);
  $('themeButton')?.addEventListener('click',switchTheme);
  $('performanceButton')?.addEventListener('click',cyclePerformanceMode);
  $('logoutButton')?.addEventListener('click',async()=>{state.settings=await window.alterE.settings.update({authorized:false,authToken:''});renderAuth()});
  {
    const authBtn = $('authButton');
    if(authBtn){
      authBtn.addEventListener('click', hardAuthTapHandler, {passive:false});
    }
  }
  $('howToUseButton')?.addEventListener('click',()=>openTutorial(true));
  $('tutorialCloseButton')?.addEventListener('click',()=>openTutorial(false));
  $('tutorialDoneButton')?.addEventListener('click',()=>openTutorial(false));
  $('settingsCloseButton')?.addEventListener('click',()=>closePanels());
  $('logsCloseButton')?.addEventListener('click',()=>closePanels());
  document.addEventListener('pointerdown', e=>{
    if (!document.querySelector('.anchored-panel:not([hidden])')) return;
    if (e.target.closest('.anchored-panel') || e.target.closest('.icon-button')) return;
    closePanels();
  });
  window.addEventListener('scroll', closePanels, {passive:true});
  window.alterE.video.onProgress(p=>{$('patchProgress')?.style.setProperty('--progress',`${Math.max(0,Math.min(100,p))}%`)});
}

function closePanelElement(e){
  if(!e || e.hidden) return;
  e.classList.remove('panel-in','is-theme-frozen');
  e.style.transition='';
  e.style.animation='';
  e.style.transform='';
  e.classList.add('panel-out');
  setTimeout(()=>{
    e.hidden=true;
    e.classList.remove('panel-out');
    e.style.height='';
    e.style.maxHeight='';
  },260);
}
function closePanels(){for(const p of ['settingsPanel','logsPanel'])closePanelElement($(p));}
function positionPanel(id){
  const panel=$(id);
  const anchor=id==='settingsPanel'?$('settingsButton'):$('logsButton');
  if(!panel||!anchor)return;
  const r=anchor.getBoundingClientRect();
  const w=Math.min(292, Math.floor(window.innerWidth*0.86));
  const left=Math.max(10, Math.min(window.innerWidth-w-10, Math.round(r.left + r.width/2 - w/2)));
  const top=Math.min(window.innerHeight-24, Math.round(r.bottom + 12));
  panel.style.width=w+'px';
  panel.style.left=left+'px';
  panel.style.top=top+'px';
}
function togglePanel(id){
  for(const p of ['settingsPanel','logsPanel'])if($(p)&&p!==id)closePanelElement($(p));
  const e=$(id);if(!e)return;
  const willOpen=e.hidden;
  if(!willOpen){closePanelElement(e);return;}
  e.hidden=false;
  e.classList.remove('panel-out','is-theme-frozen');
  e.style.height='';
  e.style.maxHeight='';
  e.style.transition='';
  e.style.animation='';
  e.style.transform='';
  positionPanel(id);
  e.classList.remove('panel-in');
  void e.offsetWidth;
  e.classList.add('panel-in');
  setTimeout(()=>{
    if(!e.hidden) e.classList.remove('panel-in');
  },260);
}
function animateTap(id,cls){const e=$(id);if(!e)return;e.classList.remove(cls);void e.offsetWidth;e.classList.add(cls);setTimeout(()=>e.classList.remove(cls),520);}
let tiktokUploadOpenLockedUntil=0;
function setDesktopUploadOverlay(show){
  const e=$('desktopUploadOverlay');
  if(!e)return;
  if(show){
    e.hidden=false;
    requestAnimationFrame(()=>e.classList.add('is-visible'));
    return;
  }
  e.classList.remove('is-visible');
  setTimeout(()=>{if(!e.classList.contains('is-visible'))e.hidden=true},240);
}
function openTikTokStudio(){
  const now=Date.now();
  if(now<tiktokUploadOpenLockedUntil){return;}
  setDesktopUploadOverlay(true);
}
function confirmTikTokDesktopUpload(){
  const now=Date.now();
  if(now<tiktokUploadOpenLockedUntil){return;}
  tiktokUploadOpenLockedUntil=now+7000;
  setDesktopUploadOverlay(false);
  markExternalTransition('external',true);
  window.alterE.shell.openTikTokUpload?.('https://www.tiktok.com/upload/?lang=en');
  setTimeout(()=>markExternalTransition('external',false),1200);
}
function openTutorial(show){const e=$('tutorialOverlay');if(!e)return;if(show){e.hidden=false;requestAnimationFrame(()=>e.classList.add('is-visible'));return}e.classList.remove('is-visible');setTimeout(()=>{if(!e.classList.contains('is-visible'))e.hidden=true},240);}
function cleanUiText(value){
  return String(value ?? '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,'')
    .replace(/[\uFE0E\uFE0F]/g,'')
    .replace(/[✦✧★☆◆◇●○■□▲△▼▽•·]/g,'')
    .replace(/\s{2,}/g,' ')
    .trim();
}
function setText(id,value){const e=$(id);if(e)e.textContent=cleanUiText(value);}
function applyText(){
  setText('selectPill',state.file?t('changeVideo'):t('selectFromGallery'));
  setText('dropTitle',t('dropTitle'));
  setText('dropHint',t('dropHint'));
  setText('patchButtonLabel',t('patch'));
  setText('uploadButtonLabel',t('upload'));
  $('settingsButton')?.setAttribute('aria-label',t('settings'));
  $('logsButton')?.setAttribute('aria-label',t('logs'));
  setText('authButton',t('authorize'));
  setText('authText',t('authText'));
  setText('settingsTitle',t('settings'));
  setText('logsTitle',t('logs'));
  setText('howToUseLabel',t('howToUse'));
  setText('languageButton',`${t('language')}: ${(state.settings.language||'en').toUpperCase()}`);
  setText('themeButton', state.settings.theme === 'light' ? t('themeDark') : t('themeLight'));
  setText('performanceButton',performanceLabel());
  setText('logoutButton',t('logout'));
  setText('tutorialStep2Title',t('tutorialTitle'));
  setText('tutorialStep2Text',t('tutorialText'));
  setText('desktopUploadTitle',t('desktopUploadTitle'));
  setText('desktopUploadText',t('desktopUploadText'));
  setText('desktopUploadStep1Title',t('desktopUploadStep1Title'));
  setText('desktopUploadStep1Text',t('desktopUploadStep1Text'));
  setText('desktopUploadStep2Title',t('desktopUploadStep2Title'));
  setText('desktopUploadStep2Text',t('desktopUploadStep2Text'));
  applyDesktopInstructionImages();
  setText('desktopUploadConfirmButton',t('desktopUploadConfirm'));
  setText('desktopUploadCancelButton',t('desktopUploadCancel'));
  renderLogs();
}


async function clearStaleAuthProgress(){
  const started = Number(state.settings?.authStartedAt || 0);
  const pending = state.settings?.pendingAuthToken || '';
  if(!pending && !state.settings?.authInProgress) { resetAuthButtonState(); return; }
  if(!started || Date.now() - started > 90 * 1000){
    state.settings = await window.alterE.settings.update({
      authInProgress:false,
      pendingAuthToken:'',
      authStartedAt:0
    }).catch(()=>state.settings);
    saveUiSnapshotSoon?.();
  }
  resetAuthButtonState();
}

async function validateStoredAuthorization(){
  const token=state.settings?.authToken||'';
  if(!state.settings?.authorized||!token)return;
  const st=await window.alterE.auth.status(token).catch(()=>null);
  const ok=isServerAuthorized(st);
  if(!ok){
    state.settings=await window.alterE.settings.update({authorized:false,authToken:''});
  }
}

function renderAuth(){const locked=!state.settings?.authorized;$('authOverlay').hidden=!locked;document.body.classList.toggle('is-auth-locked',locked);resetAuthButtonState();}

function resetPreviewElement(v){
  if(!v)return;
  try{v.pause?.();}catch(_){}
  try{v.removeAttribute('poster');}catch(_){}
  delete v.dataset.frameSet;
  delete v.dataset.posterSet;
  delete v.dataset.posterSource;
}
function capturePreviewPoster(v){
  try{
    if(!v || v.dataset.posterSet==='1' || !v.videoWidth || !v.videoHeight) return false;
    const c=document.createElement('canvas');
    const max=180;
    const ratio=Math.min(1,max/Math.max(v.videoWidth,v.videoHeight));
    c.width=Math.max(1,Math.round(v.videoWidth*ratio));
    c.height=Math.max(1,Math.round(v.videoHeight*ratio));
    const ctx=c.getContext('2d',{alpha:false});
    ctx.drawImage(v,0,0,c.width,c.height);
    v.poster=c.toDataURL('image/jpeg',0.78);
    v.dataset.posterSet='1';
    try{v.pause?.();}catch(_){}
    return true;
  }catch(_){return false;}
}
function preparePreviewFrame(v){
  if(!v)return;
  try{
    v.controls=false;
    v.disablePictureInPicture=true;
    v.muted=true;
    v.playsInline=true;
    v.autoplay=false;
    v.loop=false;
    v.preload='auto';
  }catch(_){}
  const capture=()=>{capturePreviewPoster(v);try{v.pause?.();}catch(_){}};
  const seek=()=>{
    try{
      if(v.dataset.frameSet==='1') { capture(); return; }
      v.dataset.frameSet='1';
      const duration=Number.isFinite(v.duration)?v.duration:0;
      const target=duration>0?Math.min(0.12,Math.max(0.04,duration/5)):0.04;
      if(Math.abs((v.currentTime||0)-target)>.025) v.currentTime=target;
      else capture();
    }catch(_){capture();}
  };
  v.onloadedmetadata=()=>{setTimeout(seek,0);};
  v.onloadeddata=()=>{if(!v.dataset.frameSet) seek(); else capture();};
  v.onseeked=capture;
  v.oncanplay=()=>{if(!v.dataset.posterSet) capture();};
}
function renderVideo(){
  const v=$('videoPreview');
  if(state.file){
    document.body.classList.add('has-video');
    $('fileTitle').textContent=state.file.name;
    $('fileMeta').textContent=fmt(state.file.size);
    $('fileStream').textContent=cleanUiText('MP4 / MOV PATCH ONLY');
    $('uploadIcon').hidden=true;
    $('selectPill').textContent=t('changeVideo');
    if(v&&state.fileUrl){
      if(v.src!==state.fileUrl){
        resetPreviewElement(v);
        v.src=state.fileUrl;
        v.dataset.posterSource=state.fileUrl;
      }
      v.hidden=false;
      preparePreviewFrame(v);
      v.load();
    }
  }else{
    resetPreviewElement(v);
    document.body.classList.remove('has-video');
    $('fileTitle').textContent='';
    $('fileMeta').textContent='';
    $('fileStream').textContent='';
    $('uploadIcon').hidden=false;
    $('selectPill').textContent=t('selectFromGallery');
    if(v){
      v.pause?.();
      v.hidden=true;
      delete v.dataset.frameSet;
      v.removeAttribute('src');
      v.load?.();
    }
  }
}
async function handleFile(file){
  const ext=file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if(!['.mp4','.mov'].includes(ext)){toast(t('unsupported'));resetFilePicker();markExternalTransition('file',false);return}
  if(isVideoTooLarge(file)){showTooLargeToast();log('error','videoTooLarge',file.name);resetFilePicker();markExternalTransition('file',false);return}
  const validContainer = await hasValidMp4MovStructure(file).catch(()=>false);
  if(!validContainer){showInvalidMp4MovToast(file.name);resetFilePicker();markExternalTransition('file',false);return}
  state.file=file;
  state.fileUrl=window.alterMobile.setSelectedFile(file);
  resetFilePicker();
  renderVideo();
  saveUiSnapshot();
  log('info','loaded',file.name);
  toast(t('loaded'),file.name);
}

function bytesToBase64(bytes){
  let binary='';
  const step=0x8000;
  for(let i=0;i<bytes.length;i+=step){
    binary+=String.fromCharCode.apply(null, bytes.subarray(i,i+step));
  }
  return btoa(binary);
}

function base64ToBytes(base64){
  const binary=atob(base64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return bytes;
}

async function transcodeSelectedVideoToH264(file){
  const bridge=window.AlterTranscode;
  if(!bridge || typeof bridge.beginTranscode!=='function'){
    throw new Error('HEVC fallback is not available in this APK.');
  }

  const token=bridge.beginTranscode(file.name || 'input.mp4', file.type || 'video/mp4');
  if(!token || String(token).startsWith('ERROR:')) throw new Error(String(token || 'transcode_begin_failed'));

  const inputChunkSize=128 * 1024;
  try{
    for(let offset=0; offset<file.size; offset+=inputChunkSize){
      const slice=file.slice(offset, Math.min(file.size, offset + inputChunkSize));
      const bytes=new Uint8Array(await slice.arrayBuffer());
      const res=bridge.appendInputChunk(token, bytesToBase64(bytes));
      if(res !== 'OK') throw new Error(String(res || 'transcode_append_failed'));
      const progress=Math.min(35, Math.round((offset / Math.max(1,file.size)) * 35));
      window.alterE?.video?.onProgress?.(()=>{});
      $('patchProgress')?.style.setProperty('--progress',`${progress}%`);
    }

    toast(t('started'), 'HEVC/H.265 → H.264...');
    log('info','started','HEVC/H.265 → H.264');
    const finish=bridge.finishTranscode(token);
    if(finish !== 'OK') throw new Error(String(finish || 'transcode_failed'));

    const total=Number(bridge.getResultSize(token) || 0);
    if(!total) throw new Error('empty_transcode_output');

    const outputChunks=[];
    const outputChunkSize=128 * 1024;
    for(let offset=0; offset<total; offset+=outputChunkSize){
      const b64=bridge.readResultChunk(token, offset, outputChunkSize);
      if(String(b64).startsWith('ERROR:')) throw new Error(String(b64));
      if(!b64) break;
      outputChunks.push(base64ToBytes(b64));
      const progress=35 + Math.min(40, Math.round((offset / Math.max(1,total)) * 40));
      $('patchProgress')?.style.setProperty('--progress',`${progress}%`);
    }

    const outName=(file.name || 'video.mp4').replace(/\.(mov|mp4)$/i,'') + '_h264.mp4';
    return new File(outputChunks, outName, {type:'video/mp4'});
  } finally {
    try{ bridge.releaseResult(token); }catch(_){}
  }
}

function isV5H264OnlyError(error){
  const raw=String(error?.message || error || '');
  return /V5 supports only H\.264\/AVC|supports only H\.264|H\.265|HEVC|h265|hevc/i.test(raw);
}

async function runPatchWithHevcFallback(){
  try{
    return await window.alterE.video.patch({});
  }catch(e){
    if(!isV5H264OnlyError(e)) throw e;

    log('info','started','HEVC/H.265 detected. Transcoding to H.264.');
    toast('HEVC/H.265', 'Конвертация в H.264...');

    const originalFile=state.file;
    const h264File=await transcodeSelectedVideoToH264(originalFile);

    const validContainer = await hasValidMp4MovStructure(h264File).catch(()=>false);
    if(!validContainer) throw new Error(t('unsupportedPatchFormat'));

    state.file=h264File;
    try{
      state.fileUrl=window.alterMobile.setSelectedFile(h264File);
      renderVideo();
      log('info','loaded',h264File.name);
      $('patchProgress')?.style.setProperty('--progress','78%');
      return await window.alterE.video.patch({});
    }catch(secondError){
      throw secondError;
    }
  }
}

async function patch(){
  if(state.working)return;
  if(!state.file){toast(t('noVideo'));return}
  if(isVideoTooLarge(state.file)){showTooLargeToast();log('error','videoTooLarge',state.file.name);return}
  const validContainer = await hasValidMp4MovStructure(state.file).catch(()=>false);
  if(!validContainer){showInvalidMp4MovToast(state.file.name);return}
  try{
    state.working=true;
    document.body.classList.add('is-external-transition');
    try{ await window.alterE?.background?.start?.('patch'); }catch(_){ }
    $('patchButton').classList.add('is-working');
    log('info','started',state.file.name);
    toast(t('started'));
    const r=await runPatchWithHevcFallback();
    toast(t('completed'),t('processedSaved'));
    log('success','saved',r?.outputPath || '');
  }catch(e){
    const raw=String(e?.message||e);
    const m=/not supported for patching|format is not supported|invalid mp4|moov|mdat|ftyp|container/i.test(raw)?t('unsupportedPatchFormat'):raw;
    toast(t('failed'),m);
    log('error','failed',m);
  }finally{
    state.working=false;
    $('patchButton').classList.remove('is-working');
    $('patchProgress')?.style.setProperty('--progress','0%');
    document.body.classList.remove('is-external-transition');
    try{ setTimeout(()=>window.alterE?.background?.stop?.('patch'),900); }catch(_){ }
  }
}
async function authorize(){
  const stamp = Date.now();
  if(authTapInProgress && stamp < authClickLockedUntil) return;
  authTapInProgress = true;
  authClickLockedUntil = stamp + 1600;
  resetAuthButtonState();

  try{
    toast(t('authChecking'), '');

    // Always create a fresh Telegram auth session on manual tap.
    // This prevents a stale pending session from blocking the button.
    const session = await window.alterE.auth.createSession();
    const token = session?.session_token || session?.token || '';
    const telegramUrl = session?.auth_url || session?.telegram_url || session?.url || '';

    if(!token || !telegramUrl) throw new Error('auth_session_not_created');

    state.settings = await window.alterE.settings.update({
      authorized:false,
      authToken:'',
      pendingAuthToken:token,
      authInProgress:true,
      authStartedAt:Date.now()
    });

    saveUiSnapshotSoon?.();
    markExternalTransition('external', true);
    await window.alterE.shell.openExternal(telegramUrl);
    setTimeout(()=>markExternalTransition('external', false), 900);

    toast(t('authWaiting'), '');
    pollAuthorization(token, {silent:true});
  }catch(e){
    resetAuthButtonState();
    state.settings = await window.alterE.settings.update({
      authInProgress:false,
      pendingAuthToken:'',
      authStartedAt:0
    }).catch(()=>state.settings);
    saveUiSnapshotSoon?.();
    toast(t('authFailed'), String(e?.message || e || ''));
  }finally{
    setTimeout(()=>{ authTapInProgress = false; resetAuthButtonState(); }, 500);
  }
}
async function switchLanguage(){const o=['en','ru','tr'];const n=o[(o.indexOf(state.settings.language)+1)%o.length];state.settings=await window.alterE.settings.update({language:n});applyText()}
async function switchTheme(){
  const next=state.settings.theme==='light'?'dark':'light';

  let overlay=document.getElementById('themeFadeOverlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='themeFadeOverlay';
    overlay.className='theme-fade-overlay';
    document.body.appendChild(overlay);
  }
  overlay.dataset.nextTheme=next;

  const openedPanels=['settingsPanel','logsPanel']
    .map(id=>$(id))
    .filter(p=>p && !p.hidden);

  // Freeze opened popovers only by geometry. Do not replay scale/blur animations
  // during theme repaint because this is what lags on weaker Android WebView.
  for(const p of openedPanels){
    const r=p.getBoundingClientRect();
    p.classList.remove('panel-in','panel-out');
    p.classList.add('is-theme-frozen');
    p.style.left=Math.round(r.left)+'px';
    p.style.top=Math.round(r.top)+'px';
    p.style.width=Math.round(r.width)+'px';
    p.style.height=Math.round(r.height)+'px';
    p.style.maxHeight=Math.round(r.height)+'px';
    p.style.transition='none';
    p.style.animation='none';
    p.style.transform='none';
  }

  document.body.classList.add('theme-fast-switch');
  overlay.classList.remove('is-visible');
  void overlay.offsetWidth;
  overlay.classList.add('is-visible');

  // Small two-frame delay lets the overlay appear first, then the heavy recolor
  // happens under a static layer. This feels smoother and costs less than
  // animating gradients, shadows and backdrop-filter on every element.
  requestAnimationFrame(()=>requestAnimationFrame(async()=>{
    document.body.dataset.theme=next;
    document.documentElement.dataset.theme=next;
    try{
      state.settings=await window.alterE.settings.update({theme:next});
    }catch(_){
      state.settings.theme=next;
    }
    applyText();

    setTimeout(()=>overlay.classList.remove('is-visible'),90);
    setTimeout(()=>{
      document.body.classList.remove('theme-fast-switch');
      for(const p of openedPanels){
        p.classList.remove('is-theme-frozen');
        p.style.transition='';
        p.style.animation='';
        p.style.transform='';
      }
    },190);
  }));
}
function renderLogs(){const list=$('logsList');if(!list)return;list.innerHTML=state.logs.length?state.logs.map(x=>{const raw=x.key?t(x.key):(x.message||x.details||'');const msg=cleanUiText(raw||t('noLogs'));return `<div class="log-row"><p>${esc(msg)}</p><span>${esc(cleanUiText(x.time))}</span></div>`}).join(''):`<div class="empty-state">${esc(cleanUiText(t('noLogs')))}</div>`;}
document.addEventListener('DOMContentLoaded',init);
