import { AppError } from './types';
import crypto from 'crypto';

const memoryFallbackStore = new Map<string, string>();

export interface OAuthTokenPayload {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
}

export class CredentialManager {
  private static getMasterKey(): Buffer {
    const keyStr = process.env.UNCLE_SCROOGE_VAULT_KEY || process.env.SECRET_VAULT_KEY || 'scrooge-default-master-encryption-key-32b';
    return crypto.createHash('sha256').update(keyStr).digest();
  }

  /**
   * Encrypts plaintext value using AES-256-GCM server-side.
   */
  static encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const key = this.getMasterKey();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts AES-256-GCM ciphertext server-side.
   */
  static decrypt(ciphertext: string): string {
    if (!ciphertext.includes(':')) {
      return ciphertext; // Fallback for unencrypted legacy keys
    }

    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = this.getMasterKey();

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static async storeSecret(
    tenantId: string,
    keyRef: string,
    secretValue: string
  ): Promise<string> {
    if (!tenantId || !keyRef || !secretValue) {
      throw new AppError('VALIDATION_ERROR', 'Invalid credential storage arguments');
    }

    const encryptedVal = this.encrypt(secretValue);
    const fullKey = `${tenantId}:${keyRef}`;
    memoryFallbackStore.set(fullKey, encryptedVal);

    return keyRef;
  }

  static async getSecretServerOnly(
    tenantId: string,
    keyRef: string
  ): Promise<string | null> {
    const fullKey = `${tenantId}:${keyRef}`;
    const encryptedVal = memoryFallbackStore.get(fullKey);

    if (!encryptedVal) return null;

    try {
      return this.decrypt(encryptedVal);
    } catch {
      return null;
    }
  }

  static async storeOAuthTokens(
    tenantId: string,
    keyRef: string,
    tokens: OAuthTokenPayload
  ): Promise<string> {
    const jsonStr = JSON.stringify(tokens);
    return this.storeSecret(tenantId, keyRef, jsonStr);
  }

  static async getOAuthTokensServerOnly(
    tenantId: string,
    keyRef: string
  ): Promise<OAuthTokenPayload | null> {
    const raw = await this.getSecretServerOnly(tenantId, keyRef);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as OAuthTokenPayload;
    } catch {
      return null;
    }
  }

  static async checkStatus(
    tenantId: string,
    keyRef?: string | null
  ): Promise<'CONNECTED' | 'NOT_CONFIGURED'> {
    if (!keyRef) return 'NOT_CONFIGURED';
    const secret = await this.getSecretServerOnly(tenantId, keyRef);
    return secret ? 'CONNECTED' : 'NOT_CONFIGURED';
  }

  static sanitizePayload<T extends Record<string, unknown>>(payload: T): T {
    const sensitiveKeys = ['password', 'secret', 'apikey', 'token', 'privatekey', 'authheader', 'credential', 'accesstoken', 'refreshtoken'];
    const sanitized = { ...payload };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key as keyof T] = '[REDACTED]' as unknown as T[keyof T];
      }
    }
    return sanitized;
  }
}
