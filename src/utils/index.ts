export function dateNowEST() {
  const d = new Date()
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}
