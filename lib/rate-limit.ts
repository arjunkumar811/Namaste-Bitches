/**
 * A simple in-memory Rate Limiter.
 * Note: This is designed for single-node environments.
 * For horizontally scaled environments, this should be replaced with Redis (e.g. Upstash).
 */
export class RateLimiter {
  private cache = new Map<string, { count: number; expiresAt: number }>();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  public check(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const record = this.cache.get(identifier);

    // Clean up expired items sporadically to prevent memory leak
    if (this.cache.size > 1000) {
      this.cache.forEach((val, key) => {
        if (now > val.expiresAt) this.cache.delete(key);
      });
    }

    if (record) {
      if (now > record.expiresAt) {
        this.cache.set(identifier, { count: 1, expiresAt: now + this.windowMs });
        return { success: true, remaining: this.maxRequests - 1 };
      }

      if (record.count >= this.maxRequests) {
        return { success: false, remaining: 0 };
      }

      record.count += 1;
      return { success: true, remaining: this.maxRequests - record.count };
    }

    this.cache.set(identifier, { count: 1, expiresAt: now + this.windowMs });
    return { success: true, remaining: this.maxRequests - 1 };
  }
}
