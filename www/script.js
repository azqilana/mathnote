// --- INTEGRASI CLASS HITUNG SAKTI (OOP DENGAN MODUL OPERASI) ---
class Hitung {
  constructor() {
    this.kamusOperator = [
      { kata: /di\s*tambah/gi, simbol: '+' },
      { kata: /di\s*kurang/gi, simbol: '-' },
      { kata: /di\s*kali/gi,   simbol: '×' },
      { kata: /x/gi,           simbol: '×' },
      { kata: /\*/gi,          simbol: '×' }, 
      { kata: /di\s*bagi/gi,   simbol: '÷' },
      { kata: /\//gi,          simbol: '÷' }  
    ];
  }

  bersihkanTanda(ekspresi) {
    ekspresi = ekspresi.replace(/--/g, '+');
    ekspresi = ekspresi.replace(/\+-\|-\+/g, '-');
    return ekspresi;
  }

  prosesKurung(ekspresi) {
    const regexKurung = /\(([^()]+)\)/;
    while (regexKurung.test(ekspresi)) {
      ekspresi = ekspresi.replace(regexKurung, (match, isiKurung) => {
        try {
          let ekspresiInternal = isiKurung.replace(/×/g, '*').replace(/÷/g, '/');
          const hasilIsi = new Function(`return ${ekspresiInternal}`)();
          return hasilIsi;
        } catch (e) {
          return 0;
        }
      });
      ekspresi = this.bersihkanTanda(ekspresi);
    }
    return ekspresi;
  }

  prosesAngkaBerurutan(teksHinggaKursor) {
    const barisBaris = teksHinggaKursor.split('\n');
    const barisTerakhir = barisBaris[barisBaris.length - 1].trim();

    const regexOperasiAkhir = /^([\+\-\×\÷]=)\s*$/;
    const cocokOperasi = barisTerakhir.match(regexOperasiAkhir);
    
    if (!cocokOperasi) return null; 
    
    const operasi = cocokOperasi[1]; 
    let arrayAngka = [];

    if (teksHinggaKursor.includes(':')) {
      const regexTitikDua = /[^:\s\n]+\s*:\s*(\d+(?:\.\d+)?)/g;
      let cocokItem;
      
      while ((cocokItem = regexTitikDua.exec(teksHinggaKursor)) !== null) {
        const nilaiAngka = parseFloat(cocokItem[1]);
        if (!isNaN(nilaiAngka)) {
          arrayAngka.push(nilaiAngka);
        }
      }
    } 
    else {
      let kontenAngka = barisBaris.length > 1 ? barisBaris[barisBaris.length - 2] : barisTerakhir.replace(regexOperasiAkhir, '');
      if (kontenAngka.includes(',')) {
        arrayAngka = kontenAngka
          .split(',')
          .map(num => parseFloat(num.trim()))
          .filter(num => !isNaN(num));
      }
    }

    if (arrayAngka.length === 0) return null;

    const hasilKalkulasi = arrayAngka.reduce((akumulator, nilaiSekarang, indeks) => {
      if (indeks === 0) return nilaiSekarang;

      if (operasi === '+=') {
        return akumulator + nilaiSekarang;
      } else if (operasi === '-=') {
        return akumulator - nilaiSekarang;
      } else if (operasi === '×=') {
        return akumulator * nilaiSekarang;
      } else if (operasi === '÷=') {
        return nilaiSekarang !== 0 ? akumulator / nilaiSekarang : akumulator;
      }
      return akumulator;
    }, 0);

    return Number(hasilKalkulasi.toFixed(2));
  }

  prosesTeks(teksLengkap, posisiKursor) {
    const teksHinggaKursor = teksLengkap.substring(0, posisiKursor);
    
    const hasilBerurutan = this.prosesAngkaBerurutan(teksHinggaKursor);
    if (hasilBerurutan !== null) {
      return hasilBerurutan;
    }

    const barisBaris = teksHinggaKursor.split('\n');
    let barisTerakhir = barisBaris[barisBaris.length - 1].trim();

    let teksMurni = barisTerakhir;
    this.kamusOperator.forEach(item => {
      teksMurni = teksMurni.replace(item.kata, item.simbol);
    });

    let ekspresiMatematika = teksMurni.replace(/[^0-9+\-×÷.()]/g, '');
    const polaValid = /[\d()]+[\+\-\×\÷][\d()]+/;
    
    if (polaValid.test(ekspresiMatematika)) {
      try {
        ekspresiMatematika = this.prosesKurung(ekspresiMatematika);
        let ekspresiFinal = ekspresiMatematika.replace(/×/g, '*').replace(/÷/g, '/');
        const hasilEvaluasi = new Function(`return ${ekspresiFinal}`)();
        
        if (typeof hasilEvaluasi === 'number' && !isNaN(hasilEvaluasi) && isFinite(hasilEvaluasi)) {
          return Number(hasilEvaluasi.toFixed(2)); 
        }
      } catch (e) {
        return null;
      }
    }
    return null; 
  }
}

// 1. Ambil elemen DOM
const btnMunculkan = document.getElementById('btn-munculkan');
const btnTutupCatatan = document.getElementById('btn-tutup-catatan');
const sectionCatatan = document.getElementById('catatan');
const formCatatan = document.querySelector('.catatan form');
const inputJudul = document.getElementById('judul');
const isiCatatan = document.getElementById('isi-catatan');
const wadahList = document.getElementById('wadah-list');
const notif = document.getElementById('notif');

const sectionDaftar = document.getElementById('daftar-catatan');
const btnMasterHapus = document.getElementById('btn-master-hapus');
const btnBatalHapus = document.getElementById('btn-batal-hapus');

const tooltip = document.getElementById('tooltip-kalkulator');
const teksHasilHitung = document.getElementById('teks-hasil-hitung');
const btnOpsiA = document.getElementById('btn-opsi-a');
const btnOpsiC = document.getElementById('btn-opsi-c');

// Inisialisasi Elemen Panduan
const halamanPanduan = document.getElementById("halaman-panduan");
const tombolMengerti = document.getElementById("tombol-mengerti");
const btnPanduan = document.getElementById("btn-panduan");

// Inisialisasi Sistem
const mesinHitung = new Hitung();
let isModeHapus = false;
let daftarData = [];

// 2. Real-time Event Listener Kalkulator
isiCatatan.addEventListener('input', function() {
  const posisiKursor = isiCatatan.selectionStart;
  const teksSekarang = isiCatatan.value;
  const hasilHitung = mesinHitung.prosesTeks(teksSekarang, posisiKursor);

  if (hasilHitung !== null) {
    nilaiHasilGlobal = hasilHitung;
    teksHasilHitung.innerText = "Hasil: " + hasilHitung;
    tooltip.style.display = 'flex';
    tooltip.style.left = '90px'; 
    tooltip.style.bottom = '10px'; 
  } else {
    tooltip.style.display = 'none';
  }
});

let nilaiHasilGlobal = null; 

function sisipkanHasil(format) {
  if (nilaiHasilGlobal === null) return;

  const posisiKursor = isiCatatan.selectionStart;
  const teksLama = isiCatatan.value;
  const teksSisipan = (format === 'A') ? ` = ${nilaiHasilGlobal}` : ` (${nilaiHasilGlobal})`;
  const teksBaru = teksLama.substring(0, posisiKursor) + teksSisipan + teksLama.substring(posisiKursor);
  
  isiCatatan.value = teksBaru;
  tooltip.style.display = 'none'; 
  nilaiHasilGlobal = null;

  isiCatatan.focus();
  const posisiKursorBaru = posisiKursor + teksSisipan.length;
  isiCatatan.setSelectionRange(posisiKursorBaru, posisiKursorBaru);
}

btnOpsiA.addEventListener('click', () => sisipkanHasil('A'));
btnOpsiC.addEventListener('click', () => sisipkanHasil('C'));

function tampilkanDaftar() {
  wadahList.innerHTML = ''; 
  if (daftarData.length === 0) {
    wadahList.innerHTML = '<p style="text-align:center; font-style:italic; color:var(--warna-teks-mading);">Belum ada catatan yang disimpan.</p>';
    keluarModeHapus();
    btnMasterHapus.style.display = 'none'
    return;
  }

  daftarData.forEach((item, index) => {
    const judulFix = item.judul.trim() === '' ? 'Tanpa Judul' : item.judul;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-catatan';
    itemDiv.innerHTML = `
      <div class="item-judul" onclick="handleKlikList(this, ${index})">
        <span class="teks-judul">${judulFix}</span>
        <button class="btn-hapus-satuan" onclick="hapusSatuCatatan(event, ${index})">Hapus</button>
      </div>
      <div class="item-isi">${item.isi}</div>
    `;
    wadahList.appendChild(itemDiv);
    btnMasterHapus.style.display = 'block'
  });
}

function handleKlikList(elemenJudul, index) {
  if (isModeHapus) return; 
  elemenJudul.parentElement.classList.toggle('aktif');
}

function hapusSatuCatatan(event, index) {
  event.stopPropagation(); 
  if (confirm('Apakah kamu yakin ingin menghapus catatan ini?')) {
    daftarData.splice(index, 1); 
    simpanKeLokal();
    tampilkanDaftar();
  }
}

function keluarModeHapus() {
  isModeHapus = false;
  sectionDaftar.classList.remove('mode-hapus');
  btnMasterHapus.classList.remove('aktif-merah');
  btnMasterHapus.innerText = 'Hapus';
}

function simpanKeLokal() {
  localStorage.setItem('smartnote_array_data', JSON.stringify(daftarData));
}

function muatDataLokal() {
  const dataLokal = localStorage.getItem('smartnote_array_data');
  if (dataLokal) {
    daftarData = JSON.parse(dataLokal);
  }
  tampilkanDaftar();
}
muatDataLokal();

btnMasterHapus.addEventListener('click', function() {
  if (daftarData.length === 0) return; 
  if (!isModeHapus) {
    isModeHapus = true;
    sectionDaftar.classList.add('mode-hapus');
    btnMasterHapus.classList.add('aktif-merah');
    btnMasterHapus.innerText = 'Hapus Semua';
    document.querySelectorAll('.item-catatan').forEach(el => el.classList.remove('aktif'));
  } else {
    if (confirm('PERINGATAN! Apakah kamu yakin ingin MENGHAPUS SEMUA catatan?')) {
      daftarData = []; 
      simpanKeLokal();
      tampilkanDaftar();
    } else {
      keluarModeHapus();
    }
  }
});

btnBatalHapus.addEventListener('click', keluarModeHapus);

btnMunculkan.addEventListener('click', function(e) {
  e.preventDefault();
  if (sectionCatatan.style.display === 'none' || sectionCatatan.style.display === '') {
    sectionCatatan.style.display = 'block';
    sectionCatatan.scrollIntoView({ behavior: 'smooth' });
    sectionDaftar.style.display = 'none'
    setTimeout(() => { inputJudul.focus(); }, 300);
  } else {
    sectionDaftar.style.display = 'block'
    sectionCatatan.style.display = 'none';
    tooltip.style.display = 'none';
  }
  btnMunculkan.classList.remove('tombol-kedip');
});

btnTutupCatatan.addEventListener('click', function() {
  sectionDaftar.style.display = 'block'
  sectionCatatan.style.display = 'none';
  tooltip.style.display = 'none';
  document.getElementById('top-header').scrollIntoView({ behavior: 'smooth' });
});

formCatatan.addEventListener('submit', function(event) {
  event.preventDefault(); 
  if (isiCatatan.value.trim() === '') {
    isiCatatan.focus();
    return;
  }
  
  const catatanBaru = { 
    judul: inputJudul.value, 
    isi: isiCatatan.value 
  };
  
  daftarData.unshift(catatanBaru);
  simpanKeLokal();
  keluarModeHapus();
  tampilkanDaftar();
  
  inputJudul.value = '';
  isiCatatan.value = '';
  tooltip.style.display = 'none';
  
  notif.classList.add('muncul');
  setTimeout(() => { notif.classList.remove('muncul'); }, 600);
});

// --- 📋 SISTEM MANAGEMENT PANDUAN (Terintegrasi Aman) ---
// 1. Jalankan cek memori lokal saat pertama kali halaman dimuat
const sudahBacaPanduan = localStorage.getItem("matchnote_baca_panduan");
if (!sudahBacaPanduan) {
  halamanPanduan.classList.remove("hidden");
}

// 2. Aksi tombol "Saya Mengerti" (Menutup)
tombolMengerti.addEventListener("click", function() {
  localStorage.setItem("matchnote_baca_panduan", "true");
  halamanPanduan.classList.add("hidden");
});

// 3. Aksi tombol tanda tanya ❓ di header (Membuka kembali)
btnPanduan.addEventListener("click", function() {
  halamanPanduan.classList.remove("hidden");
});

// Sistem tombol kembali Android (Capacitor)
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    document.addEventListener("backbutton", function (e) {
        e.preventDefault();
        if (navigator.app && navigator.app.exitApp) {
            navigator.app.exitApp();
        } else if (navigator.device && navigator.device.exitApp) {
            navigator.device.exitApp();
        } else {
            window.close();
        }
    }, false);
}