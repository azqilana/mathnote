/**
 * MathNote ARK - Logika/api.js
 * Semua komunikasi ke Cloudflare Worker
 * Tidak ada HTML disini, hanya fetch
 */

const BASE_URL = 'https://mathnote.muhammad-azqilana.workers.dev'

function getToken() {
  return localStorage.getItem('mn_token')
}

function headers(withAuth = false) {
  const h = { 'Content-Type': 'application/json' }
  if (withAuth) h['Authorization'] = 'Bearer ' + getToken()
  return h
}

// ─────────────────────────────
// Auth
// ─────────────────────────────
export async function register(username, password) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, password })
  })
  return res.json()
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, password })
  })
  return res.json()
}

// ─────────────────────────────
// Catatan
// ─────────────────────────────
export async function getCatatan() {
  const res = await fetch(`${BASE_URL}/api/catatan`, {
    headers: headers(true)
  })
  return res.json()
}

export async function simpanCatatan(judul, isi) {
  const res = await fetch(`${BASE_URL}/api/catatan`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ judul, isi })
  })
  return res.json()
}

export async function editCatatan(id, judul, isi) {
  const res = await fetch(`${BASE_URL}/api/catatan/${id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify({ judul, isi })
  })
  return res.json()
}

export async function hapusCatatan(id) {
  const res = await fetch(`${BASE_URL}/api/catatan/${id}`, {
    method: 'DELETE',
    headers: headers(true)
  })
  return res.json()
}
