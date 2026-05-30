/**
 * MathNote ARK - router.js
 * Engine routing + perakit layout
 */

// ─────────────────────────────
// Cache
// ─────────────────────────────
let routes = null
let jsCache = {}

// ─────────────────────────────
// Kumpulan kondisi
// ─────────────────────────────
const conditions = {
  isLogin: () => localStorage.getItem('mn_token') !== null,
  isGuest: () => localStorage.getItem('mn_token') === null,
}

// ─────────────────────────────
// Kumpulan middleware
// ─────────────────────────────
const middlewares = {
  showLoading: () => {
    const el = document.getElementById('loading')
    if (el) { el.style.display = 'block'; el.style.width = '60%' }
  },
  hideLoading: () => {
    const el = document.getElementById('loading')
    if (el) {
      el.style.width = '100%'
      setTimeout(() => { el.style.display = 'none'; el.style.width = '0%' }, 300)
    }
  },
}

// ─────────────────────────────
// Load routes.json - sekali saja
// ─────────────────────────────
async function loadRoutes() {
  if (routes) return routes
  const res = await fetch('./Route/routes.json')
  routes = await res.json()
  return routes
}

// ─────────────────────────────
// Load CSS
// ─────────────────────────────
function loadCSS(file) {
  if (document.querySelector(`link[href="${file}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = file
  document.head.appendChild(link)
}

// ─────────────────────────────
// Load JS dengan cache
// ─────────────────────────────
async function loadJS(file) {
  if (jsCache[file]) return jsCache[file]
  const mod = await import('../' + file)
  jsCache[file] = mod
  return mod
}

// ─────────────────────────────
// Cari route yang cocok
// ─────────────────────────────
function matchRoute(url, routes) {
  const parts = url.split('/').filter(Boolean)

  // 1. Exact match
  const exact = routes.find(r => r.route === url)
  if (exact) return { route: exact, params: null }

  // 2. Format :param
  const withParam = routes.find(r => {
    const rParts = r.route.split('/').filter(Boolean)
    if (rParts.length !== parts.length) return false
    return rParts.every((p, i) => p.startsWith(':') || p === parts[i])
  })
  if (withParam) {
    const rParts = withParam.route.split('/').filter(Boolean)
    const params = {}
    rParts.forEach((p, i) => { if (p.startsWith(':')) params[p.slice(1)] = parts[i] })
    return { route: withParam, params }
  }

  // 3. Base route dynamic
  if (parts.length > 1) {
    const base = '/' + parts[0] + '/'
    const dynamic = routes.find(r => r.route === base)
    if (dynamic) return { route: dynamic, params: { value: parts.slice(1).join('/') } }
  }

  return null
}

// ─────────────────────────────
// Rakit Layout
// ─────────────────────────────
async function rakitLayout(match) {
  const templateMod = await loadJS(match.html)
  const konten = templateMod.default()

  let html = ''
  for (const name of match.layout) {
    if (name === '{main}') {
      html += konten
    } else {
      const mod = await loadJS('Layout/' + name)
      html += mod.default()
    }
  }
  return html
}

// ─────────────────────────────
// Navigate
// ─────────────────────────────
export async function navigate(url) {
  window.history.pushState({}, '', url)

  const app = document.getElementById('app')
  const allRoutes = await loadRoutes()
  const matched = matchRoute(url, allRoutes)

  // 404
  if (!matched) {
    app.innerHTML = '<h2 style="padding:2rem;color:white">404 - Halaman tidak ditemukan</h2>'
    return
  }

  const { route: match, params } = matched

  // ── Cek condition ──
  if (match.condition) {
    const conds = Array.isArray(match.condition) ? match.condition : [match.condition]
    for (const cond of conds) {
      if (conditions[cond] && !conditions[cond]()) {
        // Redirect sesuai kondisi
        return navigate(cond === 'isLogin' ? '/login' : '/catatan')
      }
    }
  }

  // ── Jalankan middleware ──
  if (match.middleware) {
    const mids = Array.isArray(match.middleware) ? match.middleware : [match.middleware]
    for (const mid of mids) {
      if (middlewares[mid]) await middlewares[mid]()
    }
  }

  // ── Load CSS ──
  if (match.css) {
    const cssFiles = Array.isArray(match.css) ? match.css : [match.css]
    cssFiles.forEach(file => loadCSS(file))
  }

  // ── Rakit layout + konten ──
  app.innerHTML = await rakitLayout(match)

  // ── Load & init logika ──
  if (match.js) {
    const jsFiles = Array.isArray(match.js) ? match.js : [match.js]
    // Reset cache logika agar init ulang setiap navigate
    jsFiles.forEach(f => delete jsCache[f])
    for (const file of jsFiles) {
      const mod = await loadJS(file)
      if (mod && mod.init) mod.init(params)
    }
  }

  // ── Sembunyikan loading ──
  middlewares.hideLoading()
}

// ─────────────────────────────
// Init
// ─────────────────────────────
export async function initRouter() {
  await loadRoutes()
  window.addEventListener('popstate', () => navigate(window.location.pathname))
  const path = window.location.pathname === '/' ? '/catatan' : window.location.pathname
  await navigate(path)
}
