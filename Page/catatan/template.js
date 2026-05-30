/**
 * Page/catatan/template.js
 */

export default function () {
  return `
    <!-- Banner Guest -->
    <div id="banner-guest" style="display:none;background:#fff3cd;padding:0.6rem 1rem;justify-content:center;align-items:center;gap:0.5rem;font-size:0.85rem;color:#856404;">
      <span>⚠️ Mode tamu — catatan tidak tersimpan permanen</span>
      <button onclick="ark.navigate('/login')" style="background:#4a2c11;color:white;border:none;padding:4px 12px;border-radius:6px;font-size:0.8rem;cursor:pointer;">Masuk</button>
    </div>

    <!-- Pop-up Panduan -->
    <div id="halaman-panduan" class="hidden">
      <div class="konten-panduan">
        <h2>MathNote</h2>
        <div class="garis-pembatas"></div>
        <div class="isi-scroll-panduan">
          <p>Selamat datang di <strong>MathNote</strong>, aplikasi catatan sekaligus kalkulator pintar!</p>
          <h4>Cara untuk Mencatat:</h4>
          <ol>
            <li>Klik tombol <strong>+</strong></li>
            <li>Ketik judul (opsional)</li>
            <li>Ketik isinya</li>
            <li>Klik <strong>Simpan</strong></li>
          </ol>
          <h4>Cara Menghitung:</h4>
          <div class="kotak-contoh">
            <strong>Baris Tunggal:</strong><br>
            <code>1+1</code>
          </div>
          <div class="kotak-contoh">
            <strong>Hitung Belanjaan:</strong><br>
            <code>Ayam : 15000<br>Mie : 7000<br>+=</code>
          </div>
        </div>
        <button type="button" id="tombol-mengerti">Saya Mengerti, Mulai!</button>
      </div>
    </div>

    <!-- Form Catatan -->
    <section id="catatan" class="catatan">
      <form id="form-catatan">
        <fieldset>
          <div class="header-buku">
            <button type="submit" class="btn-simpan">Simpan</button>
            <input type="text" id="judul" class="input-judul" placeholder="JUDUL">
            <button type="button" id="btn-tutup-catatan" class="btn-tutup">&times;</button>
          </div>
          <div class="wrapper-textarea">
            <textarea id="isi-catatan" class="textarea-buku" placeholder="Tulis catatan dan hitung di sini..."></textarea>
            <div id="tooltip-kalkulator" class="tooltip-hitung">
              <span id="teks-hasil-hitung">Hasil: 0</span>
              <button type="button" id="btn-opsi-a">= Hasil</button>
              <button type="button" id="btn-opsi-c">(Hasil)</button>
            </div>
          </div>
        </fieldset>
      </form>
    </section>

    <!-- Daftar Catatan -->
    <section id="daftar-catatan" class="kotak-tema daftar-catatan">
      <button type="button" id="btn-panduan" title="Panduan">❓</button>
      <button class="btn-tambah" id="btn-munculkan">+</button>
      <h3>Daftar Catatan Tersimpan</h3>
      <div class="header-daftar">
        <button type="button" id="btn-batal-hapus" class="btn-batal-hapus">Batal</button>
        <button type="button" id="btn-master-hapus" class="btn-pemicu-hapus">Pilih</button>
      </div>
      <div class="list-daftar">
        <div id="wadah-list"></div>
      </div>
    </section>
  `
}
