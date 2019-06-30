
function Formatter({ date, format }) {
  return new Intl.DateTimeFormat('default', format).format(new Date(date))
}

export function DateOnly({ date }) {
  return Formatter({
    date,
    format: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  })
}

export function DateTime({ date }) {
  return Formatter({
    date,
    format: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  })
}
