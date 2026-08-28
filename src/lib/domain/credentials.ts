import { AppError } from './types';

const vaultStore = new Map<string, string>();

export class CredentialManager {
  static async storeSecret(
    tenantId: string,
    keyRef: string,
    secretValue: string
  ): Promise<string> {
    if (!tenantId || !keyRef || !secretValue) {
      throw new AppError('VALIDATION_ERROR', 'Invalid credential storage arguments');
    }
    const fullKey = `${tenantId}:${keyRef}`;
    vaultStore.set(fullKey, secretValue);
    return keyRef;
  }

  static async getSecretServerOnly(
    tenantId: string,
    keyRef: string
  ): Promise<string | null> {
    const fullKey = `${tenantId}:${keyRef}`;
    return vaultStore.get(fullKey) || null;
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
    const sensitiveKeys = ['password', 'secret', 'apikey', 'token', 'privatekey', 'authheader', 'credential'];
    const sanitized = { ...payload };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key as keyof T] = '[REDACTED]' as unknown as T[keyof T];
      }
    }
    return sanitized;
  }
}
