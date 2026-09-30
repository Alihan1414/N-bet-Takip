/**
 * Nöbet Çizelgesi & WhatsApp Bildirim Sistemi
 * Hedef Telefon: +90 541 571 98 89
 */

const TARGET_PHONE = '905415719889';

// Başlangıç Listeleri ve Kullanıcının verdiği önceden tutulmuş (✓) nöbetler
const DEFAULT_DATA = {
  evli: {
    id: 'evli',
    title: 'Gece Nöbeti (Evli)',
    icon: '💍',
    names: [
      'Abdulvahit Gökbunar',
      'Bayram Çok',
      'Emin Burak Hira',
      'Emrullah Kul',
      'Halil Uçar',
      'İbrahim Atay',
      'İlhan Yüceer',
      'İsmail Balcı',
      'Mehmet Ali Alsal',
      'Mehmet Altaş',
      'Mustafa Saçıkara',
      'Mustafa Ünal',
      'Recep Küçüksert',
      'Recep Şahin',
      'Selahattin Kocakoç',
      'Tunahan Sarıbıyık',
      'Tunahan Yeşil'
    ],
    served: [
      'Bayram Çok',
      'Emin Burak Hira'
    ],
    cycleCount: 1
  },
  bekar: {
    id: 'bekar',
    title: 'Gece Nöbeti (Bekar)',
    icon: '👤',
    names: [
      'Abdulkadir Usta',
      'Ahmet Faruk Gözel',
      'Bekir Kağan Ayaz',
      'Beraat Samim Yıldırım',
      'Feyyaz Gürlekçe',
      'Hasan Kemal Kacar',
      'Mehmet Berat Divanlı',
      'Mehmet Hilmi Aratekin',
      'Mustafa Ekmekci (Cuma)',
      'Ömer Ekmekci (Cuma)',
      'Seyfullah Ünal',
      'Şevket Efe Özlü'
    ],
    served: [
      'Abdulkadir Usta',
      'Beraat Samim Yıldırım',
      'Feyyaz Gürlekçe',
      'Mehmet Berat Divanlı',
      'Şevket Efe Özlü'
    ],
    cycleCount: 1
  },
  santral: {
    id: 'santral',
    title: 'Santral Nöbeti (Bekar)',
    icon: '📞',
    names: [
      'Şevket Efe Özlü',
      'Seyfullah Ünal',
      'Mehmet Hilmi Aratekin',
      'Mehmet Berat Divanlı',
      'Hasan Kemal Kacar',
      'Feyyaz Gürlekçe',
      'Beraat Samim Yıldırım',
      'Ahmet Faruk Gözel',
      'Abdulkadir Usta',
      'Ahmet Hamza Tosun'
    ],
    served: [],
    cycleCount: 1
  },
  talebe: {
    id: 'talebe',
    title: 'Talebe Nöbeti',
    icon: '📚',
    names: [],
    served: [],
    cycleCount: 1
  },
  ihvan: {
    id: 'ihvan',
    title: 'İhvan Nöbeti',
    icon: '🤝',
    names: [],
    served: [],
    cycleCount: 1
  }
};

const STORAGE_KEY_CATEGORIES = 'nobet_categories_v2';
const STORAGE_KEY_HISTORY = 'nobet_history_v2';

// State Management
let appState = {
  categories: {},
  history: [],
  selectedDate: '',
  currentSelections: {
    evli: '',
    bekar: '',
    santral: '',
    talebe: '',
    ihvan: ''
  },
  guests: '',
  customNote: ''
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initDatePicker();
  renderAllSelects();
  checkDayAlerts();
  updateLivePreview();
  setupEventListeners();
  initServiceWorker();
  initPwaInstall();
});

// PWA Service Worker Registration
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker kayıtlı:', reg.scope))
        .catch(err => console.log('Service Worker hatası:', err));
    });
  }
}

// PWA Install Prompt (Android & iOS)
let deferredPrompt = null;
function initPwaInstall() {
  const installBtn = document.getElementById('installAppBtn');
  const iosModal = document.getElementById('iosInstallModal');
  const closeIosBtn = document.getElementById('closeIosModal');
  const closeIosBtn2 = document.getElementById('closeIosModal2');

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  // iOS için Yükleme Butonunu Göster
  if (isIos && !isStandalone && installBtn) {
    installBtn.style.display = 'inline-flex';
    installBtn.innerHTML = '📲 Ana Ekrana Ekle';
    installBtn.addEventListener('click', () => {
      if (iosModal) iosModal.style.display = 'flex';
    });
  }

  // Android ve Chrome için Yükleme İstemi
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn && !isStandalone) {
      installBtn.style.display = 'inline-flex';
      installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              installBtn.style.display = 'none';
              showToast('Uygulama başarıyla kuruluyor! 🎉');
            }
            deferredPrompt = null;
          });
        }
      });
    }
  });

  // Modal Kapatma
  const closeIos = () => {
    if (iosModal) iosModal.style.display = 'none';
  };
  if (closeIosBtn) closeIosBtn.addEventListener('click', closeIos);
  if (closeIosBtn2) closeIosBtn2.addEventListener('click', closeIos);
  window.addEventListener('click', (e) => {
    if (e.target === iosModal) closeIos();
  });
}

function loadState() {
  const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  if (savedCategories) {
    try {
      appState.categories = JSON.parse(savedCategories);
      // Eski geçici placeholder isimlerini temizle
      if (appState.categories.talebe) {
        appState.categories.talebe.names = appState.categories.talebe.names.filter(n => !n.startsWith('Talebe Grubu'));
      }
      if (appState.categories.ihvan) {
        appState.categories.ihvan.names = appState.categories.ihvan.names.filter(n => !n.startsWith('İhvan Ekip'));
      }
    } catch (e) {
      console.error('Kayıtlı veri okunamadı, varsayılan yükleniyor', e);
      appState.categories = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  } else {
    appState.categories = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveCategories();
  }

  const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (savedHistory) {
    try {
      appState.history = JSON.parse(savedHistory);
    } catch (e) {
      appState.history = [];
    }
  }
}

function saveCategories() {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(appState.categories));
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(appState.history));
}

// Date Handling
function initDatePicker() {
  const dateInput = document.getElementById('shiftDate');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  dateInput.value = todayStr;
  appState.selectedDate = todayStr;
  updateDateHeading(today);

  dateInput.addEventListener('change', (e) => {
    appState.selectedDate = e.target.value;
    const parts = e.target.value.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      updateDateHeading(d);
      checkDayAlerts(d);
      updateLivePreview();
    }
  });
}

function updateDateHeading(dateObj) {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  
  const dayName = days[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];
  const text = `${dateObj.getDate()} ${monthName} ${dateObj.getFullYear()}, ${dayName}`;
  
  const el = document.getElementById('todayFormattedText');
  if (el) el.textContent = text;
}

// Special Day Notifications
function checkDayAlerts(dateObj = new Date()) {
  const dayIndex = dateObj.getDay(); // 0: Pazar, 5: Cuma, 6: Ctesi
  const banner = document.getElementById('dayAlertBanner');
  const title = document.getElementById('dayAlertTitle');
  const desc = document.getElementById('dayAlertDesc');

  if (dayIndex === 5) { // Cuma
    banner.style.display = 'flex';
    title.textContent = '🕌 Cuma Günü Özel Hatırlatması';
    desc.textContent = 'Bekar Gece Nöbetinde kural gereği "Mustafa Ekmekci (Cuma)" veya "Ömer Ekmekci (Cuma)" seçilmesi tavsiye edilir.';
  } else if (dayIndex === 6) { // Cumartesi
    banner.style.display = 'flex';
    title.textContent = '🌙 Cumartesi Gecesi Özel Hatırlatması';
    desc.textContent = 'Evli Gece Nöbeti için listeye özel not: "Ctesi Gece Hilmi Yeni" nöbetçidir.';
  } else if (dayIndex === 0) { // Pazar
    banner.style.display = 'flex';
    title.textContent = '🌙 Pazar Gecesi Özel Hatırlatması';
    desc.textContent = 'Evli Gece Nöbeti için listeye özel not: "Pazar Gece Ahmed Hamza Tosun" nöbetçidir.';
  } else {
    banner.style.display = 'none';
  }
}

// Render Dropdowns with Smart Rotation Lock
function renderAllSelects() {
  const catKeys = ['evli', 'bekar', 'santral', 'talebe', 'ihvan'];
  catKeys.forEach(catKey => renderCategorySelect(catKey));
}

function renderCategorySelect(catKey) {
  const cat = appState.categories[catKey];
  if (!cat) return;

  const selectEl = document.getElementById(`select-${catKey}`);
  const badgeEl = document.getElementById(`badge-${catKey}`);
  const progressEl = document.getElementById(`progress-${catKey}`);
  const tipEl = document.getElementById(`tip-${catKey}`);

  if (!selectEl) return;

  const totalNames = cat.names.length;
  const servedCount = cat.served.length;
  const waitingCount = totalNames - servedCount;

  // Badge & Progress
  if (badgeEl) {
    badgeEl.textContent = `${servedCount} / ${totalNames} nöbet tuttu`;
    if (servedCount >= totalNames && totalNames > 0) {
      badgeEl.classList.add('completed');
    } else {
      badgeEl.classList.remove('completed');
    }
  }

  if (progressEl) {
    const pct = totalNames > 0 ? Math.round((servedCount / totalNames) * 100) : 0;
    progressEl.style.width = `${pct}%`;
  }

  // Options
  const currentVal = appState.currentSelections[catKey] || '';
  selectEl.innerHTML = '<option value="">-- Kişi Seçiniz --</option>';

  // Sort: available first, served later
  const availableNames = cat.names.filter(n => !cat.served.includes(n));
  const servedNames = cat.names.filter(n => cat.served.includes(n));

  // Available options
  if (availableNames.length > 0) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = `Nöbet Sırası Bekleyenler (${availableNames.length})`;
    availableNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === currentVal) opt.selected = true;
      optgroup.appendChild(opt);
    });
    selectEl.appendChild(optgroup);
  }

  // Already served (Locked) options
  if (servedNames.length > 0) {
    const optgroupLocked = document.createElement('optgroup');
    optgroupLocked.label = `Döngüde Nöbet Tutanlar [Kilitli] (${servedNames.length})`;
    servedNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `✓ ${name} (Bu döngüde tuttu)`;
      opt.disabled = true;
      optgroupLocked.appendChild(opt);
    });
    selectEl.appendChild(optgroupLocked);
  }

  // Status tip text
  if (tipEl) {
    if (totalNames === 0) {
      tipEl.className = 'status-tip';
      tipEl.textContent = 'Aşağıdaki kutudan yeni isim girip "Ekle"ye basabilirsiniz.';
    } else if (waitingCount === 0 && totalNames > 0) {
      tipEl.className = 'status-tip success';
      tipEl.textContent = '🎉 Bu kategorideki herkes nöbet tuttu! Gönderim sonrası döngü otomatik sıfırlanacaktır.';
    } else if (waitingCount === 1) {
      tipEl.className = 'status-tip warning';
      tipEl.textContent = `⚡ Son 1 kişi kaldı: ${availableNames[0]}`;
    } else {
      tipEl.className = 'status-tip';
      tipEl.textContent = `${waitingCount} kişi nöbet sırası bekliyor.`;
    }
  }
}

// Generate Formatted WhatsApp Text (Kullanıcının İstediği Tüy Emojili Şablon)
function buildWhatsAppMessage() {
  const evliVal = appState.currentSelections.evli;
  const bekarVal = appState.currentSelections.bekar;
  const talebeVal = appState.currentSelections.talebe;
  const santralVal = appState.currentSelections.santral;
  const ihvanVal = appState.currentSelections.ihvan;
  const guests = (appState.guests || '').trim();
  const note = (appState.customNote || '').trim();

  let blocks = [];

  // 1. Evli Gece Nöbetçisi
  if (evliVal) {
    blocks.push(`🪶 *Evli Gece Nöbetçisi:*\n${evliVal}`);
  }

  // 2. Gece Nöbetçisi (Bekar)
  if (bekarVal) {
    blocks.push(`🪶 *Gece Nöbetçisi:*\n${bekarVal}`);
  }

  // 3. Talebe Nöbetçisi
  if (talebeVal) {
    blocks.push(`🪶 *Talebe Nöbetçisi:*\n${talebeVal}`);
  }

  // 4. Santral Nöbetçisi (seçildiyse)
  if (santralVal) {
    blocks.push(`🪶 *Santral Nöbetçisi:*\n${santralVal}`);
  }

  // 5. İhvan Nöbetçisi (seçildiyse)
  if (ihvanVal) {
    blocks.push(`🪶 *İhvan Nöbetçisi:*\n${ihvanVal}`);
  }

  // 6. Misafirlerimiz (varsa)
  if (guests) {
    blocks.push(`🪶 *Misafirlerimiz:*\n${guests}`);
  }

  let msg = blocks.join('\n\n');

  // Opsiyonel Not
  if (note) {
    msg += (msg ? '\n\n' : '') + `📝 *Not:* ${note}`;
  }

  // Sabit Nöbet Saatleri
  msg += (msg ? '\n\n\n' : '') + `Gece Nöbeti: 22:00 – 07:30\nGündüz Nöbeti: 07:30 – 22:00`;

  return msg;
}

function updateLivePreview() {
  const msg = buildWhatsAppMessage();
  const previewEl = document.getElementById('waMessageText');
  if (previewEl) {
    previewEl.textContent = msg;
  }

  const timeEl = document.getElementById('waTimeDisplay');
  if (timeEl) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hh}:${mm}`;
  }
}

// Event Listeners
function setupEventListeners() {
  // Category Select Changes
  const catKeys = ['evli', 'bekar', 'santral', 'talebe', 'ihvan'];
  catKeys.forEach(catKey => {
    const select = document.getElementById(`select-${catKey}`);
    if (select) {
      select.addEventListener('change', (e) => {
        appState.currentSelections[catKey] = e.target.value;
        updateLivePreview();
      });
    }
  });

  // Guest Input
  const guestEl = document.getElementById('guestInput');
  if (guestEl) {
    guestEl.addEventListener('input', (e) => {
      appState.guests = e.target.value;
      updateLivePreview();
    });
  }

  // Guest Quick Tags
  document.querySelectorAll('.guest-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      if (guestEl) {
        if (guestEl.value) {
          guestEl.value += '\n' + text;
        } else {
          guestEl.value = text;
        }
        appState.guests = guestEl.value;
        updateLivePreview();
      }
    });
  });

  // Custom Note Input
  const noteEl = document.getElementById('customNote');
  if (noteEl) {
    noteEl.addEventListener('input', (e) => {
      appState.customNote = e.target.value;
      updateLivePreview();
    });
  }

  // Note Quick Tags
  document.querySelectorAll('.note-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      if (noteEl) {
        if (noteEl.value) {
          noteEl.value += ' ' + text;
        } else {
          noteEl.value = text;
        }
        appState.customNote = noteEl.value;
        updateLivePreview();
      }
    });
  });

  // Copy Message Buttons
  const handleCopy = () => {
    const msg = buildWhatsAppMessage();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(() => {
        showToast('Nöbet mesajı tüm emojileriyle panoya kopyalandı! 📋');
      }).catch(() => {
        showToast('Panoya kopyalama başarısız oldu.');
      });
    }
  };

  const copyBtn = document.getElementById('copyMsgBtn');
  if (copyBtn) copyBtn.addEventListener('click', handleCopy);

  const copyAndNotifyBtn = document.getElementById('copyAndNotifyBtn');
  if (copyAndNotifyBtn) copyAndNotifyBtn.addEventListener('click', handleCopy);

  // Send WhatsApp Buttons (Main & Web)
  const sendMainBtn = document.getElementById('sendWhatsAppMainBtn');
  if (sendMainBtn) {
    sendMainBtn.addEventListener('click', () => handleSaveAndSend('auto'));
  }

  const sendWebBtn = document.getElementById('sendWhatsAppWebBtn');
  if (sendWebBtn) {
    sendWebBtn.addEventListener('click', () => handleSaveAndSend('web'));
  }

  // Talebe ve İhvan İçin Kart Üzerinden Hızlı İsim Ekleme
  const setupQuickAdd = (catKey) => {
    const input = document.getElementById(`quickAdd-${catKey}`);
    const btn = document.getElementById(`quickAddBtn-${catKey}`);
    if (!input || !btn) return;

    const doAdd = () => {
      const val = input.value.trim();
      if (!val) {
        input.focus();
        return;
      }

      const cat = appState.categories[catKey];
      if (!cat) return;

      // İsmi listeye ekle (eğer daha önce yoksa)
      if (!cat.names.includes(val)) {
        cat.names.push(val);
      }

      // Bugünün nöbetçisi olarak otomatik seç
      appState.currentSelections[catKey] = val;

      saveCategories();
      renderCategorySelect(catKey);
      updateLivePreview();
      input.value = '';

      showToast(`"${val}" listeye kaydedildi ve seçildi! ✨`);
    };

    btn.addEventListener('click', doAdd);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doAdd();
      }
    });
  };

  setupQuickAdd('talebe');
  setupQuickAdd('ihvan');

  // Modal Open/Close
  setupModals();
}

// Save Shift, Update Cycle, and Launch WhatsApp
function handleSaveAndSend(sendMode = 'web') {
  const selectedCounts = Object.values(appState.currentSelections).filter(v => Boolean(v)).length;
  if (selectedCounts === 0) {
    alert('Lütfen en az bir nöbetçi seçiniz!');
    return;
  }

  // 1. Her seçilen ismi kendi kategorisinin "served" listesine ekle
  let resetHappened = [];
  const catKeys = ['evli', 'bekar', 'santral', 'talebe', 'ihvan'];
  
  catKeys.forEach(catKey => {
    const chosen = appState.currentSelections[catKey];
    const cat = appState.categories[catKey];
    if (chosen && cat) {
      if (!cat.served.includes(chosen)) {
        cat.served.push(chosen);
      }

      // Döngü tamamlandı mı kontrolü
      if (cat.served.length >= cat.names.length && cat.names.length > 0) {
        cat.served = []; // Döngü sıfırlandı!
        cat.cycleCount = (cat.cycleCount || 1) + 1;
        resetHappened.push(cat.title);
      }
    }
  });

  // 2. Geçmişe kaydet
  const historyRecord = {
    id: Date.now(),
    date: appState.selectedDate,
    selections: { ...appState.currentSelections },
    guests: appState.guests,
    note: appState.customNote,
    timestamp: new Date().toISOString()
  };
  appState.history.unshift(historyRecord);

  // 3. Kaydet
  saveCategories();
  saveHistory();

  // 4. Arayüzü tazele
  renderAllSelects();

  if (resetHappened.length > 0) {
    alert(`🎉 Tebrikler! Aşağıdaki kategorilerde herkes nöbet tuttu ve yeni döngüye geçildi:\n- ${resetHappened.join('\n- ')}`);
  }

  // 5. Mesajı oluştur ve panoya otomatik kopyala
  const msg = buildWhatsAppMessage();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).catch(() => {});
  }

  // 6. WhatsApp Bağlantısını Aç (Telefonda doğrudan WhatsApp uygulamasını açar)
  const encoded = encodeURIComponent(msg);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  showToast('Nöbet kaydedildi & WhatsApp açılıyor... ✨');

  if (sendMode === 'app' || (sendMode === 'auto' && isMobile)) {
    // Telefonda doğrudan yerel WhatsApp uygulamasını açar (web sayfası araya girmez)
    window.location.href = `whatsapp://send?phone=${TARGET_PHONE}&text=${encoded}`;
  } else {
    // Bilgisayarda doğrudan WhatsApp Web açar
    window.open(`https://web.whatsapp.com/send?phone=${TARGET_PHONE}&text=${encoded}`, '_blank');
  }
}

// Modal Setup & Member List Management
let activeManageTab = 'evli';

function setupModals() {
  const manageModal = document.getElementById('manageModal');
  const openManageBtn = document.getElementById('openManageBtn');
  const closeManageBtn = document.getElementById('closeManageModal');
  const closeManageBtn2 = document.getElementById('closeManageModal2');
  const resetCurrentCycleBtn = document.getElementById('resetCurrentCycleBtn');

  if (openManageBtn) {
    openManageBtn.addEventListener('click', () => {
      manageModal.style.display = 'flex';
      renderManageTabContent(activeManageTab);
    });
  }

  const closeManage = () => {
    manageModal.style.display = 'none';
    renderAllSelects();
    updateLivePreview();
  };

  if (closeManageBtn) closeManageBtn.addEventListener('click', closeManage);
  if (closeManageBtn2) closeManageBtn2.addEventListener('click', closeManage);

  // Tabs inside manage modal
  document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.modal-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabTarget = btn.getAttribute('data-tab').replace('tab-', '');
      activeManageTab = tabTarget;
      renderManageTabContent(activeManageTab);
    });
  });

  if (resetCurrentCycleBtn) {
    resetCurrentCycleBtn.addEventListener('click', () => {
      const cat = appState.categories[activeManageTab];
      if (!cat) return;
      if (confirm(`"${cat.title}" kategorisindeki tüm "nöbet tuttu" işaretleri sıfırlanacak. Emin misiniz?`)) {
        cat.served = [];
        saveCategories();
        renderManageTabContent(activeManageTab);
        renderAllSelects();
        showToast('Döngü sıfırlandı.');
      }
    });
  }

  // History Modal
  const historyModal = document.getElementById('historyModal');
  const openHistoryBtn = document.getElementById('openHistoryBtn');
  const closeHistoryBtn = document.getElementById('closeHistoryModal');
  const closeHistoryBtn2 = document.getElementById('closeHistoryModal2');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  if (openHistoryBtn) {
    openHistoryBtn.addEventListener('click', () => {
      historyModal.style.display = 'flex';
      renderHistoryList();
    });
  }

  const closeHistory = () => {
    historyModal.style.display = 'none';
  };

  if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', closeHistory);
  if (closeHistoryBtn2) closeHistoryBtn2.addEventListener('click', closeHistory);

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Tüm nöbet geçmişi silinecektir. Emin misiniz?')) {
        appState.history = [];
        saveHistory();
        renderHistoryList();
        showToast('Geçmiş temizlendi.');
      }
    });
  }

  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === manageModal) closeManage();
    if (e.target === historyModal) closeHistory();
  });
}

function renderManageTabContent(catKey) {
  const container = document.getElementById('tabContentContainer');
  const cat = appState.categories[catKey];
  if (!cat || !container) return;

  container.innerHTML = `
    <div class="add-member-bar">
      <input type="text" id="newMemberInput" placeholder="${cat.title} listesine yeni kişi adı giriniz...">
      <button class="btn btn-primary" id="addMemberBtn">Ekle</button>
    </div>
    <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-muted); display:flex; justify-content:space-between;">
      <span>Toplam: <strong>${cat.names.length}</strong> kişi</span>
      <span>Nöbet Tutan: <strong>${cat.served.length}</strong> / Bekleyen: <strong>${cat.names.length - cat.served.length}</strong></span>
    </div>
    <div class="member-list-items" id="memberListItems"></div>
  `;

  const listContainer = document.getElementById('memberListItems');
  cat.names.forEach((name, idx) => {
    const isServed = cat.served.includes(name);
    const item = document.createElement('div');
    item.className = `member-item ${isServed ? 'served' : ''}`;
    item.innerHTML = `
      <div class="member-name-wrap">
        <span style="color: var(--text-dim); font-size:0.8rem; width:20px;">${idx + 1}.</span>
        <strong style="color: ${isServed ? 'var(--accent-green)' : '#fff'}">${name}</strong>
        <span class="status-badge ${isServed ? 'badge-served' : 'badge-waiting'}">
          ${isServed ? '✓ Nöbet Tuttu' : '⏳ Bekliyor'}
        </span>
      </div>
      <div class="member-actions">
        <button class="btn btn-sm btn-outline toggle-served-btn" data-name="${name}">
          ${isServed ? 'Bekliyor Yap' : 'Nöbet Tuttu İşaretle'}
        </button>
        <button class="btn-icon delete delete-member-btn" data-name="${name}" title="Kişiyi Sil">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;
    listContainer.appendChild(item);
  });

  // Add Member
  const addBtn = document.getElementById('addMemberBtn');
  const input = document.getElementById('newMemberInput');
  const handleAdd = () => {
    const val = input.value.trim();
    if (!val) return;
    if (cat.names.includes(val)) {
      alert('Bu isim zaten listede kayıtlı!');
      return;
    }
    cat.names.push(val);
    saveCategories();
    renderManageTabContent(catKey);
    renderAllSelects();
    showToast(`"${val}" listeye eklendi.`);
  };

  addBtn.addEventListener('click', handleAdd);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdd();
  });

  // Toggle Served status
  listContainer.querySelectorAll('.toggle-served-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      if (cat.served.includes(name)) {
        cat.served = cat.served.filter(n => n !== name);
      } else {
        cat.served.push(name);
      }
      saveCategories();
      renderManageTabContent(catKey);
      renderAllSelects();
    });
  });

  // Delete Member
  listContainer.querySelectorAll('.delete-member-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      if (confirm(`"${name}" kişisini listeden silmek istediğinize emin misiniz?`)) {
        cat.names = cat.names.filter(n => n !== name);
        cat.served = cat.served.filter(n => n !== name);
        saveCategories();
        renderManageTabContent(catKey);
        renderAllSelects();
        showToast(`"${name}" listeden silindi.`);
      }
    });
  });
}

function renderHistoryList() {
  const container = document.getElementById('historyListContainer');
  if (!container) return;

  if (appState.history.length === 0) {
    container.innerHTML = '<p style="color: var(--text-dim); text-align:center; padding: 30px;">Henüz kaydedilmiş nöbet geçmişi bulunmuyor.</p>';
    return;
  }

  container.innerHTML = '';
  appState.history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-header">
        <span>📅 ${item.date}</span>
        <span style="color: var(--text-dim); font-size: 0.75rem;">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="history-grid">
        <div class="history-item-line">💍 Evli: <strong>${item.selections.evli || '-'}</strong></div>
        <div class="history-item-line">👤 Bekar: <strong>${item.selections.bekar || '-'}</strong></div>
        <div class="history-item-line">📞 Santral: <strong>${item.selections.santral || '-'}</strong></div>
        <div class="history-item-line">📚 Talebe: <strong>${item.selections.talebe || '-'}</strong></div>
        <div class="history-item-line">🤝 İhvan: <strong>${item.selections.ihvan || '-'}</strong></div>
      </div>
      ${item.note ? `<div class="history-note">📝 Not: ${item.note}</div>` : ''}
    `;
    container.appendChild(card);
  });
}

// Toast helper
function showToast(text) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
