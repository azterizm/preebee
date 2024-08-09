import { Shop, SocialMedia } from '@prisma/client'
import { create } from 'zustand'

const defaultValues = {
  name: '',
  phone: '',
  layout: 0,
  color: 'bg-blue-200 hover:bg-blue-300',
  logoUrl: '',
  socialMedia: [
    { name: 'Facebook', url: '' },
    { name: 'Instagram', url: '' },
    { name: 'TikTok', url: '' },
  ],
  showPreview: false,
  description: ''
}

export const useSettingsStore = create<
  typeof defaultValues & {
    changeSetting: (
      name: keyof typeof defaultValues,
      value: string | number | boolean,
    ) => void
    addSocialMedia: (name: string, url: string) => void
    removeSocialMedia: (name: string) => void
    changeSocialMedia: (name: string, url: string) => void
    setFromShop: (
      shop: Shop & {
        socialMedia: SocialMedia[]
      },
    ) => void
  }
>()((set) => ({
  ...defaultValues,
  changeSetting: (name, value) => {
    set((state) => ({ ...state, [name]: value }))
  },
  addSocialMedia: (name, url) => {
    set((state) => ({
      socialMedia: [...state.socialMedia, { name, url }],
    }))
  },
  removeSocialMedia: (name) => {
    set((state) => ({
      socialMedia: state.socialMedia.filter((media) => media.name !== name),
    }))
  },
  changeSocialMedia: (name, url) => {
    set((state) => ({
      socialMedia: state.socialMedia.map((media) =>
        media.name === name ? { ...media, url } : media
      ),
    }))
  },
  setFromShop: (shop) => {
    set({
      name: shop.title,
      phone: shop.phone || '',
      layout: shop.layout,
      color: `bg-${shop.color}-200 hover:bg-${shop.color}-300`,
      logoUrl: shop.logoFileName ? `/api/logo/${shop.id}` : '',
      socialMedia: shop.socialMedia.map((r) => ({ name: r.name, url: r.link })),
      description: shop.description || ''
    })
  },
}))
