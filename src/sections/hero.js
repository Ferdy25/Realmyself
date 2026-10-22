export const hero = `
<main id="home">
  <section class="hero-section">
    <div class="hero-container mx-auto max-w-7xl px-5 sm:px-8">
      <div class="hero-top-strip">
        <div class="status-chip">
          <span class="live-dot"></span>
          <span>PIPELINE CUACA LIVE</span>
        </div>
        <span class="sep-dot">·</span>
        <span class="location-label">JAKARTA, ID (WGS84 −6.2088, 106.8456)</span>
      </div>

      <div class="hero-headline-wrap">
        <h1 class="hero-heading">
          Membangun alur data yang kokoh.<br />
          <em>Dari data mentah hingga analitik terpercaya.</em>
        </h1>
        <p class="hero-subheading">
          Saya <strong>Adnan</strong>, Data Engineer yang fokus pada arsitektur pipeline ETL/ELT otomatis, validasi skema relasional di PostgreSQL, dan sistem data yang terukur. Di bawah ini adalah pipeline aktif yang mengambil data cuaca Jakarta dari Open-Meteo secara real-time.
        </p>
      </div>

      <div class="hero-cta-group">
        <a class="btn-action-primary" href="#karya">
          <span>Eksplorasi Live Pipeline</span>
          <span class="arrow-icon" aria-hidden="true">↓</span>
        </a>
        <a class="btn-action-outline" href="#kontak">
          <span>Mulai Diskusi</span>
          <span class="arrow-icon" aria-hidden="true">→</span>
        </a>
      </div>

      <!-- Tech Stack Indicators -->
      <div class="hero-tech-strip">
        <div class="tech-card">
          <span class="tech-num">01</span>
          <div class="tech-info">
            <span class="tech-title">Python 3 DAG</span>
            <span class="tech-desc">Ekstraksi & orkestrasi 4 task terjadwal</span>
          </div>
        </div>
        <div class="tech-card">
          <span class="tech-num">02</span>
          <div class="tech-info">
            <span class="tech-title">PostgreSQL 16</span>
            <span class="tech-desc">Penyimpanan JSONB audit & tabel relasional</span>
          </div>
        </div>
        <div class="tech-card">
          <span class="tech-num">03</span>
          <div class="tech-info">
            <span class="tech-title">Data Validation</span>
            <span class="tech-desc">Pengecekan konsistensi 48 titik per jam</span>
          </div>
        </div>
        <div class="tech-card">
          <span class="tech-num">04</span>
          <div class="tech-info">
            <span class="tech-title">Matplotlib Engine</span>
            <span class="tech-desc">Rendering otomatis grafik tren suhu & hujan</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>`;
