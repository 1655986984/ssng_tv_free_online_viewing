import { createProxy } from './_proxy-utils.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  return createProxy(request, 'https://www.heimuer.tv', '/api/api.php')
}
