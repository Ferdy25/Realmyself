import { nav } from './sections/nav.js';
import { hero } from './sections/hero.js';
import { about } from './sections/about.js';
import { projects } from './sections/projects.js';
import { hobby } from './sections/hobby.js';
import { experience } from './sections/experience.js';
import { contact, footer } from './sections/contact.js';

document.querySelector('#app').innerHTML = `${nav}${hero}${about}${projects}${hobby}${experience}${contact}${footer}`;
document.querySelector('[data-year]').textContent = new Date().getFullYear();

// Navigation Drawer
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('hidden', open);
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileMenu.classList.add('hidden');
  menuButton.setAttribute('aria-expanded', 'false');
}));

// Interactive Pipeline Tabs (Mobile & Desktop)
const pipelineTabs = document.querySelectorAll('[data-pipeline-tab]');
const pipelinePanels = document.querySelectorAll('[data-pipeline-panel]');
pipelineTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-pipeline-tab');
    pipelineTabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    pipelinePanels.forEach((panel) => {
      panel.classList.toggle('active', panel.getAttribute('data-pipeline-panel') === target);
    });
  });
});

// Interactive Copy Email Button with instant feedback
const copyButton = document.querySelector('[data-copy-email]');
if (copyButton) {
  const defaultHtml = copyButton.innerHTML;
  copyButton.addEventListener('click', async () => {
    const email = copyButton.getAttribute('data-copy-email') || 'hello@example.com';
    try {
      await navigator.clipboard.writeText(email);
      copyButton.innerHTML = '<span class="copy-icon">✓</span> <span class="copy-text">Alamat email tersalin!</span>';
      copyButton.classList.add('copied');
      setTimeout(() => {
        copyButton.innerHTML = defaultHtml;
        copyButton.classList.remove('copied');
      }, 2500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
}

const number = (value, fractionDigits = 1) => value == null ? '—' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: fractionDigits }).format(value);
const dateTime = (value) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : 'Belum ada data tersimpan';
const weatherDescription = (code) => {
  if (code === 0) return 'Cerah';
  if ([1, 2, 3].includes(code)) return 'Cerah berawan';
  if ([45, 48].includes(code)) return 'Berkabut';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Gerimis';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Hujan';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Salju';
  if ([95, 96, 99].includes(code)) return 'Badai petir';
  return code == null ? 'Menunggu data aktual' : `Kode cuaca WMO ${code}`;
};
const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

function paintTasks(tasks = []) {
  const labels = {
    extract_open_meteo: 'Extract · Open-Meteo',
    transform_validate: 'Transform · Validasi Data',
    load_postgres: 'Load · PostgreSQL',
    visualize_matplotlib: 'Visualize · Matplotlib',
  };
  const container = document.querySelector('[data-pipeline-tasks]');
  if (!tasks.length) {
    container.innerHTML = '<div class="dag-placeholder">Task belum tercatat di database. Tekan "Jalankan Sekarang" untuk memicu pipeline.</div>';
    return;
  }
  container.innerHTML = tasks.map((task, index) => `
    <article class="dag-task-card ${safe(task.status)}">
      <div class="task-card-top">
        <span class="task-step-pill">TAHAP 0${index + 1}</span>
        <span class="task-status-badge ${safe(task.status)}">${safe(task.status).toUpperCase()}</span>
      </div>
      <div class="task-card-main">
        <strong class="task-card-title">${labels[task.task_name] || safe(task.task_name)}</strong>
        <p class="task-card-detail">${task.status === 'success' ? `${number(task.records_processed, 0)} record · ${number(task.duration_seconds, 2)} detik` : safe(task.error_message || task.status)}</p>
      </div>
    </article>`).join('');
}

function paintRuns(runs = []) {
  const container = document.querySelector('[data-run-history]');
  if (!runs.length) {
    container.innerHTML = '<p class="history-empty">Belum ada run tersimpan di database.</p>';
    return;
  }
  container.innerHTML = runs.map((run) => `
    <div class="history-data-row">
      <span class="col-id font-mono">#${safe(run.id)}</span>
      <span class="col-status"><span class="status-tag ${safe(run.status)}">${safe(run.status).toUpperCase()}</span></span>
      <span class="col-records">${run.status === 'success' ? `${number(run.records_processed, 0)} titik cuaca` : safe(run.error_message || 'Gagal')}</span>
      <span class="col-duration font-mono">${number(run.duration_seconds, 2)}s</span>
      <time class="col-time font-mono">${dateTime(run.started_at)}</time>
    </div>`).join('');
}

function paintOverview(data) {
  const latest = data.latest_run;
  const current = data.current;
  const online = true;
  document.querySelector('[data-api-indicator]')?.classList.toggle('is-online', online);
  
  const labelEl = document.querySelector('[data-api-label]');
  if (labelEl) {
    labelEl.textContent = data.latest_attempt?.status === 'failed'
      ? 'API AKTIF · RUN TERAKHIR GAGAL'
      : latest ? 'PIPELINE AKTIF · DATA TERSEDIA' : 'API AKTIF · MENUNGGU RUN PERTAMA';
  }

  const tempEl = document.querySelector('[data-weather-temperature]');
  if (tempEl) tempEl.textContent = current ? number(current.temperature_c) : '—';

  const humEl = document.querySelector('[data-weather-humidity]');
  if (humEl) humEl.textContent = current ? number(current.humidity_pct, 0) : '—';

  const windEl = document.querySelector('[data-weather-wind]');
  if (windEl) windEl.textContent = current ? number(current.wind_speed_kmh) : '—';

  const rainEl = document.querySelector('[data-weather-rain]');
  if (rainEl) rainEl.textContent = current ? number(current.precipitation_mm) : '—';

  const sumEl = document.querySelector('[data-weather-summary]');
  if (sumEl) {
    sumEl.textContent = current
      ? `${weatherDescription(current.weather_code)} · Kondisi tercatat saat API mengambil sampel cuaca di Jakarta.`
      : 'Pipeline belum memiliki data sukses di database.';
  }

  const updatedEl = document.querySelector('[data-weather-updated]');
  if (updatedEl) {
    updatedEl.textContent = latest ? `TERAKHIR DIPERBARUI: ${dateTime(data.updated_at)}` : 'BELUM ADA RUN SUKSES';
  }

  const chart = document.querySelector('[data-weather-chart]');
  const chartPlaceholder = document.querySelector('[data-chart-placeholder]');
  if (latest?.chart_path && chart && chartPlaceholder) {
    chart.src = `/api/chart.png?run=${encodeURIComponent(latest.id)}`;
    chart.hidden = false;
    chartPlaceholder.hidden = true;
  }

  paintTasks(data.tasks);
  paintRuns(data.runs);

  const runSummaryEl = document.querySelector('[data-run-summary]');
  if (runSummaryEl) {
    runSummaryEl.textContent = latest
      ? `Run #${latest.id} sukses · ${number(latest.records_processed, 0)} record · ${number(latest.duration_seconds, 2)} detik · ${number(data.total_records_loaded, 0)} total record`
      : data.latest_attempt?.status === 'failed' ? 'Run terakhir gagal. Buka tab Riwayat Database untuk melihat pesan error.' : 'Belum ada run tercatat di database.';
  }
}

async function loadOverview() {
  try {
    const response = await fetch('/api/overview', { cache: 'no-store' });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    paintOverview(await response.json());
  } catch {
    document.querySelector('[data-api-indicator]')?.classList.remove('is-online');
    const labelEl = document.querySelector('[data-api-label]');
    if (labelEl) labelEl.textContent = 'API OFFLINE · JALANKAN DOCKER';
    const sumEl = document.querySelector('[data-weather-summary]');
    if (sumEl) sumEl.textContent = 'Belum tersambung ke API lokal. Jalankan docker compose up --build untuk menghubungkan pipeline dan database nyata.';
    const runSummaryEl = document.querySelector('[data-run-summary]');
    if (runSummaryEl) runSummaryEl.textContent = 'Menunggu koneksi dari Docker container (FastAPI & PostgreSQL).';
  }
}

const runButton = document.querySelector('[data-run-pipeline]');
runButton?.addEventListener('click', async () => {
  runButton.disabled = true;
  runButton.innerHTML = 'MENJALANKAN PIPELINE... <span class="button-spinner" aria-hidden="true"></span>';
  try {
    const response = await fetch('/api/refresh', { method: 'POST' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Pipeline gagal');
    await loadOverview();
    if (result.status === 'already_running') {
      const runSummaryEl = document.querySelector('[data-run-summary]');
      if (runSummaryEl) runSummaryEl.textContent = 'Satu proses sedang berjalan; menunggu hasil masuk ke database.';
    }
  } catch (error) {
    const runSummaryEl = document.querySelector('[data-run-summary]');
    if (runSummaryEl) runSummaryEl.textContent = `Pipeline gagal: ${error.message}`;
  } finally {
    runButton.disabled = false;
    runButton.innerHTML = '<span>JALANKAN SEKARANG</span> <span class="btn-icon">↗</span>';
  }
});

loadOverview();
setInterval(loadOverview, 30_000);
