import { useMemo, type Ref } from 'react'
import { mergeRefs } from './utils.ts'

export { assignRef } from './utils.ts'

type RefInput<T> = Ref<T> | undefined | (Ref<T> | undefined)[]

/**
 * Composes multiple refs into a single one and memoizes the result to avoid refs execution on each render.
 * Accepts individual refs or arrays of refs, which are flattened automatically.
 * @param refs Refs to merge (individual or arrays).
 * @returns Merged ref.
 */
export function useComposedRef<T>(...refs: RefInput<T>[]): Ref<T> {
  const flatRefs = refs.flat()
  return useMemo(() => mergeRefs(flatRefs), flatRefs)
}
