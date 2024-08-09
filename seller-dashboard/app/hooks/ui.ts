import { useSearchParams } from '@remix-run/react'
import { useWindowSize as useWindowSizeDotDev } from '@uidotdev/usehooks'

export function useSearchParamsState(
  searchParamName: string,
  defaultValue: string,
  debounce?: number,
): readonly [
  searchParamsState: string,
  setSearchParamsState: (newState: string) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()

  const acquiredSearchParam = searchParams.get(searchParamName)
  const searchParamsState = acquiredSearchParam ?? defaultValue

  const setSearchParamsState = (newState: string) => {
    const next = Object.assign(
      {},
      [...searchParams.entries()].reduce(
        (o, [key, value]) => ({ ...o, [key]: value }),
        {},
      ),
      { [searchParamName]: newState },
    )
    if (debounce) {
      clearTimeout(debounce)
      setTimeout(() => setSearchParams(next, { replace: true }), debounce)
    } else {
      setSearchParams(next, { replace: true })
    }
  }
  return [searchParamsState, setSearchParamsState]
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): readonly [T, (newValue: T) => void] {
  const storedValue = typeof window === 'undefined'
    ? defaultValue
    : JSON.parse(localStorage.getItem(key) ?? JSON.stringify(defaultValue))

  const setValue = (newValue: T) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  }

  return [storedValue, setValue]
}

export function useWindowSize() {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  const { width, height } = useWindowSizeDotDev()
  return { width: width || 0, height: height || 0 }
}
