/**
 * MathNote ARK - Logika/auth.js
 * Logika login dan register
 */

import { login, register } from './api.js'

export function init() {
  const path = window.location.pathname

  if (path === '/login') initLogin()
  if (path === '/register') initRegister()
}

// ─────────────────────────────
// Login
// ─────────────────────────────
function initLogin() {
  const form = document.getElementById('form-login')
  const btnDaftar = document.getElementById('btn-ke-register')
  const pesan = document.getElementById('pesan')

  btnDaftar.addEventListener('click', () => ark.navigate('/register'))

  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()

    if (!username || !password) {
      tampilPesan(pesan, 'Username dan password wajib diisi!', 'error')
      return
    }

    tampilPesan(pesan, 'Sedang masuk...', 'info')

    const hasil = await login(username, password)

    if (hasil.token) {
      localStorage.setItem('mn_token', hasil.token)
      localStorage.setItem('mn_username', hasil.username)
      ark.navigate('/catatan')
    } else {
      tampilPesan(pesan, hasil.error || 'Login gagal', 'error')
    }
  })
}

// ─────────────────────────────
// Register
// ─────────────────────────────
function initRegister() {
  const form = document.getElementById('form-register')
  const btnLogin = document.getElementById('btn-ke-login')
  const pesan = document.getElementById('pesan')

  btnLogin.addEventListener('click', () => ark.navigate('/login'))

  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()
    const konfirmasi = document.getElementById('konfirmasi').value.trim()

    if (!username || !password) {
      tampilPesan(pesan, 'Username dan password wajib diisi!', 'error')
      return
    }

    if (password !== konfirmasi) {
      tampilPesan(pesan, 'Password tidak cocok!', 'error')
      return
    }

    tampilPesan(pesan, 'Sedang mendaftar...', 'info')

    const hasil = await register(username, password)

    if (hasil.message) {
      tampilPesan(pesan, 'Berhasil daftar! Silakan login.', 'sukses')
      setTimeout(() => ark.navigate('/login'), 1500)
    } else {
      tampilPesan(pesan, hasil.error || 'Gagal daftar', 'error')
    }
  })
}

// ─────────────────────────────
// Helper tampil pesan
// ─────────────────────────────
function tampilPesan(el, teks, tipe) {
  el.textContent = teks
  el.style.display = 'block'
  el.style.color = tipe === 'error' ? '#ff4d4d' : tipe === 'sukses' ? '#4caf50' : '#a67c52'
}
