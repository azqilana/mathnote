/**
 * Page/register/template.js
 */

export default function () {
  return `
    <div class="auth-wrapper">
      <div class="auth-box">
        <h2>MathNote</h2>
        <p class="auth-sub">Buat akun baru</p>
        <div class="garis-pembatas"></div>

        <form id="form-register">
          <input type="text" id="username" placeholder="Username" class="auth-input" />
          <input type="password" id="password" placeholder="Password" class="auth-input" />
          <input type="password" id="konfirmasi" placeholder="Konfirmasi Password" class="auth-input" />
          <p id="pesan" style="display:none;font-size:13px;margin-bottom:8px;"></p>
          <button type="submit" class="auth-btn">Daftar</button>
        </form>

        <div class="auth-divider">sudah punya akun?</div>
        <button id="btn-ke-login" class="auth-btn-outline">Masuk</button>
      </div>
    </div>
  `
}
