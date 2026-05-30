/**
* Page/catatan/template.js
*/

export default function () {
  return `
  

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