import crypto from 'crypto'

export class CryptoUtil {
  static sha256 (msg) {
    return crypto.createHash('sha256')
      .update(msg)
      .digest('base64')
  }
}
