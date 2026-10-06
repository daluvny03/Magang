const API_ORIGIN =
    import.meta.env.VITE_API_ORIGIN ||
    'http://localhost:3000'

export const getImageUrl = (
    imagePath,
) => {
    if (!imagePath) {
        return null
    }

    if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://') ||
        imagePath.startsWith('blob:')
    ) {
        return imagePath
    }

    return `${API_ORIGIN}${imagePath}`
}