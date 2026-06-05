/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ArrowRight,
  Wallet,
  DollarSign,
  Zap
} from 'lucide-react';

interface CheckoutTabProps {
  currentPlan: 'free' | 'pro' | 'enterprise';
  setPlan: (plan: 'free' | 'pro' | 'enterprise') => void;
  onShowNotification: (message: string, type: 'success' | 'info') => void;
  paymentMethod: 'card' | 'paypal' | 'stripe';
  setPaymentMethod: (method: 'card' | 'paypal' | 'stripe') => void;
}

export default function CheckoutTab({ 
  currentPlan, 
  setPlan, 
  onShowNotification,
  paymentMethod,
  setPaymentMethod
}: CheckoutTabProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [stripeZip, setStripeZip] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setTimeout(() => {
      setPlan('pro');
      setLoading(false);
      if (paymentMethod === 'paypal') {
        onShowNotification('PayPal 授权绑定接收成功！已激活您的专业版计划权益。', 'success');
      } else if (paymentMethod === 'stripe') {
        onShowNotification('Stripe 支付网关签约验证成功！已激活您的专业版计划权益。', 'success');
      } else {
        onShowNotification('专业版计划订阅成功！已刷新您的计费主体身份。', 'success');
      }
    }, 1500);
  };

  const handleCancelSubscription = () => {
    setPlan('free');
    onShowNotification('您的专业版订阅计划已取消，将在下个账期结束后退回至免费计划。', 'info');
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          账单结账
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          管理并配置您的底层云代理与大模型代付通道。
        </p>
      </div>

      {currentPlan === 'pro' ? (
        /* Render upgraded confirmation block directly */
        <section className="bg-white border border-[#EAEAE8] rounded-lg p-8 space-y-6 max-w-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-sans font-semibold text-brand-on-surface">
              专业版计划服务已成功激活
            </h3>
            <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
              您当前已为本组织激活了专业版大模型开发代理。每月额度已自动填充至 1,000,000 Tokens 且拥有完全平等的自托管池扩展控制。
            </p>
          </div>

          <div className="p-4 rounded bg-brand-surface-low border border-[#EAEAE8] flex items-center justify-between text-xs font-sans font-medium text-brand-on-surface">
            <span className="flex items-center gap-1.5 text-brand-on-surface-variant">
              <Clock className="w-4 h-4 text-brand-outline" />
              周期计费：$15.00/月（{
                paymentMethod === 'paypal' ? 'PayPal 签约授权自动续期' :
                paymentMethod === 'stripe' ? 'Stripe 快捷授权项目代扣' :
                'VISA 信用卡自动续期'
              }）
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
              就绪中
            </span>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 rounded border border-red-200 text-brand-error text-xs font-sans font-medium hover:bg-red-50 hover:bg-opacity-30 transition-colors cursor-pointer"
            >
              取消我的专业版订阅
            </button>
          </div>
        </section>
      ) : (
        /* Checkout Invoice Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Billing Form (Span 7) */}
          <section className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-outline" />
                选择并配置您的支付媒介
              </h3>
              <p className="text-[11px] text-brand-on-surface-variant font-sans mt-0.5">
                支持 PayPal 及 Stripe 智能网关，付款完成后额度实时到账激活。
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 pb-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                    : 'border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 text-brand-on-surface hover:bg-neutral-50 dark:hover:bg-zinc-900'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1" />
                <span className="block text-xs font-semibold leading-tight">信用卡支付</span>
                <span className="block text-[9px] text-brand-on-surface-variant font-sans mt-0.5">VISA / DEBIT</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  paymentMethod === 'paypal'
                    ? 'border-sky-600 bg-sky-600 text-white font-semibold'
                    : 'border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 text-brand-on-surface hover:bg-neutral-50 dark:hover:bg-zinc-900'
                }`}
              >
                <Wallet className="w-4 h-4 mb-1 text-sky-500" />
                <span className="block text-xs font-semibold leading-tight">PayPal 支付</span>
                <span className="block text-[9px] text-brand-on-surface-variant font-sans mt-0.5">全球账户直结</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  paymentMethod === 'stripe'
                    ? 'border-indigo-600 bg-indigo-600 text-white font-semibold'
                    : 'border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 text-brand-on-surface hover:bg-neutral-50 dark:hover:bg-zinc-900'
                }`}
              >
                <Zap className="w-4 h-4 mb-1 text-indigo-500" />
                <span className="block text-xs font-semibold leading-tight">Stripe 支付</span>
                <span className="block text-[9px] text-brand-on-surface-variant font-sans mt-0.5">智能快捷通道</span>
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {paymentMethod === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                      持卡人姓名 (Name)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. DEV DEVELOPER"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                      信用卡卡号 (Card Number)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                      到期日 (Expiry Date)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                      安全码 (CVC)
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <div className="p-4 rounded bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed font-sans space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      PayPal Express 自动扣款授权
                    </div>
                    <p>
                      您当前正通过安全 PayPal 通道绑定组织支付扣款名额，确认无误后订阅将在每月第一天自动抵扣 15.00 USD。
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                      PayPal 账号邮箱 (PayPal Email Address)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your-paypal-account@email.com"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'stripe' && (
                <div className="space-y-4">
                  <div className="p-4 rounded bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed font-sans space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Stripe 统一聚合网关安全认证
                    </div>
                    <p>
                      Stripe 可将您保存在设备中的 Apple Pay、Google Pay 或信用卡一键关联。输入卡信息与账单组织邮区完成校验。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                        Stripe 信用卡卡号 (Stripe Secure Card Number)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                        到期日 (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="12/28"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                        账单邮编 (Zip Code / Postcode)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="94016"
                        value={stripeZip}
                        onChange={(e) => setStripeZip(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 font-sans font-semibold rounded text-xs bg-brand-primary text-brand-on-primary hover:bg-zinc-800 transition-colors cursor-pointer text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading
                  ? (paymentMethod === 'paypal' ? '正在连接 PayPal 口令...' : paymentMethod === 'stripe' ? '正在建立 Stripe 支付通道...' : '卡片授权中...')
                  : (paymentMethod === 'paypal' ? '使用 PayPal 验证 & 激活专业版' : paymentMethod === 'stripe' ? '通过 Stripe 支付 & 激活专业版' : '提交订阅信息 & 激活专业版')
                }
              </button>
            </form>
          </section>

          {/* Pricing Outline (Span 5) */}
          <section className="lg:col-span-5 bg-brand-surface-low bg-opacity-35 border border-[#EAEAE8] rounded-lg p-6 space-y-4">
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-secondary" />
              计划明细汇总
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-sans font-semibold text-brand-on-surface">Asteroid Router Professional</h4>
                  <p className="text-[10px] text-brand-on-surface-variant mt-0.5">面向个人及中小型团队的高吞吐核心宿主</p>
                </div>
                <span className="text-xs font-mono font-semibold text-brand-on-surface">$15.00/月</span>
              </div>

              <div className="h-px bg-[#EAEAE8]" />

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-sans text-brand-on-surface-variant flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  1,000,000 月度 Tokens
                </p>
                <p className="text-[11px] font-sans text-brand-on-surface-variant flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  10+ 预载大通用语言模型
                </p>
                <p className="text-[11px] font-sans text-brand-on-surface-variant flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  24x7 专属 SLA 企业可用率响应
                </p>
              </div>

              <div className="h-px bg-[#EAEAE8]" />

              <div className="flex justify-between text-xs font-sans font-semibold text-brand-on-surface">
                <span>总计：</span>
                <span>$15.00 / 月</span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-blue-50 dark:bg-blue-950/20 bg-opacity-40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-[10.5px] text-blue-800 dark:text-blue-300 leading-normal font-sans">
              <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
              银行级的 SSL 256 位加密信用卡数据。 我们对安全负责，绝不在 Asteroid 核心服务器上存储明文卡数据。
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
