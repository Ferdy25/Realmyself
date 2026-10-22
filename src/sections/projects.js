export const projects = `
<section id="karya" class="work-section">
  <div class="section-container mx-auto max-w-7xl px-5 sm:px-8">
    <div class="section-kicker">
      <span class="kicker-line"></span>
      <span>LIVE PIPELINE PROJECT</span>
    </div>
    
    <div class="section-header-row">
      <div>
        <h2 class="work-title">
          Jakarta Weather Engine.<br />
          <em>Data nyata dari API publik ke PostgreSQL.</em>
        </h2>
        <p class="work-desc">
          Pipeline data otomatis yang menarik cuaca Jakarta dari Open-Meteo, melakukan transformasi & validasi di Python, menyimpan data di PostgreSQL, dan merender grafik forecast dengan Matplotlib.
        </p>
      </div>
      <div class="pipeline-quick-meta">
        <div class="quick-status">
          <span class="live-dot" data-api-indicator></span>
          <span class="quick-label" data-api-label>MENGECEK PIPELINE</span>
        </div>
        <span class="quick-coords">JAKARTA (−6.2088, 106.8456)</span>
      </div>
    </div>

    <!-- Mobile-First Interactive Tab Switcher -->
    <div class="pipeline-tab-bar" role="tablist" aria-label="Tampilan Pipeline">
      <button class="pipeline-tab active" data-pipeline-tab="weather" role="tab" aria-selected="true">
        <span>Kondisi & Grafik</span>
      </button>
      <button class="pipeline-tab" data-pipeline-tab="dag" role="tab" aria-selected="false">
        <span>Alur Task DAG</span>
      </button>
      <button class="pipeline-tab" data-pipeline-tab="history" role="tab" aria-selected="false">
        <span>Riwayat Database</span>
      </button>
    </div>

    <!-- Main Dashboard Container -->
    <div class="console-card">
      <!-- Panel 1: Weather Telemetry & Matplotlib Chart -->
      <div class="console-panel active" data-pipeline-panel="weather">
        <div class="console-split">
          <!-- Current Conditions Left -->
          <div class="console-left">
            <div class="panel-meta-header">
              <span class="panel-badge">TELEMETRI CUACA TERKINI</span>
              <span class="panel-time" data-weather-updated>MEMERIKSA DATABASE</span>
            </div>

            <div class="temp-display">
              <span class="temp-number" data-weather-temperature>--</span>
              <span class="temp-degree">°C</span>
            </div>

            <p class="temp-summary" data-weather-summary>
              Menyambungkan ke database pipeline...
            </p>

            <div class="weather-metrics-grid">
              <div class="metric-box">
                <span class="metric-title">KELEMBAPAN</span>
                <div class="metric-stat">
                  <span data-weather-humidity>--</span><small>%</small>
                </div>
              </div>
              <div class="metric-box">
                <span class="metric-title">KECEPATAN ANGIN</span>
                <div class="metric-stat">
                  <span data-weather-wind>--</span><small> km/j</small>
                </div>
              </div>
              <div class="metric-box">
                <span class="metric-title">PRESIPITASI</span>
                <div class="metric-stat">
                  <span data-weather-rain>--</span><small> mm</small>
                </div>
              </div>
            </div>

            <div class="panel-footer-info">
              <a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener noreferrer" class="source-link">
                <span>Sumber Data: Open-Meteo API</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          <!-- Matplotlib Chart Right -->
          <div class="console-right">
            <div class="chart-header">
              <span class="panel-badge">PROYEKSI FORECAST 48 JAM</span>
              <span class="chart-engine-tag">Python · Matplotlib</span>
            </div>

            <div class="chart-viewport">
              <div class="chart-placeholder" data-chart-placeholder>
                <div class="loading-spinner"></div>
                <p>Grafik akan ditampilkan setelah run pertama berhasil mengekstraksi data.</p>
              </div>
              <img class="weather-chart" data-weather-chart alt="Grafik proyeksi suhu dan probabilitas hujan Jakarta" hidden />
            </div>

            <div class="chart-footer-note">
              <span>● Visualisasi dihasilkan secara otomatis per run dari database PostgreSQL lokal.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel 2: DAG Task Execution Flow -->
      <div class="console-panel" data-pipeline-panel="dag">
        <div class="dag-header-bar">
          <div>
            <span class="panel-badge">DAG EXECUTION STATUS</span>
            <h3 class="dag-heading">Alur Kerja Empat Tahap (Directed Acyclic Graph)</h3>
          </div>
          <button class="btn-run-pipeline" data-run-pipeline>
            <span>JALANKAN SEKARANG</span>
            <span class="btn-icon">↗</span>
          </button>
        </div>

        <div class="dag-task-grid" data-pipeline-tasks>
          <div class="dag-placeholder">Memuat data task pipeline...</div>
        </div>

        <div class="dag-footer-status">
          <span class="dag-status-text" data-run-summary>Menunggu informasi run...</span>
          <span class="dag-cron-badge">CRON JADWAL: SETIAP 15 MENIT</span>
        </div>
      </div>

      <!-- Panel 3: Run History Database Logs -->
      <div class="console-panel" data-pipeline-panel="history">
        <div class="history-header-bar">
          <div>
            <span class="panel-badge">DATABASE AUDIT TRAIL</span>
            <h3 class="history-heading">Riwayat Eksekusi Pipeline (PostgreSQL)</h3>
          </div>
          <span class="history-table-name">Tabel: <code>pipeline_runs</code></span>
        </div>

        <div class="history-table-wrapper">
          <div class="history-table-head">
            <span class="col-id">RUN ID</span>
            <span class="col-status">STATUS</span>
            <span class="col-records">RECORDS</span>
            <span class="col-duration">DURASI</span>
            <span class="col-time">WAKTU (WIB)</span>
          </div>
          <div class="history-table-body" data-run-history>
            <p class="history-empty">Riwayat akan muncul setelah database tersambung.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Architecture Highlights -->
    <div class="architecture-grid">
      <div class="arch-card">
        <span class="arch-step">01 / INGEST</span>
        <h4>Penarikan Terjadwal & JSONB Audit</h4>
        <p>Ekstraksi otomatis current weather dan proyeksi 48 jam dari Open-Meteo. Raw response disimpan utuh di kolom JSONB agar asal-usul data (data lineage) terjamin.</p>
      </div>
      <div class="arch-card">
        <span class="arch-step">02 / VALIDATE</span>
        <h4>Validasi Skema & Penyesuaian Zona Waktu</h4>
        <p>Python memeriksa kelengkapan array 48 titik per jam, mengubah timestamp UTC ke Asia/Jakarta (WIB), dan menolak payload yang rusak sebelum masuk database.</p>
      </div>
      <div class="arch-card">
        <span class="arch-step">03 / OBSERVE</span>
        <h4>Pelacakan Telemetri & Grafik Matplotlib</h4>
        <p>Setiap task DAG dicatat status, durasi per detik, dan error message-nya. Grafik visualisasi dibuat dari data terstruktur yang sama yang tersaji di tabel.</p>
      </div>
    </div>

    <!-- Web Showcase: SchoolPlus -->
    <div id="schoolplus" class="schoolplus-section">
      <div class="section-kicker">
        <span class="kicker-line"></span>
        <span>WEB DEVELOPMENT PROJECT</span>
      </div>

      <div class="schoolplus-card">
        <div class="schoolplus-preview">
          <!-- Interactive-Style Browser Mockup -->
          <div class="browser-mockup">
            <div class="browser-bar">
              <div class="browser-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="browser-address">
                <span class="lock-icon">🔒</span>
                <span>https://sekolahplus.tech</span>
              </div>
            </div>
            <div class="mockup-content">
              <div class="mockup-header-bar">
                <span class="mock-logo">SchoolPlus</span>
                <div class="mock-nav">
                  <span>Dashboard</span>
                  <span>Kurikulum</span>
                  <span>Siswa</span>
                </div>
              </div>
              <div class="mockup-hero">
                <span class="mock-badge">PLATFORM EDUKASI LIVE</span>
                <h4>Sistem Manajemen Pembelajaran Digital</h4>
                <p>Platform interaktif untuk akselerasi kegiatan belajar mengajar.</p>
              </div>
              <div class="mockup-widgets">
                <div class="widget-box">
                  <span class="widget-label">Akurasi Nilai</span>
                  <span class="widget-val">99.8%</span>
                </div>
                <div class="widget-box">
                  <span class="widget-label">Waktu Respons</span>
                  <span class="widget-val">&lt; 120ms</span>
                </div>
                <div class="widget-box">
                  <span class="widget-label">Status</span>
                  <span class="widget-val live">Online ●</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="schoolplus-details">
          <div class="project-tag">WEB PLATFORM · PRODUCTION</div>
          <h3 class="schoolplus-title">SchoolPlus</h3>
          <p class="schoolplus-desc">
            Portofolio rekayasa web dan antarmuka. Dirancang dengan fokus pada responsivitas tampilan di berbagai perangkat, navigasi yang intuitif bagi pengajar dan siswa, serta performa pemuatan yang cepat.
          </p>

          <div class="project-highlights">
            <div class="highlight-item">
              <strong>Desain Responsif</strong>
              <p>Tampilan optimal baik di desktop maupun layar smartphone.</p>
            </div>
            <div class="highlight-item">
              <strong>Integrasi Sistem</strong>
              <p>Struktur kode modular dan siap terhubung dengan backend API.</p>
            </div>
          </div>

          <div class="schoolplus-actions">
            <a href="https://sekolahplus.tech" target="_blank" rel="noopener noreferrer" class="btn-external-link">
              <span>Buka sekolahplus.tech</span>
              <span class="arrow-ext">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
