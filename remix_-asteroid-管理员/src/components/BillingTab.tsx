/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  ArrowUpRight, 
  CheckCircle2, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Search,
  Globe
} from 'lucide-react';
import { BillingItem } from '../types';

interface BillingAuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  amount?: string;
  status: 'success' | 'warning' | 'info';
  ip: string;
}

interface BillingTabProps {
  onShowNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  paymentMethod?: 'card' | 'paypal' | 'stripe';
  userEmail?: string;
  onNavigate?: (tab: string) => void;
}

export default function BillingTab({ 
  onShowNotification, 
  paymentMethod = 'card', 
  userEmail = 'architect@asteroid.sh',
  onNavigate
}: BillingTabProps) {
  const [balancePaid, setBalancePaid] = useState(false);
  const [billingAuthorized, setBillingAuthorized] = useState(() => {
    return localStorage.getItem('asteroid-billing-auth') !== 'false';
  });

  const [ssoActive, setSsoActive] = useState(() => {
    return localStorage.getItem('asteroid-sso-enabled') === 'true';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [auditLogs, setAuditLogs] = useState<BillingAuditLog[]>([
    {
      id: 'tx-1004',
      timestamp: '2026-06-01 09:22:15',
      operator: userEmail,
      action: '授权变更',
      details: '管理员重新签署了自动月度账期的双向安全代扣代缴验证。',
      status: 'success',
      amount: '-',
      ip: '103.24.108.91'
    },
    {
      id: 'tx-1003',
      timestamp: '2026-05-15 14:30:00',
      operator: userEmail,
      action: '手动提前结算',
      details: '通过绑定的 VISA 信用卡 (**** 4890) 手动结清本月截至目前的账单费用。',
      status: 'success',
      amount: '$128.50',
      ip: '103.24.108.91'
    },
    {
      id: 'tx-1002',
      timestamp: '2026-05-01 00:00:02',
      operator: 'system@asteroid.sh',
      action: '自动分账扣款',
      details: '自动账单结算划转：INV-2026-004 已由账户代扣代缴扣费成功。',
      status: 'success',
      amount: '$85.30',
      ip: '10.244.3.11'
    },
    {
      id: 'tx-1001',
      timestamp: '2026-04-18 11:24:05',
      operator: userEmail,
      action: '扣款失败警报',
      details: '自动账单尝试扣费失败：绑定的信用卡超额或被拦截拒绝，已被挂起。',
      status: 'warning',
      amount: '$85.30',
      ip: '103.24.108.91'
    }
  ]);

  // Grouped cost items in current month
  const spendBreakdown: BillingItem[] = [
    { type: 'GPT-4 Turbo Input', currency: 'USD', costPerUnit: '$0.01 / 1K tokens', quantity: 4500000, total: '45.00' },
    { type: 'GPT-4 Turbo Output', currency: 'USD', costPerUnit: '$0.03 / 1K tokens', quantity: 2200000, total: '66.00' },
    { type: 'Embedding Ada-002', currency: 'USD', costPerUnit: '$0.0001 / 1K tokens', quantity: 175000000, total: '17.50' },
  ];

  const previousInvoices = [
    { id: 'INV-2026-004', date: '2026年4月1日', amount: '$85.30', card: 'VISA **** 4890', status: '已支付' },
    { id: 'INV-2026-003', date: '2026年3月1日', amount: '$112.10', card: 'VISA **** 4890', status: '已支付' },
    { id: 'INV-2026-002', date: '2026年2月1日', amount: '$42.60', card: 'VISA **** 4890', status: '已支付' },
  ];

  const totalSpendVal = balancePaid ? '0.00' : '128.50';

  const handlePayBalance = () => {
    setBalancePaid(true);
    const payMethodName = paymentMethod === 'paypal' ? 'PayPal 账户' : paymentMethod === 'stripe' ? 'Stripe 智能网关' : 'VISA 信用卡';
    onShowNotification(`账单已通过绑定的 ${payMethodName} 安全进行结算缴纳！谢谢！`, 'success');

    // Add audit log dynamically
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: BillingAuditLog = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: nowStr,
      operator: userEmail,
      action: '手动提前结算',
      details: `通过绑定的 ${payMethodName} 安全提前付缴结清本账月产生的累积支出账单。金额：$128.50`,
      status: 'success',
      amount: '$128.50',
      ip: '103.24.108.91'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleDownloadInvoice = (id: string) => {
    onShowNotification(`账单收据 ${id} 的 PDF 正在生成，导出任务已派发完毕。`, 'success');
  };

  const handleActivateSSO = () => {
    setSsoActive(true);
    localStorage.setItem('asteroid-sso-enabled', 'true');
    onShowNotification('🎉 企业单点登录与目录同步扩展包已成功订购激活！您当前可在【设置】面板中接入身份提供商 (IdP)。', 'success');

    // Add audit log dynamically
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: BillingAuditLog = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: nowStr,
      operator: userEmail,
      action: '服务配置变动',
      details: '企业级认证服务变更：成功付款购买并订阅 Enterprise SSO (单点登录) 身份联合附加套件 ($249/mo)。',
      status: 'success',
      amount: '$249.00',
      ip: '103.24.108.91'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleDeactivateSSO = () => {
    if (window.confirm('您确定要取消企业 SSO 订阅吗？这会立刻停用现存的 IdP 联合接入，普通成员将不被允许通过单点登录域接入。')) {
      setSsoActive(false);
      localStorage.setItem('asteroid-sso-enabled', 'false');
      onShowNotification('企业单点登录 (SSO) 与目录服务附加包已成功取消购买与授权服务。', 'info');

      // Add audit log dynamically
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newLog: BillingAuditLog = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        timestamp: nowStr,
        operator: userEmail,
        action: '服务退订变更',
        details: '企业级认证服务变更：退订企业级认证 SSO 身份附加套件 ($249/mo)，注销目录托管自动同步权限。',
        status: 'warning',
        amount: '-$249.00',
        ip: '103.24.108.91'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  return (
    <div className="space-y-8 fade-in text-brand-on-surface">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          支出
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1">
          监控您当前的计费项目用量余额以及历史付款列表。
        </p>
      </div>

      {/* Hero card showing accrued balance */}
      <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DE1C2] rounded-full blur-[60px] opacity-10 pointer-events-none" />

        <div className="space-y-2 relative z-10 w-full md:max-w-xl">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-outline">
            本账期当前已产生支出 (2026年5月)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-sans font-bold text-brand-on-surface tabular-nums">
              ${totalSpendVal}
            </span>
            <span className="text-[14px] text-brand-on-surface-variant font-sans font-medium">
              USD
            </span>
          </div>
          {billingAuthorized ? (
            <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
              本月累积支出将在下个结算日期 (2026年6月1日) 自动通过绑定的 {
                paymentMethod === 'paypal' ? 'PayPal 账户' :
                paymentMethod === 'stripe' ? 'Stripe 智能网关' :
                'VISA 信用卡'
              } 进行自动安全结算。自动月度扣款授权已被激活。
            </p>
          ) : (
            <p className="text-xs font-sans text-rose-500 font-medium leading-relaxed bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30 p-2.5 rounded-md flex items-center gap-1.5 mt-1.5">
              ⚠️ 付款授权已撤销 / 关闭：由于自动结算已手动关闭，本月累积支出无法在结算日自动扣款。请在到期前手动结清账单，或下方重新启用授权。
            </p>
          )}
        </div>

        {!balancePaid ? (
          <button
            onClick={handlePayBalance}
            className="px-5 py-2.5 rounded bg-black dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-sans font-medium shrink-0 shadow-sm transition-colors cursor-pointer"
          >
            提前手动缴清
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#00705f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-xs font-sans font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            无需缴费（账单已结清）
          </div>
        )}
      </section>

      {/* Cost breakdowns grouped into modern table list */}
      <section className="bg-white dark:bg-zinc-900 rounded-lg border border-[#EAEAE8] dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#EAEAE8] dark:border-zinc-800 bg-brand-surface-low dark:bg-zinc-900/50 bg-opacity-30">
          <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
            模型消费细目汇总 (MTD)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[#EAEAE8] dark:border-zinc-800 bg-brand-surface-low dark:bg-zinc-950 bg-opacity-10 text-[11px] font-sans font-semibold tracking-wider text-brand-outline">
                <th className="p-4 pl-6">服务分类 / 接口模型</th>
                <th className="p-4">结算单位单价</th>
                <th className="p-4 text-right">消费词块额度 (Volume)</th>
                <th className="p-4 text-right pr-6">结算小计 (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAE8] dark:divide-zinc-800">
              {spendBreakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors text-xs font-sans">
                  <td className="p-4 pl-6 font-medium text-brand-on-surface flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-brand-outline" />
                    {item.type}
                  </td>
                  <td className="p-4 text-brand-on-surface-variant font-sans">{item.costPerUnit}</td>
                  <td className="p-4 text-right text-brand-on-surface font-mono font-medium">{item.quantity.toLocaleString()}</td>
                  <td className="p-4 text-right pr-6 font-semibold text-brand-on-surface tabular-nums">${item.total}</td>
                </tr>
              ))}
              <tr className="bg-brand-surface-low dark:bg-zinc-950/60 bg-opacity-30 border-t border-[#EAEAE8] dark:border-zinc-800 text-xs font-sans">
                <td colSpan={3} className="p-4 pl-6 text-right font-sans font-semibold text-brand-on-surface-variant">
                  合计支出:
                </td>
                <td className="p-4 text-right pr-6 font-bold text-brand-primary text-sm tabular-nums">
                  ${totalSpendVal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Enterprise Security & SSO Add-on Package */}
      <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[70px] opacity-10 pointer-events-none" />
        
        <div className="space-y-2 relative z-10 w-full md:max-w-3xl text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/30">
              安全与目录集成扩展包 (Security & SCIM Directory Add-on)
            </span>
            {ssoActive ? (
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-905 px-2 py-0.5 rounded font-bold">
                已成功激活 (Active)
              </span>
            ) : (
              <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-905 px-2 py-0.5 rounded font-bold">
                未启用 (Inactive)
              </span>
            )}
          </div>
          
          <h3 className="text-base font-sans font-semibold text-brand-on-surface">企业级单点登录 & 身份联动套件 (Enterprise SSO Suite)</h3>
          <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
            支持一键对接 Okta, Microsoft Entra ID (Azure AD), Google Workspace 或 任何标准 OIDC / SAML 身份凭据发行中心。包含专属的 SCIM 协议自动同步用户、强制域全方位 SSO 验证登录防护，订阅附加费用为 <strong className="text-brand-on-surface font-semibold">$249 / 月</strong>。
          </p>
        </div>

        <div className="relative z-10 shrink-0 self-start md:self-auto flex gap-2">
          {!ssoActive ? (
            <button
              onClick={handleActivateSSO}
              className="px-4.5 py-2.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-semibold cursor-pointer shadow-sm transition-colors whitespace-nowrap"
            >
              一键订阅并激活 SSO
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('settings');
                    onShowNotification('已自动为您切换至设置面板中的 SSO 服务商配置区。', 'info');
                  } else {
                    onShowNotification('请在左侧侧边栏切换至【设置】页面以配置 OAuth 密钥。', 'info');
                  }
                }}
                className="px-3.5 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950 text-brand-on-surface cursor-pointer whitespace-nowrap"
              >
                配置身份提供商 (IdP)
              </button>
              <button
                onClick={handleDeactivateSSO}
                className="px-3 py-2 rounded border border-rose-200 dark:border-rose-950 text-rose-650 dark:text-rose-400 text-xs font-medium bg-rose-50/10 dark:bg-rose-95/15 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer whitespace-nowrap"
              >
                取消订阅
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Payment methods and invoices panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visa Cards details */}
        <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-outline" />
              当前付款方式
            </h3>

            {paymentMethod === 'paypal' ? (
              <div className={`border rounded p-4 text-white relative shadow-sm overflow-hidden min-h-[140px] flex flex-col justify-between transition-all ${
                billingAuthorized 
                  ? 'border-[#0070ba]/30 bg-gradient-to-br from-[#003087] to-[#0070ba]' 
                  : 'border-zinc-650 bg-neutral-700 opacity-80'
              }`}>
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white opacity-15 rounded-full blur-xl" />
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs uppercase font-bold text-sky-200 tracking-wider">PayPal Express Link</p>
                    <p className="text-[10px] text-sky-100/75 font-sans">Primary Payment Account</p>
                  </div>
                  <div className="bg-white/10 px-2.5 py-0.5 rounded text-[10px] font-sans font-bold text-white tracking-wider">
                    PAYPAL
                  </div>
                </div>
                <div>
                  <p className="text-sm font-sans tracking-tight text-white font-semibold">architect@asteroid.sh</p>
                  <div className="flex justify-between pt-2 text-[10px] text-sky-200/90 font-sans">
                    <span className="font-bold flex items-center gap-1">
                      BILLING STATUS: {billingAuthorized ? 'ACTIVE' : 'REVOKED / SUSPENDED'}
                    </span>
                    <span>TYPE: VERIFIED BUSINESS</span>
                  </div>
                </div>
              </div>
            ) : paymentMethod === 'stripe' ? (
              <div className={`border rounded p-4 text-white relative shadow-sm overflow-hidden min-h-[140px] flex flex-col justify-between transition-all ${
                billingAuthorized 
                  ? 'border-[#635bff]/30 bg-[#635bff] dark:bg-indigo-950' 
                  : 'border-zinc-650 bg-neutral-700 opacity-80'
              }`}>
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white opacity-10 rounded-full blur-xl" />
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs uppercase font-semibold text-indigo-100 tracking-wider">Stripe Token Card</p>
                    <p className="text-[10px] text-zinc-300 font-sans">Primary Payment Method</p>
                  </div>
                  <div className="bg-white bg-opacity-20 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                    STRIPE
                  </div>
                </div>
                <div>
                  <p className="text-base font-mono tracking-widest text-zinc-100">•••• •••• •••• 4242</p>
                  <div className="flex justify-between pt-2 text-[10px] text-zinc-300 font-mono">
                    <span>EXPIRES: 12/28</span>
                    <span className="font-semibold text-indigo-200">
                      AUTH: {billingAuthorized ? 'ACTIVE' : 'REVOKED'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`border rounded p-4 text-white relative shadow-sm overflow-hidden min-h-[140px] flex flex-col justify-between transition-all ${
                billingAuthorized 
                  ? 'border-zinc-700 bg-[#1e1e1d]' 
                  : 'border-zinc-650 bg-neutral-700 opacity-80'
              }`}>
                {/* Card gloss decoration */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white opacity-5 rounded-full blur-xl" />
                
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs uppercase font-semibold text-teal-300 tracking-wider">Asteroid Core Card</p>
                    <p className="text-[10px] text-zinc-400 font-sans">Primary Payment Method</p>
                  </div>
                  <div className="bg-white bg-opacity-10 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                    VISA
                  </div>
                </div>

                <div>
                  <p className="text-base font-mono tracking-widest text-zinc-100">•••• •••• •••• 4890</p>
                  <div className="flex justify-between pt-2 text-[10px] text-zinc-400 font-mono">
                    <span>EXPIRES: 12/29</span>
                    <span className={billingAuthorized ? "text-teal-300 font-semibold" : "text-rose-450 font-bold"}>
                      AUTH: {billingAuthorized ? 'ACTIVE' : 'REVOKED / INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Authorization actions details container */}
            <div className="p-3.5 rounded-lg border border-dashed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-50/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-brand-on-surface flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${billingAuthorized ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  扣款授权：{billingAuthorized ? '已启用 (Authorized)' : '已撤销 (Revoked)'}
                </p>
                <p className="text-[10px] text-zinc-550 dark:text-zinc-400">
                  {billingAuthorized ? '自动签署，每月 1 日划扣。可一键撤销暂停，防止非预期自动续费扣款。' : '代缴通道已关闭，订阅届时将暂停。'}
                </p>
              </div>

              <button
                onClick={() => {
                  const transitionToAuthorized = !billingAuthorized;
                  if (billingAuthorized) {
                    setBillingAuthorized(false);
                    localStorage.setItem('asteroid-billing-auth', 'false');
                    onShowNotification('您的自动扣款签署与订阅续费授权已撤销成功！', 'info');
                  } else {
                    setBillingAuthorized(true);
                    localStorage.setItem('asteroid-billing-auth', 'true');
                    onShowNotification('您的自动扣款与订阅结算授权已成功启用！', 'success');
                  }

                  // Add audit log
                  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
                  const newLog: BillingAuditLog = {
                    id: `tx-${Date.now().toString().slice(-4)}`,
                    timestamp: nowStr,
                    operator: userEmail,
                    action: '授权变更',
                    details: transitionToAuthorized 
                      ? '用户重新签署了自动计费结算代扣代缴与付款授权。' 
                      : '用户已撤销/关闭对于该协作团队的多年度或月度自动代扣代缴授权。',
                    status: transitionToAuthorized ? 'success' : 'warning',
                    amount: '-',
                    ip: '103.24.108.91'
                  };
                  setAuditLogs(prev => [newLog, ...prev]);
                }}
                className={`px-3 py-1.5 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer shrink-0 ${
                  billingAuthorized 
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                }`}
              >
                {billingAuthorized ? '撤销授权 / 暂停自动扣款' : '重新启用授权'}
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => onShowNotification('该演示环境无法进行真实绑卡更换，如有问题请咨询销售团队。', 'info')}
              className="text-xs font-sans font-semibold text-brand-primary dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              更新借记卡/信用卡
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </section>

        {/* Previous billing history ledger list */}
        <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg p-6 overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-outline" />
              历史对账与收据
            </h3>

            <div className="space-y-2">
              {previousInvoices.map((inv) => (
                <div 
                  key={inv.id} 
                  onClick={() => handleDownloadInvoice(inv.id)}
                  className="flex items-center justify-between p-2.5 border border-zinc-100 dark:border-zinc-800 bg-[#fafafa]/50 dark:bg-zinc-950/40 rounded hover:bg-neutral-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-sans font-semibold text-brand-on-surface">{inv.id}</p>
                    <p className="text-[10px] font-sans text-brand-on-surface-variant">{inv.date} · {inv.card}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-brand-on-surface">{inv.amount}</span>
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/10 px-1.5 py-0.5 rounded font-medium">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 sm:mt-0">
            <p className="text-[11px] text-brand-outline font-sans">
              * 您所有历史数据账单收据均已按 PDF 格式打包，可直接登账申领发票。
            </p>
          </div>
        </section>
      </div>

      {/* Billing Audit Log section */}
      <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:px-6 border-b border-[#EAEAE8] dark:border-zinc-800 bg-brand-surface-low dark:bg-zinc-900/50 bg-opacity-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-brand-outline-variant" />
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline">
              财务审计与扣缴事件日志 (Billing Audit & Event Logs)
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索财务事件..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-[11px] border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-brand-outline font-medium w-full sm:w-44 font-sans"
              />
              <Search className="w-3 h-3 text-brand-outline absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-[11px] border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium cursor-pointer w-full sm:w-auto font-sans"
            >
              <option value="all">所有事件性质</option>
              <option value="success">正常交易/签署 (Success)</option>
              <option value="warning">财务异动/警报 (Warning)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAEAE8] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-950/40 text-[10px] font-sans font-bold text-brand-outline uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold w-[150px]">时间戳 (UTC)</th>
                <th className="py-2.5 px-4 font-semibold w-[180px]">经办账号 (Operator)</th>
                <th className="py-2.5 px-4 font-semibold w-[110px]">事件分类</th>
                <th className="py-2.5 px-4 font-semibold">详细审计消息内容</th>
                <th className="py-2.5 px-4 font-semibold w-[90px] text-right">变动额度</th>
                <th className="py-2.5 px-4 font-semibold w-[110px] text-right">来源 IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAE8] dark:divide-zinc-800">
              {auditLogs
                .filter(log => {
                  const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        log.operator.toLowerCase().includes(searchTerm.toLowerCase());
                  if (statusFilter === 'all') return matchesSearch;
                  return matchesSearch && log.status === statusFilter;
                })
                .length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-xs font-sans text-brand-outline">
                    未检索到符合过滤条件的支付与财务审计日志。
                  </td>
                </tr>
              ) : (
                auditLogs
                  .filter(log => {
                    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          log.operator.toLowerCase().includes(searchTerm.toLowerCase());
                    if (statusFilter === 'all') return matchesSearch;
                    return matchesSearch && log.status === statusFilter;
                  })
                  .map(log => {
                    let statusBadgeClass = '';
                    if (log.status === 'success') statusBadgeClass = 'bg-[#2DE1C2] bg-opacity-10 text-[#00705f] dark:text-[#2DE1C2] border-[#2DE1C2] border-opacity-30';
                    else if (log.status === 'warning') statusBadgeClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40';
                    else if (log.status === 'info') statusBadgeClass = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/40';
                    else statusBadgeClass = 'bg-neutral-50 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-zinc-700';

                    return (
                      <tr key={log.id} className="text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-zinc-800/20 font-sans">
                        <td className="py-2.5 px-4 font-mono text-[10px] text-brand-outline">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-4 text-brand-on-surface truncate max-w-[170px]" title={log.operator}>
                          {log.operator}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] border font-bold ${statusBadgeClass}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-brand-on-surface-variant font-medium leading-relaxed">
                          {log.details}
                        </td>
                        <td className={`py-2.5 px-4 text-right font-mono font-semibold text-[11px] ${log.amount && log.amount !== '-' && log.status === 'success' ? 'text-teal-600 dark:text-teal-400' : 'text-brand-on-surface'}`}>
                          {log.amount}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-brand-outline text-right">
                          {log.ip}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
