/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Trash2, 
  AlertTriangle,
  Monitor,
  Check,
  ShieldCheck,
  Sun,
  Moon,
  Code,
  Mail,
  Lock,
  Key,
  QrCode,
  Copy,
  RefreshCw,
  Globe,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveSession } from '../types';

interface SettingsTabProps {
  onLogout: () => void;
  onShowNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  appearance: 'system' | 'light' | 'dark';
  onChangeAppearance: (val: 'system' | 'light' | 'dark') => void;
  userEmail?: string;
  setUserEmail?: (val: string) => void;
}

export default function SettingsTab({ 
  onLogout, 
  onShowNotification, 
  appearance, 
  onChangeAppearance,
  userEmail = 'architect@asteroid.sh',
  setUserEmail
}: SettingsTabProps) {
  const [prPlatform, setPrPlatform] = useState<'github' | 'gitlab' | 'vscode'>('github');
  const [notifyOnDeployFail, setNotifyOnDeployFail] = useState(() => localStorage.getItem('asteroid-notify-deploy-fail') === 'true');

  // --- Email Binding ---
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState(userEmail);

  // --- Phone Binding ---
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [phone, setPhone] = useState(() => localStorage.getItem('asteroid-phone') || '');
  const [newPhone, setNewPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // --- 2FA Authentication ---
  const [show2FaSetup, setShow2FaSetup] = useState(false);
  const [is2FaEnabled, setIs2FaEnabled] = useState(() => localStorage.getItem('asteroid-2fa-enabled') === 'true');
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // --- Enterprise SSO / Identity Provider Configuration ---
  const [ssoEnabled, setSsoEnabled] = useState(() => localStorage.getItem('asteroid-sso-enabled') === 'true');
  const [ssoProvider, setSsoProvider] = useState(() => localStorage.getItem('asteroid-sso-provider') || 'okta');
  const [ssoIssuer, setSsoIssuer] = useState(() => localStorage.getItem('asteroid-sso-issuer') || 'https://asteroid-corp.okta.com/oauth2/default');
  const [ssoClientId, setSsoClientId] = useState(() => localStorage.getItem('asteroid-sso-client-id') || '0oa8v3y1m9kKxyz');
  const [ssoClientSecret, setSsoClientSecret] = useState(() => localStorage.getItem('asteroid-sso-client-secret') || 'sb_sec_0oa8v3y1m9kKxyz77291a');
  const [ssoEnforced, setSsoEnforced] = useState(() => localStorage.getItem('asteroid-sso-enforced') === 'true');
  const ssoRedirectUri = 'https://asteroid.sh/api/auth/sso/callback';

  const triggerSmsCountdown = () => {
    if (!newPhone || !/^\+?[1-9]\d{1,14}$/.test(newPhone.replace(/[\s-]/g, ''))) {
      onShowNotification('请先输入有效的手机号码。', 'error');
      return;
    }
    setCountdown(60);
    onShowNotification('验证码发送成功！默认演示验证码为 123456', 'success');
  };

  React.useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      onShowNotification('请输入有效的电子邮件地址。', 'error');
      return;
    }
    if (setUserEmail) {
      setUserEmail(newEmail);
    }
    setShowEmailEdit(false);
    onShowNotification(`主账号支付与联系邮箱已更改为: ${newEmail}`, 'success');
  };

  const handleUpdatePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone) {
      onShowNotification('请输入手机号码。', 'error');
      return;
    }
    if (phoneCode !== '123456' && phoneCode !== '888888') {
      onShowNotification('短信验证码不正确。示范验证码为 123456 或 888888', 'error');
      return;
    }
    localStorage.setItem('asteroid-phone', newPhone);
    setPhone(newPhone);
    setShowPhoneEdit(false);
    setNewPhone('');
    setPhoneCode('');
    onShowNotification('安全辅助手机号码绑定成功！', 'success');
  };

  const handleUnbindPhone = () => {
    if (window.confirm('您确定要解绑当前的辅助手机号吗？这会降低账号安全性。')) {
      localStorage.removeItem('asteroid-phone');
      setPhone('');
      onShowNotification('辅助手机号码已成功解绑。', 'info');
    }
  };

  const handleVerifyAndEnable2Fa = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode !== '123456' && totpCode !== '888888') {
      onShowNotification('MFA 安全验证码校验失败。请使用 123456 进行验证绑定！', 'error');
      return;
    }
    localStorage.setItem('asteroid-2fa-enabled', 'true');
    setIs2FaEnabled(true);
    setShow2FaSetup(false);
    setTotpCode('');

    // Generate simulated recovery security backup list
    const generated: string[] = Array.from({ length: 8 }, () => {
      const seg1 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      const seg2 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      return `${seg1}-${seg2}`;
    });
    setBackupCodes(generated);
    setShowBackupCodes(true);
    onShowNotification('🎉 双因子身份校验 (2FA - TOTP) 启用成功！请备份应急恢复密钥。', 'success');
  };

  const handleDisable2Fa = () => {
    if (window.confirm('停用 2FA 会降低您的账户安全性，您确定要关闭吗？')) {
      localStorage.removeItem('asteroid-2fa-enabled');
      setIs2FaEnabled(false);
      setShowBackupCodes(false);
      onShowNotification('双因子身份验证已成功关闭。', 'info');
    }
  };

  // Manage active sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess1',
      device: '网页端会话',
      subText: 'Chrome · macOS',
      createdTime: '约 13 小时前',
      isCurrent: true
    },
    {
      id: 'sess2',
      device: '移动端 App',
      subText: 'iPhone 15 Pro · iOS',
      createdTime: '3 天前',
      isCurrent: false
    }
  ]);

  const handleRevokeSession = (id: string, name: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    onShowNotification(`已成功撤销 "${name}" 的授权会话`, 'success');
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-8 fade-in">
      {/* Settings Header */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          设置
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          管理您的个人账户偏好和安全会话。
        </p>
      </div>

      {/* Notifications Settings */}
      <section className="bg-white rounded-lg border border-[#EAEAE8] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
              通知与告警
            </h3>
            <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
              管理系统在特定事件发生时如何向您发出提醒。
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs font-sans text-brand-on-surface mr-4">部署失败时通过 Toast 弹窗通知</span>
              <div
                onClick={() => {
                  const currentNotify = localStorage.getItem('asteroid-notify-deploy-fail') === 'true';
                  const nextVal = !currentNotify;
                  localStorage.setItem('asteroid-notify-deploy-fail', String(nextVal));
                  onShowNotification(nextVal ? '已开启部署失败 Toast 告警功能' : '已关闭部署失败告警', 'info');
                  // Trigger a re-render by using a local state if needed, but for now we expect page refresh or props.
                  // Since we are in SettingsTab, we can use a local state.
                  setNotifyOnDeployFail(nextVal);
                }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  localStorage.getItem('asteroid-notify-deploy-fail') === 'true' ? 'bg-[#2DE1C2]' : 'bg-zinc-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localStorage.getItem('asteroid-notify-deploy-fail') === 'true' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Appearance Settings */}
      <section className="bg-white rounded-lg border border-[#EAEAE8] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3F4F3]">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
              外观设置
            </h3>
            <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
              选择应用程序的视觉呈现方式，您可以选择手动切换或根据系统设置自动调整。
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-lg border border-[#EAEAE8] w-full sm:w-auto h-fit">
            <button
              type="button"
              onClick={() => {
                onChangeAppearance('light');
                onShowNotification('外观主题已被更改为: 浅色模式', 'info');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                appearance === 'light'
                  ? 'bg-brand-surface-lowest text-neutral-900 border border-neutral-200 shadow-sm font-semibold'
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>浅色</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeAppearance('dark');
                onShowNotification('外观主题已被更改为: 深色模式', 'info');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                appearance === 'dark'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm font-semibold'
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>深色</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeAppearance('system');
                onShowNotification('外观主题已被更改为: 跟随系统', 'info');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                appearance === 'system'
                  ? 'bg-brand-surface-lowest dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-sm font-semibold'
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-brand-outline shrink-0" />
              <span>系统</span>
            </button>
          </div>
        </div>

        {/* PR Settings */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
              PR 偏好
            </h3>
            <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
              配置处理 Pull Request 时的默认目标平台或本地编辑器。
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-brand-surface-low rounded-lg border border-[#EAEAE8] w-full sm:w-auto h-fit">
            <button
              type="button"
              onClick={() => {
                setPrPlatform('github');
                onShowNotification('PR 默认目标已更新为: GitHub', 'info');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                prPlatform === 'github'
                  ? 'bg-brand-surface-lowest dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-sm font-semibold'
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPrPlatform('gitlab');
                onShowNotification('PR 默认目标已更新为: GitLab', 'info');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                prPlatform === 'gitlab'
                  ? 'bg-brand-surface-lowest dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-sm font-semibold'
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span>GitLab</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPrPlatform('vscode');
                onShowNotification('PR 默认目标已更新为: VS Code (Local)', 'info');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                prPlatform === 'vscode'
                  ? 'bg-brand-surface-lowest dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-sm font-semibold'
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Code className="w-3 h-3 text-brand-outline" />
              <span>VS Code</span>
            </button>
          </div>
        </div>
      </section>

      {/* Account Security Bindings (邮箱, 2FA, 辅助手机号) */}
      <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#EAEAE8] dark:border-zinc-800 bg-brand-surface-low dark:bg-zinc-900/50 bg-opacity-30">
          <h3 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            账户安全与高级身份校验 (Security & Multi-Factor Auth)
          </h3>
          <p className="text-xs font-sans text-brand-on-surface-variant mt-1.5">
            强化您和您团队的安全凭证，防范潜在的高风险自动化撞库和爆破劫持。
          </p>
        </div>

        <div className="divide-y divide-[#EAEAE8] dark:divide-zinc-800">
          {/* 1. 邮箱绑定 */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-sans font-semibold text-brand-on-surface">支付与联系邮箱</h4>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-205 dark:border-emerald-900/30 font-sans px-1.5 py-0.5 rounded font-bold">已启用</span>
                  </div>
                  <p className="text-xs font-sans text-brand-on-surface-variant">用于接收月度费用结算和紧急安全预警：<strong className="text-brand-on-surface">{userEmail}</strong></p>
                </div>
              </div>
              {!showEmailEdit && (
                <button
                  onClick={() => {
                    setNewEmail(userEmail);
                    setShowEmailEdit(true);
                  }}
                  className="px-3.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-medium bg-white dark:bg-zinc-950 hover:bg-neutral-50 dark:hover:bg-zinc-900 text-brand-on-surface active:bg-zinc-100 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  更换主要邮箱
                </button>
              )}
            </div>

            {/* Email Edit Panel */}
            {showEmailEdit && (
              <form onSubmit={handleUpdateEmail} className="mt-2 p-4 rounded-lg bg-[#fafafa] dark:bg-zinc-950/40 border border-[#EAEAE8] dark:border-zinc-800 space-y-3.5">
                <h5 className="text-xs font-semibold text-brand-on-surface">更换绑定主要邮箱地址</h5>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="请输入新的邮箱地址..."
                    className="flex-1 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-zinc-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded bg-black dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium cursor-pointer transition-colors"
                    >
                      验证并保存
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailEdit(false)}
                      className="px-3.5 py-2 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-brand-on-surface text-xs font-semibold bg-white dark:bg-zinc-950"
                    >
                      取消
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  * 提交保存后将即时在整个 Asteroid 协作套件仪表盘、月度发票推送、及事件告警端中同步生效。
                </p>
              </form>
            )}
          </div>

          {/* 2. 手机验证绑定 */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${phone ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400' : 'bg-zinc-50 dark:bg-zinc-950/40 text-zinc-400'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-sans font-semibold text-brand-on-surface">安全手机辅助验证</h4>
                    <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-bold border ${phone ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-250 dark:border-amber-900/30'}`}>
                      {phone ? '已绑定' : '未绑定 (警告级别：中)'}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-brand-on-surface-variant">
                    {phone 
                      ? `用于特权操作验证（如提取密码、重置安全令牌等）：+86 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`
                      : '还未绑定二次防撞库短信备用联系电话，极易在口令泄漏后被单方面限制。'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 self-start sm:self-auto">
                {phone ? (
                  <>
                    <button
                      onClick={() => {
                        setNewPhone('');
                        setPhoneCode('');
                        setShowPhoneEdit(true);
                      }}
                      className="px-3.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-medium bg-white dark:bg-zinc-950 hover:bg-neutral-50 dark:hover:bg-zinc-900 text-brand-on-surface cursor-pointer"
                    >
                      更换手机号
                    </button>
                    <button
                      onClick={handleUnbindPhone}
                      className="px-3.5 py-1.5 rounded border border-rose-200 dark:border-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium bg-rose-50/10 dark:bg-rose-950/10 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      解除绑定
                    </button>
                  </>
                ) : (
                  !showPhoneEdit && (
                    <button
                      onClick={() => {
                        setNewPhone('');
                        setPhoneCode('');
                        setShowPhoneEdit(true);
                      }}
                      className="px-3.5 py-1.5 rounded bg-black dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-sans font-medium hover:bg-opacity-95 shadow-sm shrink-0 cursor-pointer"
                    >
                      立即绑定手机
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Phone Edit Panel */}
            {showPhoneEdit && (
              <form onSubmit={handleUpdatePhone} className="mt-2 p-4 rounded-lg bg-[#fafafa] dark:bg-zinc-950/40 border border-[#EAEAE8] dark:border-zinc-800 space-y-4">
                <h5 className="text-xs font-semibold text-brand-on-surface">
                  {phone ? '更换绑定的安全手机号码' : '绑定一个新的安全辅助手机号'}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">国家/地区码 & 手机号</label>
                    <div className="flex gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-2 rounded text-xs border border-zinc-200 dark:border-zinc-800 bg-neutral-100 dark:bg-neutral-800 text-brand-on-surface select-none font-sans font-medium">+86</span>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="请输入11位中国大陆手机号码..."
                        maxLength={11}
                        className="flex-1 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">6位数字短信校验码</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="请输入验证码 (123456)..."
                        className="flex-1 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono tracking-widest text-center"
                      />
                      <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={triggerSmsCountdown}
                        className={`px-3 py-2 rounded text-xs font-semibold border shrink-0 transition-colors select-none ${
                          countdown > 0 
                            ? 'bg-zinc-100 dark:bg-neutral-800 text-zinc-400 dark:text-zinc-500 border-zinc-200/50 cursor-not-allowed'
                            : 'bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-brand-on-surface cursor-pointer'
                        }`}
                      >
                        {countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-black dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium cursor-pointer transition-colors"
                  >
                    验证绑定并启用
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPhoneEdit(false)}
                    className="px-4 py-2 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-brand-on-surface text-xs font-semibold bg-white dark:bg-zinc-950"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3. TOTP 二次验证 (2FA) */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${is2FaEnabled ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-500'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-sans font-semibold text-brand-on-surface">双因子安全身份验证 (Two-Factor 2FA)</h4>
                    <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-bold border ${is2FaEnabled ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/40'}`}>
                      {is2FaEnabled ? '已启用 - 极高保护' : '未启用 - 二级预警'}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
                    使用 Google Authenticator 或 Microsoft Authenticator 智能软件，登录时获取由加密哈希计算出的 6 位动态时间令牌保护账户。
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 self-start sm:self-auto shrink-0">
                {is2FaEnabled ? (
                  <button
                    onClick={handleDisable2Fa}
                    className="px-3.5 py-1.5 rounded border border-rose-200 dark:border-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium bg-rose-50/10 dark:bg-rose-950/10 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    停用双因子令牌
                  </button>
                ) : (
                  !show2FaSetup && (
                    <button
                      onClick={() => {
                        setTotpCode('');
                        setShow2FaSetup(true);
                      }}
                      className="px-3.5 py-1.5 rounded bg-black dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-sans font-medium transition-all duration-150 shrink-0 cursor-pointer shadow-sm"
                    >
                      启用 TOTP MFA 令牌
                    </button>
                  )
                )}
              </div>
            </div>

            {/* TOTP Enable Interactive Wizard Panel */}
            {show2FaSetup && (
              <div className="mt-2 p-5 rounded-lg bg-[#fafafa] dark:bg-zinc-950/40 border border-[#EAEAE8] dark:border-zinc-800 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  
                  {/* Step 1: scan QR */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-805 bg-white dark:bg-zinc-900 p-4 rounded-lg">
                    <span className="text-[9px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-brand-outline-variant px-1.5 py-0.5 rounded mb-3">STEP 1: 扫描加密二维码</span>
                    {/* Mock elegant vector QR code */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 border border-zinc-150 dark:border-zinc-800 bg-white rounded flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-zinc-900" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-amber-500 mt-1 select-all font-semibold">AST3-ROID-MFA4-2026</span>
                    </div>
                  </div>

                  {/* Step 2: verify 2Fa TOTP input */}
                  <div className="md:col-span-8 space-y-4">
                    <span className="text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded select-none">STEP 2: 双重鉴权绑定确认</span>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
                        请使用您的 Authenticator 应用程序扫描左侧的密钥二维码，如果无法扫描，您可以直接手动在该软件中输入密钥串: <strong className="font-mono text-[11px] text-teal-600 dark:text-teal-400 bg-zinc-100 dark:bg-zinc-950 px-1.5 py-0.5 rounded select-all ml-1">AST3-ROID-MFA4-2026</strong>。
                      </p>
                      <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
                        当系统绑定时间成功扣合后，软件会每 30 秒递演并生成一个一次性验证口令，请将其输入于下方。
                      </p>
                    </div>

                    <form onSubmit={handleVerifyAndEnable2Fa} className="flex flex-col sm:flex-row items-end gap-3.5 pt-1.5">
                      <div className="flex-1 w-full space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">6位 Authenticator 身份验证码 (演示请输入 123456)</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="请输入口令 (例如 123456)..."
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-zinc-400 font-mono tracking-widest text-center"
                        />
                      </div>
                      <div className="flex gap-2 shrink-0 self-stretch sm:self-auto items-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded bg-black dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium cursor-pointer transition-colors"
                        >
                          核算并开启 2FA
                        </button>
                        <button
                          type="button"
                          onClick={() => setShow2FaSetup(false)}
                          className="px-4 py-2 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-brand-on-surface text-xs font-semibold bg-white dark:bg-zinc-950"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Custom emergency backup recover keys banner block */}
            {showBackupCodes && backupCodes.length > 0 && (
              <div className="mt-3 p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-lg space-y-3.5 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4.5 h-4.5 text-emerald-555 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">🚨 备份恢复密钥 (Emergency Recovery Backup Codes)</h5>
                    <p className="text-[10px] text-emerald-700/85 dark:text-emerald-400 mt-0.5 leading-relaxed">
                      如果您临时丢失了绑定的手机或验证应用已被卸载，您可以使用这些唯一的代码替代 TOTP 验证直接登录并重新设置 2FA。代码一旦使用即刻废弃，请下载并妥善保管：
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-zinc-950 border border-dashed border-emerald-300 dark:border-emerald-900/40 p-2.5 rounded font-mono text-center text-xs text-brand-on-surface select-all">
                  {backupCodes.map((c, i) => (
                    <span key={i} className="bg-neutral-50 dark:bg-zinc-900 py-1 rounded border border-zinc-100 dark:border-zinc-800 tracking-wide font-semibold text-zinc-700 dark:text-zinc-300">{c}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodes.join('\n'));
                      onShowNotification('8个紧急恢复密钥已成功复制到剪贴板！', 'success');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer select-none"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    一键复制所有密钥
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBackupCodes(false)}
                    className="px-3 py-1.5 text-[10px] font-sans font-semibold border border-emerald-250 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded transition-all select-none cursor-pointer"
                  >
                    我已安全存储，关闭通知
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Active Sessions */}
      <section className="bg-white rounded-lg border border-[#EAEAE8] overflow-hidden">
        <div className="p-6 border-b border-[#EAEAE8] bg-brand-surface-low bg-opacity-30">
          <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
            活跃会话
          </h3>
          <p className="text-xs font-sans text-brand-on-surface-variant mt-1">
            这些是当前已登录您账户的设备。您可以撤销任何不熟悉的会话。
          </p>
        </div>

        <div className="divide-y divide-[#EAEAE8]">
          <AnimatePresence initial={false}>
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-brand-outline text-xs font-sans">
                没有发现活跃的会话连接。
              </div>
            ) : (
              sessions.map((sess) => (
                <motion.div 
                  key={sess.id}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-surface-container flex items-center justify-center text-brand-on-surface-variant shrink-0">
                      {sess.id === 'sess1' ? (
                        <Monitor className="w-4 h-4 text-brand-outline" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-brand-outline" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-sans font-medium text-brand-on-surface">
                          {sess.device}
                        </h4>
                        {sess.isCurrent && (
                          <span className="text-[10px] bg-brand-primary text-brand-on-primary font-sans px-1.5 py-0.5 rounded">
                            当前会话
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-sans text-brand-on-surface-variant mt-0.5 font-sans">
                        {sess.subText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-sans text-brand-outline truncate hidden sm:inline-block">
                      {sess.createdTime}
                    </span>
                    <button
                      onClick={() => handleRevokeSession(sess.id, sess.device)}
                      className="px-3 py-1.5 rounded border border-[#EAEAE8] bg-white hover:bg-red-50 hover:text-brand-error hover:border-red-200 text-xs font-sans font-medium transition-colors cursor-pointer"
                    >
                      撤销
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-brand-surface-low bg-opacity-40 border-t border-[#EAEAE8] text-[11px] text-brand-outline font-sans">
          会话撤销最长可能需要 10 分钟才能完成
        </div>
      </section>

      {/* Enterprise SSO & Identity Providers */}
      <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#EAEAE8] dark:border-zinc-800 bg-brand-surface-low dark:bg-zinc-900/50 bg-opacity-30">
          <h3 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-indigo-505 dark:text-indigo-400" />
            企业级单点登录与 OAuth 身份提供商 (SAML 2.0 / OIDC)
          </h3>
          <p className="text-xs font-sans text-brand-on-surface-variant mt-1.5">
            配置企业单一登录凭信服务提供商 (IdP)，让团队成员使用企业统一账户安全登录而无需维护独立密码。
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* SSO Enable Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-brand-on-surface">启用企业域 SSO 联动</h4>
              <p className="text-xs text-brand-on-surface-variant">启用后，登录流程将提供 SSO 身份接入方式。</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextVal = !ssoEnabled;
                  setSsoEnabled(nextVal);
                  localStorage.setItem('asteroid-sso-enabled', nextVal ? 'true' : 'false');
                  onShowNotification(nextVal ? '已成功开启企业域 SSO 服务状态' : '已暂停企业域 SSO 联合接入', nextVal ? 'success' : 'info');
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  ssoEnabled ? 'bg-[#2DE1C2]' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    ssoEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className={ssoEnabled ? 'space-y-5 opacity-100 transition-all duration-300' : 'space-y-5 opacity-40 saturate-50 pointer-events-none transition-all duration-300'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identity Provider Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">身份服务提供商类型 (IdP Brand)</label>
                <select
                  value={ssoProvider}
                  disabled={!ssoEnabled}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSsoProvider(val);
                    localStorage.setItem('asteroid-sso-provider', val);
                    if (val === 'okta') {
                      setSsoIssuer('https://asteroid-corp.okta.com/oauth2/default');
                    } else if (val === 'entra') {
                      setSsoIssuer('https://login.microsoftonline.com/your-tenant-uuid/v2.0');
                    } else if (val === 'google') {
                      setSsoIssuer('https://accounts.google.com');
                    } else {
                      setSsoIssuer('https://iam.yourdomain.com/oauth/authorize');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer font-medium"
                >
                  <option value="okta">Okta Enterprise Suite</option>
                  <option value="entra">Microsoft Entra ID (Azure AD)</option>
                  <option value="google">Google Workspace IAM</option>
                  <option value="generic">Generic OpenID Connect (OIDC)</option>
                </select>
              </div>

              {/* Endpoint Issuer URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">发行方 URI (Issuer / Authority Host)</label>
                <input
                  type="text"
                  disabled={!ssoEnabled}
                  value={ssoIssuer}
                  onChange={(e) => {
                    setSsoIssuer(e.target.value);
                    localStorage.setItem('asteroid-sso-issuer', e.target.value);
                  }}
                  placeholder="https://identity.yourcorp.com"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              {/* Client ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">应用程序客户端标识 (Client ID / Entity ID)</label>
                <input
                  type="text"
                  disabled={!ssoEnabled}
                  value={ssoClientId}
                  onChange={(e) => {
                    setSsoClientId(e.target.value);
                    localStorage.setItem('asteroid-sso-client-id', e.target.value);
                  }}
                  placeholder="client-id-uuid-string"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono"
                />
              </div>

              {/* Client Secret */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">客户端安全密钥 (Client Secret)</label>
                <input
                  type="password"
                  disabled={!ssoEnabled}
                  value={ssoClientSecret}
                  onChange={(e) => {
                    setSsoClientSecret(e.target.value);
                    localStorage.setItem('asteroid-sso-client-secret', e.target.value);
                  }}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono"
                />
              </div>
            </div>

            {/* Redirect URI display */}
            <div className="p-3 bg-neutral-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider block font-sans">回调重定向 URI / Redirect Callback URL</span>
              <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                <span className="truncate select-all">{ssoRedirectUri}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ssoRedirectUri);
                    onShowNotification('SSO 重定向回调链接已成功复制至剪贴板！请配置在您的 IdP 重定向白名单中。', 'success');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-sans font-semibold shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制
                </button>
              </div>
            </div>

            {/* Force SSO Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="space-y-0.5 max-w-xl text-left">
                <h5 className="text-xs font-semibold text-brand-on-surface flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  强制 SSO 验证登录 (Enforce SSO for Domain)
                </h5>
                <p className="text-[11px] text-brand-on-surface-variant font-sans leading-relaxed">
                  非管理员账号在输入匹配后缀的邮箱（如 @asteroid.sh）时，系统强制重定向至 SSO，禁止传统密码登录。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!ssoEnabled}
                  onClick={() => {
                    const nextVal = !ssoEnforced;
                    setSsoEnforced(nextVal);
                    localStorage.setItem('asteroid-sso-enforced', nextVal ? 'true' : 'false');
                    onShowNotification(nextVal ? '🔒 域名强制单点登录规则已生效' : '⚠️ 已允许账号回落使用常规密码和OTP登录', nextVal ? 'success' : 'info');
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    ssoEnforced ? 'bg-amber-600' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      ssoEnforced ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with testing actions */}
        <div className="px-6 py-4 bg-brand-surface-low dark:bg-zinc-950/60 border-t border-[#EAEAE8] dark:border-zinc-800 flex items-center justify-between gap-4">
          <p className="text-[11px] text-brand-outline font-sans">
            * 仅具有安全管理权限的账号席位可配置上述 SSO 安全合规项。
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!ssoEnabled}
              onClick={() => {
                onShowNotification(`[SSO Debug] 正在与 ${ssoProvider.toUpperCase()} 联合信任中心发起 OIDC 试连尝试...`, 'info');
                setTimeout(() => {
                  onShowNotification(`🎉 联合连接试连通过！成功握手机密密钥并匹配客户端 ID. 握手延迟：62ms.`, 'success');
                }, 1000);
              }}
              className={`px-3 py-1.5 rounded border text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950 cursor-pointer flex items-center gap-1.5 ${
                ssoEnabled ? 'text-brand-on-surface border-zinc-200 dark:border-zinc-800' : 'text-zinc-400 border-zinc-100 dark:border-zinc-900 pointer-events-none'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              测试 IdP 握手
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('asteroid-sso-enabled', ssoEnabled ? 'true' : 'false');
                localStorage.setItem('asteroid-sso-provider', ssoProvider);
                localStorage.setItem('asteroid-sso-issuer', ssoIssuer);
                localStorage.setItem('asteroid-sso-client-id', ssoClientId);
                localStorage.setItem('asteroid-sso-client-secret', ssoClientSecret);
                localStorage.setItem('asteroid-sso-enforced', ssoEnforced ? 'true' : 'false');
                onShowNotification('🎉 身份凭信 SSO 及服务提供方配置更新已成功保存并立即上线生效！', 'success');
              }}
              className="px-3.5 py-1.5 rounded bg-black dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              保存 SSO 配置
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="border border-red-200 dark:border-red-900/40 rounded-lg bg-red-50/10 dark:bg-red-950/20 overflow-hidden">
        <div className="p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/35">
          <h3 className="text-sm font-sans font-semibold text-brand-error flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            危险区域
          </h3>
        </div>

        <div className="divide-y divide-red-100/60 dark:divide-red-900/30">
          {/* Logout Section */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-sans font-medium text-brand-on-surface">
                退出登录
              </h4>
              <p className="text-xs font-sans text-brand-on-surface-variant font-sans">
                从此设备安全注销您的账户。
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded border border-[#EAEAE8] bg-white hover:bg-zinc-100 text-xs font-sans font-medium text-brand-on-surface self-start sm:self-auto transition-colors cursor-pointer"
            >
              退出登录
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-sans font-medium text-brand-error">
                删除账户
              </h4>
              <p className="text-xs font-sans text-brand-on-surface-variant font-sans">
                永久删除您的账户及其关联的所有数据。此操作无法撤销。
              </p>
            </div>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded bg-brand-error hover:bg-red-700 text-xs font-sans font-medium text-white self-start sm:self-auto transition-colors cursor-pointer"
              >
                删除
              </button>
            ) : (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded border border-[#EAEAE8] bg-white text-xs font-sans font-medium hover:bg-zinc-100"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onShowNotification('系统拒绝了该危险请求: 在模拟预览盘中禁止删除开发者账户。', 'info');
                  }}
                  className="px-3 py-1.5 rounded bg-brand-error text-white font-semibold text-xs hover:bg-red-800"
                >
                  确认删除
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
