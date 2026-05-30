/**
* Layout/navbar.js
*/

export default function () {
  const username = localStorage.getItem('mn_username') || ''
  const isLogin = localStorage.getItem('mn_token') !== null

  return `
  <header id="top-header">
  <h1>MathNote</h1>
  <h3>Aplikasi Catatan Dan <br>Kalkulator Pintar</h3>

  ${isLogin ? `
  <div class="profil-wrapper">
  <button class="btn-profil" onclick="window.toggleProfil()">
  👤 ${username}
  </button>
  <div class="dropdown-profil" id="dropdown-profil">
  <p class="dropdown-nama">👤 ${username}</p>
  <hr style="border-color:rgba(255,255,255,0.2);margin:6px 0;">
  <button class="btn-keluar" onclick="window.logOut()">🚪 Keluar</button>
  </div>
  </div>
  `: `
  <button class="btn-masuk" onclick="ark.navigate('/login')">Masuk</button>
  `}
  </header>

  <span id="notif" class="notif-sukses">Catatan disimpan!</span>
  <div id="loading"></div>

  <style>
  #top-header {
  padding: 16px 0 20px;
  color: white;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  }

  #top-header h1 { font-size: 2rem; }
  #top-header h3 { font-size: 1rem; font-weight: normal; margin-bottom: 12px; }

  .btn-masuk {
  background: rgba(255,255,255,0.15);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 7px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  backdrop-filter: blur(4px);
  }
  .btn-masuk:active { opacity: 0.7; }

  .profil-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  }

  .btn-profil {
  background: rgba(255,255,255,0.15);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 7px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  backdrop-filter: blur(4px);
  }
  .btn-profil:active { opacity: 0.7; }

  .dropdown-profil {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  background: #3a1f08;
  border-radius: 12px;
  padding: 12px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 999;
  border: 1px solid rgba(255,255,255,0.1);
  }

  .dropdown-profil.aktif { display: block; }

  .dropdown-nama {
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 4px;
  }

  .btn-keluar {
  width: 100%;
  background: rgba(255,80,80,0.15);
  color: #ff9090;
  border: 1px solid rgba(255,80,80,0.3);
  padding: 8px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 4px;
  }
  .btn-keluar:active { opacity: 0.7; }

  #loading {
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 0%;
  height: 3px;
  background: #f5deb3;
  transition: width 0.3s;
  z-index: 9999;
  }

  .notif-sukses {
  position: fixed;
  top: 20px; left: 50%;
  transform: translateX(-50%);
  background: #4a2c11;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: bold;
  z-index: 2000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  white-space: nowrap;
  }
  .notif-sukses.muncul { opacity: 1; }
  </style>
  `
}

  window.toggleProfil = function () {
    document.getElementById('dropdown-profil')?.classList.toggle('aktif')
  }

  document.addEventListener('click', function (e) {
    const wrapper = document.querySelector('.profil-wrapper')
    if (wrapper && !wrapper.contains(e.target)) {
      document.getElementById('dropdown-profil')?.classList.remove('aktif')
    }
  })

  window.logOut = function () {
    localStorage.removeItem('mn_token')
    localStorage.removeItem('mn_username')
    ark.navigate('/login')
  }