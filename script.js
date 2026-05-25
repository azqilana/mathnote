// --- INTEGRASI CLASS HITUNG SAKTI (OOP DENGAN MODUL OPERASI) ---
class Hitung {
  constructor() {
    this.kamusOperator = [
      { kata: /di\s*tambah/gi, simbol: '+' },
      { kata: /di\s*kurang/gi, simbol: '-' },
      { kata: /di\s*kali/gi,   simbol: '*' },
      { kata: /x/gi,           simbol: '*' },
      { kata: /×/gi,           simbol: '*' },
      { kata: /di\s*bagi/gi,   simbol: '/' },
      { kata: /÷/gi,           simbol: '/' }
    ];
  }

  bersihkanTanda(ekspresi) {
    ekspresi = ekspresi.replace(/--/g, '+');
    ekspresi = ekspresi.replace(/\+-|-\+/g, '-');
    return ekspresi;
  }

  prosesKurung(ekspresi) {
    const regexKurung = /\(([^()]+)\)/;
    while (regexKurung.test(ekspresi)) {
      ekspresi = ekspresi.replace(regexKurung, (match, isiKurung) => {
        try {
          const hasilIsi = new Function(`return ${isiKurung}`)();
          return hasilIsi;
        } catch (e) {
          return 0;
        }
      });
      ekspresi = this.bersihkanTanda(ekspresi);
    }
    return ekspresi;
  }

  prosesTeks(teksLengkap, posisiKursor) {
    const teksHinggaKursor = teksLengkap.substring(0, posisiKursor);
    const barisBaris = teksHinggaKursor.split('\n');
    const barisTerakhir = barisBaris[barisBaris.length - 1];

    let teksMurni = barisTerakhir;
    this.kamusOperator.forEach(item => {
      teksMurni = teksMurni.replace(item.kata, item.simbol);
    });

    let ekspresiMatematika = teksMurni.replace(/[^0-9+\-*/.()]/g, '');
    const polaValid = /[\d()]+[\+\-\*\/][\d()]+/;
    
    if (polaValid.test(ekspresiMatematika)) {
      try {
        ekspresiMatematika = this.prosesKurung(ekspresiMatematika);
        const hasilEvaluasi = new Function(`return ${ekspresiMatematika}`)();
        
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

// Inisialisasi
const mesinHitung = new Hitung();
let nilaiHasilGlobal = null; 
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
    wadahList.innerHTML = '<p style="text-align:center; font-style:italic; color:#666;">Belum ada catatan yang disimpan.</p>';
    keluarModeHapus();
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

// Tombol Plus (Munculkan Area Menulis)
btnMunculkan.addEventListener('click', function(e) {
  e.preventDefault();
  if (sectionCatatan.style.display === 'none' || sectionCatatan.style.display === '') {
    sectionCatatan.style.display = 'block';
    sectionCatatan.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { inputJudul.focus(); }, 300);
  } else {
    sectionCatatan.style.display = 'none';
    tooltip.style.display = 'none';
  }
  btnMunculkan.classList.remove('tombol-kedip');
});

// Tombol Tutup Silang (X) - Menggulung balik ke Header Atas
btnTutupCatatan.addEventListener('click', function() {
  sectionCatatan.style.display = 'none';
  tooltip.style.display = 'none';
  document.getElementById('top-header').scrollIntoView({ behavior: 'smooth' });
});

// Proses Penyimpanan Form Catatan
// 🔥 PERBAIKAN: Proses Penyimpanan Form Catatan (Judul boleh kosong, Isi WAJIB ada)
formCatatan.addEventListener('submit', function(event) {
  event.preventDefault(); 
  
  // 1. Cek apakah isi catatan kosong atau hanya berisi spasi
  if (isiCatatan.value.trim() === '') {
    // Jika kosong, arahkan kursor kembali ke tempat menulis isi catatan
    isiCatatan.focus();
    return alert("Tidak ada isi catatan")
  }
  
  // 2. Jika lolos pengecekan (ada isinya), lakukan proses simpan seperti biasa
  const catatanBaru = { 
    judul: inputJudul.value, 
    isi: isiCatatan.value 
  };
  
  daftarData.unshift(catatanBaru);
  simpanKeLokal();
  keluarModeHapus();
  tampilkanDaftar();
  
  // 3. Reset form ketikan
  inputJudul.value = '';
  isiCatatan.value = '';
  tooltip.style.display = 'none';
  
  // 4. Munculkan notifikasi sukses
  notif.classList.add('muncul');
  setTimeout(() => { notif.classList.remove('muncul'); }, 600);
});