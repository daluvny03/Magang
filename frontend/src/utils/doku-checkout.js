
const DOKU_SCRIPTS = {
  sandbox:
    'https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js',
  production:
    'https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js',
}

let scriptPromise = null

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

    script.onload = () => {
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

export const openDokuCheckout = async (paymentUrl) => {
  const environment = getDokuEnvironment()

  const url = new URL(paymentUrl)

  const allowedHostname =
    environment === 'sandbox'
      ? 'sandbox.doku.com'
      : 'jokul.doku.com'

  if (
    url.protocol !== 'https:' ||
    url.hostname !== allowedHostname
  ) {
    throw new Error('Invalid DOKU payment URL')
  }

  await loadDokuScript()

  window.loadJokulCheckout(url.toString())
}
