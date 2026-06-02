/**
 * CAPTCHA Verification — Multi-Provider Abstraction
 * Supports: Cloudflare Turnstile, Alibaba Cloud CAPTCHA (阿里云验证码)
 * Falls back gracefully when not configured
 */

type CaptchaProvider = "turnstile" | "aliyun" | "none";

function detectProvider(): CaptchaProvider {
  if (process.env.TURNSTILE_SECRET_KEY) return "turnstile";
  if (process.env.ALIYUN_CAPTCHA_SECRET) return "aliyun";
  return "none";
}

const provider = detectProvider();
const enabled = provider !== "none";

export function isCaptchaEnabled(): boolean {
  return enabled;
}

export function getCaptchaProvider(): CaptchaProvider {
  return provider;
}

// ---- Turnstile Verification ----
async function verifyTurnstile(token: string, ip?: string): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true };

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip) formData.append("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return { success: data.success, error: data["error-codes"]?.join(", ") };
}

// ---- Alibaba Cloud CAPTCHA Verification ----
async function verifyAliyun(token: string, ip?: string): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.ALIYUN_CAPTCHA_SECRET;
  const appKey = process.env.ALIYUN_CAPTCHA_APPKEY;
  if (!secret || !appKey) return { success: true };

  const res = await fetch("https://captcha.cn-shanghai.aliyuncs.com/VerifyIntelligentCaptcha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      AppKey: appKey,
      Secret: secret,
      Token: token,
      ...(ip ? { Ip: ip } : {}),
    }),
  });
  const data = await res.json();
  return { success: data.Code === 200, error: data.Message };
}

// ---- Main Verification ----
export async function verifyCaptcha(
  token: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  if (!enabled || !token) return { success: true };

  try {
    switch (provider) {
      case "turnstile":
        return await verifyTurnstile(token, ip);
      case "aliyun":
        return await verifyAliyun(token, ip);
      default:
        return { success: true };
    }
  } catch (e) {
    console.warn("CAPTCHA verification failed:", e);
    return { success: true }; // Fail open — don't block users due to CAPTCHA outage
  }
}

// Backward compatibility
export const isTurnstileEnabled = isCaptchaEnabled;
export async function verifyTurnstileLegacy(token: string, ip?: string) {
  return verifyCaptcha(token, ip);
}
    formData.append("secret", TURNSTILE_SECRET!);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

// Backward compatibility — legacy exports
export const isTurnstileEnabled = isCaptchaEnabled;
export async function verifyTurnstile(token: string, ip?: string) {
  return verifyCaptcha(token, ip);
}
