import {
    Activity,
    Wifi,
    WifiOff,
    AlertTriangle,
} from 'lucide-react'

function NetworkPingIndicator({
    ping,
    isChecking,
    isDisconnected,
}) {
    const getStatus = () => {
        if (isDisconnected) {
            return {
                label: 'Koneksi terputus',
                className: 'text-red-600 bg-red-50 border-red-200',
                icon: WifiOff,
            }
        }

        if (ping === null) {
            return {
                label: isChecking
                    ? 'Memeriksa koneksi...'
                    : 'Ping belum tersedia',
                className: 'text-gray-600 bg-gray-50 border-gray-200',
                icon: Activity,
            }
        }

        if (ping <= 100) {
            return {
                label: 'Sangat baik',
                className: 'text-green-700 bg-green-50 border-green-200',
                icon: Wifi,
            }
        }

        if (ping <= 200) {
            return {
                label: 'Baik',
                className: 'text-green-700 bg-green-50 border-green-200',
                icon: Wifi,
            }
        }

        if (ping <= 500) {
            return {
                label: 'Kurang stabil',
                className: 'text-amber-700 bg-amber-50 border-amber-200',
                icon: AlertTriangle,
            }
        }

        return {
            label: 'Sangat lambat',
            className: 'text-red-600 bg-red-50 border-red-200',
            icon: AlertTriangle,
        }
    }

    const status = getStatus()
    const StatusIcon = status.icon

    return (
        <div
            role="status"
            aria-live="polite"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-medium sm:px-3 sm:text-xs ${status.className}`}
        >
            <StatusIcon size={15} />

            <span>
                {ping !== null ? `Ping ${ping} ms` : status.label}
            </span>

            {ping !== null && (
                <span className="opacity-80">
                    · {status.label}
                </span>
            )}
        </div>
    )
}

export default NetworkPingIndicator