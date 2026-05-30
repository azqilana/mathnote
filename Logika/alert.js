/**
 * MathNote ARK - Logika/alert.js
 * Custom alert pengganti confirm() bawaan browser
 * Tema MathNote, animasi membesar 0.3s
 */

// Inject CSS sekali saja
function injectCSS() {
  if (document.getElementById('mn-alert-style')) return
  const style = document.createElement('style')
  style.id = 'mn-alert-style'
  style.textContent = `
    #mn-alert-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    #mn-alert-overlay.aktif {
      opacity: 1;
    }

    #mn-alert-box {
      background: #fff8f0;
      border: 2px solid #4a2c11;
      border-radius: 16px;
      padding: 1.5rem;
      width: 85%;
      max-width: 320px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(74,44,17,0.3);
      transform: scale(0.5);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    #mn-alert-overlay.aktif #mn-alert-box {
      transform: scale(1);
    }

    #mn-alert-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    #mn-alert-judul {
      font-size: 1.1rem;
      font-weight: bold;
      color: #4a2c11;
      margin-bottom: 0.4rem;
    }

    #mn-alert-pesan {
      font-size: 0.9rem;
      color: #7a5c3a;
      margin-bottom: 1.2rem;
      line-height: 1.5;
    }

    #mn-alert-tombol {
      display: flex;
      gap: 0.6rem;
      justify-content: center;
    }

    #mn-alert-tombol button {
      flex: 1;
      padding: 0.7rem;
      border-radius: 10px;
      border: none;
      font-size: 0.95rem;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    #mn-alert-tombol button:active { opacity: 0.7; }

    #mn-btn-batal {
      background: rgba(74,44,17,0.1);
      color: #4a2c11;
      border: 1px solid rgba(74,44,17,0.3) !important;
    }

    #mn-btn-hapus {
      background: #d32f2f;
      color: white;
    }
  `
  document.head.appendChild(style)
}

// Buat elemen alert
function buatAlert() {
  if (document.getElementById('mn-alert-overlay')) return

  const overlay = document.createElement('div')
  overlay.id = 'mn-alert-overlay'
  overlay.innerHTML = `
    <div id="mn-alert-box">
      <div id="mn-alert-icon">🗑️</div>
      <div id="mn-alert-judul"></div>
      <div id="mn-alert-pesan"></div>
      <div id="mn-alert-tombol">
        <button id="mn-btn-batal">Batal</button>
        <button id="mn-btn-hapus">Hapus</button>
      </div>
    </div>
  `
  document.body.appendChild(overlay)
}

// Tampilkan alert
function tampil() {
  const overlay = document.getElementById('mn-alert-overlay')
  requestAnimationFrame(() => {
    overlay.classList.add('aktif')
  })
}

// Sembunyikan alert
function sembunyikan() {
  const overlay = document.getElementById('mn-alert-overlay')
  overlay.classList.remove('aktif')
  setTimeout(() => overlay.remove(), 350)
}

// ─────────────────────────────
// Main function — pakai ini
// ─────────────────────────────
export function konfirmasiHapus({ judul = 'Hapus Catatan?', pesan = 'Catatan yang dihapus tidak bisa dikembalikan.', labelHapus = 'Hapus', labelBatal = 'Batal' } = {}) {
  return new Promise((resolve) => {
    injectCSS()
    buatAlert()

    document.getElementById('mn-alert-judul').textContent = judul
    document.getElementById('mn-alert-pesan').textContent = pesan
    document.getElementById('mn-btn-hapus').textContent = labelHapus
    document.getElementById('mn-btn-batal').textContent = labelBatal

    tampil()

    document.getElementById('mn-btn-hapus').onclick = () => {
      sembunyikan()
      resolve(true)
    }

    document.getElementById('mn-btn-batal').onclick = () => {
      sembunyikan()
      resolve(false)
    }

    // Klik overlay juga tutup
    document.getElementById('mn-alert-overlay').onclick = (e) => {
      if (e.target.id === 'mn-alert-overlay') {
        sembunyikan()
        resolve(false)
      }
    }
  })
}
