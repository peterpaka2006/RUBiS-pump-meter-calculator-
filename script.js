let invoiceCount = 1;

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = toast.querySelector('.toast-icon');

  toastMsg.textContent = message;

  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ED1C24, #C62828)';
    toastIcon.textContent = '❌';
  } else {
    toast.style.background = 'linear-gradient(135deg, #009639, #00A651)';
    toastIcon.textContent = '✅';
  }

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function saveHistory() {
  const grandTotal = unformatNumber(document.getElementById('grandTotal').textContent.replace(' UGX',''));
  if (grandTotal <= 0) return;

  const today = new Date().toLocaleDateString('en-UG');
  const history = JSON.parse(localStorage.getItem('salesHistory') || '[]');

  const existingIndex = history.findIndex(h => h.date === today);
  if (existingIndex > -1) {
    history[existingIndex].amount = grandTotal;
  } else {
    history.unshift({ date: today, amount: grandTotal });
  }

  if (history.length > 30) history.pop();
  localStorage.setItem('salesHistory', JSON.stringify(history));
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem('salesHistory') || '[]');
  const historyList = document.getElementById('historyList');

  if (history.length === 0) {
    historyList.innerHTML = '<p style="color:#999;text-align:center;">No history yet</p>';
  } else {
    historyList.innerHTML = history.map(item => `
      <div class="history-item">
        <div class="history-date">Date: ${item.date}</div>
        <div class="history-amount">Money made: ${formatNumber(item.amount)} UGX</div>
      </div>
    `).join('');
  }

  document.getElementById('historyDialog').classList.add('show');
}

function hideHistory() {
  document.getElementById('historyDialog').classList.remove('show');
}

function sendWhatsApp() {
  saveHistory();
  saveInvoices();
  saveMeters(); // Save meters before sending

  const dateTime = document.getElementById('currentDateTime').textContent;
  const shift = document.getElementById('shiftLabel').textContent;
  const staff = document.getElementById('staffNameDisplay').textContent;
  const grandTotal = document.getElementById('grandTotal').textContent;
  const momo = document.getElementById('momoAmount').value || '0';
  const airtel = document.getElementById('airtelAmount').value || '0';
  const safe = document.getElementById('safeAmount').value || '0';
  const totalDeductions = document.getElementById('totalDeductions').value || '0 UGX';
  const cashBalance = document.getElementById('cashBalance').value || '0 UGX';

  let invoiceText = '';
  document.querySelectorAll('.invoice-row').forEach((row, index) => {
    const amount = row.querySelector('.invAmount').value;
    const name = row.querySelector('.invName').value;
    const plate = row.querySelector('.invPlate').value;
    if (amount && unformatNumber(amount) > 0) {
      invoiceText += `\n${index+1}. ${name || 'No Name'} - ${plate || 'No Plate'}: ${amount} UGX`;
    }
  });

  let message = `*RUBIS SHIFT REPORT*\n\n📅 Date: ${dateTime}\n${shift}\n👤 Staff: ${staff}\n\n🏦 GRAND TOTAL: ${grandTotal}\n\n💳 DEDUCTIONS:\nMomo: ${momo} UGX\nAirtel: ${airtel} UGX\nSafe: ${safe} UGX${invoiceText}\nTOTAL DEDUCTIONS: ${totalDeductions}\n\n💰 C/B CASH BALANCE: ${cashBalance}\n\n⚡ Developed by PETERPAKA TEC GUY`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

function printReport() {
  saveHistory();
  saveInvoices();
  saveMeters(); // Save meters before printing
  window.print();
}

// Save invoices to localStorage per day
function saveInvoices() {
  const invoices = [];
  document.querySelectorAll('.invoice-row').forEach(row => {
    const amount = row.querySelector('.invAmount').value;
    const name = row.querySelector('.invName').value;
    const plate = row.querySelector('.invPlate').value;
    if (amount || name || plate) {
      invoices.push({amount, name, plate});
    }
  });
  const today = new Date().toLocaleDateString('en-UG');
  localStorage.setItem('invoices_' + today, JSON.stringify(invoices));
}

// Load invoices from localStorage on app open
function loadInvoices() {
  const today = new Date().toLocaleDateString('en-UG');
  const saved = JSON.parse(localStorage.getItem('invoices_' + today) || '[]');
  const container = document.getElementById('invoicesContainer');

  if (saved.length > 0) {
    container.innerHTML = '';
    saved.forEach(inv => {
      const row = document.createElement('div');
      row.className = 'invoice-row';
      row.innerHTML = `
        <div class="row"><label>Amount:</label><input type="text" class="invAmount money-input" value="${inv.amount}" placeholder="UGX"></div>
        <div class="row"><label>Name:</label><input type="text" class="invName" value="${inv.name}" placeholder="Customer Name"></div>
        <div class="row"><label>Plate:</label><input type="text" class="invPlate" value="${inv.plate}" placeholder="UAX 123X"></div>
      `;
      container.appendChild(row);
    });
  }
  invoiceCount = saved.length || 1;
  calculateCash();
}

// NEW: Save meters to localStorage per day
function saveMeters() {
  const today = new Date().toLocaleDateString('en-UG');
  const meterData = {
    pricePMS: document.getElementById('pricePMS').value,
    priceAGO: document.getElementById('priceAGO').value,
    a_openPMS: document.getElementById('a-openPMS').value,
    a_openAGO: document.getElementById('a-openAGO').value,
    a_closePMS: document.getElementById('a-closePMS').value,
    a_closeAGO: document.getElementById('a-closeAGO').value,
    b_openPMS: document.getElementById('b-openPMS').value,
    b_openAGO: document.getElementById('b-openAGO').value,
    b_closePMS: document.getElementById('b-closePMS').value,
    b_closeAGO: document.getElementById('b-closeAGO').value,
    momo: document.getElementById('momoAmount').value,
    airtel: document.getElementById('airtelAmount').value,
    safe: document.getElementById('safeAmount').value
  };
  localStorage.setItem('meters_' + today, JSON.stringify(meterData));
}

// NEW: Load meters from localStorage on app open
function loadMeters() {
  const today = new Date().toLocaleDateString('en-UG');
  const saved = JSON.parse(localStorage.getItem('meters_' + today) || '{}');

  if (saved.pricePMS) document.getElementById('pricePMS').value = saved.pricePMS;
  if (saved.priceAGO) document.getElementById('priceAGO').value = saved.priceAGO;
  if (saved.a_openPMS) document.getElementById('a-openPMS').value = saved.a_openPMS;
  if (saved.a_openAGO) document.getElementById('a-openAGO').value = saved.a_openAGO;
  if (saved.a_closePMS) document.getElementById('a-closePMS').value = saved.a_closePMS;
  if (saved.a_closeAGO) document.getElementById('a-closeAGO').value = saved.a_closeAGO;
  if (saved.b_openPMS) document.getElementById('b-openPMS').value = saved.b_openPMS;
  if (saved.b_openAGO) document.getElementById('b-openAGO').value = saved.b_openAGO;
  if (saved.b_closePMS) document.getElementById('b-closePMS').value = saved.b_closePMS;
  if (saved.b_closeAGO) document.getElementById('b-closeAGO').value = saved.b_closeAGO;
  if (saved.momo) document.getElementById('momoAmount').value = saved.momo;
  if (saved.airtel) document.getElementById('airtelAmount').value = saved.airtel;
  if (saved.safe) document.getElementById('safeAmount').value = saved.safe;

  // Recalculate after loading
  calculate('a');
  calculate('b');
  calculateCash();
}

window.onload = () => {
  const savedName = localStorage.getItem('staffName');
  const savedPhoto = localStorage.getItem('staffPhoto');
  const savedPin = localStorage.getItem('staffPin');

  if (savedName && savedPhoto && savedPin) {
    document.getElementById('createAccountSection').style.display = 'none';
    document.getElementById('pinLoginSection').style.display = 'block';
    document.getElementById('resetPinSection').style.display = 'none';
    document.getElementById('savedProfile').src = savedPhoto;
    document.getElementById('welcomeName').textContent = 'Welcome ' + savedName;
    document.getElementById('loginSubtitle').textContent = 'Enter PIN to Unlock';
  } else {
    document.getElementById('createAccountSection').style.display = 'block';
    document.getElementById('pinLoginSection').style.display = 'none';
    document.getElementById('resetPinSection').style.display = 'none';
    document.getElementById('loginSubtitle').textContent = 'Create Account First';
  }
}

function createAccount() {
  const name = document.getElementById('loginName').value.trim();
  const pic = document.getElementById('profilePreview').src;
  const pin = document.getElementById('createPin').value;
  const confirmPin = document.getElementById('confirmPin').value;
  const secQ = document.getElementById('secQuestion').value;
  const secA = document.getElementById('secAnswer').value.trim().toLowerCase();

  if (!name) { showToast('Please enter your name', 'error'); return; }
  if (pin.length!== 4 || isNaN(pin)) { showToast('PIN must be 4 digits', 'error'); return; }
  if (pin!== confirmPin) { showToast('PINs do not match', 'error'); return; }
  if (!secQ) { showToast('Select security question', 'error'); return; }
  if (!secA) { showToast('Enter security answer', 'error'); return; }

  localStorage.setItem('staffName', name);
  localStorage.setItem('staffPhoto', pic);
  localStorage.setItem('staffPin', pin);
  localStorage.setItem('secQuestion', secQ);
  localStorage.setItem('secAnswer', secA);

  showToast('Account created successfully!');
  setTimeout(() => openApp(), 800);
}

function loginWithPin() {
  const enteredPin = document.getElementById('loginPin').value;
  const savedPin = localStorage.getItem('staffPin');

  if (enteredPin!== savedPin) {
    showToast('Wrong PIN! Try again', 'error');
    document.getElementById('loginPin').value = '';
    return;
  }

  openApp();
  showToast('Unlocked successfully');
}

function openApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  updateStaffDisplay();
  loadMeters(); // Load meters first
  loadInvoices(); // Then load invoices
}

function switchUser() {
  if (confirm('Clear current user and create new account?')) {
    localStorage.clear();
    location.reload();
  }
}

function showResetPin() {
  const q = localStorage.getItem('secQuestion');
  const questions = {
    mother: "What is your mother's name?",
    school: "What primary school did you attend?",
    village: "What village were you born in?",
    pet: "What is your favorite animal?"
  };

  document.getElementById('pinLoginSection').style.display = 'none';
  document.getElementById('resetPinSection').style.display = 'block';
  document.getElementById('resetQuestion').textContent = questions[q];
}

function backToLogin() {
  document.getElementById('resetPinSection').style.display = 'none';
  document.getElementById('pinLoginSection').style.display = 'block';
  document.getElementById('resetAnswer').value = '';
  document.getElementById('newPin1').value = '';
  document.getElementById('newPin2').value = '';
}

function resetMyPin() {
  const answer = document.getElementById('resetAnswer').value.trim().toLowerCase();
  const savedAnswer = localStorage.getItem('secAnswer');
  const newPin1 = document.getElementById('newPin1').value;
  const newPin2 = document.getElementById('newPin2').value;

  if (answer!== savedAnswer) {
    showToast('Wrong answer! Try again', 'error');
    return;
  }
  if (newPin1.length!== 4 || isNaN(newPin1)) {
    showToast('PIN must be 4 digits', 'error');
    return;
  }
  if (newPin1!== newPin2) {
    showToast('PINs do not match', 'error');
    return;
  }

  localStorage.setItem('staffPin', newPin1);
  showToast('PIN Reset Successfully!');
  backToLogin();
}

function showLogoutDialog() {
  document.getElementById('logoutDialog').classList.add('show');
}

function hideLogoutDialog() {
  document.getElementById('logoutDialog').classList.remove('show');
}

function confirmLogout() {
  hideLogoutDialog();
  saveInvoices();
  saveMeters(); // Save meters before logout
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginPin').value = '';
  showToast('Screen locked');
}

document.getElementById('profilePic').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profilePreview').src = e.target.result;
    }
    reader.readAsDataURL(file);
  }
});

document.getElementById('accountPic').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('accountPhoto').src = e.target.result;
    }
    reader.readAsDataURL(file);
  }
});

function updateStaffDisplay() {
  const name = localStorage.getItem('staffName');
  const photo = localStorage.getItem('staffPhoto');
  document.getElementById('staffNameDisplay').textContent = name;
  document.getElementById('staffPhoto').src = photo;
  document.getElementById('accountName').value = name;
  document.getElementById('accountPhoto').src = photo;
}

function saveAccount() {
  const newName = document.getElementById('accountName').value.trim();
  const newPhoto = document.getElementById('accountPhoto').src;
  const newPin = document.getElementById('newPin').value;

  if (!newName) {
    showToast('Name cannot be empty', 'error');
    return;
  }

  localStorage.setItem('staffName', newName);
  localStorage.setItem('staffPhoto', newPhoto);

  if (newPin) {
    if (newPin.length!== 4 || isNaN(newPin)) {
      showToast('PIN must be 4 digits', 'error');
      return;
    }
    localStorage.setItem('staffPin', newPin);
    showToast('Profile & PIN updated!');
  } else {
    showToast('Profile updated!');
  }

  updateStaffDisplay();
  document.getElementById('newPin').value = '';
  showPage('meters');
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(page + 'Page').classList.add('active');
  if(event && event.target.classList.contains('nav-btn')) {
    event.target.classList.add('active');
  }
}

function updateDateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours + minutes/60;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-UG', options);

  const shiftLabel = document.getElementById('shiftLabel');
  if (currentTime >= 7.52 && currentTime <= 16.5) {
    shiftLabel.textContent = '🌞 DAY SHIFT';
    shiftLabel.className = 'shift-label day-shift';
  } else {
    shiftLabel.textContent = '🌙 NIGHT SHIFT';
    shiftLabel.className = 'shift-label night-shift';
  }
}
updateDateTime();
setInterval(updateDateTime, 60000);

// FIXED: Format number with commas, no decimals for UGX cash
function formatNumber(num) {
  if (num === '' || num === null || isNaN(num)) return '';
  num = Math.round(Number(num));
  return num.toLocaleString('en-US');
}

// FIXED: Parse number correctly, keep decimals for calculation
function unformatNumber(str) {
  if (!str) return 0;
  let cleaned = str.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

document.addEventListener('input', function(e) {
  if (e.target.classList.contains('money-input')) {
    const cursorPos = e.target.selectionStart;
    const oldLength = e.target.value.length;
    let rawNum = unformatNumber(e.target.value);
    e.target.value = rawNum > 0? formatNumber(rawNum) : '';
    const newLength = e.target.value.length;
    e.target.setSelectionRange(cursorPos + (newLength - oldLength), cursorPos + (newLength - oldLength));
    calculateCash();
    saveInvoices();
  }

  // NEW: Auto-save meters when typing
  if (e.target.id && (e.target.id.startsWith('a-') || e.target.id.startsWith('b-') || e.target.id.startsWith('price'))) {
    saveMeters();
  }
});

// FIXED CALCULATE - Works with O/M only
function calculate(pump) {
  const pricePMS = unformatNumber(document.getElementById('pricePMS').value);
  const priceAGO = unformatNumber(document.getElementById('priceAGO').value);
  const openPMS = unformatNumber(document.getElementById(pump+'-openPMS').value);
  const openAGO = unformatNumber(document.getElementById(pump+'-openAGO').value);
  const closePMS = unformatNumber(document.getElementById(pump+'-closePMS').value);
  const closeAGO = unformatNumber(document.getElementById(pump+'-closeAGO').value);

  if (closePMS > openPMS && closePMS > 0) {
    const litersPMS = closePMS - openPMS;
    const moneyPMS = litersPMS * pricePMS;
    document.getElementById(pump+'-litersPMS').value = litersPMS.toFixed(3) + ' L';
    document.getElementById(pump+'-moneyPMS').value = formatNumber(moneyPMS) + ' UGX';
  } else {
    document.getElementById(pump+'-litersPMS').value = '';
    document.getElementById(pump+'-moneyPMS').value = '';
  }

  if (closeAGO > openAGO && closeAGO > 0) {
    const litersAGO = closeAGO - openAGO;
    const moneyAGO = litersAGO * priceAGO;
    document.getElementById(pump+'-litersAGO').value = litersAGO.toFixed(3) + ' L';
    document.getElementById(pump+'-moneyAGO').value = formatNumber(moneyAGO) + ' UGX';
  } else {
    document.getElementById(pump+'-litersAGO').value = '';
    document.getElementById(pump+'-moneyAGO').value = '';
  }

  const grandSales =
    (closePMS > openPMS? (closePMS - openPMS) * pricePMS : 0) +
    (closeAGO > openAGO? (closeAGO - openAGO) * priceAGO : 0);

  document.getElementById(pump+'-grandSales').value = grandSales > 0? formatNumber(grandSales) + ' UGX' : '';
  updateGrandTotal();
}

function updateGrandTotal() {
  const grandA = unformatNumber(document.getElementById('a-grandSales').value.replace(' UGX',''));
  const grandB = unformatNumber(document.getElementById('b-grandSales').value.replace(' UGX',''));
  const finalTotal = Math.round(grandA + grandB);
  document.getElementById('grandTotal').textContent = finalTotal > 0? formatNumber(finalTotal) + ' UGX' : '0 UGX';
  calculateCash();
}

function resetPump(pump) {
  ['openPMS','openAGO','closePMS','closeAGO'].forEach(field => {
    document.getElementById(pump+'-'+field).value = '';
  });
  calculate(pump);
  saveMeters(); // Save after reset
}

function addInvoice() {
  invoiceCount++;
  const container = document.getElementById('invoicesContainer');
  const newInvoice = document.createElement('div');
  newInvoice.className = 'invoice-row';
  newInvoice.innerHTML = `
    <div class="row"><label>Amount:</label><input type="text" class="invAmount money-input" placeholder="UGX"></div>
    <div class="row"><label>Name:</label><input type="text" class="invName" placeholder="Customer Name"></div>
    <div class="row"><label>Plate:</label><input type="text" class="invPlate" placeholder="UAX 123X"></div>
  `;
  container.appendChild(newInvoice);
  saveInvoices();
}

// FIXED CASH CALCULATION - No more 35M bug
function calculateCash() {
  const grandTotal = unformatNumber(document.getElementById('grandTotal').textContent.replace(' UGX',''));
  const momo = unformatNumber(document.getElementById('momoAmount').value);
  const airtel = unformatNumber(document.getElementById('airtelAmount').value);
  const safe = unformatNumber(document.getElementById('safeAmount').value);

  let totalInvoices = 0;
  document.querySelectorAll('.invAmount').forEach(input => {
    totalInvoices += unformatNumber(input.value);
  });

  const totalDeductions = momo + airtel + safe + totalInvoices;
  const cashBalance = Math.round(grandTotal - totalDeductions);

  document.getElementById('totalDeductions').value = totalDeductions > 0? formatNumber(totalDeductions) + ' UGX' : '';
  document.getElementById('cashBalance').value = cashBalance >= 0? formatNumber(cashBalance) + ' UGX' : 'SHORTAGE ' + formatNumber(Math.abs(cashBalance)) + ' UGX';
}

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    if(input.id.startsWith('a-') &&!input.classList.contains('money-input')) {
      calculate('a');
      saveMeters(); // Save meters on input
    }
    if(input.id.startsWith('b-') &&!input.classList.contains('money-input')) {
      calculate('b');
      saveMeters(); // Save meters on input
    }
    if(input.id.startsWith('price')) {
      calculate('a');
      calculate('b');
      saveMeters(); // Save prices too
    }
  });
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
 .then(() => console.log('Service Worker Registered'));
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setTimeout(() => {
    if(confirm('Install Rubis Calculator App on your phone? Opens faster!')) {
      deferredPrompt.prompt();
    }
  }, 3000);
});
