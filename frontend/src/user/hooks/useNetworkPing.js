import { useEffect, useState } from 'react'
import { checkInternetPing } from '../services/cat.service'
const PING_INTERVAL = 10000
const PING_TIMEOUT = 5000

export const useNetworkPing = (enabled = true) => {
    const [ping, setPing] = useState(null)
    const [isChecking, setIsChecking] = useState(false)
    const [isDisconnected, setIsDisconnected] = useState(false)
    useEffect(() => {
        if (!enabled) return undefined
        let active = true
        let inFlight = false
        let controller = null
        const checkPing = async () => {
            if (!active || inFlight) return
            inFlight = true
            controller = new AbortController()
            const currentController = controller
            const timeoutId = window.setTimeout(() => {
                currentController.abort()
            }, PING_TIMEOUT)
            setIsChecking(true)
            try {
                const result = await checkInternetPing({
                    signal: currentController.signal,
                })
                if (!active) return
                setPing(result)
                setIsDisconnected(false)
            } catch {
                if (!active) return
                setPing(null)
                setIsDisconnected(true)
            } finally {
                window.clearTimeout(timeoutId)
                inFlight = false
                controller = null
                if (active) {
                    setIsChecking(false)
                }
            }
        }

        void checkPing()
        const intervalId = window.setInterval(
            checkPing,
            PING_INTERVAL
        )
        return () => {
            active = false
            window.clearInterval(intervalId)
            controller?.abort()
        }
    }, [enabled])
    return {
        ping,
        isChecking,
        isDisconnected,
    }
}