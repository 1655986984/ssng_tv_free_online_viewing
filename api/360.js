import { createProxy } from './_proxy-utils.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  return createProxy(request, 'https://360zy5.com', '/api/360')
}
