const STORAGE_KEY = "kaspanitia-live-v1";
const AUTH_KEY = "kaspanitia-auth-v1";
const PASSWORDS_KEY = "kaspanitia-passwords-v1";

const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "rab", label: "RAB" },
  { id: "pengajuan", label: "Pengajuan" },
  { id: "transaksi", label: "Transaksi" },
  { id: "laporan", label: "Laporan" },
  { id: "audit", label: "Audit" },
  { id: "users", label: "Users" }
];

const defaultState = {
  currentUserId: "u-bendahara",
  users: [
    { id: "u-admin", name: "Admin Sistem", email: "admin@kaspanitia.id", role: "Admin", divisi: "-", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
    { id: "u-ketua", name: "Rina Ketua", email: "ketua@kaspanitia.id", role: "Ketua Panitia", divisi: "-", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
    { id: "u-bendahara", name: "Budi Bendahara", email: "bendahara@kaspanitia.id", role: "Bendahara", divisi: "-", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
    { id: "u-divisi-acara", name: "Ayu Acara", email: "acara@kaspanitia.id", role: "Koordinator Divisi", divisi: "Acara", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
    { id: "u-divisi-humas", name: "Dian Humas", email: "humas@kaspanitia.id", role: "Koordinator Divisi", divisi: "Humas", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
  ],
  transactions: [
    { id: "TRX-1042", date: "2026-10-22", jenis: "income", kategori: "Sponsor", nominal: 2500000, status: "disetujui", nama: "Sponsor Mitra A" },
    { id: "TRX-1043", date: "2026-10-23", jenis: "expense", kategori: "Dekorasi", nominal: 1800000, status: "diajukan", nama: "Beli dekorasi" },
    { id: "TRX-1044", date: "2026-10-24", jenis: "expense", kategori: "Perjalanan", nominal: 950000, status: "dicairkan", nama: "Transport panitia" },
    { id: "TRX-1045", date: "2026-10-25", jenis: "transfer", kategori: "Kas internal", nominal: 1200000, status: "disetujui", nama: "Transfer tim" }
  ],
  overview: {
    totalKas: 18450000,
    pengeluaran: 5865000,
    pendapatan: 7920000,
    sisaKas: 12600000
  }
};

const state = loadState();
let currentScreen = "dashboard";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const seeded = structuredClone(defaultState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(saved);
  } catch {
    const seeded = structuredClone(defaultState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

function getPasswordMap() {
  const raw = localStorage.getItem(PASSWORDS_KEY);
  if (!raw) {
    const map = {};
    state.users.forEach((user) => {
      map[user.email] = "123456";
    });
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(map));
    return map;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const map = {};
    state.users.forEach((user) => {
      map[user.email] = "123456";
    });
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(map));
    return map;
  }
}

function showLoginError(message) {
  const el = document.getElementById("loginError");
  el.textContent = message;
  el.classList.add("show");
}

function clearLoginError() {
  const el = document.getElementById("loginError");
  el.classList.remove("show");
  el.textContent = "";
}

function showApp() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");
}

function showAuth() {
  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
}

function renderUserMeta() {
  const user = getCurrentUser();
  document.getElementById("sidebarUserName").textContent = user.name;
  document.getElementById("sidebarUserRole").textContent = user.role;
  document.getElementById("userRoleTop").textContent = user.role;
  document.getElementById("userNameTop").textContent = user.name.split(" ")[0];
  document.getElementById("sidebarUserPhoto").src = user.photo;
  document.getElementById("userAvatar").src = user.photo;
}

function renderUserSelect() {
  const select = document.getElementById("userSelect");
  select.innerHTML = state.users
    .map((user) => `<option value="${user.id}" ${user.id === state.currentUserId ? "selected" : ""}>${user.name}</option>`)
    .join("");
}

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = menuItems
    .map(
      (item) => `
        <button class="nav-btn ${item.id === currentScreen ? "active" : ""}" data-screen="${item.id}" type="button">
          ${item.label}
        </button>
      `
    )
    .join("");

  nav.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentScreen = button.dataset.screen;
      renderNav();
      renderScreen();
    });
  });
}

function setStatusText() {
  const titleMap = {
    dashboard: ["Dashboard", "Monitoring keuangan dan realisasi anggaran"],
    rab: ["Rencana Anggaran", "Perencanaan kebutuhan dan alokasi dana"],
    pengajuan: ["Pengajuan", "Daftar pengajuan dan persetujuan"],
    transaksi: ["Transaksi", "Riwayat transaksi kas dan pengeluaran"],
    laporan: ["Laporan", "Ringkasan dan rekapitulasi kegiatan"],
    audit: ["Audit", "Pemeriksaan dan catatan transaksi"],
    users: ["Users", "Manajemen pengguna dan akses"],
  };

  const [title, subtitle] = titleMap[currentScreen];
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageSubtitle").textContent = subtitle;
}

function formatMoney(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function renderDashboard() {
  const { totalKas, pengeluaran, pendapatan, sisaKas } = state.overview;

  const cards = `
    <div class="summary-box">Kas aktif terkini: <strong>${formatMoney(totalKas)}</strong> siap dikelola untuk kebutuhan acara.</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-head">
          <div class="stat-label">Total kas</div>
          <div class="stat-icon icon-green">💰</div>
        </div>
        <div class="stat-value">${formatMoney(totalKas)}</div>
        <div class="trend up">▲ 12.4%</div>
      </div>
      <div class="stat-card">
        <div class="stat-head">
          <div class="stat-label">Pengeluaran</div>
          <div class="stat-icon icon-red">📉</div>
        </div>
        <div class="stat-value">${formatMoney(pengeluaran)}</div>
        <div class="trend down">▼ 3.1%</div>
      </div>
      <div class="stat-card">
        <div class="stat-head">
          <div class="stat-label">Pendapatan</div>
          <div class="stat-icon icon-blue">📈</div>
        </div>
        <div class="stat-value">${formatMoney(pendapatan)}</div>
        <div class="trend up">▲ 8.7%</div>
      </div>
      <div class="stat-card">
        <div class="stat-head">
          <div class="stat-label">Sisa kas</div>
          <div class="stat-icon icon-gold">🧾</div>
        </div>
        <div class="stat-value">${formatMoney(sisaKas)}</div>
        <div class="trend up">▲ 5.9%</div>
      </div>
    </div>

    <div class="main-grid">
      <section class="section">
        <div class="section-header">
          <h3>Performa bulan ini</h3>
          <span class="muted">Januari 2026</span>
        </div>
        <div class="chart-wrap">
          <div class="bar-col"><div class="bar" style="height: 38%"></div><div class="bar-label">Jan</div></div>
          <div class="bar-col"><div class="bar alt" style="height: 52%"></div><div class="bar-label">Feb</div></div>
          <div class="bar-col"><div class="bar" style="height: 67%"></div><div class="bar-label">Mar</div></div>
          <div class="bar-col"><div class="bar alt" style="height: 58%"></div><div class="bar-label">Apr</div></div>
          <div class="bar-col"><div class="bar" style="height: 78%"></div><div class="bar-label">Mei</div></div>
          <div class="bar-col"><div class="bar alt" style="height: 90%"></div><div class="bar-label">Jun</div></div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h3>Prioritas</h3>
          <span class="muted">Hari ini</span>
        </div>
        <div class="mini-list">
          <div class="mini-item">
            <span class="mini-dot" style="background:#1d8e5d"></span>
            <div>
              <strong>Acara utama</strong>
              <small>Persiapan venue</small>
            </div>
            <span class="value">72%</span>
          </div>
          <div class="mini-item">
            <span class="mini-dot" style="background:#3d7ad9"></span>
            <div>
              <strong>Promosi</strong>
              <small>Publikasi digital</small>
            </div>
            <span class="value">84%</span>
          </div>
          <div class="mini-item">
            <span class="mini-dot" style="background:#c9861b"></span>
            <div>
              <strong>Logistik</strong>
              <small>Transport & konsumsi</small>
            </div>
            <span class="value">65%</span>
          </div>
        </div>
      </section>
    </div>

    <section class="section">
      <div class="section-header">
        <h3>Transaksi terkini</h3>
        <span class="muted">${state.transactions.length} data</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Kategori</th>
              <th>Nominal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${state.transactions.map((item) => `
              <tr>
                <td>${item.id}</td>
                <td>${item.date}</td>
                <td><span class="badge ${item.jenis}">${item.jenis}</span></td>
                <td>${item.kategori}</td>
                <td class="money ${item.jenis === "expense" ? "out" : "in"}">${formatMoney(item.nominal)}</td>
                <td><span class="badge status-${item.status}">${item.status}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById("screen-dashboard").innerHTML = cards;
}

function renderRAB() {
  document.getElementById("screen-rab").innerHTML = `
    <section class="section">
      <div class="section-header">
        <h3>RAB</h3>
        <button class="btn secondary" type="button">+ Tambah Item</button>
      </div>
      <div class="grid-2">
        <div class="list-card">
          <div class="mini-label">Total anggaran</div>
          <div class="big-number">${formatMoney(42000000)}</div>
        </div>
        <div class="list-card">
          <div class="mini-label">Realisasi</div>
          <div class="big-number">${formatMoney(27600000)}</div>
        </div>
      </div>
    </section>
  `;
}

function renderPengajuan() {
  document.getElementById("screen-pengajuan").innerHTML = `
    <section class="section">
      <div class="section-header">
        <h3>Pengajuan</h3>
        <button class="btn secondary" type="button">+ Pengajuan Baru</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Judul</th>
              <th>Divisi</th>
              <th>Nominal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Perbaikan sound system</td><td>Acara</td><td>${formatMoney(2400000)}</td><td><span class="badge status-diajukan">diajukan</span></td></tr>
            <tr><td>Promosi media sosial</td><td>Humas</td><td>${formatMoney(1800000)}</td><td><span class="badge status-disetujui">disetujui</span></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTransaksi() {
  document.getElementById("screen-transaksi").innerHTML = `
    <section class="section">
      <div class="section-header">
        <h3>Transaksi</h3>
        <button class="btn primary" type="button">+ Buat Transaksi</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Jenis</th>
              <th>Status</th>
              <th>Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${state.transactions.map((item) => `
              <tr>
                <td>${item.id}</td>
                <td>${item.nama}</td>
                <td><span class="badge ${item.jenis}">${item.jenis}</span></td>
                <td><span class="badge status-${item.status}">${item.status}</span></td>
                <td class="money ${item.jenis === "expense" ? "out" : "in"}">${formatMoney(item.nominal)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderLaporan() {
  document.getElementById("screen-laporan").innerHTML = `
    <section class="section">
      <div class="section-header">
        <h3>Laporan</h3>
        <button class="btn secondary" type="button">Download PDF</button>
      </div>
      <div class="summary-box">Laporan kegiatan bulan ini telah dihasilkan dan siap disetujui.</div>
    </section>
  `;
}

function renderAudit() {
  document.getElementById("screen-audit").innerHTML = `
    <section class="section">
      <div class="section-header">
        <h3>Audit</h3>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Checklist</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>Verifikasi bukti</td><td><span class="badge status-disetujui">ok</span></td></tr>
            <tr><td>Rekonsiliasi kas</td><td><span class="badge status-diajukan">pending</span></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderUsers() {
  document.getElementById("screen-users").innerHTML = `
    <section class="section">
      <div class="section-header">
        <h3>Users</h3>
        <button class="btn secondary" type="button">+ Tambah User</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nama</th><th>Role</th><th>Divisi</th><th>Email</th></tr>
          </thead>
          <tbody>
            ${state.users.map((user) => `
              <tr>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>${user.divisi}</td>
                <td>${user.email}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderScreen() {
  setStatusText();
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.add("hidden"));
  const target = document.getElementById(`screen-${currentScreen}`);
  target.classList.remove("hidden");

  if (currentScreen === "dashboard") renderDashboard();
  if (currentScreen === "rab") renderRAB();
  if (currentScreen === "pengajuan") renderPengajuan();
  if (currentScreen === "transaksi") renderTransaksi();
  if (currentScreen === "laporan") renderLaporan();
  if (currentScreen === "audit") renderAudit();
  if (currentScreen === "users") renderUsers();
}

function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  const pattern = getPasswordMap();

  if (!user) {
    showLoginError("Email tidak terdaftar.");
    return;
  }

  if (pattern[user.email] !== password) {
    showLoginError("Password salah. Gunakan password default 123456.");
    return;
  }

  state.currentUserId = user.id;
  saveState();
  clearLoginError();
  renderUserMeta();
  renderUserSelect();
  showApp();
}

function handleExportCsv() {
  const rows = state.transactions.map((item) => [
    item.id,
    item.date,
    item.kategori,
    item.jenis,
    item.status,
    item.nominal
  ]);

  const csv = ["id,tanggal,kategori,jenis,status,nominal", ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kaspanitia-transaksi.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleDownloadPdf() {
  if (!window.jspdf?.jsPDF) {
    alert("Library PDF belum siap. Silakan coba lagi.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("KasPanitia - Data Transaksi", 14, 12);
  state.transactions.forEach((item, index) => {
    const y = 24 + index * 8;
    doc.text(`${item.id} | ${item.date} | ${item.kategori} | ${formatMoney(item.nominal)}`, 14, y);
  });
  doc.save("kaspanitia-transaksi.pdf");
}

function resetData() {
  const confirmed = confirm("Reset data ke default?");
  if (!confirmed) return;

  const seeded = structuredClone(defaultState);
  Object.assign(state, seeded);
  saveState();
  renderUserMeta();
  renderUserSelect();
  renderNav();
  renderScreen();
}

function changePasswordOpen() {
  document.getElementById("passwordModal").classList.remove("hidden");
  document.getElementById("passwordMessage").className = "password-message";
  document.getElementById("passwordMessage").textContent = "";
}

function changePasswordClose() {
  document.getElementById("passwordModal").classList.add("hidden");
  document.getElementById("changePasswordForm").reset();
}

function handlePasswordSubmit(event) {
  event.preventDefault();
  const currentPassword = document.getElementById("currentPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const message = document.getElementById("passwordMessage");
  const user = getCurrentUser();
  const map = getPasswordMap();

  if (map[user.email] !== currentPassword) {
    message.textContent = "Password lama tidak sesuai.";
    message.className = "password-message show error";
    return;
  }

  if (newPassword.length < 6) {
    message.textContent = "Password baru minimal 6 karakter.";
    message.className = "password-message show error";
    return;
  }

  if (newPassword !== confirmPassword) {
    message.textContent = "Konfirmasi password tidak cocok.";
    message.className = "password-message show error";
    return;
  }

  map[user.email] = newPassword;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(map));

  message.textContent = "Password berhasil diperbarui.";
  message.className = "password-message show success";

  setTimeout(() => {
    changePasswordClose();
  }, 900);
}

function bindEvents() {
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    loginUser();
  });

  document.getElementById("userSelect").addEventListener("change", (event) => {
    state.currentUserId = event.target.value;
    saveState();
    renderUserMeta();
    renderScreen();
  });

  document.getElementById("globalSearch").addEventListener("input", (event) => {
    const keyword = event.target.value.toLowerCase();
    const filtered = state.transactions.filter((item) => {
      return [item.id, item.nama, item.kategori, item.status].some((text) => String(text).toLowerCase().includes(keyword));
    });

    const target = document.getElementById("screen-dashboard");
    if (!keyword) {
      renderDashboard();
      return;
    }

    target.innerHTML = `
      <section class="section">
        <div class="section-header">
          <h3>Hasil pencarian</h3>
          <span class="muted">${filtered.length} data</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Nama</th><th>Kategori</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${filtered.map((item) => `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.nama}</td>
                  <td>${item.kategori}</td>
                  <td><span class="badge status-${item.status}">${item.status}</span></td>
                </tr>
              `).join("") || '<tr><td colspan="4">Tidak ada hasil</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    showAuth();
    document.getElementById("loginForm").reset();
    clearLoginError();
  });

  document.getElementById("changePasswordBtn").addEventListener("click", changePasswordOpen);
  document.getElementById("closePasswordModal").addEventListener("click", changePasswordClose);
  document.getElementById("cancelPasswordBtn").addEventListener("click", changePasswordClose);
  document.getElementById("changePasswordForm").addEventListener("submit", handlePasswordSubmit);
  document.getElementById("exportCsvBtn").addEventListener("click", handleExportCsv);
  document.getElementById("downloadPdfBtn").addEventListener("click", handleDownloadPdf);
  document.getElementById("resetDataBtn").addEventListener("click", resetData);

  document.getElementById("profileUploadInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const user = getCurrentUser();
      user.photo = reader.result;
      saveState();
      renderUserMeta();
      renderUserSelect();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("quickAction").addEventListener("click", () => {
    alert("Fitur transaksi cepat siap dikembangkan.");
  });
}

function init() {
  renderUserMeta();
  renderUserSelect();
  renderNav();
  renderScreen();
  bindEvents();
  showAuth();
}

init();
