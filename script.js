 const navButtons = document.querySelectorAll('.nav button');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('page-title');
    const headerSub = document.getElementById('header-sub');

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

    // OS detection helper
    function getOSInfo(){
      const ua = navigator.userAgent;
      if (ua.indexOf('Windows') !== -1) return {id:'windows', name:'Windows'};
      if (ua.indexOf('Mac') !== -1 && ua.indexOf('iPhone') === -1) return {id:'mac', name:'macOS'};
      if (ua.indexOf('iPhone') !== -1) return {id:'iphone', name:'iPhone'};
      if (ua.indexOf('Android') !== -1) return {id:'android', name:'Android'};
      if (ua.indexOf('CrOS') !== -1) return {id:'chromeos', name:'ChromeOS'};
      if (ua.indexOf('Linux') !== -1 && ua.indexOf('Android') === -1) return {id:'linux', name:'Linux'};
      return {id:'unknown', name:'Your device'};
    }

    function createDownloadCard(title, desc, downloadLink, downloadLabel, extraLink){
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
        a.className = 'btn-small primary';
        a.textContent = downloadLabel || 'Download';
        actions.appendChild(a);
      }

      if (extraLink) {
        const b = document.createElement('a');
        b.href = extraLink;
        b.className = 'btn-small';
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

    // Vinti download logic (same responses as before)
    const vintiContainer = document.getElementById('vinti-download');
    const os = getOSInfo();

    (function renderVinti(){
      let card;
      if (os.id === 'windows') {
        const link = 'https://github.com/BackupPASS/Downloads-Vinti/releases/download/V2.60.0/Vinti_Setup_2.60.0.exe';
        card = createDownloadCard(
          'Windows Users',
          'Vinti for Windows 10+. Click download to get the latest installer.',
          link,
          'Download Vinti for Windows'
        );
      } else if (os.id === 'mac') {
        const link = 'https://github.com/BackupPASS/Downloads/raw/refs/heads/main/Vinti%20MacOS.app.zip';
        card = createDownloadCard(
          'macOS Users',
          'Vinti for macOS Big Sur 11.7+. Download the .app bundle and follow the instructions.',
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
        // iPhone / Android / ChromeOS / unknown
        card = createDownloadCard(
          os.name + ' is not supported.',
          `This software is not available for download on ${os.name}.`,
          null,
          null,
          'https://plingifyplug.com/VintiRequirements'
        );
      }
      vintiContainer.appendChild(card);
    })();

    // Hub download logic
    const hubContainer = document.getElementById('hub-download');
    (function renderHub(){
      let card;
      if (os.id === 'windows') {
        const link = 'https://github.com/BackupPASS/PlingifyPlug-Hub/releases/download/v.0.0.70/PlingifyPlug-Hub-0.0.70.exe';
        card = createDownloadCard(
          'Windows Users',
          'PlingifyPlug Hub is available for Windows 10+. You will be taken to the Hub download page.',
          link,
          'Download'
        );
      } else {
        card = createDownloadCard(
          os.name + ' is not supported.',
          `PlingifyPlug Hub isn’t available on ${os.name}. You can still use Vinti where supported.`,
          null,
          null,
          'https://plingifyplug.com/VintiRequirements'
        );
      }
      hubContainer.appendChild(card);
    })();

    // Cookie logic
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
