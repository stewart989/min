/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  Settings, 
  Cloud, 
  Cpu, 
  Puzzle, 
  Workflow, 
  Key, 
  Users, 
  BarChart3, 
  DollarSign, 
  Receipt,
  User,
  LogOut,
  ChevronLeft,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentPlan: 'free' | 'pro' | 'enterprise';
  onLogout: () => void;
  userEmail: string;
  onReturnToAgent: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentPlan, onLogout, userEmail, onReturnToAgent }: SidebarProps) {
  const menuItems = [
    { id: 'overview' as ActiveTab, label: '首页', icon: Home },
    { id: 'settings' as ActiveTab, label: '设置', icon: Settings },
    { id: 'cloud' as ActiveTab, label: '云代理', icon: Cloud },
    { id: 'debug' as ActiveTab, label: '调试', icon: Cpu },
    { id: 'plugins' as ActiveTab, label: '插件', icon: Puzzle },
    { id: 'integrations' as ActiveTab, label: '集成', icon: Workflow },
    { id: 'api-keys' as ActiveTab, label: 'API 密钥', icon: Key },
    { id: 'members' as ActiveTab, label: '成员', icon: Users },
    { id: 'usage' as ActiveTab, label: '用量', icon: BarChart3 },
    { id: 'billing' as ActiveTab, label: '支出', icon: DollarSign },
    { id: 'checkout' as ActiveTab, label: '账单', icon: Receipt },
  ];

  return (
    <aside className="w-60 bg-brand-bg border-r border-[#EAEAE8] flex flex-col justify-between h-screen fixed top-0 left-0 z-20 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="p-5 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-black flex items-center justify-center text-white">
              <span className="font-sans font-bold text-base">A</span>
            </div>
            <div>
              <h1 className="text-[15px] font-sans font-semibold tracking-tight text-brand-on-surface">
                AsteroidRouter 控制台
              </h1>
              <span className="text-[10px] text-brand-on-surface-variant font-sans flex items-center gap-1 mt-0.5">
                {currentPlan === 'pro' && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-[#2DE1C2] bg-opacity-20 text-[#00705f] font-semibold border border-[#2DE1C2] border-opacity-30">
                    PRO
                  </span>
                )}
                {currentPlan === 'free' ? '专业版计划 · 未启用' : '专业版计划 · 已启用'}
              </span>
            </div>
          </div>
        </div>

        {/* Selection Divider */}
        <div className="h-px bg-[#EAEAE8] mx-4 my-2.5" />

        {/* Navigation Items */}
        <nav className="px-3 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-surface-container-highest text-brand-on-surface font-medium border-l-[3px] border-brand-primary'
                    : 'text-brand-on-surface-variant hover:bg-brand-surface-container-low hover:text-brand-on-surface'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-primary' : 'text-brand-on-surface-variant'}`} />
                <span className="text-[12px] font-sans">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Nav Footer */}
      <div className="p-3 space-y-1.5 bg-brand-surface-dim bg-opacity-10 border-t border-[#EAEAE8]">
        {/* Toggle back pointer if inside nested view */}
        <button
          onClick={onReturnToAgent}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-black text-white hover:bg-zinc-800 text-[11px] font-sans font-medium transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          返回代理器
        </button>

        <a
          href="https://www.asteroidclothing.com/docs/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-1.5 rounded text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low transition-colors text-[12px] font-sans no-underline"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>官方技术文档</span>
          </div>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-left transition-colors text-[12px] font-sans ${
            activeTab === 'settings' 
              ? 'bg-brand-surface-container-highest text-brand-on-surface' 
              : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>个人设置</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-left text-brand-error hover:bg-red-50 hover:bg-opacity-50 transition-colors text-[12px] font-sans"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>退出登录</span>
        </button>

        {/* Tiny metadata */}
        <div className="pt-1 px-3">
          <p className="text-[9px] text-brand-outline font-mono truncate select-none leading-none">
            {userEmail}
          </p>
        </div>
      </div>
    </aside>
  );
}
