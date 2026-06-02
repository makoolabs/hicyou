'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github } from 'lucide-react'
import { Turnstile } from '@/components/turnstile'

// Simple inline SVG icons for Chinese OAuth providers
const WechatIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="#07C160">
    <path d="M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7.34 5.93C3.93 16.09 2 13.82 2 11.17 2 7.7 5.5 5 9.84 5c3.9 0 7.16 2.5 7.16 5.67 0 3.17-3.26 5.67-7.16 5.67-.62 0-1.22-.06-1.79-.17l-2.89.75.68-2.99zM17.5 13c2.76 0 5-1.79 5-4s-2.24-4-5-4c-.32 0-.63.03-.94.08C17.34 6.5 18 8.24 18 10.17c0 2.77-1.77 5.09-4.21 5.83.12.37.21.75.21 1.17 0 .34-.03.67-.08 1 .57-.05 1.11-.17 1.58-.17z"/>
  </svg>
);

const AlipayIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="#1677FF">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6.5h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm-7 4h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm7 3h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1z"/>
  </svg>
);

const FeishuIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="#3370FF">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

type OAuthProvider = 'github' | 'google' | 'wechat' | 'feishu' | 'alipay';

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [turnstileToken, setTurnstileToken] = useState('')
    const supabase = createClient()

    const handleLogin = async (provider: OAuthProvider) => {
        if (!turnstileToken) {
            setMessage('Please complete the security check')
            return
        }
        // Alipay requires Authing.cn or custom OAuth — Supabase doesn't natively support it
        if (provider === 'alipay') {
            setMessage('支付宝登录需通过 Authing.cn 配置。请访问 authing.cn 注册并配置支付宝OAuth。')
            return
        }
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                    queryParams: { captcha_token: turnstileToken },
                },
            })
            if (error) {
                // Graceful message for unconfigured providers
                if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
                    setMessage(`${provider} 登录尚未配置，请先设置 OAuth 应用`)
                } else {
                    setMessage(error.message)
                }
                setLoading(false)
            }
        } catch (err: any) {
            setMessage(err?.message || `无法使用 ${provider} 登录`)
            setLoading(false)
        }
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!turnstileToken) {
            setMessage('Please complete the security check')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
                captchaToken: turnstileToken,
            },
        })
        if (error) {
            setMessage(error.message)
        } else {
            setMessage('Check your email for the login link!')
        }
        setLoading(false)
    }

    const providers: { id: OAuthProvider; label: string; icon: React.ReactNode; section: 'intl' | 'cn' }[] = [
        { id: 'github', label: 'GitHub', icon: <Github className="mr-2 h-4 w-4" />, section: 'intl' },
        { id: 'google', label: 'Google', icon: <GoogleIcon />, section: 'intl' },
        { id: 'wechat', label: '微信', icon: <WechatIcon />, section: 'cn' },
        { id: 'alipay', label: '支付宝', icon: <AlipayIcon />, section: 'cn' },
        { id: 'feishu', label: '飞书', icon: <FeishuIcon />, section: 'cn' },
    ];

    const intlProviders = providers.filter(p => p.section === 'intl');
    const cnProviders = providers.filter(p => p.section === 'cn');

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        登录 / Sign in
                    </h2>
                </div>

                <div className="mt-8 space-y-6">
                    {/* International OAuth */}
                    <div className="grid grid-cols-2 gap-3">
                        {intlProviders.map(p => (
                            <Button
                                key={p.id}
                                variant="outline"
                                onClick={() => handleLogin(p.id)}
                                disabled={loading}
                            >
                                {p.icon}
                                {p.label}
                            </Button>
                        ))}
                    </div>

                    {/* Chinese OAuth */}
                    <div className="grid grid-cols-3 gap-3">
                        {cnProviders.map(p => (
                            <Button
                                key={p.id}
                                variant="outline"
                                onClick={() => handleLogin(p.id)}
                                disabled={loading}
                            >
                                {p.icon}
                                {p.label}
                            </Button>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                或使用邮箱 / Or email
                            </span>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleEmailLogin}>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="mt-2">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Turnstile
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                                onVerify={(token) => setTurnstileToken(token)}
                            />
                        </div>

                        <div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Sending...' : '发送验证码 / Send OTP'}
                            </Button>
                        </div>
                        {message && (
                            <p className="text-center text-sm text-red-500">{message}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
