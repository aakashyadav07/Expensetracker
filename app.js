/* ==========================================================================
   EXPENSE TRACKER — FULL ENGINE WITH P2P KHAATA, UPI QR & SMART DEBT ALERTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const DB_KEY = 'expense_tracker_users_v4';
  const SESSION_KEY = 'expense_tracker_session_v4';

  // Register PWA Service Worker for mobile app readiness
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Service worker registration:', err);
      });
    });
  }

  // PWA Install Prompt Listener
  let deferredPrompt;
  const btnPwaInstall = document.getElementById('btn-pwa-install');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnPwaInstall) btnPwaInstall.style.display = 'inline-flex';
  });

  if (btnPwaInstall) {
    btnPwaInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('App Installed', 'Expense Tracker has been installed on your device!', 'success');
        }
        deferredPrompt = null;
      } else {
        showToast('PWA Ready', 'To install on mobile, tap browser menu (⋮ or Share) and select "Add to Home Screen".', 'info');
      }
      // Mandatory notification permission popup when downloaded / installed or install is tapped:
      setTimeout(() => openMandatoryPermissionModal(), 350);
    });
  }

  /* ==========================================================================
     ANDROID HAPTIC FEEDBACK & TOUCH INTERACTION
     ========================================================================== */
  function triggerHaptic(duration = 20) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }

  // Global Android micro-haptic feedback on touchable elements
  document.addEventListener('click', (e) => {
    if (e.target.closest('button, .merchant-pill, .switch-pill-btn, .debt-tab-btn, .filter-type-btn, .tx-toggle-btn')) {
      triggerHaptic(15);
    }
  });

  // Initialize Database with pre-seeded rich accounts containing debts & transactions
  function initDatabase() {
    let users = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
    if (!users || !Array.isArray(users) || users.length === 0) {
      users = [
        {
          email: 'student@expensetracker.io',
          password: 'StudentPass2026!',
          name: 'Aarav Patel',
          persona: 'student',
          isVerified: true,
          prePaymentCategorizerEnabled: true,
          transactions: [
            { id: 1, title: 'Monthly Allowance from Parents', amount: 8500, type: 'income', category: 'Pocket Allowance', date: 'Sep 01' },
            { id: 2, title: 'Hostel Shared Room Rent', amount: 2500, type: 'expense', category: 'Hostel & Rent', date: 'Sep 02' },
            { id: 3, title: 'Engineering Textbooks & Printouts', amount: 450, type: 'expense', category: 'Academics & Books', date: 'Sep 03' },
            { id: 4, title: 'Campus Canteen & Evening Snacks', amount: 320, type: 'expense', category: 'Canteen & Dining', date: 'Yesterday' }
          ],
          debts: [
            { id: 101, friendName: 'Rohan Sharma', upiId: 'rohan.sharma@okaxis', amount: 1200, type: 'i_owe', note: 'Hostel WiFi & Grocery share', dueDate: '2026-09-10', isSettled: false },
            { id: 102, friendName: 'Aman Verma', upiId: 'aman@paytm', amount: 450, type: 'owed_to_me', note: 'Campus Canteen Pizza split', dueDate: '2026-09-08', isSettled: false }
          ]
        },
        {
          email: 'trader@expensetracker.io',
          password: 'TraderElite2026#',
          name: 'Vikram Singhania',
          persona: 'trader',
          isVerified: true,
          prePaymentCategorizerEnabled: true,
          transactions: [
            { id: 1, title: 'NIFTY 24500 CE Expiry Scalp', amount: 14850, type: 'income', category: 'F&O Options', date: 'Today, 11:30 AM' },
            { id: 2, title: 'TCS Breakout Swing Target Hit', amount: 21400, type: 'income', category: 'Equity Swing', date: 'Yesterday' },
            { id: 3, title: 'BankNifty Strict Stop-Loss Hit', amount: 4200, type: 'expense', category: 'F&O Options', date: '2 days ago' }
          ],
          debts: [
            { id: 201, friendName: 'Kunal Kapoor', upiId: 'kunal@icici', amount: 5000, type: 'owed_to_me', note: 'Bloomberg Terminal sub share', dueDate: '2026-09-15', isSettled: false }
          ]
        },
        {
          email: 'business@expensetracker.io',
          password: 'BusinessOwner2026$',
          name: 'Meera Gupta',
          persona: 'business',
          isVerified: true,
          prePaymentCategorizerEnabled: true,
          transactions: [
            { id: 1, title: 'Client Web Design Retainer (Invoice #104)', amount: 65000, type: 'income', category: 'Client Invoicing', date: 'Today' },
            { id: 2, title: 'Textile Wholesale Raw Material Order', amount: 38000, type: 'expense', category: 'Vendor Supplies', date: 'Yesterday' }
          ],
          debts: [
            { id: 301, friendName: 'Apex Logistics', upiId: 'apex@hdfcbank', amount: 8400, type: 'i_owe', note: 'Cargo Freight Shipment Charges', dueDate: '2026-09-12', isSettled: false }
          ]
        },
        {
          email: 'pro@expensetracker.io',
          password: 'SalariedPro2026!',
          name: 'Alex Morgan',
          persona: 'pro',
          isVerified: true,
          prePaymentCategorizerEnabled: true,
          transactions: [
            { id: 1, title: 'Corporate Senior Tech Salary Credit', amount: 95000, type: 'income', category: 'Salary & Bonus', date: 'Sep 01' },
            { id: 2, title: 'Apartment EMI & Maintenance', amount: 28000, type: 'expense', category: 'Needs (Rent & EMI)', date: 'Sep 02' }
          ],
          debts: [
            { id: 401, friendName: 'Priya Nair', upiId: 'priya@okhdfcbank', amount: 2100, type: 'i_owe', note: 'Team Outing Dinner Share', dueDate: '2026-09-11', isSettled: false }
          ]
        }
      ];
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }
    return users;
  }

  function getUsers() {
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    users.forEach(u => {
      if (u.prePaymentCategorizerEnabled === undefined) u.prePaymentCategorizerEnabled = true;
    });
    return users;
  }

  function saveUsers(users) {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  }

  function findUser(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  function updateUser(updatedUser) {
    const users = getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (index !== -1) {
      users[index] = updatedUser;
      saveUsers(users);
    }
  }

  initDatabase();

  // Views
  const authView = document.getElementById('auth-view');
  const dashboardView = document.getElementById('dashboard-view');

  // Auth Elements
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const tabsContainer = document.querySelector('.tabs-container');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  // Persona Demo Buttons
  const demoStudentBtn = document.getElementById('demo-student-btn');
  const demoTraderBtn = document.getElementById('demo-trader-btn');
  const demoBusinessBtn = document.getElementById('demo-business-btn');
  const demoProBtn = document.getElementById('demo-pro-btn');

  // Social Auth
  const btnGoogle = document.getElementById('btn-google-auth');
  const btnApple = document.getElementById('btn-apple-auth');

  // Forgot Password Modal
  const btnForgotPw = document.getElementById('btn-forgot-pw');
  const modalForgot = document.getElementById('forgot-modal');
  const modalCloseX = document.getElementById('modal-close-x');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const formForgot = document.getElementById('form-forgot');

  // OTP Modal Elements
  const otpModal = document.getElementById('otp-modal');
  const otpTargetEmail = document.getElementById('otp-target-email');
  const otpHintCode = document.getElementById('otp-hint-code');
  const btnAutoFillOtp = document.getElementById('btn-auto-fill-otp');
  const otpDigits = document.querySelectorAll('.otp-digit');
  const otpInputsWrapper = document.getElementById('otp-inputs-wrapper');
  const otpErrorMsg = document.getElementById('otp-error-msg');
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  const btnResendOtp = document.getElementById('btn-resend-otp');
  const btnCancelOtp = document.getElementById('btn-cancel-otp');

  // Dashboard Nav & Persona Switcher
  const dashUserName = document.getElementById('dash-user-name');
  const userAvatarInitials = document.getElementById('user-avatar-initials');
  const dashPersonaBadge = document.getElementById('dash-persona-badge');
  const dashPersonaBanner = document.getElementById('dash-persona-banner');
  const bannerTitle = document.getElementById('banner-title');
  const bannerDesc = document.getElementById('banner-desc');
  const bannerStatChip = document.getElementById('banner-stat-chip');
  const dashStatsContainer = document.getElementById('dash-stats-container');
  const dashToolContainer = document.getElementById('dash-tool-container');
  const dashboardTxList = document.getElementById('dashboard-tx-list');
  const btnLogout = document.getElementById('btn-logout');
  const btnAddTxText = document.getElementById('btn-add-tx-text');
  const switchBtns = document.querySelectorAll('.switch-pill-btn');

  // Notification Bell & Drawer
  const btnNotifToggle = document.getElementById('btn-notif-toggle');
  const notifCounter = document.getElementById('notif-counter');
  const notifDrawer = document.getElementById('notif-drawer');
  const notifDrawerList = document.getElementById('notif-drawer-list');
  const notifStatusSub = document.getElementById('notif-status-sub');

  // Smart Debt Return Alert Floating Banner
  const smartDebtAlertBanner = document.getElementById('smart-debt-alert-banner');
  const smartAlertHeading = document.getElementById('smart-alert-heading');
  const smartAlertSubtext = document.getElementById('smart-alert-subtext');
  const btnSmartSettleAction = document.getElementById('btn-smart-settle-action');
  const btnDismissSmartAlert = document.getElementById('btn-dismiss-smart-alert');
  let currentSmartDebtToSettle = null;

  // P2P Khaata Section Elements
  const btnOpenRequestMoney = document.getElementById('btn-open-request-money');
  const tabDebtIOwe = document.getElementById('tab-debt-i-owe');
  const tabDebtOwedToMe = document.getElementById('tab-debt-owed-to-me');
  const countIOwe = document.getElementById('count-i-owe');
  const countOwedToMe = document.getElementById('count-owed-to-me');
  const debtsCardsGrid = document.getElementById('debts-cards-grid');
  let currentDebtFilter = 'i_owe';

  // Request Money & Live UPI QR Modal Elements
  const requestMoneyModal = document.getElementById('request-money-modal');
  const requestModalClose = document.getElementById('request-modal-close');
  const p2pModalCancel = document.getElementById('p2p-modal-cancel');
  const formP2pRequest = document.getElementById('form-p2p-request');
  const btnRelCollect = document.getElementById('btn-rel-collect');
  const btnRelBorrow = document.getElementById('btn-rel-borrow');
  const upiGeneratedBox = document.getElementById('upi-generated-box');
  const upiQrImageWrap = document.getElementById('upi-qr-image-wrap');
  const qrAmountDisplay = document.getElementById('qr-amount-display');
  const qrNoteDisplay = document.getElementById('qr-note-display');
  const btnWhatsappShare = document.getElementById('btn-whatsapp-share');
  const btnFinishP2p = document.getElementById('btn-finish-p2p');
  const btnUpiAppDirect = document.getElementById('btn-upi-app-direct');
  let currentP2pType = 'owed_to_me';
  let activeGeneratedWhatsappUrl = '';
  let activeGeneratedUpiUri = '';
  let activeFriendName = '';
  let activeAmountFormatted = '';
  let activeNote = '';

  // Add Transaction Modal
  const btnOpenTxModal = document.getElementById('btn-open-tx-modal');
  const txModal = document.getElementById('tx-modal');
  const txModalClose = document.getElementById('tx-modal-close');
  const txModalCancel = document.getElementById('tx-modal-cancel');
  const formAddTx = document.getElementById('form-add-tx');
  const txToggleBtns = document.querySelectorAll('#tx-modal .tx-toggle-btn');
  const txCategorySelect = document.getElementById('tx-category');
  const txLabelTitle = document.getElementById('tx-label-title');
  let currentTxType = 'expense';

  // Edit Transaction Modal
  const editTxModal = document.getElementById('edit-tx-modal');
  const editTxModalClose = document.getElementById('edit-tx-modal-close');
  const editTxModalCancel = document.getElementById('edit-tx-modal-cancel');
  const formEditTx = document.getElementById('form-edit-tx');
  const editTxIdInput = document.getElementById('edit-tx-id');
  const editTxTitleInput = document.getElementById('edit-tx-title');
  const editTxAmountInput = document.getElementById('edit-tx-amount');
  const editTxCategorySelect = document.getElementById('edit-tx-category');
  const editTypeBtns = document.querySelectorAll('#edit-tx-modal .tx-toggle-btn');
  let currentEditTxType = 'expense';

  // Pre-Payment Auto-Categorizer & UPI Scan & Pay Simulator Elements
  const togglePrePaymentCategorizer = document.getElementById('toggle-pre-payment-categorizer');
  const btnOpenScanPay = document.getElementById('btn-open-scan-pay');
  const scanPayModal = document.getElementById('scan-pay-modal');
  const scanPayModalClose = document.getElementById('scan-pay-modal-close');
  const scanPayModalCancel = document.getElementById('scan-pay-modal-cancel');
  const formScanPay = document.getElementById('form-scan-pay');
  const scanPayMerchant = document.getElementById('scan-pay-merchant');
  const scanPayUpiId = document.getElementById('scan-pay-upi-id');
  const scanPayAmount = document.getElementById('scan-pay-amount');
  const scanPayNote = document.getElementById('scan-pay-note');
  const quickMerchantChips = document.querySelectorAll('.quick-merchant-chip');

  // Pre-Payment Categorizer & Impulse Shield Modal Elements
  const prePaymentModal = document.getElementById('pre-payment-modal');
  const prePaymentModalClose = document.getElementById('pre-payment-modal-close');
  const prePaymentModalCancel = document.getElementById('pre-payment-modal-cancel');
  const prePayMerchantName = document.getElementById('pre-pay-merchant-name');
  const prePayUpiDisplay = document.getElementById('pre-pay-upi-display');
  const prePayAmountDisplay = document.getElementById('pre-pay-amount-display');
  const prePayImpulseWarning = document.getElementById('pre-pay-impulse-warning');
  const prePayImpulseDesc = document.getElementById('pre-pay-impulse-desc');
  const preSelectedCategoryName = document.getElementById('pre-selected-category-name');
  const preCategoryChipsGrid = document.getElementById('pre-category-chips-grid');
  const preImpactCurrBal = document.getElementById('pre-impact-curr-bal');
  const preImpactNewBal = document.getElementById('pre-impact-new-bal');
  const preImpactProgressBar = document.getElementById('pre-impact-progress-bar');
  const prePaySplitCheckbox = document.getElementById('pre-pay-split-checkbox');
  const preSplitDetails = document.getElementById('pre-split-details');
  const prePaySplitFriend = document.getElementById('pre-pay-split-friend');
  const prePaySplitNote = document.getElementById('pre-pay-split-note');
  const btnPrePaymentConfirm = document.getElementById('btn-pre-payment-confirm');

  let pendingPaymentData = null;
  let activePreSelectedCategory = '';

  // Ledger Search & Filter Elements
  const txSearchInput = document.getElementById('tx-search-input');
  const filterTypeBtns = document.querySelectorAll('.filter-type-btn');
  let currentLedgerTypeFilter = 'all';

  // Password & Validation Elements
  const pwToggles = document.querySelectorAll('.btn-toggle-pw');
  const regPasswordInput = document.getElementById('reg-password');
  const strengthBars = [
    document.getElementById('str-seg-1'),
    document.getElementById('str-seg-2'),
    document.getElementById('str-seg-3'),
    document.getElementById('str-seg-4')
  ];
  const strengthText = document.getElementById('strength-text');
  const toastContainer = document.getElementById('toast-container');
  let pendingOtpUserEmail = null;

  /* --------------------------------------------------------------------------
     Toast System & Currency Formatter
     -------------------------------------------------------------------------- */
  function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 5000);
  }

  function formatRupee(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* --------------------------------------------------------------------------
     Tab Switching & Password Visibility
     -------------------------------------------------------------------------- */
  function switchTab(targetTab) {
    if (targetTab === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      tabsContainer.removeAttribute('data-active');
      formLogin.classList.add('active');
      formRegister.classList.remove('active');
      clearFormErrors(formRegister);
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      tabsContainer.setAttribute('data-active', 'register');
      formRegister.classList.add('active');
      formLogin.classList.remove('active');
      clearFormErrors(formLogin);
    }
  }

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));

  pwToggles.forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
      const targetId = toggleBtn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeOpen = toggleBtn.querySelector('.icon-eye-open');
      const eyeClosed = toggleBtn.querySelector('.icon-eye-closed');
      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
      } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
      }
    });
  });

  /* --------------------------------------------------------------------------
     4 Persona Demo Fillers
     -------------------------------------------------------------------------- */
  demoStudentBtn.addEventListener('click', () => fillDemoLogin('student@expensetracker.io', 'StudentPass2026!', '🎓 Student'));
  demoTraderBtn.addEventListener('click', () => fillDemoLogin('trader@expensetracker.io', 'TraderElite2026#', '📈 Trader'));
  demoBusinessBtn.addEventListener('click', () => fillDemoLogin('business@expensetracker.io', 'BusinessOwner2026$', '💼 Business'));
  demoProBtn.addEventListener('click', () => fillDemoLogin('pro@expensetracker.io', 'SalariedPro2026!', '👔 Salaried'));

  function fillDemoLogin(email, pw, label) {
    switchTab('login');
    const emailInput = document.getElementById('login-email');
    const pwInput = document.getElementById('login-password');
    emailInput.value = email;
    pwInput.value = pw;
    clearError(emailInput, 'login-email-error');
    clearError(pwInput, 'login-password-error');
    showToast('Profile Loaded', `${label} demo credentials loaded. Click Sign In!`, 'info');
  }

  /* --------------------------------------------------------------------------
     Validation Helpers
     -------------------------------------------------------------------------- */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setError(inputElement, errorElementId, message) {
    const errorEl = document.getElementById(errorElementId);
    const wrapper = inputElement.closest('.input-wrapper');
    if (wrapper) wrapper.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(inputElement, errorElementId) {
    const errorEl = document.getElementById(errorElementId);
    const wrapper = inputElement.closest('.input-wrapper');
    if (wrapper) wrapper.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.input-wrapper').forEach(w => w.classList.remove('error'));
    form.querySelectorAll('.field-error-msg').forEach(msg => msg.textContent = '');
  }

  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => clearError(input, `${input.id}-error`));
  });

  /* --------------------------------------------------------------------------
     OTP Verification Modal
     -------------------------------------------------------------------------- */
  function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function openOtpModal(user) {
    pendingOtpUserEmail = user.email;
    otpTargetEmail.textContent = user.email;
    otpHintCode.textContent = user.otpCode || '941820';
    otpErrorMsg.textContent = '';
    otpDigits.forEach(d => d.value = '');
    otpModal.classList.remove('hidden');
    setTimeout(() => otpDigits[0].focus(), 150);
  }

  function closeOtpModal() {
    otpModal.classList.add('hidden');
    pendingOtpUserEmail = null;
  }

  otpDigits.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      input.value = val ? val[0] : '';
      otpErrorMsg.textContent = '';
      if (val && index < otpDigits.length - 1) otpDigits[index + 1].focus();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpDigits[index - 1].focus();
      } else if (e.key === 'Enter') {
        btnVerifyOtp.click();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const numbersOnly = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
      if (numbersOnly.length > 0) {
        numbersOnly.split('').forEach((char, i) => {
          if (otpDigits[i]) otpDigits[i].value = char;
        });
        const focusIndex = Math.min(numbersOnly.length, otpDigits.length - 1);
        otpDigits[focusIndex].focus();
      }
    });
  });

  btnAutoFillOtp.addEventListener('click', () => {
    const code = otpHintCode.textContent.trim();
    if (code && code.length === 6) {
      code.split('').forEach((ch, idx) => {
        if (otpDigits[idx]) otpDigits[idx].value = ch;
      });
      otpDigits[5].focus();
      otpErrorMsg.textContent = '';
      showToast('Code Auto-filled', '6-digit OTP code inserted.', 'info');
    }
  });

  btnVerifyOtp.addEventListener('click', () => {
    let enteredCode = '';
    otpDigits.forEach(d => enteredCode += d.value.trim());

    if (enteredCode.length < 6) {
      otpErrorMsg.textContent = 'Please enter all 6 digits of your verification code';
      otpInputsWrapper.classList.add('shake');
      setTimeout(() => otpInputsWrapper.classList.remove('shake'), 500);
      return;
    }

    if (!pendingOtpUserEmail) return;
    const user = findUser(pendingOtpUserEmail);
    if (!user) return;

    const btnText = btnVerifyOtp.querySelector('.btn-text');
    const btnSpinner = btnVerifyOtp.querySelector('.btn-spinner');
    btnVerifyOtp.disabled = true;
    btnText.textContent = 'Verifying...';
    btnSpinner.classList.remove('hidden');

    setTimeout(() => {
      btnVerifyOtp.disabled = false;
      btnText.textContent = 'Verify & Activate Account';
      btnSpinner.classList.add('hidden');

      if (enteredCode === user.otpCode) {
        user.isVerified = true;
        delete user.otpCode;
        updateUser(user);

        closeOtpModal();
        showToast('Account Verified!', `Welcome ${user.name}! Accessing your verified dashboard...`, 'success');
        loginToDashboard(user);
      } else {
        otpErrorMsg.textContent = 'Incorrect verification code. Please check the simulated code above.';
        otpInputsWrapper.classList.add('shake');
        setTimeout(() => otpInputsWrapper.classList.remove('shake'), 500);
      }
    }, 700);
  });

  btnResendOtp.addEventListener('click', () => {
    if (!pendingOtpUserEmail) return;
    const user = findUser(pendingOtpUserEmail);
    if (user) {
      const newCode = generateOtpCode();
      user.otpCode = newCode;
      updateUser(user);
      otpHintCode.textContent = newCode;
      otpErrorMsg.textContent = '';
      otpDigits.forEach(d => d.value = '');
      otpDigits[0].focus();
      showToast('New Code Generated', `Code ${newCode} dispatched to ${user.email}`, 'info');
    }
  });

  btnCancelOtp.addEventListener('click', () => {
    closeOtpModal();
    switchTab('login');
  });

  /* --------------------------------------------------------------------------
     Registration & Login
     -------------------------------------------------------------------------- */
  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const selectedPersonaInput = document.querySelector('input[name="reg-persona"]:checked');
    const termsCheck = document.getElementById('terms-agree');
    const termsError = document.getElementById('terms-error');

    let isValid = true;
    if (!nameInput.value.trim()) { setError(nameInput, 'reg-name-error', 'Please provide your full name'); isValid = false; }
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) { setError(emailInput, 'reg-email-error', 'Please enter a valid email'); isValid = false; }
    if (!passwordInput.value || passwordInput.value.length < 8) { setError(passwordInput, 'reg-password-error', 'Password must be at least 8 characters'); isValid = false; }
    if (!termsCheck.checked) { termsError.textContent = 'You must accept the Terms and Privacy Policy'; isValid = false; } else { termsError.textContent = ''; }
    if (!isValid) return;

    if (findUser(emailInput.value.trim())) {
      setError(emailInput, 'reg-email-error', 'An account with this email already exists. Please sign in.');
      return;
    }

    const persona = selectedPersonaInput ? selectedPersonaInput.value : 'student';
    const otp = generateOtpCode();
    const newUser = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim().toLowerCase(),
      password: passwordInput.value,
      persona: persona,
      isVerified: false,
      notificationSyncEnabled: false,
      otpCode: otp,
      transactions: [
        { id: 1, title: 'Welcome Account Activation Deposit', amount: 10000, type: 'income', category: 'Earnings', date: 'Today' }
      ],
      debts: [
        { id: 501, friendName: 'Karan Sharma', upiId: 'karan@okhdfcbank', amount: 500, type: 'i_owe', note: 'Dinner split', dueDate: '2026-09-12', isSettled: false }
      ]
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    formRegister.reset();
    showToast('Account Created', 'Please enter your 6-digit verification code.', 'info');
    openOtpModal(newUser);
  });

  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    let isValid = true;
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) { setError(emailInput, 'login-email-error', 'Please enter a valid email'); isValid = false; }
    if (!passwordInput.value) { setError(passwordInput, 'login-password-error', 'Please enter your password'); isValid = false; }
    if (!isValid) return;

    const user = findUser(emailInput.value.trim());
    if (!user) { setError(emailInput, 'login-email-error', 'Account not found. Please sign up.'); return; }
    if (user.password !== passwordInput.value) { setError(passwordInput, 'login-password-error', 'Incorrect password.'); return; }

    if (!user.isVerified) {
      showToast('Account Not Verified', 'Please complete verification.', 'error');
      if (!user.otpCode) { user.otpCode = generateOtpCode(); updateUser(user); }
      openOtpModal(user);
      return;
    }

    showToast('Login Successful', `Welcome back, ${user.name}!`, 'success');
    loginToDashboard(user);
  });

  /* --------------------------------------------------------------------------
     Dashboard Master Renderer
     -------------------------------------------------------------------------- */
  function getPersonaTitle(persona) {
    switch (persona) {
      case 'student': return '🎓 College Student';
      case 'trader': return '📈 Active Trader';
      case 'business': return '💼 Small Business';
      case 'pro': return '👔 Salaried Pro';
      default: return '👤 Personal User';
    }
  }

  function renderDashboard(user) {
    const persona = user.persona || 'student';
    dashUserName.textContent = user.name;
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ET';
    userAvatarInitials.textContent = initials;
    dashPersonaBadge.textContent = getPersonaTitle(persona);

    // Sync navbar switch pills
    switchBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-persona') === persona);
    });

    // Sync Pre-Payment Auto-Categorizer toggle switch
    if (togglePrePaymentCategorizer) {
      togglePrePaymentCategorizer.checked = user.prePaymentCategorizerEnabled !== false;
    }

    // Configure welcome banner
    dashPersonaBanner.className = `persona-banner ${persona}-theme`;
    if (persona === 'student') {
      bannerTitle.textContent = '🎓 College Student Budget Hub';
      bannerDesc.textContent = 'Keep your pocket money in check, survive the semester, and split roommate bills in 1 click.';
      bannerStatChip.textContent = '📅 14 Days Left Till Allowance';
      btnAddTxText.textContent = '+ Add College Expense';
    } else if (persona === 'trader') {
      bannerTitle.textContent = '📈 Active Trader P&L Command Center';
      bannerDesc.textContent = 'Log trades across Equity, F&O and Crypto, monitor your daily win rate, and control risk.';
      bannerStatChip.textContent = '⚡ Market Status: Active';
      btnAddTxText.textContent = '+ Log Trade Entry';
    } else if (persona === 'business') {
      bannerTitle.textContent = '💼 Small Business & MSME Ledger';
      bannerDesc.textContent = 'Track client invoicing, monitor pending receivables, and stay prepared for 18% GST filing.';
      bannerStatChip.textContent = '📑 GST Q2 Period Active';
      btnAddTxText.textContent = '+ Record B2B Invoice';
    } else {
      bannerTitle.textContent = '👔 Salaried Professional Wealth Planner';
      bannerDesc.textContent = 'Master the 50/30/20 rule, track recurring utilities & subscriptions, and grow your SIP investments.';
      bannerStatChip.textContent = '💰 Salary Cycle: On Track';
      btnAddTxText.textContent = '+ Add Monthly Expense';
    }

    // Compute Totals
    const txList = user.transactions || [];
    let totalInflow = 0;
    let totalOutflow = 0;
    txList.forEach(t => {
      if (t.type === 'income') totalInflow += Number(t.amount);
      else totalOutflow += Number(t.amount);
    });
    const netBalance = totalInflow - totalOutflow;

    // Render Metric Cards
    renderPersonaMetrics(persona, netBalance, totalInflow, totalOutflow, txList);

    // Render Specialized Tool
    renderPersonaTool(persona, user, netBalance);

    // Render P2P Khaata (Lend & Borrow)
    renderDebtsSection(user, netBalance);

    // Check & Render Smart Debt Return Alerts
    checkSmartDebtAlerts(user, netBalance);

    // Render Modal Categories
    populateModalCategories(persona);

    // Render Live Ledger
    renderTransactionList(txList);
  }

  /* Metric Cards */
  function renderPersonaMetrics(persona, netBalance, totalInflow, totalOutflow, txList) {
    dashStatsContainer.innerHTML = '';
    if (persona === 'student') {
      const daysLeft = 14;
      const dailyLimit = netBalance > 0 ? Math.floor(netBalance / daysLeft) : 0;
      dashStatsContainer.innerHTML = `
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Remaining Pocket Money</span><span class="badge-growth-sm">Allowance Mode</span></div>
          <h2 class="stat-main-figure">${formatRupee(netBalance)}</h2>
          <span class="stat-subtext">Total cash & UPI balance left</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Daily Spend Cap</span><span class="badge-growth-sm">Target Limit</span></div>
          <h3 class="stat-secondary-figure neutral-val">₹${dailyLimit} <span style="font-size:0.95rem;">/ day</span></h3>
          <span class="stat-subtext">Safe spending rate for ${daysLeft} days</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Spent This Month</span><span class="badge-warning-sm">Canteen & Living</span></div>
          <h3 class="stat-secondary-figure expense-val">-${formatRupee(totalOutflow)}</h3>
          <span class="stat-subtext">Hostel rent, mess & academics</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>AI Financial Health</span><span class="health-score-badge">🛡️ Shield Active</span></div>
          <h2 class="stat-main-figure" style="color:var(--brand-emerald-light);">92<span style="font-size:1rem; color:var(--text-muted); font-weight:500;">/100</span></h2>
          <span class="stat-subtext">Burn velocity: ₹${dailyLimit}/day safe margin</span>
          <div class="health-gauge-track"><div class="health-gauge-fill" style="width: 92%;"></div></div>
        </div>
      `;
    } else if (persona === 'trader') {
      const wins = txList.filter(t => t.type === 'income').length;
      const totalTrades = txList.length || 1;
      const winRate = ((wins / totalTrades) * 100).toFixed(1);
      dashStatsContainer.innerHTML = `
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Net Realized P&L</span><span class="badge-growth-sm">${netBalance >= 0 ? '+ROI' : '-Loss'}</span></div>
          <h2 class="stat-main-figure ${netBalance >= 0 ? 'income-val' : 'expense-val'}">${netBalance >= 0 ? '+' : ''}${formatRupee(netBalance)}</h2>
          <span class="stat-subtext">Across F&O, Equities & Crypto</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Trade Win Rate</span><span class="badge-growth-sm">Accuracy</span></div>
          <h3 class="stat-secondary-figure neutral-val">${winRate}%</h3>
          <span class="stat-subtext">${wins} Profitable trades / ${totalTrades} total logged</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Gross Inflow</span><span class="badge-growth-sm">Profits</span></div>
          <h3 class="stat-secondary-figure income-val">+${formatRupee(totalInflow)}</h3>
          <span class="stat-subtext">Deployed capital: ₹2,45,000</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>AI Risk Discipline</span><span class="health-score-badge">🛡️ Shield Active</span></div>
          <h2 class="stat-main-figure" style="color:var(--brand-emerald-light);">88<span style="font-size:1rem; color:var(--text-muted); font-weight:500;">/100</span></h2>
          <span class="stat-subtext">Controlled drawdown • ${winRate}% accuracy</span>
          <div class="health-gauge-track"><div class="health-gauge-fill" style="width: 88%;"></div></div>
        </div>
      `;
    } else if (persona === 'business') {
      const estimatedGst = (totalInflow * 0.18).toFixed(2);
      dashStatsContainer.innerHTML = `
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Net Business Cashflow</span><span class="badge-growth-sm">Liquid Reserve</span></div>
          <h2 class="stat-main-figure">${formatRupee(netBalance)}</h2>
          <span class="stat-subtext">Operating bank balance</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Pending Client Dues</span><span class="badge-warning-sm">Receivables</span></div>
          <h3 class="stat-secondary-figure neutral-val">₹64,200.00</h3>
          <span class="stat-subtext">Invoices pending clearance</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Estimated GST (18%)</span><span class="badge-warning-sm">Tax Reserve</span></div>
          <h3 class="stat-secondary-figure expense-val">-${formatRupee(estimatedGst)}</h3>
          <span class="stat-subtext">Set aside for GSTR-3B</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>AI Cashflow Buffer</span><span class="health-score-badge">🛡️ Shield Active</span></div>
          <h2 class="stat-main-figure" style="color:var(--brand-emerald-light);">86<span style="font-size:1rem; color:var(--text-muted); font-weight:500;">/100</span></h2>
          <span class="stat-subtext">Runway: ~4.2 mo • GST provision covered</span>
          <div class="health-gauge-track"><div class="health-gauge-fill" style="width: 86%;"></div></div>
        </div>
      `;
    } else {
      const savingsRate = totalInflow > 0 ? ((netBalance / totalInflow) * 100).toFixed(0) : 0;
      dashStatsContainer.innerHTML = `
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Net Savings Balance</span><span class="badge-growth-sm">${savingsRate}% Rate</span></div>
          <h2 class="stat-main-figure">${formatRupee(netBalance)}</h2>
          <span class="stat-subtext">Retained wealth this month</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Monthly Salary Credit</span><span class="badge-growth-sm">Inflow</span></div>
          <h3 class="stat-secondary-figure income-val">+${formatRupee(totalInflow)}</h3>
          <span class="stat-subtext">Corporate employment deposit</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>Living Outflow</span><span class="badge-warning-sm">Expenses</span></div>
          <h3 class="stat-secondary-figure expense-val">-${formatRupee(totalOutflow)}</h3>
          <span class="stat-subtext">EMI, Rent, SIP & Utilities</span>
        </div>
        <div class="dash-stat-card">
          <div class="stat-card-header"><span>AI Wealth Score</span><span class="health-score-badge">🛡️ Shield Active</span></div>
          <h2 class="stat-main-figure" style="color:var(--brand-emerald-light);">91<span style="font-size:1rem; color:var(--text-muted); font-weight:500;">/100</span></h2>
          <span class="stat-subtext">50/30/20 target met • ${savingsRate}% savings</span>
          <div class="health-gauge-track"><div class="health-gauge-fill" style="width: 91%;"></div></div>
        </div>
      `;
    }
  }

  /* Specialized Tools */
  function renderPersonaTool(persona, user, netBalance) {
    dashToolContainer.innerHTML = '';
    if (persona === 'student') {
      dashToolContainer.innerHTML = `
        <div class="tool-card-header">
          <span class="tool-card-title">🍕 Roommate & Canteen Bill Splitter</span>
          <span class="tool-badge">Instant UPI Calculation</span>
        </div>
        <div class="splitter-form-grid">
          <div class="form-group"><label class="form-label">Total Bill Amount (₹)</label><div class="input-wrapper"><span class="input-icon">₹</span><input type="number" id="split-bill-amt" class="form-input" value="1200" min="1"></div></div>
          <div class="form-group"><label class="form-label">Number of Roommates</label><div class="input-wrapper"><span class="input-icon">👥</span><input type="number" id="split-friends-count" class="form-input" value="4" min="1" max="50"></div></div>
          <div class="tool-output-box"><span class="tool-output-label">Each Person Pays</span><span class="tool-output-val" id="split-result-val">₹300.00</span></div>
          <button type="button" class="btn-primary-cta" id="btn-copy-split"><span>📋 Copy Split for WhatsApp</span></button>
        </div>
      `;
      const billInput = document.getElementById('split-bill-amt');
      const countInput = document.getElementById('split-friends-count');
      const resultVal = document.getElementById('split-result-val');
      const copyBtn = document.getElementById('btn-copy-split');

      function updateSplit() {
        const bill = parseFloat(billInput.value) || 0;
        const count = parseInt(countInput.value) || 1;
        resultVal.textContent = `₹${(bill / count).toFixed(2)}`;
      }
      billInput.addEventListener('input', updateSplit);
      countInput.addEventListener('input', updateSplit);
      copyBtn.addEventListener('click', () => {
        const text = `Expense Tracker Split: Total ₹${billInput.value} split across ${countInput.value} people = ${resultVal.textContent} per person. Please UPI me!`;
        navigator.clipboard.writeText(text).catch(() => {});
        showToast('Split Copied!', 'Copied message for WhatsApp/UPI.', 'success');
      });
    } else if (persona === 'trader') {
      dashToolContainer.innerHTML = `
        <div class="tool-card-header"><span class="tool-card-title">📊 Quick Trade P&L Calculator</span><span class="tool-badge">Risk & Reward Analyzer</span></div>
        <div class="trade-calc-grid">
          <div class="form-group"><label class="form-label">Ticker</label><div class="input-wrapper"><input type="text" id="trade-ticker" class="form-input" value="NIFTY 24500 CE"></div></div>
          <div class="form-group"><label class="form-label">Buy (₹) / Sell (₹)</label><div class="input-wrapper" style="display:flex;"><input type="number" id="trade-buy" class="form-input" value="120" style="width:50%;"><input type="number" id="trade-sell" class="form-input" value="155" style="width:50%;"></div></div>
          <div class="form-group"><label class="form-label">Quantity</label><div class="input-wrapper"><input type="number" id="trade-qty" class="form-input" value="150"></div></div>
          <div class="tool-output-box"><span class="tool-output-label">Net Return</span><span class="tool-output-val income-val" id="trade-result-val">+₹5,250.00 (+29.1%)</span></div>
        </div>
      `;
      const buyInput = document.getElementById('trade-buy');
      const sellInput = document.getElementById('trade-sell');
      const qtyInput = document.getElementById('trade-qty');
      const resultVal = document.getElementById('trade-result-val');
      function updateTradeCalc() {
        const buy = parseFloat(buyInput.value) || 0;
        const sell = parseFloat(sellInput.value) || 0;
        const qty = parseFloat(qtyInput.value) || 0;
        const diff = (sell - buy) * qty;
        const roi = buy > 0 ? (((sell - buy) / buy) * 100).toFixed(1) : 0;
        if (diff >= 0) {
          resultVal.className = 'tool-output-val income-val';
          resultVal.textContent = `+${formatRupee(diff)} (+${roi}%)`;
        } else {
          resultVal.className = 'tool-output-val expense-val';
          resultVal.textContent = `-${formatRupee(Math.abs(diff))} (${roi}%)`;
        }
      }
      buyInput.addEventListener('input', updateTradeCalc);
      sellInput.addEventListener('input', updateTradeCalc);
      qtyInput.addEventListener('input', updateTradeCalc);
    } else if (persona === 'business') {
      dashToolContainer.innerHTML = `
        <div class="tool-card-header"><span class="tool-card-title">🧾 Instant B2B GST Tax Calculator</span><span class="tool-badge">GST 18% Compliant</span></div>
        <div class="gst-calc-grid">
          <div class="form-group"><label class="form-label">Base Invoice (₹)</label><div class="input-wrapper"><span class="input-icon">₹</span><input type="number" id="gst-base-amt" class="form-input" value="50000"></div></div>
          <div class="form-group"><label class="form-label">GST Tax Slab</label><div class="input-wrapper"><select id="gst-slab-select" class="form-input form-select"><option value="18" selected>18% (Standard Services/Goods)</option><option value="12">12%</option><option value="5">5%</option><option value="28">28%</option></select></div></div>
          <div class="tool-output-box"><span class="tool-output-label">Tax Component</span><span class="tool-output-val" id="gst-tax-val">₹9,000.00</span></div>
          <div class="tool-output-box"><span class="tool-output-label">Total With GST</span><span class="tool-output-val income-val" id="gst-total-val">₹59,000.00</span></div>
        </div>
      `;
      const baseInput = document.getElementById('gst-base-amt');
      const slabSelect = document.getElementById('gst-slab-select');
      const taxVal = document.getElementById('gst-tax-val');
      const totalVal = document.getElementById('gst-total-val');
      function updateGst() {
        const b = parseFloat(baseInput.value) || 0;
        const s = parseFloat(slabSelect.value) || 18;
        const t = (b * s) / 100;
        taxVal.textContent = formatRupee(t);
        totalVal.textContent = formatRupee(b + t);
      }
      baseInput.addEventListener('input', updateGst);
      slabSelect.addEventListener('change', updateGst);
    } else {
      dashToolContainer.innerHTML = `
        <div class="tool-card-header"><span class="tool-card-title">📐 50/30/20 Budgeting Health Analyzer</span><span class="tool-badge">Harvard Wealth Model</span></div>
        <div class="budget-50-container">
          <div class="rule-bars-row">
            <div class="rule-item"><div class="rule-header needs"><span>Needs (50% Target)</span><span>₹47,500 Max</span></div><div class="rule-meter-track"><div class="rule-meter-fill needs" style="width: 45%;"></div></div><span class="stat-subtext">Rent, EMIs, Groceries (On Track)</span></div>
            <div class="rule-item"><div class="rule-header wants"><span>Wants (30% Target)</span><span>₹28,500 Max</span></div><div class="rule-meter-track"><div class="rule-meter-fill wants" style="width: 25%;"></div></div><span class="stat-subtext">Dining out, Netflix, Leisure</span></div>
            <div class="rule-item"><div class="rule-header savings"><span>Savings (20% Target)</span><span>₹19,000 Min</span></div><div class="rule-meter-track"><div class="rule-meter-fill savings" style="width: 80%;"></div></div><span class="stat-subtext">Index SIPs & Emergency Fund</span></div>
          </div>
        </div>
      `;
    }
  }

  /* --------------------------------------------------------------------------
     SMART DEBT RETURN NOTIFICATIONS ENGINE
     -------------------------------------------------------------------------- */
  function checkSmartDebtAlerts(user, netBalance) {
    const debts = user.debts || [];
    const unsettledIOwe = debts.filter(d => d.type === 'i_owe' && !d.isSettled);

    // Update Notification Bell Counter
    if (unsettledIOwe.length > 0) {
      notifCounter.classList.remove('hidden');
      notifCounter.textContent = unsettledIOwe.length;
      notifStatusSub.textContent = `${unsettledIOwe.length} Debts to Return`;
    } else {
      notifCounter.classList.add('hidden');
      notifStatusSub.textContent = 'All Debts Settled';
    }

    // Populate Notification Drawer
    notifDrawerList.innerHTML = '';
    if (unsettledIOwe.length === 0) {
      notifDrawerList.innerHTML = '<div style="font-size:0.78rem; color:var(--text-muted); text-align:center; padding:1rem 0;">No pending debts to return. You are all clear! 🎉</div>';
    } else {
      unsettledIOwe.forEach(d => {
        const canSettle = netBalance >= d.amount;
        const item = document.createElement('div');
        item.className = 'notif-alert-card';
        item.innerHTML = `
          <div class="notif-card-title">Return ${formatRupee(d.amount)} to ${d.friendName}</div>
          <div class="notif-card-desc">For ${d.note || 'Split expense'} • Due ${d.dueDate || 'Soon'}</div>
          ${canSettle ? 
            `<button type="button" class="notif-card-action" data-debt-id="${d.id}">💡 You have funds! Click to Settle Now</button>` : 
            `<span style="font-size:0.7rem; color:var(--text-muted);">Current balance is below debt amount</span>`
          }
        `;
        notifDrawerList.appendChild(item);

        const actBtn = item.querySelector('.notif-card-action');
        if (actBtn) {
          actBtn.addEventListener('click', () => settleDebt(user, d.id));
        }
      });
    }

    // Check for High-Impact Floating Banner:
    // If balance can cover at least one active debt to return
    const affordableDebt = unsettledIOwe.find(d => netBalance >= d.amount);
    if (affordableDebt) {
      currentSmartDebtToSettle = affordableDebt;
      smartDebtAlertBanner.classList.remove('hidden');
      smartAlertHeading.textContent = `💡 Debt Return Reminder: You have money now!`;
      smartAlertSubtext.textContent = `Your current balance (${formatRupee(netBalance)}) is sufficient to return ${formatRupee(affordableDebt.amount)} to ${affordableDebt.friendName}.`;
    } else {
      smartDebtAlertBanner.classList.add('hidden');
      currentSmartDebtToSettle = null;
    }
  }

  // Bell Dropdown toggle
  btnNotifToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDrawer.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!notifDrawer.contains(e.target) && e.target !== btnNotifToggle) {
      notifDrawer.classList.add('hidden');
    }
  });

  // Fast Settle Action from Banner
  btnSmartSettleAction.addEventListener('click', () => {
    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (user && currentSmartDebtToSettle) {
      settleDebt(user, currentSmartDebtToSettle.id);
    }
  });

  btnDismissSmartAlert.addEventListener('click', () => {
    smartDebtAlertBanner.classList.add('hidden');
  });

  /* --------------------------------------------------------------------------
     P2P KHAATA (LEND & BORROW) SECTION & UPI GENERATOR
     -------------------------------------------------------------------------- */
  function renderDebtsSection(user, netBalance) {
    const debts = user.debts || [];
    const iOweList = debts.filter(d => d.type === 'i_owe' && !d.isSettled);
    const owedToMeList = debts.filter(d => d.type === 'owed_to_me' && !d.isSettled);

    countIOwe.textContent = iOweList.length;
    countOwedToMe.textContent = owedToMeList.length;

    // Filter cards
    const activeList = currentDebtFilter === 'i_owe' ? iOweList : owedToMeList;
    debtsCardsGrid.innerHTML = '';

    if (activeList.length === 0) {
      debtsCardsGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.85rem;">
          No ${currentDebtFilter === 'i_owe' ? 'pending debts to return' : 'money owed to you'}. 
          Click <strong>"+ Request Money / Add Debt"</strong> to record an entry.
        </div>
      `;
      return;
    }

    activeList.forEach(debt => {
      const card = document.createElement('div');
      card.className = `debt-card ${debt.type}`;

      const isIOwe = debt.type === 'i_owe';
      const canAfford = netBalance >= debt.amount;

      card.innerHTML = `
        <div class="debt-card-top">
          <div>
            <div class="debt-friend-name">${debt.friendName}</div>
            <div class="debt-due-tag">Due: ${debt.dueDate || 'Flexible'} • UPI: ${debt.upiId || 'Not linked'}</div>
          </div>
          <span class="badge-growth-sm" style="${isIOwe ? 'background:rgba(244,63,94,0.18); color:#fb7185;' : ''}">
            ${isIOwe ? 'To Return' : 'To Collect'}
          </span>
        </div>
        <div>
          <span class="debt-amount-figure ${isIOwe ? 'expense-val' : 'income-val'}">
            ${isIOwe ? '-' : '+'}${formatRupee(debt.amount)}
          </span>
          <div class="debt-note">For: ${debt.note || 'Shared expense'}</div>
        </div>
        <div class="debt-actions-row">
          <button type="button" class="btn-debt-settle" data-id="${debt.id}">
            ✓ Mark as Settled
          </button>
          ${!isIOwe ? 
            `<button type="button" class="btn-debt-remind" data-id="${debt.id}" title="Send UPI WhatsApp Reminder">
              📲 Remind
            </button>` : 
            canAfford ? `<span style="font-size:0.7rem; color:var(--brand-emerald-light); font-weight:700; align-self:center;">Funds Ready!</span>` : ''
          }
        </div>
      `;

      debtsCardsGrid.appendChild(card);

      // Settle Button
      card.querySelector('.btn-debt-settle').addEventListener('click', () => {
        settleDebt(user, debt.id);
      });

      // Remind via WhatsApp Button
      const remindBtn = card.querySelector('.btn-debt-remind');
      if (remindBtn) {
        remindBtn.addEventListener('click', () => {
          const upiUri = `upi://pay?pa=${debt.upiId || 'merchant@upi'}&pn=${encodeURIComponent(user.name)}&am=${debt.amount}&cu=INR&tn=${encodeURIComponent(debt.note || 'Split expense')}`;
          const msg = `Hi ${debt.friendName}, gentle reminder regarding ₹${debt.amount} for "${debt.note || 'shared expense'}". You can pay via UPI here: ${upiUri}`;
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
        });
      }
    });
  }

  // Debt Tabs toggle
  tabDebtIOwe.addEventListener('click', () => {
    currentDebtFilter = 'i_owe';
    tabDebtIOwe.classList.add('active');
    tabDebtOwedToMe.classList.remove('active');
    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (user) {
      const net = (user.transactions || []).reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
      renderDebtsSection(user, net);
    }
  });

  tabDebtOwedToMe.addEventListener('click', () => {
    currentDebtFilter = 'owed_to_me';
    tabDebtOwedToMe.classList.add('active');
    tabDebtIOwe.classList.remove('active');
    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (user) {
      const net = (user.transactions || []).reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
      renderDebtsSection(user, net);
    }
  });

  // Settle Debt Function
  function settleDebt(user, debtId) {
    const debt = (user.debts || []).find(d => d.id === debtId);
    if (!debt) return;

    debt.isSettled = true;

    // If it was a debt to return, automatically log an expense entry in the ledger
    if (debt.type === 'i_owe') {
      user.transactions.push({
        id: Date.now(),
        title: `Settled Debt to ${debt.friendName}`,
        amount: debt.amount,
        type: 'expense',
        category: 'Debt Repayment',
        date: 'Today'
      });
      showToast('Debt Settled', `Returned ${formatRupee(debt.amount)} to ${debt.friendName}. Logged in ledger!`, 'success');
    } else {
      // If collecting money, automatically log an income entry
      user.transactions.push({
        id: Date.now(),
        title: `Collected Money from ${debt.friendName}`,
        amount: debt.amount,
        type: 'income',
        category: 'Debt Repayment',
        date: 'Today'
      });
      showToast('Money Received', `Received ${formatRupee(debt.amount)} from ${debt.friendName}. Added to balance!`, 'success');
    }

    updateUser(user);
    renderDashboard(user);
  }

  /* --------------------------------------------------------------------------
     REQUEST MONEY & LIVE UPI QR CODE MODAL
     -------------------------------------------------------------------------- */
  btnOpenRequestMoney.addEventListener('click', () => {
    requestMoneyModal.classList.remove('hidden');
    formP2pRequest.classList.remove('hidden');
    upiGeneratedBox.classList.add('hidden');
    formP2pRequest.reset();
    currentP2pType = 'owed_to_me';
    updateP2pRelationshipButtons();
    document.getElementById('p2p-friend-name').focus();
  });

  function closeRequestMoneyModal() {
    requestMoneyModal.classList.add('hidden');
  }

  requestModalClose.addEventListener('click', closeRequestMoneyModal);
  p2pModalCancel.addEventListener('click', closeRequestMoneyModal);
  btnFinishP2p.addEventListener('click', closeRequestMoneyModal);

  function updateP2pRelationshipButtons() {
    btnRelCollect.classList.toggle('active', currentP2pType === 'owed_to_me');
    btnRelBorrow.classList.toggle('active', currentP2pType === 'i_owe');
  }

  btnRelCollect.addEventListener('click', () => { currentP2pType = 'owed_to_me'; updateP2pRelationshipButtons(); });
  btnRelBorrow.addEventListener('click', () => { currentP2pType = 'i_owe'; updateP2pRelationshipButtons(); });

  formP2pRequest.addEventListener('submit', (e) => {
    e.preventDefault();
    const friendNameInput = document.getElementById('p2p-friend-name');
    const upiIdInput = document.getElementById('p2p-upi-id');
    const amountInput = document.getElementById('p2p-amount');
    const noteInput = document.getElementById('p2p-note');
    const dueDateInput = document.getElementById('p2p-due-date');

    let isValid = true;
    if (!friendNameInput.value.trim()) { setError(friendNameInput, 'p2p-friend-name-error', 'Please enter friend\'s name'); isValid = false; }
    const amt = parseFloat(amountInput.value);
    if (isNaN(amt) || amt <= 0) { setError(amountInput, 'p2p-amount-error', 'Please enter a valid amount'); isValid = false; }
    if (!isValid) return;

    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (!user) return;

    const friendName = friendNameInput.value.trim();
    const friendUpi = upiIdInput.value.trim() || `${friendName.toLowerCase().replace(/\s+/g, '')}@upi`;
    const note = noteInput.value.trim() || 'Split Expense';
    const dueDate = dueDateInput.value || 'Within 7 days';

    const newDebt = {
      id: Date.now(),
      friendName: friendName,
      upiId: friendUpi,
      amount: amt,
      type: currentP2pType,
      note: note,
      dueDate: dueDate,
      isSettled: false
    };

    if (!user.debts) user.debts = [];
    user.debts.push(newDebt);
    updateUser(user);

    // Generate UPI Intent String
    const myUpiId = `${user.name.toLowerCase().replace(/\s+/g, '')}@okaxis`;
    const upiUri = `upi://pay?pa=${encodeURIComponent(myUpiId)}&pn=${encodeURIComponent(user.name)}&am=${amt.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
    activeGeneratedUpiUri = upiUri;
    activeFriendName = friendName;
    activeAmountFormatted = formatRupee(amt);
    activeNote = note;

    // Generate high resolution scannable QR Code using QR Server API with custom SVG fallback
    qrAmountDisplay.textContent = formatRupee(amt);
    qrNoteDisplay.textContent = `To: ${user.name} • Note: ${note}`;
    upiQrImageWrap.innerHTML = `
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(upiUri)}" alt="UPI QR Code" style="width:100%; height:100%; border-radius:8px;">
    `;

    // Configure WhatsApp Payment Request Link
    const waText = `Hi ${friendName}! Please pay ${formatRupee(amt)} for "${note}" using this UPI link: ${upiUri}`;
    activeGeneratedWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    // Transition to QR display
    formP2pRequest.classList.add('hidden');
    upiGeneratedBox.classList.remove('hidden');

    renderDashboard(user);
    showToast('Record Created', `Recorded debt entry for ${friendName}. Live UPI QR is ready!`, 'success');
  });

  // Direct Android UPI App Launcher (Google Pay, PhonePe, Paytm, BHIM)
  if (btnUpiAppDirect) {
    btnUpiAppDirect.addEventListener('click', () => {
      triggerHaptic(25);
      if (activeGeneratedUpiUri) {
        showToast('Launching UPI App', 'Opening Google Pay, PhonePe, Paytm or BHIM...', 'info');
        window.location.href = activeGeneratedUpiUri;
      } else {
        showToast('UPI Link Missing', 'Please generate a valid payment request first.', 'error');
      }
    });
  }

  // Native Android Web Share API with WhatsApp fallback
  if (btnWhatsappShare) {
    btnWhatsappShare.addEventListener('click', async () => {
      triggerHaptic(20);
      if (navigator.share && activeGeneratedUpiUri) {
        try {
          await navigator.share({
            title: 'Expense Tracker UPI Request',
            text: `Hi ${activeFriendName || 'Friend'}! Please pay ${activeAmountFormatted || ''} for "${activeNote || 'Split Expense'}" using this UPI link:`,
            url: activeGeneratedUpiUri
          });
          showToast('Request Shared', 'Sent via native Android share sheet.', 'success');
          return;
        } catch (err) {
          if (err.name === 'AbortError') return; // User cancelled Android share sheet
        }
      }
      if (activeGeneratedWhatsappUrl) {
        window.open(activeGeneratedWhatsappUrl, '_blank');
      }
    });
  }

  /* --------------------------------------------------------------------------
     TRANSACTION EDITING & DELETION ENGINE
     -------------------------------------------------------------------------- */
  function populateModalCategories(persona) {
    let categories = [];
    if (persona === 'student') categories = ['Pocket Allowance', 'Canteen & Dining', 'Hostel & Rent', 'Academics & Books', 'Entertainment', 'Transport'];
    else if (persona === 'trader') categories = ['F&O Options', 'Equity Swing', 'Crypto', 'Dividend Inflow', 'Intraday Equities', 'Brokerage & Taxes'];
    else if (persona === 'business') categories = ['Client Invoicing', 'Vendor Supplies', 'Tax & GST', 'Operating Overhead', 'Office Lease', 'Salaries'];
    else categories = ['Salary & Bonus', 'Needs (Rent & EMI)', 'Needs (Groceries & Utility)', 'Wants (Dining & Fun)', 'Savings (SIP & Funds)', 'Other'];

    [txCategorySelect, editTxCategorySelect].forEach(sel => {
      sel.innerHTML = '';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        sel.appendChild(opt);
      });
    });
  }

  function renderTransactionList(transactions) {
    dashboardTxList.innerHTML = '';

    // Apply Search & Filter
    const query = (txSearchInput.value || '').toLowerCase().trim();
    const filtered = (transactions || []).filter(tx => {
      const matchesQuery = !query || tx.title.toLowerCase().includes(query) || (tx.category && tx.category.toLowerCase().includes(query));
      const matchesType = currentLedgerTypeFilter === 'all' || tx.type === currentLedgerTypeFilter;
      return matchesQuery && matchesType;
    });

    if (filtered.length === 0) {
      dashboardTxList.innerHTML = `
        <div class="tx-empty-state">
          <span>No transactions matching your criteria.</span>
        </div>
      `;
      return;
    }

    filtered.slice().reverse().forEach(tx => {
      const isIncome = tx.type === 'income';
      const itemEl = document.createElement('div');
      itemEl.className = 'dash-tx-item';

      itemEl.innerHTML = `
        <div class="tx-left-col">
          <div class="tx-icon-wrap ${isIncome ? 'tx-income' : 'tx-expense'}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              ${isIncome ? 
                '<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>' : 
                '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>'
              }
            </svg>
          </div>
          <div class="tx-info">
            <span class="tx-name">${tx.title}</span>
            <span class="tx-meta">${tx.date || 'Today'} • <span class="tx-cat-badge">${tx.category || 'General'}</span></span>
          </div>
        </div>
        <div class="tx-amount-col">
          <span class="tx-amount-text ${isIncome ? 'income-val' : 'expense-val'}">
            ${isIncome ? '+' : '-'}${formatRupee(tx.amount)}
          </span>
          <div class="tx-row-actions">
            <button type="button" class="btn-tx-action edit" data-id="${tx.id}" title="Edit this transaction">✏️</button>
            <button type="button" class="btn-tx-action delete" data-id="${tx.id}" title="Delete this transaction">🗑️</button>
          </div>
        </div>
      `;
      dashboardTxList.appendChild(itemEl);

      // Edit Button Listener
      itemEl.querySelector('.btn-tx-action.edit').addEventListener('click', () => {
        openEditTxModal(tx);
      });

      // Delete Button Listener
      itemEl.querySelector('.btn-tx-action.delete').addEventListener('click', () => {
        deleteTransaction(tx.id);
      });
    });
  }

  // Search & Type Filters
  txSearchInput.addEventListener('input', () => {
    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (user) renderTransactionList(user.transactions);
  });

  filterTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLedgerTypeFilter = btn.getAttribute('data-filter');
      const activeEmail = localStorage.getItem(SESSION_KEY);
      const user = findUser(activeEmail);
      if (user) renderTransactionList(user.transactions);
    });
  });

  // Open Edit Modal
  function openEditTxModal(tx) {
    editTxIdInput.value = tx.id;
    editTxTitleInput.value = tx.title;
    editTxAmountInput.value = tx.amount;
    currentEditTxType = tx.type;
    editTypeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === currentEditTxType);
    });
    if (editTxCategorySelect) editTxCategorySelect.value = tx.category || editTxCategorySelect.options[0].value;
    editTxModal.classList.remove('hidden');
    editTxTitleInput.focus();
  }

  editTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentEditTxType = btn.getAttribute('data-type');
      editTypeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === currentEditTxType));
    });
  });

  editTxModalClose.addEventListener('click', () => editTxModal.classList.add('hidden'));
  editTxModalCancel.addEventListener('click', () => editTxModal.classList.add('hidden'));

  // Save Edited Transaction
  formEditTx.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(editTxIdInput.value);
    const title = editTxTitleInput.value.trim();
    const amt = parseFloat(editTxAmountInput.value);
    const category = editTxCategorySelect.value;

    if (!title || isNaN(amt) || amt <= 0) return;

    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (!user) return;

    const txIndex = (user.transactions || []).findIndex(t => t.id === id);
    if (txIndex !== -1) {
      user.transactions[txIndex].title = title;
      user.transactions[txIndex].amount = amt;
      user.transactions[txIndex].type = currentEditTxType;
      user.transactions[txIndex].category = category;
      updateUser(user);

      editTxModal.classList.add('hidden');
      renderDashboard(user);
      showToast('Transaction Updated', `Successfully updated "${title}" to ${formatRupee(amt)}.`, 'success');
    }
  });

  // Delete Transaction
  function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this entry? Your balance will be adjusted.')) return;
    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (!user) return;

    user.transactions = (user.transactions || []).filter(t => t.id !== id);
    updateUser(user);
    renderDashboard(user);
    showToast('Entry Deleted', 'Transaction removed and ledger updated.', 'info');
  }

  // Add Transaction Modal
  btnOpenTxModal.addEventListener('click', () => {
    txModal.classList.remove('hidden');
    formAddTx.reset();
    currentTxType = 'expense';
    txToggleBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-type') === 'expense'));
    document.getElementById('tx-title').focus();
  });

  txModalClose.addEventListener('click', () => txModal.classList.add('hidden'));
  txModalCancel.addEventListener('click', () => txModal.classList.add('hidden'));

  txToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTxType = btn.getAttribute('data-type');
      txToggleBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === currentTxType));
    });
  });

  formAddTx.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('tx-title');
    const amountInput = document.getElementById('tx-amount');
    const categorySelect = document.getElementById('tx-category');

    let isValid = true;
    if (!titleInput.value.trim()) { setError(titleInput, 'tx-title-error', 'Please enter a description'); isValid = false; }
    const amt = parseFloat(amountInput.value);
    if (isNaN(amt) || amt <= 0) { setError(amountInput, 'tx-amount-error', 'Please enter a valid amount'); isValid = false; }
    if (!isValid) return;

    const activeEmail = localStorage.getItem(SESSION_KEY);
    const user = findUser(activeEmail);
    if (!user) return;

    const newTx = {
      id: Date.now(),
      title: titleInput.value.trim(),
      amount: amt,
      type: currentTxType,
      category: categorySelect.value,
      date: 'Just now'
    };

    if (!user.transactions) user.transactions = [];
    user.transactions.push(newTx);
    updateUser(user);

    txModal.classList.add('hidden');
    renderDashboard(user);
    showToast('Entry Recorded', `${currentTxType === 'income' ? 'Credited' : 'Debited'} ${formatRupee(amt)} for ${newTx.title}`, 'success');
  });

  // Switch persona live
  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPersona = btn.getAttribute('data-persona');
      const activeEmail = localStorage.getItem(SESSION_KEY);
      if (activeEmail) {
        const user = findUser(activeEmail);
        if (user) {
          user.persona = targetPersona;
          updateUser(user);
          renderDashboard(user);
          showToast('Interface Switched', `Switched to ${getPersonaTitle(targetPersona)}.`, 'info');
        }
      }
    });
  });

  function loginToDashboard(user) {
    localStorage.setItem(SESSION_KEY, user.email);
    renderDashboard(user);
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Mandatory Notification & SMS Permission Gate for Bank & UPI Auto-Sync
    if (user.notificationSyncEnabled !== true) {
      setTimeout(() => {
        openMandatoryPermissionModal(user);
      }, 400);
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    dashboardView.classList.add('hidden');
    authView.classList.remove('hidden');
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  }

  btnLogout.addEventListener('click', logout);

  // Restore session if active
  const activeSessionEmail = localStorage.getItem(SESSION_KEY);
  if (activeSessionEmail) {
    const activeUser = findUser(activeSessionEmail);
    if (activeUser && activeUser.isVerified) {
      loginToDashboard(activeUser);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  // Automatic Notification Access Prompt for First-Time / Unconfigured Users
  setTimeout(() => {
    const currentUser = activeSessionEmail ? findUser(activeSessionEmail) : null;
    if (!currentUser || currentUser.notificationSyncEnabled !== true) {
      openMandatoryPermissionModal(currentUser);
    }
  }, 700);

  // Social Auth Feedback
  btnGoogle.addEventListener('click', () => showToast('Google OAuth', 'Connecting securely to Google...', 'info'));
  btnApple.addEventListener('click', () => showToast('Apple ID', 'Connecting to Apple ID...', 'info'));

  // Forgot password
  btnForgotPw.addEventListener('click', () => { modalForgot.classList.remove('hidden'); document.getElementById('forgot-email').focus(); });
  modalCloseX.addEventListener('click', () => modalForgot.classList.add('hidden'));
  modalCancelBtn.addEventListener('click', () => modalForgot.classList.add('hidden'));
  formForgot.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    if (!email || !isValidEmail(email)) return;
    modalForgot.classList.add('hidden');
    showToast('Reset Dispatched', `A reset link was sent to ${email}`, 'success');
  });

  /* --------------------------------------------------------------------------
     PRE-PAYMENT AUTO-CATEGORIZER & UPI SCAN & PAY SIMULATOR ENGINE
     (Unique Differentiator: Category prompt BEFORE debit & Impulse Spending Shield)
     -------------------------------------------------------------------------- */
  const PERSONA_EXPENSE_CATEGORIES = {
    student: [
      { label: '🍔 Canteen & Mess', name: 'Canteen & Dining' },
      { label: '📚 Books & Xerox', name: 'Academics & Books' },
      { label: '🚕 Auto & Metro', name: 'Commute & Travel' },
      { label: '🍿 Weekend Fun', name: 'Leisure & Entertainment' },
      { label: '📱 Mobile Recharge', name: 'Mobile & Internet' },
      { label: '🛍️ Shopping & Kit', name: 'Shopping & Essentials' }
    ],
    trader: [
      { label: '📊 Brokerage & STT', name: 'Brokerage & Taxes' },
      { label: '🖥️ Terminal & Algo', name: 'Trading Tech & Data' },
      { label: '📈 Trading Books', name: 'Education & Mentorship' },
      { label: '☕ Cafe & Co-work', name: 'Co-working & Coffee' },
      { label: '🛡️ Risk Hedge', name: 'Hedging Costs' },
      { label: '🏷️ Misc Trade Fee', name: 'Exchange Charges' }
    ],
    business: [
      { label: '📦 Raw Inventory', name: 'Vendor Supplies' },
      { label: '📢 Marketing & Ads', name: 'Client Acquisition' },
      { label: '🚚 Freight Delivery', name: 'Logistics & Shipping' },
      { label: '🏢 Office Rent/Util', name: 'Office Operations' },
      { label: '💼 Staff & Freelance', name: 'Contractor Wages' },
      { label: '🧾 Software & SaaS', name: 'Digital Subscriptions' }
    ],
    pro: [
      { label: '🛒 Groceries & Supermkt', name: 'Needs (Groceries)' },
      { label: '🍽️ Dining & Swiggy', name: 'Wants (Dining Out)' },
      { label: '⚡ Utilities & Bills', name: 'Needs (Utilities)' },
      { label: '🚕 Uber & Fuel', name: 'Needs (Transport)' },
      { label: '🏖️ Movie & Streaming', name: 'Wants (Entertainment)' },
      { label: '📈 Mutual Fund / SIP', name: 'Savings & Investments' }
    ]
  };

  const PERSONA_DAILY_LIMITS = {
    student: 300,
    trader: 3000,
    business: 15000,
    pro: 1500
  };

  // 1. Master Toggle: Enable / Disable Pre-Payment Smart Categorizer
  if (togglePrePaymentCategorizer) {
    togglePrePaymentCategorizer.addEventListener('change', () => {
      const activeEmail = localStorage.getItem(SESSION_KEY);
      if (!activeEmail) return;
      const user = findUser(activeEmail);
      if (!user) return;

      user.prePaymentCategorizerEnabled = togglePrePaymentCategorizer.checked;
      updateUser(user);

      if (user.prePaymentCategorizerEnabled) {
        showToast('Categorizer Activated', '⚡ Pre-Payment Smart Categorizer is ON: All outgoing payments will prompt for expense category before debiting to auto-record your ledger.', 'success');
      } else {
        showToast('Direct Pay Mode', 'Pre-Payment Categorizer is OFF: Outgoing UPI payments will complete instantly without asking for expense category.', 'info');
      }
    });
  }

  // 2. Open Scan & Pay Modal
  if (btnOpenScanPay) {
    btnOpenScanPay.addEventListener('click', () => {
      if (scanPayModal) {
        scanPayModal.classList.remove('hidden');
        if (formScanPay) formScanPay.reset();
        clearFormErrors(formScanPay);
        if (scanPayMerchant) scanPayMerchant.focus();
      }
    });
  }

  if (scanPayModalClose) {
    scanPayModalClose.addEventListener('click', () => scanPayModal.classList.add('hidden'));
  }
  if (scanPayModalCancel) {
    scanPayModalCancel.addEventListener('click', () => scanPayModal.classList.add('hidden'));
  }

  // 3. Quick Merchant Shortcuts
  quickMerchantChips.forEach(chip => {
    chip.addEventListener('click', () => {
      scanPayMerchant.value = chip.getAttribute('data-name') || '';
      scanPayUpiId.value = chip.getAttribute('data-upi') || '';
      scanPayAmount.value = chip.getAttribute('data-amount') || '';
      scanPayNote.value = chip.getAttribute('data-note') || '';
      clearError(scanPayMerchant, 'scan-pay-merchant-error');
      clearError(scanPayAmount, 'scan-pay-amount-error');
    });
  });

  // 4. Submit Scan & Pay Form
  if (formScanPay) {
    formScanPay.addEventListener('submit', (e) => {
      e.preventDefault();
      const merchant = scanPayMerchant.value.trim();
      const upi = scanPayUpiId.value.trim() || `${merchant.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`;
      const amt = parseFloat(scanPayAmount.value);
      const note = scanPayNote.value.trim();

      let isValid = true;
      if (!merchant) { setError(scanPayMerchant, 'scan-pay-merchant-error', 'Please enter merchant/recipient name'); isValid = false; }
      const activeEmail = localStorage.getItem(SESSION_KEY);
      const user = findUser(activeEmail);
      if (!user) return;

      if (isNaN(amt) || amt <= 0) {
        setError(scanPayAmount, 'scan-pay-amount-error', 'Please enter a valid amount');
        isValid = false;
      }
      if (!isValid) return;

      scanPayModal.classList.add('hidden');

      const paymentData = { merchant, upi, amount: amt, note };

      // INTERCEPT PAYMENT: Check if user has enabled the Pre-Payment Categorizer
      if (user.prePaymentCategorizerEnabled !== false) {
        openPrePaymentModal(paymentData, user);
      } else {
        executePaymentDirectly(paymentData, user);
      }
    });
  }

  // 5. Open Pre-Payment Categorizer & Impulse Shield Modal
  function openPrePaymentModal(payment, user) {
    pendingPaymentData = payment;
    const persona = user.persona || 'student';
    const categories = PERSONA_EXPENSE_CATEGORIES[persona] || PERSONA_EXPENSE_CATEGORIES.student;
    const dailyLimit = PERSONA_DAILY_LIMITS[persona] || 400;

    prePayMerchantName.textContent = payment.merchant;
    prePayUpiDisplay.textContent = payment.upi;
    prePayAmountDisplay.textContent = formatRupee(payment.amount);

    // Impulse Spending Shield Guardrail
    if (payment.amount > dailyLimit) {
      prePayImpulseWarning.classList.remove('hidden');
      const excess = Math.round(payment.amount - dailyLimit);
      prePayImpulseDesc.textContent = `This payment exceeds your daily spend allowance (₹${dailyLimit.toLocaleString('en-IN')}) by ₹${excess.toLocaleString('en-IN')}. Unlike PhonePe/Paytm which let you overspend without warning, Expense Tracker urges you to reflect before confirming.`;
    } else {
      prePayImpulseWarning.classList.add('hidden');
    }

    // Populate 1-Tap Category Chips
    preCategoryChipsGrid.innerHTML = '';
    activePreSelectedCategory = categories[0].name;
    preSelectedCategoryName.textContent = categories[0].name;

    categories.forEach((cat, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `pre-cat-chip ${idx === 0 ? 'active' : ''}`;
      chip.textContent = cat.label;
      chip.addEventListener('click', () => {
        preCategoryChipsGrid.querySelectorAll('.pre-cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activePreSelectedCategory = cat.name;
        preSelectedCategoryName.textContent = cat.name;
      });
      preCategoryChipsGrid.appendChild(chip);
    });

    // Calculate Net Balance & Budget Forecast
    const txList = user.transactions || [];
    let totalInflow = 0;
    let totalOutflow = 0;
    txList.forEach(t => {
      if (t.type === 'income') totalInflow += Number(t.amount);
      else totalOutflow += Number(t.amount);
    });
    const currentBalance = totalInflow - totalOutflow;
    const balanceAfterDebit = currentBalance - payment.amount;

    preImpactCurrBal.textContent = formatRupee(currentBalance);
    preImpactNewBal.textContent = formatRupee(balanceAfterDebit);
    if (balanceAfterDebit < 0) {
      preImpactNewBal.style.color = '#f87171';
    } else {
      preImpactNewBal.style.color = 'var(--brand-cyan-light)';
    }

    const impactPercent = currentBalance > 0 ? Math.min(100, Math.round((payment.amount / currentBalance) * 100)) : 100;
    preImpactProgressBar.style.width = `${Math.max(8, impactPercent)}%`;

    // Reset Split Checkbox
    prePaySplitCheckbox.checked = false;
    preSplitDetails.classList.add('hidden');
    const halfShare = formatRupee(payment.amount / 2);
    prePaySplitNote.textContent = `Will automatically create a ${halfShare} "Friend Owes Me" Khaata entry!`;

    prePaymentModal.classList.remove('hidden');
  }

  // 6. Split Checkbox Event Listeners
  if (prePaySplitCheckbox) {
    prePaySplitCheckbox.addEventListener('change', () => {
      if (prePaySplitCheckbox.checked) {
        preSplitDetails.classList.remove('hidden');
        if (pendingPaymentData) {
          const halfAmt = formatRupee(pendingPaymentData.amount / 2);
          prePaySplitNote.textContent = `Will automatically create a ${halfAmt} "Friend Owes Me" Khaata entry for ${prePaySplitFriend.value || 'friend'}!`;
        }
      } else {
        preSplitDetails.classList.add('hidden');
      }
    });
  }

  if (prePaySplitFriend) {
    prePaySplitFriend.addEventListener('input', () => {
      if (pendingPaymentData) {
        const halfAmt = formatRupee(pendingPaymentData.amount / 2);
        prePaySplitNote.textContent = `Will automatically create a ${halfAmt} "Friend Owes Me" Khaata entry for ${prePaySplitFriend.value || 'friend'}!`;
      }
    });
  }

  // 7. Confirm Pre-Payment & Auto-Record
  if (btnPrePaymentConfirm) {
    btnPrePaymentConfirm.addEventListener('click', () => {
      if (!pendingPaymentData) return;
      const activeEmail = localStorage.getItem(SESSION_KEY);
      const user = findUser(activeEmail);
      if (!user) return;

      const btnText = btnPrePaymentConfirm.querySelector('.btn-text');
      btnPrePaymentConfirm.disabled = true;
      btnText.textContent = 'Processing Payment...';

      setTimeout(() => {
        btnPrePaymentConfirm.disabled = false;
        btnText.textContent = 'Confirm Payment & Auto-Record';

        // Add expense transaction auto-categorized
        const newTx = {
          id: Date.now(),
          title: `UPI to ${pendingPaymentData.merchant}${pendingPaymentData.note ? ' (' + pendingPaymentData.note + ')' : ''}`,
          amount: pendingPaymentData.amount,
          type: 'expense',
          category: activePreSelectedCategory,
          date: 'Just now'
        };
        if (!user.transactions) user.transactions = [];
        user.transactions.push(newTx);

        // If auto-split was checked, automatically create P2P debt entry
        if (prePaySplitCheckbox.checked) {
          const friendName = prePaySplitFriend.value.trim() || 'Roommate / Friend';
          const splitAmt = Math.round((pendingPaymentData.amount / 2) * 100) / 100;
          if (!user.debts) user.debts = [];
          user.debts.push({
            id: Date.now() + 1,
            friendName: friendName,
            upiId: '',
            amount: splitAmt,
            type: 'owed_to_me',
            note: `50% split for ${pendingPaymentData.merchant}`,
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            isSettled: false
          });
          showToast('Split Debt Logged', `Recorded ${formatRupee(splitAmt)} owed by ${friendName} in P2P Khaata!`, 'info');
        }

        updateUser(user);
        prePaymentModal.classList.add('hidden');
        renderDashboard(user);

        showToast('Payment Successful & Categorized!', `⚡ ${formatRupee(pendingPaymentData.amount)} debited to ${pendingPaymentData.merchant} & auto-recorded under "${activePreSelectedCategory}". Zero manual tracking needed!`, 'success');
        pendingPaymentData = null;
      }, 400);
    });
  }

  if (prePaymentModalClose) {
    prePaymentModalClose.addEventListener('click', () => {
      prePaymentModal.classList.add('hidden');
      pendingPaymentData = null;
    });
  }

  if (prePaymentModalCancel) {
    prePaymentModalCancel.addEventListener('click', () => {
      prePaymentModal.classList.add('hidden');
      pendingPaymentData = null;
      showToast('Payment Cancelled', 'No money was debited from your account.', 'info');
    });
  }

  // 8. Direct Payment Fallback (Used when user disables Pre-Payment Categorizer)
  function executePaymentDirectly(payment, user) {
    const newTx = {
      id: Date.now(),
      title: `UPI to ${payment.merchant}${payment.note ? ' (' + payment.note + ')' : ''}`,
      amount: payment.amount,
      type: 'expense',
      category: 'UPI Direct Payment',
      date: 'Just now'
    };
    if (!user.transactions) user.transactions = [];
    user.transactions.push(newTx);
    updateUser(user);
    renderDashboard(user);
    showToast('UPI Payment Sent', `⚡ Sent ${formatRupee(payment.amount)} to ${payment.merchant} (Direct Mode without prompt).`, 'success');
  }

  /* ==========================================================================
     BANK & UPI NOTIFICATION PARSER & REAL-TIME AUTO-UPGRADE ENGINE
     ========================================================================== */

  // Audio synthesizer chime for incoming bank notifications
  function playNotificationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6 note

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // OS Dropdown Banner Elements
  const osNotifBanner = document.getElementById('os-notif-banner');
  const osAppIcon = document.getElementById('os-app-icon');
  const osAppName = document.getElementById('os-app-name');
  const osNotifClose = document.getElementById('os-notif-close');
  const osNotifText = document.getElementById('os-notif-text');
  const osParsedBadge = document.getElementById('os-parsed-badge');
  let osNotifTimeout = null;

  if (osNotifClose) {
    osNotifClose.addEventListener('click', () => {
      if (osNotifBanner) osNotifBanner.classList.add('hidden');
    });
  }

  function showOsNotificationBanner(source, text, parsed) {
    if (!osNotifBanner) return;

    let icon = '🏦';
    if (source.includes('Google Pay')) icon = '🟢';
    else if (source.includes('PhonePe')) icon = '🟣';
    else if (source.includes('Paytm')) icon = '🔵';
    else if (source.includes('HDFC')) icon = '🏦';
    else if (source.includes('SBI')) icon = '🏛️';
    else if (source.includes('ICICI')) icon = '🏢';

    osAppIcon.textContent = icon;
    osAppName.textContent = `${source} Alert`;
    osNotifText.textContent = text;

    const isCredit = parsed.type === 'income';
    osParsedBadge.className = `os-parsed-badge ${isCredit ? 'credit' : 'debit'}`;
    osParsedBadge.textContent = `⚡ Auto-${isCredit ? 'Credited' : 'Debited'}: ${isCredit ? '+' : '-'}${formatRupee(parsed.amount)} (${parsed.category})`;

    osNotifBanner.classList.remove('hidden');
    playNotificationChime();

    if (osNotifTimeout) clearTimeout(osNotifTimeout);
    osNotifTimeout = setTimeout(() => {
      osNotifBanner.classList.add('hidden');
    }, 6500);
  }

  // Mandatory Permission Modal Elements
  const mandatoryNotifModal = document.getElementById('mandatory-notif-modal');
  const mandatoryModalClose = document.getElementById('mandatory-modal-close');
  const btnSkipMandatoryPermission = document.getElementById('btn-skip-mandatory-permission');
  const btnGrantMandatoryPermission = document.getElementById('btn-grant-mandatory-permission');
  const browserPermStatusText = document.getElementById('browser-perm-status-text');
  const permStatusDot = document.getElementById('perm-status-dot');
  const btnOpenPermModal = document.getElementById('btn-open-perm-modal');
  const btnLoginPermTest = document.getElementById('btn-login-perm-test');

  function updateBrowserPermStatusBadge() {
    if (!browserPermStatusText || !permStatusDot) return;
    if (!('Notification' in window)) {
      browserPermStatusText.textContent = 'System Status: Notification API Not Supported';
      permStatusDot.className = 'perm-status-dot denied';
      return;
    }
    const perm = Notification.permission;
    if (perm === 'granted') {
      browserPermStatusText.textContent = '✅ Browser Push Access: Granted & Active';
      permStatusDot.className = 'perm-status-dot granted';
    } else if (perm === 'denied') {
      browserPermStatusText.textContent = '⚠️ Browser Push Access: Blocked in Site Settings';
      permStatusDot.className = 'perm-status-dot denied';
    } else {
      browserPermStatusText.textContent = '🔔 Browser Push Access: Ready to Grant';
      permStatusDot.className = 'perm-status-dot';
    }
  }

  function openMandatoryPermissionModal(user) {
    if (mandatoryNotifModal) {
      updateBrowserPermStatusBadge();
      mandatoryNotifModal.classList.remove('hidden');
    }
  }

  function closeMandatoryPermissionModal() {
    if (mandatoryNotifModal) mandatoryNotifModal.classList.add('hidden');
  }

  if (mandatoryModalClose) mandatoryModalClose.addEventListener('click', closeMandatoryPermissionModal);
  if (btnSkipMandatoryPermission) btnSkipMandatoryPermission.addEventListener('click', closeMandatoryPermissionModal);
  if (btnOpenPermModal) btnOpenPermModal.addEventListener('click', () => openMandatoryPermissionModal());
  if (btnLoginPermTest) btnLoginPermTest.addEventListener('click', () => openMandatoryPermissionModal());

  if (btnGrantMandatoryPermission) {
    btnGrantMandatoryPermission.addEventListener('click', async () => {
      const btnText = btnGrantMandatoryPermission.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Activating On-Device Listener...';

      if ('Notification' in window) {
        try {
          await Notification.requestPermission();
        } catch (err) {
          console.warn('Notification permission request:', err);
        }
      }

      updateBrowserPermStatusBadge();

      const activeEmail = localStorage.getItem(SESSION_KEY);
      const user = activeEmail ? findUser(activeEmail) : null;
      if (user) {
        user.notificationSyncEnabled = true;
        updateUser(user);
      }

      setTimeout(() => {
        if (btnText) btnText.textContent = 'Grant Permission & Activate Auto-Sync';
        closeMandatoryPermissionModal();
        showToast('Permission Granted', 'Bank & UPI Notification Listener activated! Your transactions will auto-sync.', 'success');
        playNotificationChime();

        // Trigger test verification banner
        showOsNotificationBanner(
          'HDFC Bank',
          'Alert: Bank & UPI Notification Auto-Sync enabled successfully on this device. Ready to auto-record transactions!',
          { type: 'income', amount: 0, category: 'Auto-Sync Active' }
        );
      }, 300);
    });
  }

  // Simulator Modal Elements
  const btnOpenNotifSync = document.getElementById('btn-open-notif-sync');
  const btnTriggerNotifSim = document.getElementById('btn-trigger-notif-sim');
  const notifSimulatorModal = document.getElementById('notif-simulator-modal');
  const notifSimModalClose = document.getElementById('notif-sim-modal-close');
  const notifSimModalCancel = document.getElementById('notif-sim-modal-cancel');
  const formNotifSim = document.getElementById('form-notif-sim');
  const simSourceSelect = document.getElementById('sim-source-select');
  const simNotifText = document.getElementById('sim-notif-text');
  const simNotifError = document.getElementById('sim-notif-error');
  const parserStatusTag = document.getElementById('parser-status-tag');
  const prevType = document.getElementById('prev-type');
  const prevAmount = document.getElementById('prev-amount');
  const prevMerchant = document.getElementById('prev-merchant');
  const prevCat = document.getElementById('prev-cat');
  const simPresetBtns = document.querySelectorAll('.sim-preset-btn');

  function openNotifSimulatorModal() {
    if (notifSimulatorModal) {
      notifSimulatorModal.classList.remove('hidden');
      if (simNotifText && !simNotifText.value.trim()) {
        simNotifText.value = "Alert: A/c **4120 debited by Rs 350.00 on 24-Oct-26 at Starbucks Coffee via UPI. Avl Bal: Rs 4,880.00.";
        if (simSourceSelect) simSourceSelect.value = "HDFC Bank";
        updateParserLivePreview();
      }
    }
  }

  function closeNotifSimulatorModal() {
    if (notifSimulatorModal) notifSimulatorModal.classList.add('hidden');
  }

  // Nav button opens Notification Access Setup Modal directly
  if (btnOpenNotifSync) btnOpenNotifSync.addEventListener('click', () => openMandatoryPermissionModal());
  if (btnTriggerNotifSim) btnTriggerNotifSim.addEventListener('click', openNotifSimulatorModal);
  if (notifSimModalClose) notifSimModalClose.addEventListener('click', closeNotifSimulatorModal);
  if (notifSimModalCancel) notifSimModalCancel.addEventListener('click', closeNotifSimulatorModal);

  // Preset Buttons
  simPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-source');
      const txt = btn.getAttribute('data-text');
      if (simSourceSelect) simSourceSelect.value = src;
      if (simNotifText) simNotifText.value = txt;
      updateParserLivePreview();
    });
  });

  if (simNotifText) {
    simNotifText.addEventListener('input', updateParserLivePreview);
  }
  if (simSourceSelect) {
    simSourceSelect.addEventListener('change', updateParserLivePreview);
  }

  // Regex Financial Extraction Engine
  function parseNotificationDetails(rawText, source) {
    const text = rawText || '';

    // 1. Detect Credit vs Debit
    const creditKeywords = /\b(credited|received|deposited|refund|salary|added|inward\s+remittance|cr)\b/i;
    const debitKeywords = /\b(debited|paid|spent|transferred|sent|withdrawn|purchase|payment\s+of|dr)\b/i;

    let isCredit = false;
    if (creditKeywords.test(text) && !debitKeywords.test(text)) {
      isCredit = true;
    } else if (debitKeywords.test(text) && !creditKeywords.test(text)) {
      isCredit = false;
    } else if (creditKeywords.test(text) && debitKeywords.test(text)) {
      const crPos = text.search(creditKeywords);
      const drPos = text.search(debitKeywords);
      isCredit = crPos < drPos;
    } else {
      isCredit = false;
    }

    // 2. Extract Amount
    let amount = 0;
    const amtRegexes = [
      /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
      /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹)/i,
      /\b(?:debited|credited|paid|received|spent)\s+(?:by|with|for)?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
      /amount\s+(?:of\s+)?(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i
    ];

    for (const rx of amtRegexes) {
      const match = text.match(rx);
      if (match && match[1]) {
        const cleaned = match[1].replace(/,/g, '');
        const val = parseFloat(cleaned);
        if (!isNaN(val) && val > 0) {
          amount = val;
          break;
        }
      }
    }

    // 3. Extract Merchant / Recipient / Sender
    let merchant = '';
    const merchantRegexes = [
      /(?:to|at|for|vpa|info:|towards|paid\s+to|from)\s+([A-Za-z0-9&@\.\s-]{2,32}?)(?:\s+(?:via|on|ref|avl|bal|\.|\,|$))/i,
      /(?:transfer\s+to|credited\s+by)\s+([A-Za-z0-9&@\.\s-]{2,32}?)(?:\s+(?:via|on|ref|\.|$))/i
    ];

    for (const rx of merchantRegexes) {
      const match = text.match(rx);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (!/^(your|a\/c|account|rs|inr|upi|ref|bank)$/i.test(candidate)) {
          merchant = candidate;
          break;
        }
      }
    }

    if (!merchant) {
      merchant = isCredit ? 'Direct Bank Inflow' : 'UPI Payment';
    }

    // 4. Auto-Categorize intelligently based on merchant & text
    let category = 'General';
    const lower = (text + ' ' + merchant).toLowerCase();

    if (/starbucks|cafe|canteen|swiggy|zomato|dining|food|snack|mcdonald|pizza|burger/i.test(lower)) {
      category = 'Canteen & Dining';
    } else if (/uber|ola|rapido|metro|fuel|petrol|diesel|travel|flight|irctc/i.test(lower)) {
      category = 'Transport & Travel';
    } else if (/salary|bonus|payroll|corporate/i.test(lower)) {
      category = 'Salary & Inflow';
    } else if (/hostel|rent|maintenance|electricity|wifi|bill/i.test(lower)) {
      category = 'Hostel & Rent';
    } else if (/books|textbook|xerox|exam|academics|course/i.test(lower)) {
      category = 'Academics & Books';
    } else if (/zerodha|groww|upstox|f&o|options|nifty|trade|stock/i.test(lower)) {
      category = 'F&O Options';
    } else if (/client|invoice|retainer|b2b/i.test(lower)) {
      category = 'Client Invoicing';
    } else if (/vendor|supplies|raw\s*material/i.test(lower)) {
      category = 'Vendor Supplies';
    } else {
      category = isCredit ? 'Income Credit' : 'Miscellaneous Expense';
    }

    return {
      type: isCredit ? 'income' : 'expense',
      amount: amount,
      merchant: merchant,
      category: category,
      isValid: amount > 0
    };
  }

  function updateParserLivePreview() {
    if (!simNotifText) return;
    const text = simNotifText.value.trim();
    const source = simSourceSelect ? simSourceSelect.value : 'HDFC Bank';
    const parsed = parseNotificationDetails(text, source);

    if (parsed.isValid) {
      if (parserStatusTag) {
        parserStatusTag.textContent = '✓ Valid Transaction Detected';
        parserStatusTag.style.color = '#34d399';
      }
      if (prevType) prevType.innerHTML = parsed.type === 'income' ? '<span style="color:#34d399;">+ Credit (Inflow)</span>' : '<span style="color:#fda4af;">- Debit (Outflow)</span>';
      if (prevAmount) prevAmount.textContent = formatRupee(parsed.amount);
      if (prevMerchant) prevMerchant.textContent = parsed.merchant;
      if (prevCat) prevCat.textContent = parsed.category;
    } else {
      if (parserStatusTag) {
        parserStatusTag.textContent = '⚠️ Waiting for Rupee Amount';
        parserStatusTag.style.color = '#f59e0b';
      }
      if (prevType) prevType.textContent = '-';
      if (prevAmount) prevAmount.textContent = '-';
      if (prevMerchant) prevMerchant.textContent = '-';
      if (prevCat) prevCat.textContent = '-';
    }
  }

  // Trigger from simulator form
  if (formNotifSim) {
    formNotifSim.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = simNotifText.value.trim();
      const source = simSourceSelect ? simSourceSelect.value : 'Bank Alert';

      if (!text) {
        if (simNotifError) simNotifError.textContent = 'Please enter or paste notification text.';
        return;
      }

      const parsed = parseNotificationDetails(text, source);
      if (!parsed.isValid) {
        if (simNotifError) simNotifError.textContent = 'Could not detect an amount (e.g. Rs 350 or ₹500). Please check text.';
        return;
      }
      if (simNotifError) simNotifError.textContent = '';

      const activeEmail = localStorage.getItem(SESSION_KEY);
      const user = findUser(activeEmail);
      if (!user) return;

      // Auto-Upgrade User Ledger!
      const newTx = {
        id: Date.now(),
        title: `${source}: ${parsed.merchant}`,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        date: 'Just now (Auto-Sync)'
      };

      if (!user.transactions) user.transactions = [];
      user.transactions.unshift(newTx);
      updateUser(user);
      renderDashboard(user);

      closeNotifSimulatorModal();
      showOsNotificationBanner(source, text, parsed);

      showToast(
        parsed.type === 'income' ? '⚡ Bank Credit Auto-Synced' : '⚡ Bank Debit Auto-Synced',
        `${parsed.type === 'income' ? 'Added' : 'Deducted'} ${formatRupee(parsed.amount)} for "${parsed.merchant}" under ${parsed.category}.`,
        'success'
      );
    });
  }

  /* ==========================================================================
     ANDROID HARDWARE/GESTURE BACK BUTTON & APP SHORTCUTS
     ========================================================================== */
  function setupAndroidModalBackSupport() {
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    
    // Automatically push state to browser history when any modal becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (!target.classList.contains('hidden')) {
            if (!window.history.state || !window.history.state.modalOpen) {
              window.history.pushState({ modalOpen: true, modalId: target.id }, '');
            }
          }
        }
      });
    });

    modalBackdrops.forEach(modal => {
      observer.observe(modal, { attributes: true });
      
      // Dismiss on backdrop touch for mobile native feel
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          triggerHaptic(15);
          if (window.history.state && window.history.state.modalOpen) {
            window.history.back();
          }
        }
      });
    });

    // Android Hardware/Gesture Back Button listener (dismisses modal instead of closing app)
    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-backdrop:not(.hidden)'));
      if (openModals.length > 0) {
        const topModal = openModals[openModals.length - 1];
        topModal.classList.add('hidden');
        triggerHaptic(20);
      } else if (notifDrawer && notifDrawer.classList.contains('active')) {
        notifDrawer.classList.remove('active');
        triggerHaptic(20);
      }
    });
  }

  function handleAndroidAppShortcuts() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortcut = urlParams.get('shortcut');
    if (!shortcut) return;

    // Clean URL query without page reload
    window.history.replaceState({}, document.title, window.location.pathname);

    // Give dashboard time to settle
    setTimeout(() => {
      const activeEmail = localStorage.getItem(SESSION_KEY);
      if (!activeEmail) return;

      if (shortcut === 'scan-pay' && btnOpenScanPay) {
        btnOpenScanPay.click();
      } else if (shortcut === 'add-tx' && btnOpenTxModal) {
        btnOpenTxModal.click();
      } else if (shortcut === 'p2p' && btnOpenRequestMoney) {
        btnOpenRequestMoney.click();
      }
    }, 450);
  }

  setupAndroidModalBackSupport();
  handleAndroidAppShortcuts();
});
