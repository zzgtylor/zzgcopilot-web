const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function createTotpSecret(byteLength = 20) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  let bits = ''
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0')
  let encoded = ''
  for (let index = 0; index < bits.length; index += 5) {
    encoded += BASE32[Number.parseInt(bits.slice(index, index + 5).padEnd(5, '0'), 2)]
  }
  return encoded
}

function decodeBase32(value: string) {
  let bits = ''
  for (const character of value.toUpperCase().replace(/[^A-Z2-7]/g, '')) {
    const index = BASE32.indexOf(character)
    if (index >= 0) bits += index.toString(2).padStart(5, '0')
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(bits.slice(index * 8, index * 8 + 8), 2)
  }
  return bytes
}

async function codeAt(secret: string, counter: number) {
  const message = new ArrayBuffer(8)
  const view = new DataView(message)
  view.setUint32(4, counter, false)
  const key = await crypto.subtle.importKey('raw', decodeBase32(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, message))
  const offset = signature[signature.length - 1] & 0x0f
  const value = ((signature[offset] & 0x7f) << 24) | (signature[offset + 1] << 16) | (signature[offset + 2] << 8) | signature[offset + 3]
  return String(value % 1_000_000).padStart(6, '0')
}

export async function verifyTotp(secret: string, provided: string) {
  if (!/^\d{6}$/.test(provided)) return false
  const counter = Math.floor(Date.now() / 30_000)
  const candidates = await Promise.all([-1, 0, 1].map((offset) => codeAt(secret, counter + offset)))
  return candidates.includes(provided)
}

export async function sha256(value: string | ArrayBuffer) {
  const input = typeof value === 'string' ? new TextEncoder().encode(value) : value
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const bytes = crypto.getRandomValues(new Uint8Array(6))
    const value = Array.from(bytes, (byte) => BASE32[byte % BASE32.length]).join('')
    return `${value.slice(0, 4)}-${value.slice(4, 8)}`
  })
}
