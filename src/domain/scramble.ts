export function scrambleName(name: string, rng: () => number = Math.random): string {
  const letters = [...name]
  if (letters.length <= 1) return name

  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }

  if (letters.join('') === name) {
    ;[letters[0], letters[1]] = [letters[1], letters[0]]
  }

  return letters.join('')
}
