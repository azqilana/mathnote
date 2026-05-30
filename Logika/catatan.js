/**
 * MathNote ARK - Logika/catatan.js
 * Offline First Strategy:
 * - Selalu simpan ke localStorage
 * - Kalau online & login → kirim ke API juga
 * - Kalau balik online → sync antrian ke database
 */

import { getCatatan, simpanCatatan, editCatatan, hapusCatatan } from './api.js'

// ─────────────────────────────
// Mesin Hitung
// ─────────────────────────────
class Hitung {
  constructor() {
    this.kamusOperator = [
      { kata: /di\s*tambah/gi, simbol: '+' },
      { kata: /di\s*kurang/gi, simbol: '-' },
      { kata: /di\s*kali/gi, simbol: '×' },
      { kata: /x/gi, simbol: '×' },
      { kata: /\*/gi, simbol: '×' },
      { kata: /di\s*bagi/gi, simbol: '÷' },
      { kata: /\//gi, simbol: '÷' },
    ]
  }

  bersihkanTanda(e) {
    return e.replace(/--/g, '+').replace(/\+-|-\+/g, '-')
  }

  prosesKurung(ekspresi) {
    const re = /\(([^()]+)\)/
    while (re.test(ekspresi)) {
      ekspresi = ekspresi.replace(re, (_, isi) => {
        try { return new Function(`return ${isi.replace(/×/g,'*').replace(/÷/g,'/')}`)() }
        catch { return 0 }
      })
      ekspresi = this.bersihkanTanda(ekspresi)
    }
    return ekspresi
  }

  prosesAngkaBerurutan(teks) {
    const baris = teks.split('\n')
    const terakhir = baris[baris.length - 1].trim()
    const reOp = /^([\+\-\×\÷]=)\s*$/
    const cocok = terakhir.match(reOp)
    if (!cocok) return null

    const op = cocok[1]
    let angka = []

    if (teks.includes(':')) {
      const re = /[^:\s\n]+\s*:\s*(\d+(?:\.\d+)?)/g
      let m
      while ((m = re.exec(teks)) !== null) {
        const n = parseFloat(m[1])
        if (!isNaN(n)) angka.push(n)
      }
    } else {
      const konten = baris.length > 1 ? baris[baris.length - 2] : terakhir.replace(reOp, '')
      if (konten.includes(',')) {
        angka = konten.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n))
      }
    }

    if (!angka.length) return null

    const hasil = angka.reduce((a, n, i) => {
      if (i === 0) return n
      if (op === '+=') return a + n
      if (op === '-=') return a - n
      if (op === '×=') return a * n
      if (op === '÷=') return n !== 0 ? a / n : a
      return a
    }, 0)

    return Number(hasil.toFixed(2))
  }

  prosesTeks(teks, pos) {
    const hinggaKursor = teks.substring(0, pos)
    const berurutan = this.prosesAngkaBerurutan(hinggaKursor)
    if (berurutan !== null) return berurutan

    const baris = hinggaKursor.split('\n')
    let terakhir = baris[baris.length - 1].trim()
    this.kamusOperator.forEach(item => { terakhir = terakhir.replace(item.kata, item.simbol) })

    let ekspresi = terakhir.replace(/[^0-9+\-×÷.()]/g, '')
    if (/[\d()]+[\+\-\×\÷][\d()]+/.test(ekspresi)) {
      try {
        ekspresi = this.prosesKurung(ekspresi)
        const hasil = new Function(`return ${ekspresi.replace(/×/g,'*').replace(/÷/g,'/')}`)()
        if (typeof hasil === 'number' && !isNaN(hasil) && isFinite(hasil)) return Number(hasil.toFixed(2))
      } catch { return null }
    }
    return null
  }
}

// ─────────────────────────────
// State
// ─────────────────────────────
const mesin = new Hitung()
let daftarData = []
let indeksEdit = null
let nilaiHasil = null
let isModeHapus = false

// ─────────────────────────────
// Helper
// ─────────────────────────────
function isLogin() {
  return localStorage.getItem('mn_token') !== null
}

function isOnline() {
  return navigator.onLine
}

// ─────────────────────────────
// localStorage helpers
// ─────────────────────────────
function getLokal() {
  return JSON.parse(localStorage.getItem('mn_catatan_lokal') || '[]')
}

function setLokal(data) {
  localStorage.setItem('mn_catatan_lokal', JSON.stringify(data))
}

// Antrian: data lokal yang belum ter-sync ke database
function getAntrian() {
  return JSON.parse(localStorage.getItem('mn_antrian_sync') || '[]')
}

function setAntrian(data) {
  localStorage.setItem('mn_antrian_sync', JSON.stringify(data))
}

function tambahAntrian(item) {
  const antrian = getAntrian()
  antrian.push(item)
  setAntrian(antrian)
}

function hapusDariAntrian(localId) {
  const antrian = getAntrian().filter(i => i.localId !== localId)
  setAntrian(antrian)
}

// ─────────────────────────────
// Sync antrian ke database
// ─────────────────────────────
async function syncKeDatabase() {
  if (!isLogin() || !isOnline()) return

  const antrian = getAntrian()
  if (!antrian.length) return

  console.log('[MathNote] Sync', antrian.length, 'catatan ke database...')

  for (const item of antrian) {
    try {
      if (item.aksi === 'simpan') {
        await simpanCatatan(item.judul, item.isi)
      } else if (item.aksi === 'edit') {
        await editCatatan(item.dbId, item.judul, item.isi)
      } else if (item.aksi === 'hapus') {
        await hapusCatatan(item.dbId)
      }
      hapusDariAntrian(item.localId)
    } catch (e) {
      console.log('[MathNote] Gagal sync item:', item.localId)
    }
  }

  // Setelah sync, refresh dari database
  await muatCatatan()
  tampilStatusSync('✅ Catatan berhasil disinkronkan!')
}

function tampilStatusSync(pesan) {
  const el = document.getElementById('notif')
  if (!el) return
  el.textContent = pesan
  el.classList.add('muncul')
  setTimeout(() => {
    el.textContent = 'Catatan disimpan!'
    el.classList.remove('muncul')
  }, 2000)
}

// ─────────────────────────────
// Init
// ─────────────────────────────
export async function init() {
  if (!isLogin()) tampilBannerGuest()

  await muatCatatan()
  pasangEvent()
  cekPlatform()

  // Listener balik online → sync otomatis
  window.addEventListener('online', async () => {
    console.log('[MathNote] Kembali online, mulai sync...')
    await syncKeDatabase()
  })
}

// ─────────────────────────────
// Cek Platform
// ─────────────────────────────
function cekPlatform() {
  const btn = document.getElementById('downloadBtn')
  if (!btn) return
  btn.style.display = window.Capacitor !== undefined ? 'none' : 'block'
}

// ─────────────────────────────
// Banner guest
// ─────────────────────────────
function tampilBannerGuest() {
  const banner = document.getElementById('banner-guest')
  if (banner) banner.style.display = 'flex'
}

// ─────────────────────────────
// Muat catatan
// Offline First:
// 1. Tampil dari localStorage dulu (cepat)
// 2. Kalau online & login → fetch dari API, update lokal
// ─────────────────────────────
async function muatCatatan() {
  const wadah = document.getElementById('wadah-list')
  if (!wadah) return

  // Tampil lokal dulu agar terasa cepat
  daftarData = getLokal()
  tampilkanDaftar()

  // Kalau login & online → ambil dari database, update lokal
  if (isLogin() && isOnline()) {
    try {
      const data = await getCatatan()
      if (!data.error) {
        daftarData = data
        setLokal(data)
        tampilkanDaftar()
        // Sync antrian kalau ada
        await syncKeDatabase()
      }
    } catch (e) {
      console.log('[MathNote] Offline, pakai data lokal')
    }
  }
}

// ─────────────────────────────
// Tampilkan daftar
// ─────────────────────────────
function tampilkanDaftar() {
  const wadah = document.getElementById('wadah-list')
  const btnHapus = document.getElementById('btn-master-hapus')
  if (!wadah) return

  wadah.innerHTML = ''

  if (!daftarData.length) {
    wadah.innerHTML = '<p style="text-align:center;font-style:italic;color:#666;">Belum ada catatan.</p>'
    keluarModeHapus()
    if (btnHapus) btnHapus.style.display = 'none'
    return
  }

  if (btnHapus) btnHapus.style.display = 'block'

  daftarData.forEach((item, index) => {
    const judul = item.judul?.trim() || 'Tanpa Judul'
    const div = document.createElement('div')
    div.className = 'item-catatan'
    div.innerHTML = `
      <div class="item-judul" data-index="${index}">
        <span class="teks-judul">${judul}</span>
        <div class="grup-tombol-aksi">
          <button class="btn-edit-satuan" data-index="${index}">✏️</button>
          <button class="btn-hapus-satuan" data-index="${index}">❌</button>
        </div>
      </div>
      <div class="item-isi">${item.isi}</div>
    `
    wadah.appendChild(div)
  })

  wadah.querySelectorAll('.item-judul').forEach(el => {
    el.addEventListener('click', function () {
      if (isModeHapus) return
      this.parentElement.classList.toggle('aktif')
    })
  })

  wadah.querySelectorAll('.btn-edit-satuan').forEach(el => {
    el.addEventListener('click', function (e) {
      e.stopPropagation()
      bukaEdit(parseInt(this.dataset.index))
    })
  })

  wadah.querySelectorAll('.btn-hapus-satuan').forEach(el => {
    el.addEventListener('click', function (e) {
      e.stopPropagation()
      hapusSatu(parseInt(this.dataset.index))
    })
  })
}

// ─────────────────────────────
// Aksi catatan
// ─────────────────────────────
function bukaEdit(index) {
  indeksEdit = index
  document.getElementById('judul').value = daftarData[index].judul || ''
  document.getElementById('isi-catatan').value = daftarData[index].isi
  document.getElementById('catatan').style.display = 'block'
  document.getElementById('daftar-catatan').style.display = 'none'
  document.getElementById('tooltip-kalkulator').style.display = 'none'
  keluarModeHapus()
  setTimeout(() => document.getElementById('isi-catatan').focus(), 300)
}

async function hapusSatu(index) {
  if (!confirm('Hapus catatan ini?')) return

  const item = daftarData[index]

  // Hapus dari lokal
  daftarData.splice(index, 1)
  setLokal(daftarData)
  tampilkanDaftar()

  if (isLogin()) {
    if (isOnline() && item.id) {
      // Online → hapus langsung dari database
      await hapusCatatan(item.id)
    } else if (item.id) {
      // Offline → masuk antrian
      tambahAntrian({ aksi: 'hapus', localId: Date.now(), dbId: item.id })
    }
  }
}

function keluarModeHapus() {
  isModeHapus = false
  document.getElementById('daftar-catatan')?.classList.remove('mode-hapus')
  const btn = document.getElementById('btn-master-hapus')
  if (btn) { btn.classList.remove('aktif-merah'); btn.innerText = 'Pilih' }
}

function sisipkanHasil(format) {
  if (nilaiHasil === null) return
  const el = document.getElementById('isi-catatan')
  const pos = el.selectionStart
  const sisipan = format === 'A' ? ` = ${nilaiHasil}` : ` (${nilaiHasil})`
  el.value = el.value.substring(0, pos) + sisipan + el.value.substring(pos)
  document.getElementById('tooltip-kalkulator').style.display = 'none'
  nilaiHasil = null
  el.focus()
  el.setSelectionRange(pos + sisipan.length, pos + sisipan.length)
}

// ─────────────────────────────
// Pasang semua event
// ─────────────────────────────
function pasangEvent() {
  const isiEl = document.getElementById('isi-catatan')
  const tooltip = document.getElementById('tooltip-kalkulator')
  const btnTambah = document.getElementById('btn-munculkan')
  const btnTutup = document.getElementById('btn-tutup-catatan')
  const form = document.getElementById('form-catatan')
  const btnMasterHapus = document.getElementById('btn-master-hapus')
  const btnBatal = document.getElementById('btn-batal-hapus')
  const notif = document.getElementById('notif')

  // Kalkulator realtime
  isiEl.addEventListener('input', function () {
    const hasil = mesin.prosesTeks(isiEl.value, isiEl.selectionStart)
    if (hasil !== null) {
      nilaiHasil = hasil
      document.getElementById('teks-hasil-hitung').innerText = 'Hasil: ' + hasil
      tooltip.style.display = 'flex'
      tooltip.style.left = '90px'
      tooltip.style.bottom = '10px'
    } else {
      tooltip.style.display = 'none'
    }
  })

  document.getElementById('btn-opsi-a').addEventListener('click', () => sisipkanHasil('A'))
  document.getElementById('btn-opsi-c').addEventListener('click', () => sisipkanHasil('C'))

  // Tombol tambah
  btnTambah.addEventListener('click', function (e) {
    e.preventDefault()
    const catatan = document.getElementById('catatan')
    const daftar = document.getElementById('daftar-catatan')
    if (catatan.style.display === 'none' || !catatan.style.display) {
      indeksEdit = null
      document.getElementById('judul').value = ''
      isiEl.value = ''
      catatan.style.display = 'block'
      daftar.style.display = 'none'
      setTimeout(() => document.getElementById('judul').focus(), 300)
    } else {
      daftar.style.display = 'flex'
      catatan.style.display = 'none'
      tooltip.style.display = 'none'
    }
  })

  // Tombol tutup
  btnTutup.addEventListener('click', function () {
    indeksEdit = null
    document.getElementById('judul').value = ''
    isiEl.value = ''
    document.getElementById('daftar-catatan').style.display = 'flex'
    document.getElementById('catatan').style.display = 'none'
    tooltip.style.display = 'none'
  })

  // Submit form
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    const judul = document.getElementById('judul').value
    const isi = isiEl.value.trim()
    if (!isi) { isiEl.focus(); return }

    const localId = Date.now()

    if (indeksEdit !== null) {
      // Edit
      const item = daftarData[indeksEdit]
      const itemBaru = { ...item, judul, isi }

      // Update lokal
      daftarData[indeksEdit] = itemBaru
      setLokal(daftarData)

      if (isLogin()) {
        if (isOnline() && item.id) {
          await editCatatan(item.id, judul, isi)
        } else if (item.id) {
          tambahAntrian({ aksi: 'edit', localId, dbId: item.id, judul, isi })
        }
      }
      indeksEdit = null
    } else {
      // Simpan baru
      const itemBaru = { localId, judul, isi }
      daftarData.unshift(itemBaru)
      setLokal(daftarData)

      if (isLogin()) {
        if (isOnline()) {
          await simpanCatatan(judul, isi)
          // Refresh dari database untuk dapat ID yang benar
          const data = await getCatatan()
          if (!data.error) { daftarData = data; setLokal(data) }
        } else {
          tambahAntrian({ aksi: 'simpan', localId, judul, isi })
        }
      }
    }

    document.getElementById('judul').value = ''
    isiEl.value = ''
    tooltip.style.display = 'none'
    document.getElementById('daftar-catatan').style.display = 'flex'
    document.getElementById('catatan').style.display = 'none'

    tampilkanDaftar()

    notif.classList.add('muncul')
    setTimeout(() => notif.classList.remove('muncul'), 600)
  })

  // Mode hapus
  btnMasterHapus.addEventListener('click', async function () {
    if (!daftarData.length) return
    if (!isModeHapus) {
      isModeHapus = true
      document.getElementById('daftar-catatan').classList.add('mode-hapus')
      btnMasterHapus.classList.add('aktif-merah')
      btnMasterHapus.innerText = 'Hapus Semua'
      document.querySelectorAll('.item-catatan').forEach(el => el.classList.remove('aktif'))
    } else {
      if (confirm('PERINGATAN! Hapus SEMUA catatan?')) {
        if (isLogin() && isOnline()) {
          for (const item of daftarData) {
            if (item.id) await hapusCatatan(item.id)
          }
        }
        daftarData = []
        setLokal([])
        setAntrian([])
        tampilkanDaftar()
        keluarModeHapus()
      } else {
        keluarModeHapus()
      }
    }
  })

  btnBatal.addEventListener('click', keluarModeHapus)

  // Panduan
  document.getElementById('tombol-mengerti')?.addEventListener('click', function () {
    localStorage.setItem('mn_baca_panduan', 'true')
    document.getElementById('halaman-panduan').classList.add('hidden')
  })

  document.getElementById('btn-panduan')?.addEventListener('click', function () {
    document.getElementById('halaman-panduan').classList.remove('hidden')
  })

  if (!localStorage.getItem('mn_baca_panduan')) {
    document.getElementById('halaman-panduan')?.classList.remove('hidden')
  }
}
