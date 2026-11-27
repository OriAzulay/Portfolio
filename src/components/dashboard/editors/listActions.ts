import { removeAt, replaceAt } from "@/lib/utils";

/** Immutable add / update / remove / move helpers for an editable list. */
export function listActions<T>(list: T[], onChange: (next: T[]) => void) {
  return {
    add: (item: T) => onChange([...list, item]),
    update: (index: number, patch: Partial<T>) => onChange(replaceAt(list, index, patch)),
    remove: (index: number) => onChange(removeAt(list, index)),
    /** Returns a handler moving the item by `offset`, or undefined at the list edges. */
    mover: (index: number, offset: -1 | 1) => {
      const target = index + offset;
      if (target < 0 || target >= list.length) return undefined;
      return () => {
        const next = [...list];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
      };
    },
  };
}
