/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  HelpCircle,
  ToggleLeft,
  Computer,
  ChevronRight,
  ShieldAlert,
  Server,
  Sparkles,
  CheckCircle2,
  History,
  X,
  Copy,
  AlertCircle,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Deployment {
  id: string;
  version: string;
  status: 'deploying' | 'success' | 'failed';
  timestamp: string;
  logs?: string;
}

interface CloudTabProps {
  currentPlan: 'free' | 'pro' | 'enterprise';
  setPlan: (plan: 'free' | 'pro' | 'enterprise') => void;
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export default function CloudTab({ currentPlan, setPlan, onShowNotification }: CloudTabProps) {
  const [selfHosted, setSelfHosted] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [alertOnFailure, setAlertOnFailure] = useState(() => {
    const saved = localStorage.getItem('asteroid-notify-deploy-fail');
    return saved === null ? true : saved === 'true';
  });
  
  const [deployments, setDeployments] = useState<Deployment[]>([
    { id: 'dep-001', version: 'v1.2.4', status: 'success', timestamp: '2026-06-05 10:30' },
    { 
      id: 'dep-002', 
      version: 'v1.2.5', 
      status: 'failed', 
      timestamp: '2026-06-05 11:15', 
      logs: `[ERROR] 2026-06-05 11:15:01: Failed to resolve dependency '@google/genai'
[ERROR] 2026-06-05 11:15:02: Error: Cannot find module '@google/genai'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)
    at Function.Module._load (node:internal/modules/cjs/loader:778:27)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/usr/src/app/dist/server.cjs:1:164)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)` 
    },
    { id: 'dep-003', version: 'v1.2.6', status: 'deploying', timestamp: '12:05 发起' },
  ]);

  const handleNewDeployment = () => {
    const newId = `dep-${Math.floor(Math.random() * 900 + 100).toString()}`;
    const newVersion = `v1.2.${deployments.length + 4}`;
    const newDep: Deployment = {
      id: newId,
      version: newVersion,
      status: 'deploying',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' 发起',
    };

    setDeployments(prev => [newDep, ...prev]);
    onShowNotification(`正在为 ${newVersion} 启动云端冷启动构建流水线...`, 'info');

    // Simulate completion
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate
      setDeployments(prev => prev.map(d => {
        if (d.id === newId) {
          const status = isSuccess ? 'success' : 'failed';
          const logs = isSuccess ? undefined : `[ERROR] ${new Date().toISOString()}: Deployment failed during production bundle optimization.
[ERROR] Memory limit exceeded (1024MB).
[TRACE] node_modules/esbuild/lib/main.js:1606:10
[TRACE] node_modules/vite/dist/node/chunks/dep-Df0InpBy.js:45032:25`;
          
          if (!isSuccess && alertOnFailure) {
            onShowNotification(`⚠️ 部署 ${newVersion} 失败！检测到生产环境构建异常，请检查错误日志。`, 'info');
          } else if (isSuccess) {
            onShowNotification(`🎉 部署 ${newVersion} 已成功上线！流量已切换至新版本。`, 'success');
          }

          return { 
            ...d, 
            status, 
            timestamp: new Date().toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
            logs 
          };
        }
        return d;
      }));
    }, 4000);
  };

  const handleRetry = (id: string) => {
    onShowNotification(`正在重试部署 ${id}...`, 'info');
    setDeployments(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'deploying', timestamp: '正在重试...' } : d
    ));
    
    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'success', timestamp: '2026-06-05 12:20' } : d
      ));
      onShowNotification(`部署 ${id} 重试成功！已自动上线新生产实例。`, 'success');
    }, 2000);
  };

  const handleToggleSelfHosted = () => {
    setSelfHosted(!selfHosted);
    onShowNotification(
      !selfHosted 
        ? '已启用自托管资源池。您可以连接并在本地代理集群上分发任务。' 
        : '已禁用自托管资源池，目前回归 Asteroid 原生安全云端主机。', 
      'info'
    );
  };

  const openLogModal = (deployment: Deployment) => {
    setSelectedDeployment(deployment);
    setIsLogModalOpen(true);
  };

  const handleCopyLogs = (logs: string) => {
    navigator.clipboard.writeText(logs);
    onShowNotification('错误日志已成功复制到剪贴板。', 'success');
  };

  const handleConnectSource = () => {
    onShowNotification('正在跳转源控制连接，请选择对应的版本控制服务(GitHub/GitLab)...', 'success');
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          云代理
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          创建代理以异步方式编辑和运行代码。
        </p>
      </div>

      {/* Primary Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main connection panel (Span 7) */}
        <section className="bg-white rounded-lg border border-[#EAEAE8] p-6 lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="w-10 h-10 rounded-md bg-brand-surface-container flex items-center justify-center text-brand-on-surface">
              <Server className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-sans font-semibold text-brand-on-surface">
                连接您的开发环境
              </h3>
              <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
                云代理会将代码推送至您的远程服务器，并建立双向同步通道。支持实时代码热重载，无需手动上传，让远程开发体验如同本地般流畅。
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={handleConnectSource}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-[#EAEAE8] bg-white hover:bg-zinc-50 text-xs font-sans font-medium text-brand-on-surface transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                连接源控制
              </button>
              <button
                onClick={handleNewDeployment}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-black text-white hover:bg-zinc-800 text-xs font-sans font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                部署新版本
              </button>
              <button
                onClick={() => onShowNotification('演示视频加载中，请稍候...', 'info')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-[#EAEAE8] bg-white hover:bg-zinc-50 text-xs font-sans font-medium text-brand-on-surface transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-brand-outline" />
                查看演示视频
              </button>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#EAEAE8] flex items-center gap-3">
            {/* Mock logos */}
            <div className="flex -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] font-sans font-semibold">Git</span>
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-white border border-white flex items-center justify-center text-[9px] font-sans font-semibold">Sl</span>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white border border-white flex items-center justify-center text-[9px] font-sans font-semibold">Am</span>
            </div>
            <span className="text-[11px] text-brand-outline font-sans">
              兼容主流 Git 托管服务
            </span>
          </div>
        </section>

        {/* Right High Availability architecture Illustration (Span 5) */}
        <section className="bg-gradient-to-br from-zinc-900 to-black rounded-lg p-6 lg:col-span-5 text-white flex flex-col justify-between overflow-hidden relative min-h-[300px]">
          {/* Neon mesh grids in background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          
          {/* Isometric Server Tower Render (Premium custom SVG artwork mimicking Screenshot 3) */}
          <div className="w-full flex justify-center py-4 relative z-10">
            <svg viewBox="0 0 160 160" className="w-32 h-32 text-zinc-400">
              {/* Base Platform */}
              <polygon points="80,140 135,110 80,80 25,110" fill="#2d2d2c" stroke="#4a4a49" strokeWidth="1" />
              <polygon points="80,145 135,115 135,110 80,140" fill="#1f1f1e" />
              <polygon points="80,145 25,115 25,110 80,140" fill="#151514" />
              
              {/* Neon accent frame (Cyan `#2de1c2`) */}
              <polygon points="80,136 128,110 80,84 32,110" fill="none" stroke="#2de1c2" strokeWidth="1.5" strokeDasharray="3,1" opacity="0.8" />
              
              {/* Server Block 1 (Lowest) */}
              <g transform="translate(0, -10)">
                <polygon points="80,110 115,90 80,70 45,90" fill="#3a3a39" stroke="#5a5a59" strokeWidth="0.5" />
                <polygon points="80,122 115,102 115,90 80,110" fill="#2d2d2c" />
                <polygon points="80,122 45,102 45,90 80,110" fill="#1e1e1d" />
                {/* Console horizontal slots/lights */}
                <line x1="55" y1="100" x2="70" y2="108" stroke="#2de1c2" strokeWidth="1" />
                <circle cx="90" cy="98" r="1" fill="#2de1c2" />
                <circle cx="100" cy="93" r="1" fill="#e12d52" />
              </g>

              {/* Server Block 2 (Middle) */}
              <g transform="translate(0, -32)">
                <polygon points="80,110 115,90 80,70 45,90" fill="#3a3a39" stroke="#5a5a59" strokeWidth="0.5" />
                <polygon points="80,122 115,102 115,90 80,110" fill="#2d2d2c" />
                <polygon points="80,122 45,102 45,90 80,110" fill="#1e1e1d" />
                {/* Console slots */}
                <line x1="55" y1="100" x2="70" y2="108" stroke="#2de1c2" strokeWidth="1" />
                <circle cx="90" cy="98" r="1" fill="#2de1c2" />
                <circle cx="100" cy="93" r="1" fill="#2de1c2" />
              </g>

              {/* Server Block 3 (Top) */}
              <g transform="translate(0, -54)">
                <polygon points="80,110 115,90 80,70 45,90" fill="#4a4a49" stroke="#6a6a69" strokeWidth="0.5" />
                <polygon points="80,122 115,102 115,90 80,110" fill="#333332" />
                <polygon points="80,122 45,102 45,90 80,110" fill="#232322" />
                {/* Console slots */}
                <line x1="55" y1="100" x2="70" y2="108" stroke="#55fbdb" strokeWidth="1" />
                <circle cx="90" cy="98" r="1" fill="#2de1c2" />
                <circle cx="100" cy="93" r="1" fill="#e12d52" />
              </g>
              
              {/* Top server lid glowing icon */}
              <circle cx="80" cy="30" r="1.5" fill="#2de1c2" opacity="0.9" />
            </svg>
          </div>

          <div className="space-y-1 relative z-10 pt-2">
            <h4 className="text-xs font-sans font-semibold tracking-wider uppercase text-brand-outline-variant flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2DE1C2]" />
              高可用性架构
            </h4>
            <p className="text-xs font-sans text-stone-400 select-none font-sans">
              99.9% 运行时间在线率保证
            </p>
          </div>
        </section>
      </div>

      {/* Deployment History List */}
      <section className="bg-white rounded-lg border border-[#EAEAE8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EAEAE8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-outline" />
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
              部署历史记录
            </h3>
          </div>
          <span className="text-[10px] font-sans text-brand-outline-variant bg-brand-surface-container px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
            最近 10 条
          </span>
        </div>

        <div className="divide-y divide-[#EAEAE8]">
          {deployments.map((dep) => (
            <div key={dep.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
              <div className="flex items-center gap-4">
                {/* Status Dot */}
                <div className="relative">
                  {dep.status === 'deploying' ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-50" />
                  ) : dep.status === 'success' ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  )}
                </div>

                <div className="text-left font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-on-surface">{dep.version}</span>
                    <span className="text-[10px] font-mono text-brand-outline-variant bg-neutral-100 px-1.5 py-0.5 rounded uppercase">{dep.id}</span>
                  </div>
                  <p className="text-[11px] text-brand-on-surface-variant mt-0.5 font-sans">
                    {dep.status === 'deploying' ? '正在准备环境并在云端执行构建...' : `部署时间: ${dep.timestamp}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-sans">
                {dep.status === 'failed' && (
                  <>
                    <button
                      onClick={() => openLogModal(dep)}
                      className="p-1 px-2 items-center gap-1.5 inline-flex bg-white hover:bg-neutral-50 border border-neutral-200 rounded text-[10px] font-sans font-medium text-brand-on-surface transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3 text-brand-outline" />
                      查看详情
                    </button>
                    <button
                      onClick={() => handleRetry(dep.id)}
                      className="p-1 px-2 items-center gap-1.5 inline-flex bg-white hover:bg-rose-50 border border-rose-100 rounded text-[10px] font-sans font-medium text-rose-600 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      重试
                    </button>
                  </>
                )}
                {dep.status === 'success' && (
                  <span className="text-[10px] font-sans font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    在线服务中
                  </span>
                )}
                {dep.status === 'deploying' && (
                  <span className="text-[10px] font-sans font-medium text-blue-600 flex items-center gap-2">
                    <div className="w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    构建中...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Log Modal */}
      <AnimatePresence>
        {isLogModalOpen && selectedDeployment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#EAEAE8] flex items-center justify-between bg-[#fcfcfa]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-sans font-bold text-brand-on-surface">部署失败详情</h3>
                    <p className="text-[10px] font-sans text-brand-on-surface-variant font-medium">版本: {selectedDeployment.version} • {selectedDeployment.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-brand-outline hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-zinc-950 font-mono text-left">
                <div className="space-y-1">
                  {selectedDeployment.logs?.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="w-8 text-[10px] text-zinc-600 text-right select-none">{i + 1}</span>
                      <span className={`text-xs whitespace-pre-wrap ${line.includes('[ERROR]') ? 'text-rose-400' : 'text-zinc-300'}`}>
                        {line}
                      </span>
                    </div>
                  ))}
                  {!selectedDeployment.logs && (
                    <div className="text-xs text-zinc-500 italic">暂无详细日志。</div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#EAEAE8] flex items-center justify-between bg-[#fcfcfa]">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[11px] font-sans font-semibold uppercase tracking-tight">异常终止 (SIGTERM)</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDeployment.logs && (
                    <button
                      onClick={() => handleCopyLogs(selectedDeployment.logs!)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-white border border-[#EAEAE8] hover:bg-zinc-50 text-xs font-sans font-medium text-brand-on-surface transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      复制日志
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsLogModalOpen(false);
                      handleRetry(selectedDeployment.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-black text-white hover:bg-zinc-800 text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    立即重试部署
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secondary split options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Notification Alert Settings */}
        <section className="bg-white rounded-lg border border-[#EAEAE8] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
                  部署告警通知
                </h3>
                <p className="text-xs font-sans text-brand-on-surface-variant mt-0.5">
                  部署失败时通过全局 Toast 提醒。
                </p>
              </div>

              <button
                onClick={() => {
                  const nextVal = !alertOnFailure;
                  setAlertOnFailure(nextVal);
                  localStorage.setItem('asteroid-notify-deploy-fail', String(nextVal));
                  onShowNotification(`部署告警通知已${nextVal ? '开启' : '关闭'}`, nextVal ? 'success' : 'info');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    alertOnFailure ? 'bg-[#2DE1C2] border border-[#1ab197]' : 'bg-[#E2E2E2]'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                    alertOnFailure ? 'left-6' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  if (alertOnFailure) {
                    onShowNotification('⚠️ [告警测试] 自动检测到上一次部署版本 v1.2.5 存在关键依赖缺失错误，请及时排查日志。', 'info');
                  } else {
                    onShowNotification('告警通知已处于关闭状态，测试无效。', 'info');
                  }
                }}
                className="w-full py-1.5 px-3 rounded border border-neutral-200 text-[10px] font-sans font-medium text-brand-outline hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                发送测试告警
              </button>
            </div>
          </div>
        </section>

        {/* Self-hosted pool block */}
        <section className="bg-white rounded-lg border border-[#EAEAE8] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
                  自托管资源池
                </h3>
                <p className="text-xs font-sans text-brand-on-surface-variant mt-0.5">
                  在您自己的基础设施上运行代理。
                </p>
              </div>

              {/* iOS style custom switcher */}
              <button
                onClick={handleToggleSelfHosted}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  selfHosted ? 'bg-[#2DE1C2] border border-[#1ab197]' : 'bg-[#E2E2E2]'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                    selfHosted ? 'left-6' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            {/* Sub content item */}
            <div className="border border-[#EAEAE8] rounded-md p-4 bg-brand-surface-low bg-opacity-40 hover:bg-brand-surface-container transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Computer className="w-4 h-4 text-brand-outline" />
                  <div>
                    <h4 className="text-xs font-sans font-medium text-brand-on-surface">
                      我的机器
                    </h4>
                    <p className="text-[11px] font-sans text-brand-on-surface-variant">
                      {selfHosted ? '通过 SSH / Agent 配置文件已加载集群' : '未连接任何本地设备'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-brand-outline-variant group-hover:text-brand-on-surface transition-colors" />
              </div>
            </div>
          </div>
        </section>

        {/* Upgrade alert widget matching styling */}
        <section className="bg-[#fcfcfa] dark:bg-brand-surface-low/60 rounded-lg border border-teal-100 dark:border-teal-950/40 p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Backdrop dynamic glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DE1C2] rounded-full blur-[60px] opacity-10 pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#006b5b] dark:text-[#2DE1C2]" />
              <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
                升级以解锁云代理
              </h3>
            </div>
            <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
              专业版计划包含 500 个代理小时、无限次同步以及对高级自托管集群的支持。
            </p>
          </div>

          <div className="pt-6 relative z-10 flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (currentPlan === 'pro') {
                  onShowNotification('您的账户目前已是专业版计划，享有全部高级云代理席位特权！', 'info');
                } else {
                  setPlan('pro');
                  onShowNotification('成功升级到专业版计划！已被赋予云代理完全访问特权。', 'success');
                }
              }}
              className="py-2 px-5 rounded text-xs font-sans font-medium bg-black dark:bg-[#ffffff] text-white dark:text-neutral-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer"
            >
              {currentPlan === 'pro' ? '已解锁专业版云代理' : '升级到专业版'}
            </button>
            <span className="text-[11px] text-brand-outline font-sans">
              7天免费试用，随后 $20/月
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
