import {
    useEffect,
    useState,
} from 'react'

const getRemainingSeconds = (expiresAt) => {
    if (!expiresAt) {
        return 0
    }

    const expiresAtTime =
        new Date(expiresAt).getTime()

    if (!Number.isFinite(expiresAtTime)) {
        return 0
    }

    return Math.max(
        Math.ceil(
            (expiresAtTime - Date.now()) /
                1000
        ),
        0
    )
}

export const useAttemptTimer = (
    expiresAt
) => {
    const [, forceRender] =
        useState(0)

    useEffect(() => {
        if (!expiresAt) {
            return
        }

        const intervalId = setInterval(() => {
            forceRender(
                (current) => current + 1
            )
        }, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [expiresAt])

    const remainingSeconds =
        getRemainingSeconds(expiresAt)

    const hours = Math.floor(
        remainingSeconds / 3600
    )

    const minutes = Math.floor(
        (remainingSeconds % 3600) / 60
    )

    const seconds =
        remainingSeconds % 60

    const formattedTime = [
        hours,
        minutes,
        seconds,
    ]
        .map((value) =>
            String(value).padStart(2, '0')
        )
        .join(':')

    return {
        remainingSeconds,
        formattedTime,
        isExpired:
            Boolean(expiresAt) &&
            remainingSeconds === 0,
    }
}