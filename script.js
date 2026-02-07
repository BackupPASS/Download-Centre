const navButtons = document.querySelectorAll('.nav button');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('page-title');
const headerSub = document.getElementById('header-sub');

let downloadSystemStatus = 'unknown'; // 'online' | 'downtime' | 'offline' | 'error' | 'unknown'

function isDownloadSystemOffline() {
  return String(downloadSystemStatus).toLowerCase() === 'offline';
}

function showDownloadBlockedAlert() {
  alert('Unable to Download.\n\nThere was an error connecting to the download system.');
}

function guardDownloadClick(e) {
  if (!isDownloadSystemOffline()) return;
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  showDownloadBlockedAlert();
  return false;
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');

if (target === 'extensions') {
  const vinti = getVintiInfo();
  if (!vinti) {
    alert('The Vinti Store is only available inside Vinti.');
    return;
  }
}

    navButtons.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target).classList.add('active');

if (target === 'vinti') {
  pageTitle.textContent = 'Vinti Download';
  headerSub.textContent = 'Get the latest version of Vinti for your device.';
} else if (target === 'hub') {
  pageTitle.textContent = 'PlingifyPlug Hub Download';
  headerSub.textContent = 'Download PlingifyPlug Hub for supported platforms.';
} else if (target === 'extensions') {
  pageTitle.textContent = 'Vinti Store';
  headerSub.textContent = 'Install extensions for Vinti.';
}
  });
});

function getOSInfo() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Windows') !== -1) return { id: 'windows', name: 'Windows' };
  if (ua.indexOf('Mac') !== -1 && ua.indexOf('iPhone') === -1) return { id: 'mac', name: 'macOS' };
  if (ua.indexOf('iPhone') !== -1) return { id: 'iphone', name: 'iPhone' };
  if (ua.indexOf('Android') !== -1) return { id: 'android', name: 'Android' };
  if (ua.indexOf('CrOS') !== -1) return { id: 'chromeos', name: 'ChromeOS' };
  if (ua.indexOf('Linux') !== -1 && ua.indexOf('Android') === -1) return { id: 'linux', name: 'Linux' };
  return { id: 'unknown', name: 'your device' };
}

function createDownloadCard(title, desc, downloadLink, downloadLabel, extraLink) {
  const card = document.createElement('div');
  card.className = 'download-card';

  const icon = document.createElement('div');
  icon.className = 'download-icon';
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M12 3v12m0 0 4-4m-4 4-4-4M5 15v3.5C5 20.09 6.79 21 12 21s7-0.91 7-2.5V15"/>
    </svg>`;

  const content = document.createElement('div');
  content.className = 'download-content';

  const t = document.createElement('div');
  t.className = 'download-title';
  t.textContent = title;

  const d = document.createElement('div');
  d.className = 'download-desc';
  d.innerHTML = desc;

  const actions = document.createElement('div');
  actions.className = 'download-actions';

if (downloadLink) {
  const a = document.createElement('a');
  a.href = downloadLink;
  a.className = 'btn primary';
  a.textContent = downloadLabel || 'Download';

  a.addEventListener('click', guardDownloadClick);

  actions.appendChild(a);
}


  if (extraLink) {
    const b = document.createElement('a');
    b.href = extraLink;
    b.className = 'btn';
    b.textContent = 'View requirements';
    actions.appendChild(b);
  }

  content.appendChild(t);
  content.appendChild(d);
  content.appendChild(actions);
  card.appendChild(icon);
  card.appendChild(content);
  return card;
}

async function handleWindowsBetaClick() {

  if (isDownloadSystemOffline()) {
    showDownloadBlockedAlert();
    return;
  }

  if (!window.firebase || !firebase.auth) {
    alert('Beta access is not available right now (auth not initialised).');
    return;
  }

  const promptFn = window.vintiPrompt
    ? (msg, def) => window.vintiPrompt(msg, def)
    : (msg, def) => Promise.resolve(window.prompt(msg, def));

  const email = await promptFn('Enter beta access email:', '');
  if (!email) {
    alert('Beta download cancelled.');
    return;
  }

  const password = await promptFn('Enter beta access password:', '');
  if (!password) {
    alert('Beta download cancelled.');
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      const betaUrl = 'https://github.com/BackupPASS/Download-Centre/releases/download/V3.1.80/Vinti-3.1.80-setup.exe';
      window.location.href = betaUrl;
    })
    .catch((err) => {
      console.error('Beta auth failed:', err);
      alert('Incorrect credentials or access denied.');
    });
}

const vintiContainer = document.getElementById('vinti-download');
const os = getOSInfo();

(function renderVinti() {
  let card;
  if (os.id === 'windows') {
    const link = 'https://github.com/BackupPASS/Download-Centre/releases/download/V3.1.80/Vinti-3.1.80-setup.exe';
    card = createDownloadCard(
      'Windows Users',
      'Vinti for Windows. Click download to get the latest installer.',
      link,
      'Download Vinti for Windows'
    );

    const actions = card.querySelector('.download-actions');
    if (actions) {
      const betaBtn = document.createElement('button');
      betaBtn.type = 'button';
      betaBtn.className = 'btn primary';
      betaBtn.textContent = 'Download Vinti BETA for Windows';
      betaBtn.addEventListener('click', handleWindowsBetaClick);
      actions.appendChild(betaBtn);
    }

  } else if (os.id === 'mac') {
    const link = 'https://github.com/BackupPASS/Download-Centre/releases/download/V2.70.50/Vinti-2.70.50.dmg';
    card = createDownloadCard(
      'macOS Users',
      'Vinti for MacOS. Download the .app bundle and follow the instructions.',
      link,
      'Download Vinti for macOS'
    );
  } else if (os.id === 'linux') {
    const link = 'https://github.com/BackupPASS/Downloads-Vinti/releases/download/V2.50.82/Vinti.Setup.Linux.zip';
    card = createDownloadCard(
      'Linux Users',
      'Vinti for Linux (all major distributions). This release is currently in BETA.',
      link,
      'Download Vinti for Linux'
    );
  } else {
    card = createDownloadCard(
      os.name + ' Users',
      `This software is not available for download on ${os.name}.`,
      null,
      null
    );
  }
  vintiContainer.appendChild(card);
})();

const hubContainer = document.getElementById('hub-download');
(function renderHub() {
  let card;
  if (os.id === 'windows') {
    const link = 'https://github.com/BackupPASS/PlingifyPlug-Hub/releases/download/V1.0.40/PlingifyPlug-Hub-Setup-1.0.40.exe';
    card = createDownloadCard(
      'Windows Users',
      'PlingifyPlug Hub is available for Windows. You will be taken to the Hub download page.',
      link,
      'Download PlingifyPlug-Hub'
    );
  } else {
    card = createDownloadCard(
      os.name + ' Users',
      `PlingifyPlug Hub isn’t available on ${os.name}. You can still use Vinti where supported.`,
      null,
      null
    );
  }
  hubContainer.appendChild(card);
})();

function hasAcceptedCookies() {
  return document.cookie.split(";").some((item) =>
    item.trim().startsWith("cookieAccepted=")
  );
}

function showCookieNotice() {
  if (!hasAcceptedCookies()) {
    document.getElementById("cookie-card").style.display = "block";
  }
}

function acceptCookies() {
  document.getElementById("cookie-card").style.display = "none";
  document.cookie = "cookieAccepted=true; max-age=31536000; path=/";
}

document.getElementById("accept-cookies").addEventListener("click", acceptCookies);
setTimeout(showCookieNotice, 1000);


document.addEventListener('DOMContentLoaded', () => {
  const vintiPill = document.getElementById('vinti-status-pill');
  if (vintiPill) updateVintiStatusPill(vintiPill);

  const hubPill = document.getElementById('hub-status-pill');
  if (hubPill) updateVintiStatusPill(hubPill); 
});

async function updateVintiStatusPill(statusEl) {
  statusEl.classList.remove('ok', 'warn', 'danger');
  statusEl.textContent = 'Checking status…';

  try {
    const res = await fetch('https://backuppass.github.io/Status-Centre/');
    if (!res.ok) {
      throw new Error('Status Centre request failed with ' + res.status);
    }

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

   const coreCard = Array.from(doc.querySelectorAll('.card')).find(card => {
  const sectionTitle = card.querySelector('.section-title');
  const h2 = card.querySelector('h2');
  return (
    sectionTitle &&
    h2 &&
    sectionTitle.textContent.trim().toLowerCase() === 'plingifyplug core systems' &&
    h2.textContent.trim().toLowerCase() === 'plingifyplug'
  );
});

if (!coreCard) {
  console.warn('Status Centre: PlingifyPlug Core Systems card not found');
  setUnknownStatus(statusEl, 'Status not found');
  return;
}

const downloadLi = Array.from(coreCard.querySelectorAll('li')).find(li => {
  const strong = li.querySelector('strong');
  return strong && strong.textContent.trim().toLowerCase() === 'download system';
});

if (!downloadLi) {
  console.warn('Status Centre: "Download System" line not found');
  setUnknownStatus(statusEl, 'Download System not found');
  return;
}

const hintEl = downloadLi.querySelector('.hint');
const lineRaw = (hintEl ? hintEl.textContent : downloadLi.textContent) || '';
const line = lineRaw.trim().toLowerCase();

console.log('Download System status line:', line);

let status = 'unknown';
if (line.includes('online')) {
  status = 'online';
} else if (line.includes('downtime')) {
  status = 'downtime';
} else if (line.includes('offline')) {
  status = 'offline';
} else if (line.includes('error')) {
  status = 'error';
}

downloadSystemStatus = status;

applyStatusToPill(statusEl, status);
  } catch (err) {
    console.error('Failed to fetch Vinti status:', err);
    setUnknownStatus(statusEl, 'Error fetching status');
  }
}

function applyStatusToPill(el, status) {
  el.classList.remove('ok', 'warn', 'danger');

  switch (status) {
    case 'online':
      el.classList.add('ok');
      el.textContent = 'Online';
      break;

    case 'downtime':
      el.classList.add('warn');
      el.textContent = 'Downtime';
      break;

    case 'offline':
      el.classList.add('danger');
      el.textContent = 'Offline';
      break;

    case 'error':
      el.classList.add('danger');
      el.textContent = 'Error';
      break;

    default:
      setUnknownStatus(el, 'Unknown');
      break;
  }
}

function setUnknownStatus(el, label) {
  el.classList.remove('ok', 'warn', 'danger');
  el.textContent = label || 'Unknown';
}

function getVintiInfo() {
  const ua = navigator.userAgent;

  // Must contain Vinti/x.y.z
  const match = ua.match(/\bVinti\/([0-9.]+)\b/i);
  if (!match) return null;

  return {
    isVinti: true,
    version: match[1],
    ua
  };
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function updateExtensionsHint({ loading = false, count = null, message = null }) {
  const hint = document.getElementById('extensions-hint');
  const hintText = document.getElementById('extensions-hint-text');
  const pill = document.getElementById('extensions-count-pill');
  const spinner = hint?.querySelector('.spinner');

  if (!hint || !hintText) return;

  hint.style.display = 'block';

  if (pill) pill.style.display = 'none';
  if (spinner) spinner.style.display = 'none';

  if (loading) {
    if (spinner) spinner.style.display = 'inline-block';
    hintText.textContent = 'Loading available extensions…';
    return;
  }

  if (message) {
    hintText.textContent = message;
    return;
  }

  if (typeof count === 'number') {
    hintText.textContent = '';
    if (pill) {
      pill.style.display = 'inline-flex';
      pill.textContent =
        count === 1 ? '1 extension available' : `${count} extensions available`;
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const vinti = getVintiInfo();
  const extGroup = document.getElementById('extensions-group');
  const extNav = document.getElementById('extensions-nav');
  const extList = document.getElementById('extensions-list');
  const extSection = document.getElementById('extensions');
  const extHint = document.getElementById('extensions-hint');

  if (extGroup) extGroup.classList.add('is-hidden');

  if (!vinti) {
    if (extSection) extSection.remove();
    return;
  }

  extGroup.classList.remove('is-hidden');

if (compareVersions(vinti.version, '3.0.0') < 0) {
  updateExtensionsHint({
    message:
      'No extensions are available for this version of Vinti. Please update to the latest version.'
  });

  if (extList) extList.innerHTML = '';
  return;
}

  loadExtensions(vinti.version);
});

async function loadExtensions(vintiVersion) {

  const hint = document.getElementById('extensions-hint');
  const hintText = document.getElementById('extensions-hint-text');
  const spinner = hint?.querySelector('.spinner');

  updateExtensionsHint({ loading: true });

  const res = await fetch(
    'https://raw.githubusercontent.com/BackupPASS/Download-Centre/main/extensions/index.json'
  );
  const data = await res.json();

  const list = document.getElementById('extensions-list');
  list.innerHTML = '';

let addedCount = 0;


  const installed = await getInstalledExtensions();

  data.extensions.forEach(ext => {
    if (compareVersions(vintiVersion, ext.minVintiVersion) < 0) return;

const installedEntry = installed.find(i => i.id === ext.id);
const isInstalled = !!installedEntry;

const installedVersion =
  installedEntry?.version ||
  (isInstalled ? '1.0.0' : null);

let hasUpdate = false;

if (
  isInstalled &&
  typeof installedVersion === 'string' &&
  compareVersions(ext.version, installedVersion) > 0
) {
  hasUpdate = true;
}


    const card = document.createElement('div');
    card.className = 'download-card';

card.innerHTML = `
  <div class="download-content">
    <div class="download-title">
      ${ext.name}
      ${ext.verified ? '<span class="pill ok mono">Verified</span>' : ''}
    </div>

    <div class="download-desc">
      By ${ext.publisher || 'Unknown'} • Requires Vinti ${ext.minVintiVersion}+
    </div>
        <div class="download-actions">
        <button class="btn ghost" onclick="showExtensionInfo('${ext.id}')">
             Info
          </button>

  ${
    isInstalled
      ? hasUpdate
        ? `
          <button class="btn primary"
            onclick="updateExtension('${ext.id}', '${ext.version}', '${ext.download}')">
            Update
          </button>
          <button class="btn ghost" onclick="openExtension('${ext.id}')">
            Open
          </button>
        `
        : `
          <button class="btn primary" onclick="openExtension('${ext.id}')">
            Open
          </button>
        `
      : `
        <button class="btn primary"
          onclick="installExtension('${ext.id}', '${ext.version}', '${ext.download}')">
          Install
        </button>
      `
  }

  ${
    isInstalled
      ? `
        <button class="btn" onclick="uninstallExtension('${ext.id}')">
          Uninstall
        </button>
      `
      : ''
  }
        </div>
      </div>
    `;

    list.appendChild(card);
    addedCount++;
  });

if (!hint || !hintText) return;

if (addedCount === 0) {
  hint.style.display = 'block';
  if (spinner) spinner.style.display = 'inline-block';

  hintText.textContent =
    'No extensions are available for this version of Vinti.';
  return;
}
updateExtensionsHint({ count: addedCount });
}



async function getInstalledExtensions() {
  if (!window.vintiExtensions) return [];

  const ids = await window.vintiExtensions.list();

  return ids.map(id => ({
    id,
    version: localStorage.getItem(`vinti-ext-version-${id}`)
  }));
}


async function installExtension(id, version, url) {
  const vinti = getVintiInfo();
  if (!vinti || !window.vintiExtensions) {
    alert('The Vinti Store is only available inside Vinti.');
    return;
  }

  try {
    const res = await window.vintiExtensions.install(url);

    if (!res || res.ok === true) {
      localStorage.setItem(`vinti-ext-version-${id}`, version);

      alert('Extension installed successfully.');
      await loadExtensions(vinti.version);
    }
  } catch {
    alert('Extension install failed.');
  }
}


async function openExtension(id) {
  if (!window.vintiExtensions) return;
  await window.vintiExtensions.open(id);
}

async function uninstallExtension(id) {
  if (!confirm('Uninstall this extension?')) return;
  await window.vintiExtensions.uninstall(id);
  const vinti = getVintiInfo();
if (vinti) {
  await loadExtensions(vinti.version);
}
}

async function updateExtension(id, version, url) {
  const vinti = getVintiInfo();
  if (!vinti || !window.vintiExtensions) return;

  try {
    await window.vintiExtensions.update(id, url);
    localStorage.setItem(`vinti-ext-version-${id}`, version);
    await loadExtensions(vinti.version);
    alert('Extension updated successfully.');
  } catch {
    alert('Extension update failed.');
  }
}

function showExtensionInfo(id) {
  fetch('https://raw.githubusercontent.com/BackupPASS/Download-Centre/main/extensions/index.json')
    .then(r => r.json())
    .then(data => {
      const ext = data.extensions.find(e => e.id === id);
      if (!ext) return;

      const perms = (ext.permissions || [])
        .map(p => `• ${p}`)
        .join('\n');

      alert(
        `${ext.name} v${ext.version}\n\n` +
        `By ${ext.publisher}\n` +
        `${ext.verified ? 'Verified by PlingifyPlug\n\n' : '\n'}` +
        `${ext.description}\n\n` +
        `Permissions:\n${perms || 'None'}`
      );
    });
}

