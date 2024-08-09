import { Category, Product, ProductImage } from '@prisma/client'
import { create } from 'zustand'
import { MultiplePhotosInputEntity } from '~/components/MultiplePhotosInput'

const defaultValues = {
  photos: [] as MultiplePhotosInputEntity[],
  title: '',
  price: 50,
  description: '',
  stock: 1,
  categoriesId: [] as string[],
}

export const useProductStore = create<
  typeof defaultValues & {
    changeSetting: (
      name: keyof typeof defaultValues,
      value: string | number | boolean,
    ) => void
    removePhotoByIndex: (index: number) => void
    addPhotos: (input: {
      file: File
      preview: string
    }[]) => void
    reset: () => void
    addCategory: (input: string) => void
    removeCategoryById: (id: string) => void
    setProduct: (
      product: Product & { categories: Category[]; images: ProductImage[] },
    ) => void
  }
>()((set) => ({
  ...defaultValues,
  changeSetting: (name, value) => {
    set((state) => ({ ...state, [name]: value }))
  },
  removePhotoByIndex: (index) => {
    set((state) => {
      const newPhotos = [...state.photos]
      newPhotos.splice(index, 1)
      return { photos: newPhotos }
    })
  },
  addPhotos: (input) => {
    set((state) => ({ photos: [...state.photos, ...input] }))
  },
  reset: () => {
    set(defaultValues)
  },
  addCategory: (input) => {
    set((state) => ({ categoriesId: [...state.categoriesId, input] }))
  },
  removeCategoryById: (id) => {
    set((state) => {
      const newCategories = state.categoriesId.filter((r) => r !== id)
      return { categoriesId: newCategories }
    })
  },
  setProduct: (product) => {
    set({
      title: product.title,
      price: product.price,
      description: product.description || '',
      stock: product.stockAvailable,
      categoriesId: product.categories.map((r) => r.id),
      photos: product.images.map((r) => ({
        file: null as any,
        preview: `/api/product_image/${r.id}`,
      })),
    })
  },
}))
