/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Code, 
  MessageSquare, 
  Star, 
  Zap, 
  Check, 
  Info,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GuideStep, PremiumPlan, ContributionCell } from '../types';

interface OverviewTabProps {
  currentPlan: 'free' | 'pro' | 'enterprise';
  setPlan: (plan: 'free' | 'pro' | 'enterprise') => void;
  onNavigate: (tabName: any) => void;
}

export default function OverviewTab({ currentPlan, setPlan, onNavigate }: OverviewTabProps) {
  // Guides tasks
  const [guides, setGuides] = useState<GuideStep[]>([
    {
      id: 'g1',
      title: '连接 GitHub 或 GitLab',
      description: '同步代码仓库并自动配置您的开发源流',
      connected: false,
      buttonText: '连接',
      actionType: 'connect_git'
    },
    {
      id: 'g2',
      title: '连接 Slack',
      description: '接收 Asteroid 系统动作、部署日志与事件告警',
      connected: false,
      buttonText: '连接',
      actionType: 'connect_slack'
    },
    {
      id: 'g3',
      title: '用插件扩展 AsteroidRouter',
      description: '加载丰富快捷、即插即用的功能与工具集',
      connected: false,
      buttonText: '浏览',
      actionType: 'browse_plugins'
    },
    {
      id: 'g5',
      title: '设置云环境以获得更快、可并行的代理',
      description: '配置安全自足、高性能算力的虚拟计算底座',
      connected: false,
      buttonText: '设置',
      actionType: 'setup_proxy'
    },
    {
      id: 'g6',
      title: '官方技术文档门户',
      description: '查阅 AsteroidRouter 的完整 API 文档、模型参数与集成指南',
      connected: false,
      buttonText: '立即阅读',
      actionType: 'read_docs'
    }
  ]);

  const toggleConnection = (id: string, actionType: string) => {
    if (actionType === 'read_docs') {
      window.open('https://www.asteroidclothing.com/docs/', '_blank');
      return;
    }
    setGuides(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, connected: !item.connected };
      }
      return item;
    }));

    if (actionType === 'browse_plugins') {
      onNavigate('plugins');
    } else if (actionType === 'setup_proxy') {
      onNavigate('cloud');
    }
  };

  // Pricing sections
  const plans: PremiumPlan[] = [
    {
      id: 'free',
      name: '入门版',
      price: '$0',
      period: '永久免费',
      features: ['50,000 Tokens', '5 个模型'],
      ctaText: '免费开始',
    },
    {
      id: 'pro',
      name: '专业版',
      price: '$15',
      period: '/月',
      features: ['1,000,000 Tokens', '10 个模型', '优先支持'],
      ctaText: '开始专业版试用',
      popular: true,
    },
    {
      id: 'enterprise',
      name: '企业版',
      price: '$299',
      period: '/月',
      features: ['无限额度', '150+ 个模型', 'SSO & SLA'],
      ctaText: '联系销售',
    }
  ];

  // Active Git Commit Calendar State
  const [activeFilter, setActiveFilter] = useState<'all' | 'tab' | 'agent'>('all');
  
  // Build a responsive 24x7 heatmap grid representation for 2026.
  // Clicking grid tiles increments the core write counter!
  const rows = 7;
  const cols = 53; // weeks
  const totalDays = rows * cols;

  const [gridCounts, setGridCounts] = useState<number[]>(() => {
    // Generate organic-looking mock grid distribution (0 to 4)
    const initialCounts = Array.from({ length: totalDays }, (_, i) => {
      // Simulate clusters and empties
      const cluster = Math.sin(i / 10) * Math.cos(i / 3) + Math.random();
      if (cluster < 0.2) return 0;
      if (cluster < 0.7) return 1;
      if (cluster < 1.3) return 2;
      if (cluster < 1.8) return 3;
      return 4;
    });
    return initialCounts;
  });

  // Calculate dynamic commit sum based on current grid & filter weights
  const totalEditsCount = useMemo(() => {
    const baseSum = gridCounts.reduce((acc, curr) => acc + curr, 0) * 12; // multiplied to look equivalent to real scale
    if (activeFilter === 'tab') return Math.floor(baseSum * 0.42);
    if (activeFilter === 'agent') return Math.floor(baseSum * 0.58);
    return baseSum;
  }, [gridCounts, activeFilter]);

  const handleCellClick = (index: number) => {
    setGridCounts(prev => {
      const copy = [...prev];
      copy[index] = (copy[index] + 1) % 5; // cycle through shades 0-4
      return copy;
    });
  };

  // CSS for shading
  const getCellColorClass = (val: number) => {
    switch (val) {
      case 0: return 'bg-brand-surface-container'; // empty/light-gray
      case 1: return 'bg-[#c9f6eb] hover:ring-2 hover:ring-[#2DE1C2]'; // minimum green-teal
      case 2: return 'bg-[#89ead3] hover:ring-2 hover:ring-[#2DE1C2]'; // medium shade
      case 3: return 'bg-[#2de1c2] hover:ring-2 hover:ring-[#16947f]'; // strong pro-teal
      case 4: return 'bg-[#006b5b] hover:ring-2 hover:ring-[#00201a]'; // maximum green-teal
      default: return 'bg-brand-surface-container';
    }
  };

  // Months label alignment across 53 weeks
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="space-y-8 fade-in">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
            概述
          </h2>
          <p className="text-sm font-sans text-brand-on-surface-variant mt-1">
            欢迎回来，这是您的项目概览和待办事项。
          </p>
        </div>
        <a 
          href="https://www.asteroidclothing.com/docs/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#EAEAE8] rounded-full hover:bg-zinc-50 transition-all text-xs font-sans font-semibold text-brand-on-surface shadow-sm no-underline group"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>访问官方文档门户</span>
          <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-black transition-colors" />
        </a>
      </div>

      {/* Guide Checklist Block ("新手指南") */}
      <section className="bg-white rounded-lg border border-[#EAEAE8] overflow-hidden">
        <div className="p-6 border-b border-[#EAEAE8] bg-brand-surface-low bg-opacity-30">
          <h3 className="text-base font-sans font-semibold text-brand-on-surface flex items-center gap-2">
            新手指南
          </h3>
        </div>
        <div className="divide-y divide-[#EAEAE8]">
          {guides.map((item) => (
            <div key={item.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded ${item.connected ? 'bg-emerald-50 dark:bg-emerald-950/20 text-[#006b5b] dark:text-emerald-400' : 'bg-brand-surface-container text-brand-on-surface'}`}>
                  {item.actionType === 'connect_git' && <Code className="w-4 h-4" />}
                  {item.actionType === 'connect_slack' && <MessageSquare className="w-4 h-4" />}
                  {item.actionType === 'browse_plugins' && <Star className="w-4 h-4" />}
                  {item.actionType === 'setup_proxy' && <Zap className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-sans font-medium text-brand-on-surface flex items-center gap-2">
                    {item.title}
                    {item.connected && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> 已连接
                      </span>
                    )}
                  </h4>
                  <p className="text-xs font-sans text-brand-on-surface-variant mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleConnection(item.id, item.actionType)}
                className={`px-4 py-1.5 rounded text-xs font-sans font-medium transition-all ${
                  item.connected
                    ? 'border border-[#EAEAE8] bg-white text-brand-on-surface hover:bg-zinc-100'
                    : 'bg-brand-primary text-brand-on-primary hover:bg-zinc-800'
                }`}
              >
                {item.connected ? '断开' : item.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sleek pricing matrix ("选择适合您的计划") */}
      <section className="bg-black text-white rounded-lg p-6 sm:p-10 border border-[#2F3130] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[160px] opacity-10 pointer-events-none" />
        
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-xl font-sans font-semibold tracking-tight text-white sm:text-2xl">
            选择适合您的计划
          </h3>
          <p className="text-sm font-sans text-zinc-400">
            透明的定价，助力您的项目规模化发展。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {plans.map((p) => {
            const isCurrent = currentPlan === p.id;
            return (
              <div 
                key={p.id}
                className={`rounded-lg p-6 bg-[#161616] border flex flex-col justify-between relative transition-all duration-300 ${
                  p.popular 
                    ? 'border-[#2DE1C2] ring-1 ring-[#2DE1C2] md:-translate-y-1 shadow-lg' 
                    : 'border-[#2F3130]'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2DE1C2] text-black text-[10px] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    最受欢迎
                  </span>
                )}
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-sans font-semibold text-zinc-400">{p.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-500 bg-opacity-20 text-emerald-300 px-2 py-0.5 rounded font-sans">
                        您当前的计划
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-sans font-bold text-white">{p.price}</span>
                    <span className="text-xs font-sans text-zinc-500">{p.period}</span>
                  </div>

                  <div className="h-px bg-[#2F3130] w-full" />

                  <ul className="space-y-2.5 pt-2">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-sans text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6">
                  <button
                    onClick={() => {
                      if (p.id === 'pro') {
                        onNavigate('checkout');
                      } else if (p.id === 'enterprise') {
                        onNavigate('billing');
                      } else {
                        setPlan(p.id as any);
                      }
                    }}
                    className={`w-full py-2 rounded text-xs font-sans font-medium transition-all ${
                      isCurrent 
                        ? 'bg-[#1E1E1D] text-emerald-400 border border-[#2DE1C2] border-opacity-40 cursor-default'
                        : p.popular
                          ? 'bg-[#2DE1C2] text-black hover:bg-neutral-100 font-semibold'
                          : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                    disabled={isCurrent}
                  >
                    {isCurrent ? '当前计划' : p.ctaText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Commits Heatmap Calendar ("AI 代码行编辑") */}
      <section className="bg-white rounded-lg border border-[#EAEAE8] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
              AI 代码行编辑
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-sans font-bold text-brand-on-surface tabular-nums">
                {totalEditsCount.toLocaleString()}
              </span>
              <span className="text-xs text-brand-on-surface-variant font-sans">
                次编辑已写入
              </span>
            </div>
          </div>

          {/* Action Filters */}
          <div className="inline-flex rounded-md p-0.5 bg-brand-surface-container-low border border-[#EAEAE8] self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs font-sans rounded transition-all ${
                activeFilter === 'all' 
                  ? 'bg-white text-brand-on-surface shadow-sm font-medium' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveFilter('tab')}
              className={`px-3 py-1 text-xs font-sans rounded transition-all ${
                activeFilter === 'tab' 
                  ? 'bg-white text-brand-on-surface shadow-sm font-medium' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface'
              }`}
            >
              Tab
            </button>
            <button
              onClick={() => setActiveFilter('agent')}
              className={`px-3 py-1 text-xs font-sans rounded transition-all ${
                activeFilter === 'agent' 
                  ? 'bg-white text-brand-on-surface shadow-sm font-medium' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface'
              }`}
            >
              代理
            </button>
          </div>
        </div>

        {/* Heatmap Grid Wrapper */}
        <div className="relative overflow-x-auto pb-2">
          <div className="min-w-[640px] space-y-1 pt-1.5 select-none">
            {/* Months Row Header */}
            <div className="grid grid-cols-[30px_repeat(53,1fr)] text-[10px] font-mono text-brand-outline mb-1 justify-items-stretch">
              <div />
              {months.map((m, idx) => (
                <div 
                  key={idx} 
                  style={{ gridColumnStart: Math.floor(idx * 4.4) + 2 }} // spread labels relatively evenly across 53 weeks
                  className="font-sans font-medium"
                >
                  {m}
                </div>
              ))}
            </div>

            {/* Grid proper (7 Rows for Sunday to Saturday) */}
            {Array.from({ length: rows }).map((_, rIdx) => (
              <div key={rIdx} className="grid grid-cols-[30px_repeat(53,1fr)] gap-1 items-center">
                {/* Visual day labels (e.g. Wed, Fri) */}
                <span className="font-sans text-[10.5px] text-brand-outline-variant font-medium leading-none text-right pr-2">
                  {rIdx === 1 ? '一' : rIdx === 3 ? '三' : rIdx === 5 ? '五' : ''}
                </span>

                {/* Grid cells across 53 weeks */}
                {Array.from({ length: cols }).map((_, cIdx) => {
                  const flatIdx = cIdx * rows + rIdx;
                  const count = gridCounts[flatIdx] || 0;
                  return (
                    <div
                      key={flatIdx}
                      onClick={() => handleCellClick(flatIdx)}
                      className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer ${getCellColorClass(count)}`}
                      title={`单元格 ${flatIdx}: 写入级别 ${count} (点击可修改)`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between text-xs font-sans text-brand-on-surface-variant bg-brand-surface-low p-3 rounded border border-[#EAEAE8] border-dashed">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-outline" />
            <span className="text-[11px]">点击任一格像素块可以追加或重构动态编辑频次。</span>
          </div>
          <div className="flex items-center gap-1.5 font-sans">
            <span>较少</span>
            <div className="w-3 h-3 rounded-sm bg-brand-surface-container" />
            <div className="w-3 h-3 rounded-sm bg-[#c9f6eb]" />
            <div className="w-3 h-3 rounded-sm bg-[#89ead3]" />
            <div className="w-3 h-3 rounded-sm bg-[#2de1c2]" />
            <div className="w-3 h-3 rounded-sm bg-[#006b5b]" />
            <span>较多</span>
          </div>
        </div>
      </section>
    </div>
  );
}
