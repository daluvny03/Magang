
const DOKU_SCRIPTS = {
  sandbox:
    'https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js',
  production:
    'https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js',
}

let scriptPromise = null
let openVersion = 0
let removeModalListeners = () => {}

export const closeDokuCheckout = () => {
  openVersion++ // Also cancels an open waiting for the SDK to load.
  removeModalListeners()
  removeModalListeners = () => {}
  if (typeof document !== 'undefined') {
    document.querySelectorAll?.('[id="jokul_checkout_modal"]').forEach(modal => modal.remove())
  }
}

const getDokuEnvironment = () => {
  const environment = import.meta.env.VITE_DOKU_ENV

  if (!DOKU_SCRIPTS[environment]) {
    throw new Error('Invalid DOKU environment')
  }

  return environment
}

export const loadDokuScript = () => {
  if (typeof window.loadJokulCheckout === 'function') {
    return Promise.resolve()
  }

  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')

    script.src = DOKU_SCRIPTS[getDokuEnvironment()]
    script.async = true
    const previousClick = window.onclick

    script.onload = () => {
      // The SDK assigns window.onclick globally; keep application handlers intact.
      window.onclick = previousClick
      if (typeof window.loadJokulCheckout !== 'function') {
        reject(new Error('DOKU Checkout unavailable'))
        return
      }

      resolve()
    }

    script.onerror = () => {
      script.remove()
      reject(new Error('Failed to load DOKU Checkout'))
    }

    document.body.appendChild(script)
  }).catch((error) => {
    scriptPromise = null
    throw error
  })

  return scriptPromise
}

export const openDokuCheckout = async (paymentUrl, canOpen = () => true, onClose = () => {}) => {
  const environment = getDokuEnvironment()

  const url = new URL(paymentUrl)

  const allowedOrigins =
  environment === 'sandbox'
    ? [
        'https://sandbox.doku.com',
        'https://staging.doku.com',
      ]
    : ['https://jokul.doku.com']

    if (
      url.protocol !== 'https:' ||
      !allowedOrigins.includes(url.origin) ||
      url.username ||
      url.password ||
      url.hash
    ) {
      throw new Error('Invalid DOKU payment URL')
    }

  closeDokuCheckout()
  const version = openVersion
  await loadDokuScript()

  if (version !== openVersion || !canOpen()) return
  // Official SDK appends duplicate IDs and its close handler only hides one.
  // Replace its global message handler with a source-checked per-modal handler.
  if (typeof window.receive === 'function') window.removeEventListener('message', window.receive)
  window.closeJokul = closeDokuCheckout
  window.loadJokulCheckout(url.toString())
  const modal = document.getElementById?.('jokul_checkout_modal')
  if (!modal) return
  const frame = modal.querySelector('iframe')
  const close = () => {
    closeDokuCheckout()
    if (canOpen()) onClose()
  }
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Tutup pembayaran'
  button.setAttribute('aria-label', 'Tutup pembayaran')
  Object.assign(button.style, {
    position: 'fixed', top: '12px', right: '12px', zIndex: '2147483647',
    background: 'white', color: '#111827', padding: '10px 16px',
    borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer',
  })
  modal.appendChild(button)
  const backdrop = event => { if (event.target === modal) close() }
  const escape = event => { if (event.key === 'Escape') close() }
  const message = event => {
    const origins = environment === 'sandbox'
      ? ['https://sandbox.doku.com', 'https://staging.doku.com', 'https://checkout.doku.com']
      : ['https://jokul.doku.com', 'https://checkout.doku.com']
    if (event.source === frame?.contentWindow && origins.includes(event.origin) &&
        event.data?.func === 'closeJokul') close()
  }
  button.addEventListener('click', close)
  modal.addEventListener('click', backdrop)
  window.addEventListener('keydown', escape)
  window.addEventListener('message', message)
  removeModalListeners = () => {
    button.removeEventListener('click', close)
    modal.removeEventListener('click', backdrop)
    window.removeEventListener('keydown', escape)
    window.removeEventListener('message', message)
  }
}
