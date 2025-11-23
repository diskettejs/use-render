import { useMemo, type Ref, type RefCallback } from 'react'

/**
 * Assigns a value to a ref.
 * @param ref The ref to assign the value to.
 * @param value The value to assign to the ref.
 * @returns The ref cleanup callback, if any.
 */
export function assignRef<T>(
  ref: Ref<T> | undefined | null,
  value: T | null,
): ReturnType<RefCallback<T>> {
  if (typeof ref === 'function') {
    return ref(value)
  } else if (ref) {
    ref.current = value
  }
}

function mergeRefs<T>(refs: (Ref<T> | undefined)[]): Ref<T> {
  return (value: T | null) => {
    const cleanups: (() => void)[] = []

    for (const ref of refs) {
      const cleanup = assignRef(ref, value)
      const isCleanup = typeof cleanup === 'function'
      cleanups.push(isCleanup ? cleanup : () => assignRef(ref, null))
    }

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }
}

/**
 * Composes multiple refs into a single one and memoizes the result to avoid refs execution on each render.
 * @param refs List of refs to merge.
 * @returns Merged ref.
 */
export function useComposedRef<T>(refs: (Ref<T> | undefined)[]): Ref<T> {
  return useMemo(() => mergeRefs(refs), refs)
}
