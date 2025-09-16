export default defineEventHandler((event) => {
  if (event.path.startsWith('/.well-known')) {
    return { status: 'ok' }
  }
})


