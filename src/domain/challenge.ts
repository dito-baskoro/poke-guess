export function pickNextPokemonId(
  ids: number[],
  previousId: number | null,
  random: () => number = Math.random,
): number {
  const candidates = ids.length > 1 ? ids.filter((id) => id !== previousId) : ids
  const index = Math.floor(random() * candidates.length)
  return candidates[index]
}
