// Simple high-speed local profanity and spam filter

const BAD_WORDS = [
  "spam", "scam", "phishing", "hack", "abuse", "slur", "hate", "kill",
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", "whore"
];

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export class ModerationService {
  /**
   * Cleans text by replacing profanity with asterisks
   */
  static filterProfanity(text: string): string {
    if (!text) return "";
    let cleaned = text;

    BAD_WORDS.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      cleaned = cleaned.replace(regex, "*".repeat(word.length));
    });

    return cleaned;
  }

  /**
   * Check if text contains profanity
   */
  static containsProfanity(text: string): boolean {
    if (!text) return false;
    return BAD_WORDS.some((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      return regex.test(text);
    });
  }

  /**
   * Rate limit check: allows max 6 messages per 5 seconds per user
   */
  static checkRateLimit(userId: string): { allowed: boolean; remainingSeconds?: number } {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId) || { count: 0, lastReset: now };

    if (now - userLimit.lastReset > 5000) {
      // Reset window
      userLimit.count = 1;
      userLimit.lastReset = now;
      rateLimitMap.set(userId, userLimit);
      return { allowed: true };
    }

    if (userLimit.count >= 6) {
      const remaining = Math.ceil((5000 - (now - userLimit.lastReset)) / 1000);
      return { allowed: false, remainingSeconds: remaining };
    }

    userLimit.count += 1;
    rateLimitMap.set(userId, userLimit);
    return { allowed: true };
  }
}
