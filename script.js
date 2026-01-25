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
    navButtons.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target).classList.add('active');

    if (target === 'vinti') {
      pageTitle.textContent = 'Vinti Download';
      headerSub.textContent = 'Get the latest version of Vinti for your device.';
    } else {
      pageTitle.textContent = 'PlingifyPlug Hub Download';
      headerSub.textContent = 'Download PlingifyPlug Hub for supported platforms.';
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
      const betaUrl = 'https://github.com/BackupPASS/Download-Centre/releases/download/V3.0.10/Vinti-3.0.10-setup.exe';
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
    const link = 'https://github.com/BackupPASS/Download-Centre/releases/download/V3.0.10/Vinti-3.0.10-setup.exe';
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
