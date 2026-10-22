export const about = `
<section id="tentang" class="about-section">
  <div class="section-container mx-auto max-w-7xl px-5 sm:px-8">
    <div class="about-grid">
      <div class="about-left">
        <div class="section-kicker">
          <span class="kicker-line"></span>
          <span>TENTANG SAYA</span>
        </div>
        <h2 class="about-title">
          Fokus pada integritas data,<br />
          <em>keandalan, dan kesederhanaan.</em>
        </h2>
        <p class="about-text-lead">
          Sebagai Data Engineer, fokus utama saya adalah memastikan data mengalir secara konsisten dari berbagai sumber tanpa kehilangan konteks, tervalidasi sebelum masuk ke database, dan mudah diakses oleh tim pengambil keputusan.
        </p>
        <p class="about-text-body">
          Saya terbiasa menangani tantangan integrasi data: kegagalan koneksi API, inkonsistensi format JSON, perubahan zona waktu, hingga optimasi query database. Saya percaya bahwa arsitektur yang baik adalah sistem yang dapat diamati (observable) dan pulih secara otomatis saat terjadi gangguan.
        </p>
      </div>

      <div class="about-right">
        <div class="capability-list">
          <div class="capability-card">
            <span class="cap-index">A</span>
            <div class="cap-content">
              <h3>Ingesti Data & ETL/ELT</h3>
              <p>Mengekstraksi data dari REST API publik/privat, mengelola rate limit, dan menyimpan raw payload JSONB untuk auditability.</p>
            </div>
          </div>

          <div class="capability-card">
            <span class="cap-index">B</span>
            <div class="cap-content">
              <h3>Data Modeling & PostgreSQL</h3>
              <p>Merancang skema relasional yang dinormalisasi, penanganan tipe data geospasial/waktu, dan indeks performan.</p>
            </div>
          </div>

          <div class="capability-card">
            <span class="cap-index">C</span>
            <div class="cap-content">
              <h3>Observabilitas & Telemetri DAG</h3>
              <p>Mencatat status setiap run, durasi eksekusi per task, jumlah baris yang diproses, serta pesan error terperinci.</p>
            </div>
          </div>

          <div class="capability-card">
            <span class="cap-index">D</span>
            <div class="cap-content">
              <h3>Otomasi & Kontainerisasi</h3>
              <p>Menjalankan pipeline terisolasi menggunakan Docker & Docker Compose dengan penjadwalan cron teratur.</p>
            </div>
          </div>
        </div>

        <div class="tech-chips-block">
          <span class="chips-label">KOMPETENSI TEKNIS:</span>
          <div class="chips-container">
            <span class="chip">Python 3</span>
            <span class="chip">PostgreSQL</span>
            <span class="chip">SQL & DDL</span>
            <span class="chip">Docker & Compose</span>
            <span class="chip">REST API Ingestion</span>
            <span class="chip">ETL / ELT Pipelines</span>
            <span class="chip">Data Validation</span>
            <span class="chip">Matplotlib</span>
            <span class="chip">Linux & Bash</span>
            <span class="chip">Git Versioning</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
