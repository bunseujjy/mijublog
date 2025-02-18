export const useSocial = (url: string) => {
    const encodedUrl = encodeURIComponent(url)
    
    const openShare = (shareUrl: string) => {
        if (process.client) {
            window.open(shareUrl, '_blank')
        }
    }

    const shareFacebook = computed(() => ({
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        share: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
    }))

    const shareTwitter = computed(() => {
        const text = encodeURIComponent('Check out this awesome list!')
        return {
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
            share: () => openShare(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`)
        }
    })

    const copyToClipboard = async () => {
        if (!process.client) return false
        try {
            await navigator.clipboard.writeText(url)
            return true
        } catch (error) {
            console.error('Failed to copy:', error)
            return false
        }
    }

    return {
        shareFacebook,
        shareTwitter,
        copyToClipboard
    }
}