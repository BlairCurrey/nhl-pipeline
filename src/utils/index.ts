export function dateNowEST() {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  return formatDate(dateString)
}

export function formatDate(inputDate: string) {
  const [month, day, year] = inputDate.split('/');
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const numericYear = Number(year);
  // Use string interpolation to construct the output string
  return `${numericYear}-${numericMonth.toString().padStart(2, '0')}-${numericDay.toString().padStart(2, '0')}`;
}