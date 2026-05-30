/**
 * MathNote - Cloudflare Worker API
 * Endpoint:
 * POST /api/register   - Daftar akun
 * POST /api/login      - Masuk akun
 * GET  /api/catatan    - Ambil semua catatan
 * POST /api/catatan    - Simpan catatan baru
 * PUT  /api/catatan/:id - Edit catatan
 * DELETE /api/catatan/:id - Hapus catatan
 */

// ─────────────────────────────
// CORS Headers
// ─────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ─────────────────────────────
// JWT Sederhana
// ─────────────────────────────
const SECRET = 'mathnote-secret-key-ark'

async function buatToken(userId) {
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  const encoded = btoa(JSON.stringify(payload))
  return encoded
}

async function verifikasiToken(token) {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function ambilToken(request) {
  const auth = request.headers.get('Authorization')
  if (!auth) return null
  return auth.replace('Bearer ', '')
}

// ─────────────────────────────
// Hash Password Sederhana
// ─────────────────────────────
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + SECRET)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

// ─────────────────────────────
// Main Handler
// ─────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // ── Register ──
    if (path === '/api/register' && method === 'POST') {
      const { username, password } = await request.json()

      if (!username || !password) {
        return response({ error: 'Username dan password wajib diisi' }, 400)
      }

      // Cek username sudah ada
      const existing = await env.DB.prepare(
        'SELECT id FROM users WHERE username = ?'
      ).bind(username).first()

      if (existing) {
        return response({ error: 'Username sudah dipakai' }, 400)
      }

      const hashed = await hashPassword(password)
      await env.DB.prepare(
        'INSERT INTO users (username, password) VALUES (?, ?)'
      ).bind(username, hashed).run()

      return response({ message: 'Berhasil daftar!' })
    }

    // ── Login ──
    if (path === '/api/login' && method === 'POST') {
      const { username, password } = await request.json()

      if (!username || !password) {
        return response({ error: 'Username dan password wajib diisi' }, 400)
      }

      const user = await env.DB.prepare(
        'SELECT id, password FROM users WHERE username = ?'
      ).bind(username).first()

      if (!user) {
        return response({ error: 'Username tidak ditemukan' }, 401)
      }

      const hashed = await hashPassword(password)
      if (hashed !== user.password) {
        return response({ error: 'Password salah' }, 401)
      }

      const token = await buatToken(user.id)
      return response({ token, username })
    }

    // ── Catatan - perlu login ──
    const token = ambilToken(request)
    if (!token) return response({ error: 'Perlu login' }, 401)

    const payload = await verifikasiToken(token)
    if (!payload) return response({ error: 'Token tidak valid atau expired' }, 401)

    const userId = payload.userId

    // GET semua catatan
    if (path === '/api/catatan' && method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, judul, isi, created_at FROM catatan WHERE user_id = ? ORDER BY id DESC'
      ).bind(userId).all()
      return response(results)
    }

    // POST simpan catatan baru
    if (path === '/api/catatan' && method === 'POST') {
      const { judul, isi } = await request.json()
      if (!isi) return response({ error: 'Isi catatan wajib diisi' }, 400)

      await env.DB.prepare(
        'INSERT INTO catatan (user_id, judul, isi) VALUES (?, ?, ?)'
      ).bind(userId, judul || '', isi).run()

      return response({ message: 'Catatan disimpan!' })
    }

    // PUT edit catatan
    const editMatch = path.match(/^\/api\/catatan\/(\d+)$/)
    if (editMatch && method === 'PUT') {
      const id = editMatch[1]
      const { judul, isi } = await request.json()

      // Pastikan catatan milik user ini
      const catatan = await env.DB.prepare(
        'SELECT id FROM catatan WHERE id = ? AND user_id = ?'
      ).bind(id, userId).first()

      if (!catatan) return response({ error: 'Catatan tidak ditemukan' }, 404)

      await env.DB.prepare(
        'UPDATE catatan SET judul = ?, isi = ? WHERE id = ?'
      ).bind(judul || '', isi, id).run()

      return response({ message: 'Catatan diperbarui!' })
    }

    // DELETE hapus catatan
    if (editMatch && method === 'DELETE') {
      const id = editMatch[1]

      const catatan = await env.DB.prepare(
        'SELECT id FROM catatan WHERE id = ? AND user_id = ?'
      ).bind(id, userId).first()

      if (!catatan) return response({ error: 'Catatan tidak ditemukan' }, 404)

      await env.DB.prepare(
        'DELETE FROM catatan WHERE id = ?'
      ).bind(id).run()

      return response({ message: 'Catatan dihapus!' })
    }

    return response({ error: 'Endpoint tidak ditemukan' }, 404)
  }
}
