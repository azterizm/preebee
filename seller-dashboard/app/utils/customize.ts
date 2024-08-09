import socialMedia from '~/constants/social_media'

export function processSocialMediaInput(s: { name: string, url?: string }) {
  const entity = socialMedia.find((sm) => sm.name === s.name)
  if (!entity || !s.url) return null
  const domain = entity.placeholder.split('/')[0]
  if (!s.url.startsWith('http')) {
    s.url = `https://${domain}/${s.url}`
  }
  return s
}
