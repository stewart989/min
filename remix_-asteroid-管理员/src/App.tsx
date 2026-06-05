/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  HelpCircle, 
  Search, 
  User, 
  Menu, 
  X,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ActiveTab } from './types';

// Component imports
import Sidebar from './components/Sidebar';
import OverviewTab from './components/OverviewTab';
import SettingsTab from './components/SettingsTab';
import CloudTab from './components/CloudTab';
import DebugTab from './components/DebugTab';
import PluginsTab from './components/PluginsTab';
import IntegrationsTab from './components/IntegrationsTab';
import ApiKeysTab from './components/ApiKeysTab';
import MembersTab from './components/MembersTab';
import UsageTab from './components/UsageTab';
import BillingTab from './components/BillingTab';
import CheckoutTab from './components/CheckoutTab';
import AgentWorkspace from './components/AgentWorkspace';
import VoiceController from './components/VoiceController';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [userEmail, setUserEmail] = useState('architect@asteroid.sh');
  const [password, setPassword] = useState('');
  
  // --- SSO Interactive States ---
  const [loginMode, setLoginMode] = useState<'standard' | 'sso'>('standard');
  const [ssoDomain, setSsoDomain] = useState('asteroid.sh');
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoStep, setSsoStep] = useState<'initializing' | 'redirecting' | 'verifying' | 'completed' | ''>('');
  
  // Default to Agent Mode on active session
  const [isAgentMode, setIsAgentMode] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'enterprise'>(() => {
    return (localStorage.getItem('asteroid-plan') as 'free' | 'pro' | 'enterprise') || 'free';
  });

  useEffect(() => {
    localStorage.setItem('asteroid-plan', currentPlan);
  }, [currentPlan]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'stripe'>('card');
  
  // Dynamic visual style theme state
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('asteroid-appearance') as 'system' | 'light' | 'dark') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (theme: 'light' | 'dark') => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (appearance === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(appearance);
    }
  }, [appearance]);

  const handleAppearanceChange = (value: 'system' | 'light' | 'dark') => {
    setAppearance(value);
    localStorage.setItem('asteroid-appearance', value);
  };

  // Floating Mobile Menus trigger
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications Toast State
  const [notification, setNotification] = useState<{
    id: number;
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setNotification({ id, message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const triggerSsoOAuth = (domain: string) => {
    const isSsoEnabled = localStorage.getItem('asteroid-sso-enabled') === 'true';
    if (!isSsoEnabled) {
      showNotification(`域名 ${domain} 暂未启用企业单点登录 (SSO)。请使用传统邮箱和密码登录。`, 'error');
      return;
    }

    const provider = localStorage.getItem('asteroid-sso-provider') || 'okta';
    const providerName = provider === 'okta' ? 'Okta Enterprise Suite' :
                         provider === 'entra' ? 'Microsoft Entra ID' :
                         provider === 'google' ? 'Google Workspace IAM' : 'OpenID Connect Issuer';

    setSsoLoading(true);
    setSsoStep('initializing');
    
    // Staggered interactive stages for professional authenticity
    setTimeout(() => {
      setSsoStep('redirecting');
      showNotification(`正在重定向安全认证握手包至 ${providerName}...`, 'info');
    }, 700);

    setTimeout(() => {
      setSsoStep('verifying');
      showNotification(`正在解算 SSO 授权令牌证书并同步组织成员权限...`, 'info');
    }, 1800);

    setTimeout(() => {
      setSsoStep('completed');
      setLoggedIn(true);
      setSsoLoading(false);
      setUserEmail(`architect@${domain}`);
      showNotification(`🎉 SSO 联合认证成功！已接入三方凭证 [${providerName}] 并成功初始化工作区状态。`, 'success');
    }, 3000);
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain || !ssoDomain.includes('.')) {
      showNotification('请输入合法的企业校验域名 (例如 asteroid.sh)！', 'error');
      return;
    }
    triggerSsoOAuth(ssoDomain);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.includes('@')) {
      showNotification('请输入合法的邮箱账户格式！', 'error');
      return;
    }

    const isSsoEnabled = localStorage.getItem('asteroid-sso-enabled') === 'true';
    const isSsoEnforced = localStorage.getItem('asteroid-sso-enforced') === 'true';
    const emailDomain = userEmail.split('@')[1];

    if (isSsoEnabled && isSsoEnforced && emailDomain === 'asteroid.sh') {
      showNotification('🔒 组织安全审计：该域名强制单点登录，正在自动为您定向至 SSO 密钥通道...', 'info');
      setLoginMode('sso');
      setSsoDomain(emailDomain);
      // Wait a moment then trigger SSO OAuth simulation
      setTimeout(() => {
        triggerSsoOAuth(emailDomain);
      }, 500);
      return;
    }

    setLoggedIn(true);
    showNotification('授权通过！您已成功登录 AsteroidRouter 控制台。', 'success');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setLoginMode('standard');
    showNotification('您已成功安全地注销退出。', 'info');
  };

  // Switch rendered tabs dynamically
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            currentPlan={currentPlan} 
            setPlan={(p) => {
              setCurrentPlan(p);
              if (p === 'pro') {
                showNotification('计划升级成功！您的组织已被升级至 PRO 专业版体系。', 'success');
              }
            }} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        );
      case 'settings':
        return (
          <SettingsTab 
            onLogout={handleLogout} 
            onShowNotification={showNotification} 
            appearance={appearance}
            onChangeAppearance={handleAppearanceChange}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
          />
        );
      case 'cloud':
        return (
          <CloudTab 
            currentPlan={currentPlan} 
            setPlan={(p) => {
              setCurrentPlan(p);
              if (p === 'pro') showNotification('云端专业版代理特权已解锁！', 'success');
            }} 
            onShowNotification={showNotification} 
          />
        );
      case 'debug':
        return <DebugTab onShowNotification={showNotification} />;
      case 'plugins':
        return <PluginsTab onShowNotification={showNotification} />;
      case 'integrations':
        return <IntegrationsTab onShowNotification={showNotification} />;
      case 'api-keys':
        return <ApiKeysTab onShowNotification={showNotification} />;
      case 'members':
        return <MembersTab onShowNotification={showNotification} userEmail={userEmail} />;
      case 'usage':
        return <UsageTab onShowNotification={showNotification} />;
      case 'billing':
        return (
          <BillingTab 
            onShowNotification={showNotification} 
            paymentMethod={paymentMethod}
            userEmail={userEmail}
            onNavigate={(tab) => setActiveTab(tab as any)}
          />
        );
      case 'checkout':
        return (
          <CheckoutTab 
            currentPlan={currentPlan} 
            setPlan={(p) => {
              setCurrentPlan(p);
              if (p === 'pro') {
                showNotification('已接受账单绑定，本月专业版订阅激活成功！', 'success');
              } else {
                showNotification('计划已重构为免费计划。', 'info');
              }
            }} 
            onShowNotification={showNotification} 
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        );
      default:
        return (
          <div className="p-8 text-center bg-white rounded border border-[#EAEAE8]">
            尚未实现的模块。
          </div>
        );
    }
  };

  // Convert tab slug to human label
  const getTabLabel = (tab: ActiveTab): string => {
    const mappings: Record<ActiveTab, string> = {
      overview: '基本概述（首页）',
      settings: '个人与系统设置',
      cloud: '云端代理配置',
      debug: '调试编译沙箱',
      plugins: '系统附加插件',
      integrations: '第三方开发集成',
      'api-keys': '系统 API 密钥',
      members: '协作组织席位',
      usage: '服务资源用量统计',
      billing: '月度支出流水明细',
      checkout: '账单结账明细'
    };
    return mappings[tab] || '未注册状态';
  };

  if (!loggedIn) {
    /* Visual Masterpiece Login Portal (Strictly respects design system specs) */
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract glowing node shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-stone-700 rounded-full blur-[180px] opacity-20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-800 rounded-full blur-[180px] opacity-15 pointer-events-none" />
        
        {/* Toast Warning banner if active */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 bg-[#161616] p-4 rounded-lg border border-[#2F3130] flex items-center gap-3 shadow-2xl">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-[#2DE1C2]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-xs text-stone-200 font-sans">{notification.message}</span>
          </div>
        )}

        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded bg-white text-black flex items-center justify-center font-sans font-bold text-2xl mx-auto shadow-md">
              A
            </div>
            <h2 className="text-2xl font-sans font-semibold tracking-tight text-white">
              登录 AsteroidRouter 控制台
            </h2>
            <p className="text-xs font-sans text-stone-400">
              请选择登录凭据以读取并载入您的小组工作区
            </p>
          </div>

          {/* Login tab bar indicators */}
          {(!ssoLoading) && (
            <div className="grid grid-cols-2 bg-[#161616] p-1 rounded-lg border border-[#2F3130] text-xs">
              <button
                type="button"
                onClick={() => setLoginMode('standard')}
                className={`py-1.5 rounded font-medium transition-colors cursor-pointer text-center ${
                  loginMode === 'standard' ? 'bg-[#2de1c2] text-black font-semibold font-sans text-[11px]' : 'text-stone-400 hover:text-white font-sans text-[11px]'
                }`}
              >
                常规账号密码
              </button>
              <button
                type="button"
                onClick={() => {
                  const isSsoEnabled = localStorage.getItem('asteroid-sso-enabled') === 'true';
                  if (!isSsoEnabled) {
                    showNotification('⚠️ 尚未有托管域名在此工作区激活 SSO。请先一键订购启用后配置联合秘钥。', 'info');
                  }
                  setLoginMode('sso');
                }}
                className={`py-1.5 rounded font-medium transition-colors cursor-pointer text-center ${
                  loginMode === 'sso' ? 'bg-[#2de1c2] text-black font-semibold font-sans text-[11px]' : 'text-stone-400 hover:text-white font-sans text-[11px]'
                }`}
              >
                企业 SSO 单点登录
              </button>
            </div>
          )}

          {ssoLoading ? (
            /* Immersive high fidelity Identity Federation Handshake loading screen */
            <div className="p-6 bg-[#161616] border border-[#2F3130] rounded-lg text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-505 rounded-full blur-[40px] opacity-20 pointer-events-none" />
              
              <div className="flex justify-center items-center py-2">
                <div className="relative flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
                  <div className="absolute inset-x-0 inset-y-0 m-auto h-4 w-4 rounded-full bg-[#2de1c2] animate-ping" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest block">
                  SECURE Federated Link IAM
                </span>
                <h4 className="text-sm font-semibold text-white font-sans">正在向三方受信域发起联络...</h4>
              </div>

              {/* Redirection steps indicator */}
              <div className="text-left space-y-1.5 bg-black/60 p-3 rounded border border-[#232524] font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-stone-300">
                  <span className={ssoStep === 'initializing' || ssoStep === 'redirecting' || ssoStep === 'verifying' || ssoStep === 'completed' ? 'text-[#2de1c2]' : 'text-stone-600'}>●</span>
                  <span>初始化 SSO 协议握手...</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300">
                  <span className={ssoStep === 'redirecting' || ssoStep === 'verifying' || ssoStep === 'completed' ? 'text-[#2de1c2]' : 'text-stone-600'}>●</span>
                  <span>正在重定向加密受信证书包...</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300">
                  <span className={ssoStep === 'verifying' || ssoStep === 'completed' ? 'text-[#2de1c2]' : 'text-stone-600'}>●</span>
                  <span>验证信任链签署并解算 LDAP/SCIM 席位...</span>
                </div>
              </div>
            </div>
          ) : loginMode === 'standard' ? (
            /* Standard Email Password login form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1 font-sans">
                    邮箱账户 (Email Address)
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#161616] border border-[#2F3130] rounded focus:outline-none focus:ring-1 focus:ring-[#2DE1C2] text-xs font-mono font-medium text-white placeholder-stone-600"
                    placeholder="architect@asteroid.sh"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1 font-sans">
                    登录密码 (Access Credentials)
                  </label>
                  <input
                    type="password"
                    required={!(localStorage.getItem('asteroid-sso-enabled') === 'true' && localStorage.getItem('asteroid-sso-enforced') === 'true' && userEmail.endsWith('@asteroid.sh'))}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#161616] border border-[#2F3130] rounded focus:outline-none focus:ring-1 focus:ring-[#2DE1C2] text-xs font-mono text-white placeholder-stone-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#2DE1C2] text-black hover:bg-white text-xs font-sans font-bold transition-all shadow-md cursor-pointer text-center"
                >
                  验证授权并登入
                </button>
              </div>

              {localStorage.getItem('asteroid-sso-enabled') === 'true' && (
                <div className="pt-1.5 text-center">
                  <span className="text-[10px] text-stone-500 font-sans">
                    或者：您的组织已开通 SSO 联动？
                    <button
                      type="button"
                      onClick={() => setLoginMode('sso')}
                      className="text-indigo-400 hover:underline inline ml-1 font-semibold"
                    >
                      使用组织 SSO 登录 &rarr;
                    </button>
                  </span>
                </div>
              )}
            </form>
          ) : (
            /* Federated Enterprise SSO Auth form */
            <form onSubmit={handleSsoSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1 font-sans">
                    组织专用验证域 (Enterprise Domain)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={ssoDomain}
                      onChange={(e) => setSsoDomain(e.target.value)}
                      className="w-full pl-3 pr-20 py-2.5 bg-[#161616] border border-[#2F3130] rounded focus:outline-none focus:ring-1 focus:ring-[#2DE1C2] text-xs font-mono font-medium text-white placeholder-stone-600"
                      placeholder="asteroid.sh"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-indigo-950 text-indigo-400 border border-indigo-900/40 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase">
                      SSO Link
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed font-sans text-left">
                    填写由组织管理员分发的身份域。我们将根据您填写的域名自动加载在 AsteroidRouter 注册好的安全合规 SSO 服务中心。
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#2DE1C2] text-black hover:bg-white text-xs font-sans font-bold transition-all shadow-md cursor-pointer text-center"
                >
                  对接单点登录身份中心
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setLoginMode('standard')}
                  className="text-stone-400 hover:text-white hover:underline text-[10px] font-sans"
                >
                  &larr; 返回使用传统密码账户验证
                </button>
              </div>
            </form>
          )}

          {/* Quick simulation helper options */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-stone-500 font-sans">
              * 协作组织预览账期。输入任何合法的沙箱账户即可安全连接。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAgentMode) {
    return (
      <AgentWorkspace 
        onShowNotification={showNotification}
        userEmail={userEmail}
        currentPlan={currentPlan}
        onNavigateToConsole={(tab) => {
          setIsAgentMode(false);
          if (tab) {
            setActiveTab(tab as any);
          }
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-on-surface flex font-sans antialiased">
      {/* 1. Sidebar Panel (Hidden in mobile, rendered natively in desktop) */}
      <div className="hidden lg:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }} 
          currentPlan={currentPlan}
          onLogout={handleLogout}
          userEmail={userEmail}
          onReturnToAgent={() => setIsAgentMode(true)}
        />
      </div>

      {/* 2. Floating Mobile Sidebar Menu Overlay if triggered */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Blackout mask overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-40" 
          />
          
          <div className="relative w-60 h-full z-50">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }} 
              currentPlan={currentPlan}
              onLogout={handleLogout}
              userEmail={userEmail}
              onReturnToAgent={() => setIsAgentMode(true)}
            />
            {/* Quick close button on edge */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 -right-12 p-2 bg-white rounded border border-[#EAEAE8]"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace Layout */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen relative">
        
        {/* Floating self-dismissing Notifications Toast banner */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 p-4 rounded-lg border flex items-center gap-3 shadow-xl max-w-sm bg-white border-[#EAEAE8] text-brand-on-surface fade-in">
            {notification.type === 'success' && (
              <div id="toast-success-badge" className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            )}
            {notification.type === 'info' && (
              <div id="toast-info-badge" className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Info className="w-3.5 h-3.5" />
              </div>
            )}
            {notification.type === 'error' && (
              <div id="toast-error-badge" className="w-5 h-5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-xs font-sans font-medium">{notification.message}</span>
          </div>
        )}

        {/* Top Header Navigation bar */}
        <header className="h-13 border-b border-[#EAEAE8] bg-white bg-opacity-80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile menu list burger action */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-md hover:bg-neutral-100 lg:hidden text-brand-on-surface"
              title="打开侧栏"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-outline font-sans">
              <span className="text-brand-on-surface font-sans">{getTabLabel(activeTab)}</span>
            </div>
          </div>

          {/* Right Header items */}
          <div id="header-user-triggers" className="flex items-center gap-3">
            <VoiceController 
              onNavigate={(tab) => setActiveTab(tab)}
              onLogout={handleLogout}
              showNotification={showNotification}
            />
            
            <button 
              onClick={() => showNotification('暂无未读系统通告，切片系统监控保持最高运行效率！', 'info')}
              className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors text-brand-outline hover:text-black relative"
              title="系统通告"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute top-1 right-1 w-1.2 h-1.2 bg-[#2DE1C2] rounded-full ring-2 ring-white" />
            </button>

            <button 
              onClick={() => showNotification('正在跳转知识库系统指南，请稍候...', 'info')}
              className="p-1.5 rounded-full hover:bg-neutral-50 transition-colors text-brand-outline hover:text-black"
              title="帮助库中心"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Quick checkout tab switch badge */}
            {currentPlan !== 'pro' && (
              <button
                onClick={() => setActiveTab('checkout')}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 bg-opacity-10 text-amber-700 hover:bg-opacity-20 text-[10px] font-sans font-bold rounded-full transition-all uppercase"
              >
                <Sparkles className="w-2.5 h-2.5" />
                试用专业版
              </button>
            )}

            <div className="h-4 w-px bg-[#EAEAE8]" />

            {/* Micro layout Monogram profile circle avatar */}
            <div 
              onClick={() => setActiveTab('settings')}
              className="w-7 h-7 rounded-full bg-brand-surface-container border border-[#EAEAE8] flex items-center justify-center font-sans font-bold text-[11px] text-brand-on-surface cursor-pointer select-none ring-2 ring-transparent hover:ring-brand-outline hover:ring-opacity-45 transition-all"
              title="个人资料与系统设置"
            >
              {userEmail.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* 4. Core Dynamic Panels Container with custom breathing margins */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-5xl mx-auto w-full">
            {renderActiveTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
