import { useEffect, useState, useCallback } from 'react';
import { API_BASE } from './config';

export interface SecuritySettings {
  is2FaEnabled: boolean;
  ssoEnabled: boolean;
  ssoEnforced: boolean;
  ssoProvider: string;
  ssoIssuer: string;
  ssoClientId: string;
  ssoClientSecretSet: boolean;   // 只回传"是否已配置"，绝不回传明文
}

export function useSecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/settings/security`, { credentials: 'include' });
    setSettings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // 保存普通安全状态（不含密钥）
  const save = useCallback(async (patch: Partial<SecuritySettings>) => {
    const res = await fetch(`${API_BASE}/settings/security`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('保存失败');
    await load();
  }, [load]);

  // 单独写入密钥：只发不收，服务端加密存储
  const saveSsoSecret = useCallback(async (clientSecret: string) => {
    const res = await fetch(`${API_BASE}/settings/security/sso-secret`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ clientSecret }),
    });
    if (!res.ok) throw new Error('密钥保存失败');
    await load();
  }, [load]);

  return { settings, loading, save, saveSsoSecret };
}
