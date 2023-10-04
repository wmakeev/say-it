import { createHash } from 'node:crypto'

/**
 * Returns a MD5 hash
 *
 * @param {string} content
 */
export function md5(content) {
  return createHash('md5').update(content).digest('hex')
}
