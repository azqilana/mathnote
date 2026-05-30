/**
 * MathNote ARK - app.js
 * Entry point - import sekali saja
 */

import { initRouter, navigate } from './Route/router.js'

window.ark = { navigate }

initRouter()
