
import { useEffect, useRef, useState } from 'react'

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client'

let scriptPromise = null
let initializedClientId = null
let activeHandler = null

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.src = GOOGLE_SCRIPT
      script.async = true

      script.onload = () => resolve()
      script.onerror = () => {
        script.remove()
        reject(new Error('Gagal memuat Google Sign-In'))
      }

      document.head.appendChild(script)
    }).catch((error) => {
      scriptPromise = null
      throw error
    })
  }

  return scriptPromise
}

function initializeGoogle(clientId) {
  if (initializedClientId === clientId) return

  window.google.accounts.id.initialize({
    client_id: clientId,
    ux_mode: 'popup',
    auto_select: false,
    callback: (response) => {
      if (!response?.credential) return
      activeHandler?.(response.credential)
    },
  })

  initializedClientId = clientId
}

function GoogleSignInButton({
  onCredential,
  onError,
  disabled = false,
  text = 'signin_with',
}) {
  const buttonRef = useRef(null)
  const credentialCallbackRef = useRef(onCredential)
  const errorCallbackRef = useRef(onError)
  const disabledRef = useRef(disabled)

  const [ready, setReady] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  // Update nilai terbaru setelah React commit.
  useEffect(() => {
    credentialCallbackRef.current = onCredential
    errorCallbackRef.current = onError
    disabledRef.current = disabled
  }, [onCredential, onError, disabled])

  useEffect(() => {
    let active = true

    const handleCredential = (credential) => {
      if (!active || disabledRef.current) return

      credentialCallbackRef.current?.(credential)
    }

    async function setup() {
      if (!clientId) {
        errorCallbackRef.current?.(
          'Google Login belum dikonfigurasi'
        )
        return
      }

      try {
        await loadGoogleScript()

        if (!active || !buttonRef.current) return

        initializeGoogle(clientId)

        activeHandler = handleCredential

        buttonRef.current.replaceChildren()

        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            text,
            width: 340,
          }
        )

        if (active) setReady(true)
      } catch {
        if (active) {
          errorCallbackRef.current?.(
            'Google Sign-In gagal dimuat'
          )
        }
      }
    }

    setup()

    return () => {
      active = false

      if (activeHandler === handleCredential) {
        activeHandler = null
      }
    }
  }, [clientId, text])

  return (
    <div className="relative flex w-full justify-center">
      <div ref={buttonRef} />

      {(!ready || disabled) && (
        <div
          className="absolute inset-0 z-10 bg-white/70"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default GoogleSignInButton