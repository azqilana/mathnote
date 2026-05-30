/**
 * Page/login/template.js
 */

export default function () {
  return `
    <div class="auth-wrapper">
      <div class="auth-box">
        <h2>MathNote</h2>
        <p class="auth-sub">Masuk ke akun kamu</p>
        <div class="garis-pembatas"></div>

        <form id="form-login">
          <input type="text" id="username" placeholder="Username" class="auth-input" />
          <input type="password" id="password" placeholder="Password" class="auth-input" />
          <p id="pesan" style="display:none;font-size:13px;margin-bottom:8px;"></p>
          <button type="submit" class="auth-btn">Masuk</button>
        </form>

        <div class="auth-divider">atau</div>
        <button id="btn-ke-register" class="auth-btn-outline">Daftar Akun Baru</button>
        <button onclick="ark.navigate('/catatan')" class="auth-btn-guest">
          Lanjut tanpa login →
        </button>
        <p class="auth-note">⚠️ Tanpa login, catatan hanya tersimpan di perangkat ini</p>
      </div>
    </div>
  `
}
