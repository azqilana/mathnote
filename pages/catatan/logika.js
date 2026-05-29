/**
* MathNote - Catatan
* logika.js - Khusus logika, tidak ada HTML
*/

// ─────────────────────────────
// Mesin Hitung
// ─────────────────────────────
class Hitung {
  constructor() {
    this.kamusOperator = [{
      kata: /di\s*tambah/gi,
      simbol: '+'
    },
      {
        kata: /di\s*kurang/gi,
        simbol: '-'
      },
      {
        kata: /di\s*kali/gi,
        simbol: '×'
      },
      {
        kata: /x/gi,
        simbol: '×'
      },
      {
        kata: /\*/gi,
        simbol: '×'
      },
      {
        kata: /di\s*bagi/gi,
        simbol: '÷'
      },
      {
        kata: /\//gi,
        simbol: '÷'
      },
    ]
  }

  bersihkanTanda(ekspresi) {
    ekspresi = ekspresi.replace(/--/g, '+')
    ekspresi = ekspresi.replace(/\+-|-\+/g, '-')
    return ekspresi
  }

  prosesKurung(ekspresi) {
    const regexKurung = /\(([^()]+)\)/
    while (regexKurung.test(ekspresi)) {
      ekspresi = ekspresi.replace(regexKurung, (match, isiKurung) => {
        try {
          let e = isiKurung.replace(/×/g, '*').replace(/÷/g, '/')
          return new Function(`return ${e}`)()
        } catch (e) {
          return 0
        }
      })
      ekspresi = this.bersihkanTanda(ekspresi)
    }
    return ekspresi
  }

  prosesAngkaBerurutan(teksHinggaKursor) {
    const barisBaris = teksHinggaKursor.split('\n')
    const barisTerakhir = barisBaris[barisBaris.length - 1].trim()
    const regexOperasiAkhir = /^([\+\-\×\÷]=)\s*$/
    const cocokOperasi = barisTerakhir.match(regexOperasiAkhir)
    if (!cocokOperasi) return null

    const operasi = cocokOperasi[1]
    let arrayAngka = []

    if (teksHinggaKursor.includes(':')) {
      const regexTitikDua = /[^:\s\n]+\s*:\s*(\d+(?:\.\d+)?)/g
      let cocokItem
      while ((cocokItem = regexTitikDua.exec(teksHinggaKursor)) !== null) {
        const nilai = parseFloat(cocokItem[1])
        if (!isNaN(nilai)) arrayAngka.push(nilai)
      }
    } else {
      let konten = barisBaris.length > 1
      ? barisBaris[barisBaris.length - 2]: barisTerakhir.replace(regexOperasiAkhir, '')
      if (konten.includes(',')) {
        arrayAngka = konten.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n))
      }
    }

    if (arrayAngka.length === 0) return null

    const hasil = arrayAngka.reduce((akum, nilai, i) => {
      if (i === 0) return nilai
      if (operasi === '+=') return akum + nilai
      if (operasi === '-=') return akum - nilai
      if (operasi === '×=') return akum * nilai
      if (operasi === '÷=') return nilai !== 0 ? akum / nilai: akum
      return akum
    },
      0)

    return Number(hasil.toFixed(2))
  }

  prosesTeks(teksLengkap,
    posisiKursor) {
    const teksHinggaKursor = teksLengkap.substring(0,
      posisiKursor)
    const hasilBerurutan = this.prosesAngkaBerurutan(teksHinggaKursor)
    if (hasilBerurutan !== null) return hasilBerurutan

    const barisBaris = teksHinggaKursor.split('\n')
    let barisTerakhir = barisBaris[barisBaris.length - 1].trim()

    let teksMurni = barisTerakhir
    this.kamusOperator.forEach(item => {
      teksMurni = teksMurni.replace(item.kata, item.simbol)
    })

    let ekspresi = teksMurni.replace(/[^0-9+\-×÷.()]/g, '')
    const polaValid = /[\d()]+[\+\-\×\÷][\d()]+/

    if (polaValid.test(ekspresi)) {
      try {
        ekspresi = this.prosesKurung(ekspresi)
        let final = ekspresi.replace(/×/g, '*').replace(/÷/g, '/')
        const hasil = new Function(`return ${final}`)()
        if (typeof hasil === 'number' && !isNaN(hasil) && isFinite(hasil)) {
          return Number(hasil.toFixed(2))
        }
      } catch (e) {
        return null
      }
    }
    return null
  }
}

// ─────────────────────────────
// State
// ─────────────────────────────
const mesinHitung = new Hitung()
let isModeHapus = false
let daftarData = []
let indeksEdit = null
let nilaiHasilGlobal = null

// ─────────────────────────────
// Init - dipanggil oleh router
// ─────────────────────────────
export function init() {
  muatDataLokal()
  pasangSemuaEvent()
  cekPanduan()
  cekPlatform() 
}

// ─────────────────────────────
// Data
// ─────────────────────────────
function muatDataLokal() {
  const data = localStorage.getItem('smartnote_array_data')
  if (data) daftarData = JSON.parse(data)
  tampilkanDaftar()
}

function simpanKeLokal() {
  localStorage.setItem('smartnote_array_data', JSON.stringify(daftarData))
  document.getElementById('catatan').style.display = 'none'
  document.getElementById('daftar-catatan').style.display = 'flex'
  document.getElementById('daftar-catatan').scrollTop = 0
}

// ─────────────────────────────
// Tampilan Daftar
// ─────────────────────────────
function tampilkanDaftar() {
  const wadahList = document.getElementById('wadah-list')
  const btnMasterHapus = document.getElementById('btn-master-hapus')
  wadahList.innerHTML = ''

  if (daftarData.length === 0) {
    wadahList.innerHTML = '<p style="text-align:center;font-style:italic;color:#666;">Belum ada catatan yang disimpan.</p>'
    keluarModeHapus()
    btnMasterHapus.style.display = 'none'
    return
  }

  daftarData.forEach((item, index) => {
    const judulFix = item.judul.trim() === '' ? 'Tanpa Judul': item.judul
    const itemDiv = document.createElement('div')
    itemDiv.className = 'item-catatan'
    itemDiv.innerHTML = `
    <div class="item-judul" data-index="${index}">
    <span class="teks-judul">${judulFix}</span>
    <div class="grup-tombol-aksi">
    <button class="btn-edit-satuan" data-index="${index}">✏️</button>
    <button class="btn-hapus-satuan" data-index="${index}">❌</button>
    </div>
    </div>
    <div class="item-isi">${item.isi}</div>
    `
    wadahList.appendChild(itemDiv)
    btnMasterHapus.style.display = 'block'
  })

  // Event untuk item daftar
  wadahList.querySelectorAll('.item-judul').forEach(el => {
    el.addEventListener('click', function () {
      if (isModeHapus) return
      this.parentElement.classList.toggle('aktif')
    })
  })

  wadahList.querySelectorAll('.btn-edit-satuan').forEach(el => {
    el.addEventListener('click',
      function (e) {
        e.stopPropagation()
        editCatatan(parseInt(this.dataset.index))
      })
  })

  wadahList.querySelectorAll('.btn-hapus-satuan').forEach(el => {
    el.addEventListener('click',
      function (e) {
        e.stopPropagation()
        hapusSatuCatatan(parseInt(this.dataset.index))
      })
  })
}

// ─────────────────────────────
// Aksi Catatan
// ─────────────────────────────
function editCatatan(index) {
  indeksEdit = index
  document.getElementById('judul').value = daftarData[index].judul
  document.getElementById('isi-catatan').value = daftarData[index].isi
  document.getElementById('catatan').style.display = 'block'
  document.getElementById('daftar-catatan').style.display = 'none'
  document.getElementById('tooltip-kalkulator').style.display = 'none'
  keluarModeHapus()
  document.getElementById('catatan').scrollIntoView({
    behavior: 'smooth'
  })
  setTimeout(() => document.getElementById('isi-catatan').focus(), 300)
}

function hapusSatuCatatan(index) {
  if (confirm('Apakah kamu yakin ingin menghapus catatan ini?')) {
    daftarData.splice(index, 1)
    simpanKeLokal()
    tampilkanDaftar()
  }
}

function keluarModeHapus() {
  isModeHapus = false
  document.getElementById('daftar-catatan').classList.remove('mode-hapus')
  const btn = document.getElementById('btn-master-hapus')
  btn.classList.remove('aktif-merah')
  btn.innerText = 'Pilih'
}

// ─────────────────────────────
// Sisipkan Hasil Hitung
// ─────────────────────────────
function sisipkanHasil(format) {
  if (nilaiHasilGlobal === null) return
  const isiCatatan = document.getElementById('isi-catatan')
  const posisi = isiCatatan.selectionStart
  const teksLama = isiCatatan.value
  const sisipan = format === 'A' ? ` = ${nilaiHasilGlobal}`: ` (${nilaiHasilGlobal})`
  isiCatatan.value = teksLama.substring(0, posisi) + sisipan + teksLama.substring(posisi)
  document.getElementById('tooltip-kalkulator').style.display = 'none'
  nilaiHasilGlobal = null
  isiCatatan.focus()
  const pos = posisi + sisipan.length
  isiCatatan.setSelectionRange(pos, pos)
}

// ─────────────────────────────
// Panduan
// ─────────────────────────────
function cekPanduan() {
  const sudahBaca = localStorage.getItem('matchnote_baca_panduan')
  if (!sudahBaca) {
    document.getElementById('halaman-panduan').classList.remove('hidden')
  }
}

// ─────────────────────────────
// Pasang Semua Event
// ─────────────────────────────
function pasangSemuaEvent() {
  const isiCatatan = document.getElementById('isi-catatan')
  const tooltip = document.getElementById('tooltip-kalkulator')
  const btnMunculkan = document.getElementById('btn-munculkan')
  const btnTutup = document.getElementById('btn-tutup-catatan')
  const formCatatan = document.getElementById('form-catatan')
  const btnMasterHapus = document.getElementById('btn-master-hapus')
  const btnBatalHapus = document.getElementById('btn-batal-hapus')
  const tombolMengerti = document.getElementById('tombol-mengerti')
  const btnPanduan = document.getElementById('btn-panduan')
  const notif = document.getElementById('notif')

  // Kalkulator realtime
  isiCatatan.addEventListener('input', function () {
    const posisi = isiCatatan.selectionStart
    const hasil = mesinHitung.prosesTeks(isiCatatan.value, posisi)
    if (hasil !== null) {
      nilaiHasilGlobal = hasil
      document.getElementById('teks-hasil-hitung').innerText = 'Hasil: ' + hasil
      tooltip.style.display = 'flex'
      tooltip.style.left = '90px'
      tooltip.style.bottom = '10px'
    } else {
      tooltip.style.display = 'none'
    }
  })

  document.getElementById('btn-opsi-a').addEventListener('click',
    () => sisipkanHasil('A'))
  document.getElementById('btn-opsi-c').addEventListener('click',
    () => sisipkanHasil('C'))

  // Tombol tambah
  btnMunculkan.addEventListener('click',
    function (e) {
      e.preventDefault()
      const catatan = document.getElementById('catatan')
      const daftar = document.getElementById('daftar-catatan')
      if (catatan.style.display === 'none' || catatan.style.display === '') {
        catatan.style.display = 'block'
        catatan.scrollIntoView({
          behavior: 'smooth'
        })
        daftar.style.display = 'none'
        setTimeout(() => document.getElementById('judul').focus(), 300)
      } else {
        daftar.style.display = 'flex'
        catatan.style.display = 'none'
        tooltip.style.display = 'none'
      }
      btnMunculkan.classList.remove('tombol-kedip')
    })

  // Tombol tutup
  btnTutup.addEventListener('click',
    function () {
      indeksEdit = null
      document.getElementById('judul').value = ''
      isiCatatan.value = ''
      document.getElementById('daftar-catatan').style.display = 'flex'
      document.getElementById('catatan').style.display = 'none'
      tooltip.style.display = 'none'
      document.getElementById('top-header').scrollIntoView({
        behavior: 'smooth'
      })
    })

  // Submit form
  formCatatan.addEventListener('submit',
    function (e) {
      e.preventDefault()
      if (isiCatatan.value.trim() === '') {
        isiCatatan.focus(); return
      }

      const data = {
        judul: document.getElementById('judul').value,
        isi: isiCatatan.value
      }

      if (indeksEdit !== null) {
        daftarData[indeksEdit] = data
        indeksEdit = null
      } else {
        daftarData.unshift(data)
      }

      simpanKeLokal()
      keluarModeHapus()
      tampilkanDaftar()

      document.getElementById('judul').value = ''
      isiCatatan.value = ''
      tooltip.style.display = 'none'

      notif.classList.add('muncul')
      setTimeout(() => notif.classList.remove('muncul'), 600)
    })

  // Mode hapus
  btnMasterHapus.addEventListener('click',
    function () {
      if (daftarData.length === 0) return
      if (!isModeHapus) {
        isModeHapus = true
        document.getElementById('daftar-catatan').classList.add('mode-hapus')
        btnMasterHapus.classList.add('aktif-merah')
        btnMasterHapus.innerText = 'Hapus Semua'
        document.querySelectorAll('.item-catatan').forEach(el => el.classList.remove('aktif'))
      } else {
        if (confirm('PERINGATAN! Apakah kamu yakin ingin MENGHAPUS SEMUA catatan?')) {
          daftarData = []
          simpanKeLokal()
          tampilkanDaftar()
        } else {
          keluarModeHapus()
        }
      }
    })

  btnBatalHapus.addEventListener('click',
    keluarModeHapus)

  // Panduan
  tombolMengerti.addEventListener('click',
    function () {
      localStorage.setItem('matchnote_baca_panduan', 'true')
      document.getElementById('halaman-panduan').classList.add('hidden')
    })

  btnPanduan.addEventListener('click',
    function () {
      document.getElementById('halaman-panduan').classList.remove('hidden')
    })
}
function cekPlatform() {
  const isNativeApp = window.Capacitor !== undefined;
  const downloadBtn = document.getElementById('downloadBtn');
  if (isNativeApp) {
    downloadBtn.style.display = 'none';
  } else {
    downloadBtn.style.display = 'block';
  }
}

window.addEventListener('load', cekPlatform);