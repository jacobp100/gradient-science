export const firstIndex = <T>(
  elements: T[],
  predicate: (value: T) => boolean
): number | undefined => {
  let start = 0;
  let end = elements.length - 1;
  let found: number | undefined = undefined;
  while (start <= end) {
    const mid = ((start + end) / 2) | 0;
    if (predicate(elements[mid])) {
      found = mid;
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return found;
};

export const firstElement = <T>(
  elements: T[],
  predicate: (value: T) => boolean
) => {
  const index = firstIndex(elements, predicate);
  return index != null ? elements[index] : undefined;
};

export const lastIndex = <T>(
  elements: T[],
  predicate: (value: T) => boolean
): number | undefined => {
  let start = 0;
  let end = elements.length - 1;
  let found: number | undefined = undefined;
  while (start <= end) {
    const mid = ((start + end) / 2) | 0;
    if (predicate(elements[mid])) {
      found = mid;
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return found;
};

export const lastElement = <T>(
  elements: T[],
  predicate: (value: T) => boolean
) => {
  const index = lastIndex(elements, predicate);
  return index != null ? elements[index] : undefined;
};
