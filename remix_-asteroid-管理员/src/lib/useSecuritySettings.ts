import { useCallback, useEffect, useRef, useState } from 'react';
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

const ENDPOINT = `${API_BASE}/settings/security`;

export function useSecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);    // 首次加载
  const [saving, setSaving] = useState(false);     // 保存中
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // 拉取设置；initial=true 显示主 loading，刷新时不闪
  const load = useCallback(async (initial = false, signal?: AbortSignal) => {
    if (initial) setLoading(true);
    try {
      const res = await fetch(ENDPOINT, { credentials: 'include', signal });
      if (!res.ok) throw new Error(`加载失败（${res.status}）`);
      const data: SecuritySettings = await res.json();
      if (mountedRef.current) { setSettings(data); setError(null); }
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') return;
      if (mountedRef.current) setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      if (initial && mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    load(true, ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  // 保存普通安全状态（不含密钥）
  const save = useCallback(async (patch: Partial<SecuritySettings>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`保存失败（${res.status}）`);
      await load();            // 刷新，不闪主 loading
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : '保存失败');
      throw e;                 // 让调用方也能感知失败
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [load]);

  // 单独写入密钥：只发不收，服务端加密存储
  const saveSsoSecret = useCallback(async (clientSecret: string) => {
    if (!clientSecret) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${ENDPOINT}/sso-secret`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clientSecret }),
      });
      if (!res.ok) throw new Error(`密钥保存失败（${res.status}）`);
      await load();
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : '密钥保存失败');
      throw e;
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  return { settings, loading, saving, error, save, saveSsoSecret, refresh };
}
