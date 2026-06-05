/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  Slack,
  MessageSquare,
  Network,
  Activity,
  Bug,
  HelpCircle,
  Sparkles,
  Search,
  Check,
  Send,
  X
} from 'lucide-react';
import { Integration } from '../types';

interface IntegrationsTabProps {
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export default function IntegrationsTab({ onShowNotification }: IntegrationsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');

  // Define Integrations from the visual list
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'i1',
      name: 'GitHub',
      description: '授权并无缝同步您的私有和公共代码库。',
      category: 'version-control',
      connected: false,
      iconName: 'github'
    },
    {
      id: 'i2',
      name: 'GitLab',
      description: '连接自托管或云端 GitLab 实例推进极佳合并。',
      category: 'version-control',
      connected: false,
      iconName: 'gitlab'
    },
    {
      id: 'i3',
      name: 'Slack',
      description: '向您指定的频道投递自动生成的工作量与合并报告。',
      category: 'collaboration',
      connected: true,
      iconName: 'slack'
    },
    {
      id: 'i8',
      name: '飞书 (Feishu / Lark)',
      description: '将开发事件、CI/CD 状态直接推送到飞书群机器人或办公网络捷径。',
      category: 'collaboration',
      connected: false,
      iconName: 'feishu'
    },
    {
      id: 'i9',
      name: '钉钉 (DingTalk)',
      description: '集成钉钉智能群助手，将关键的代码健康指标和合并提醒即时投递。',
      category: 'collaboration',
      connected: false,
      iconName: 'dingtalk'
    },
    {
      id: 'i4',
      name: 'Microsoft Teams',
      description: '配置安全挂条，接收开发流的关键状态通知。',
      category: 'collaboration',
      connected: false,
      iconName: 'teams'
    },
    {
      id: 'i5',
      name: 'Linear',
      description: '在任务单被指派时，让 AI 代理自动编写就绪代码。',
      category: 'collaboration',
      connected: false,
      iconName: 'linear'
    },
    {
      id: 'i6',
      name: 'Jira Software',
      description: '自动同步工单处理状态，智能对齐冲刺敏捷指标。',
      category: 'collaboration',
      connected: false,
      iconName: 'jira'
    },
    {
      id: 'i7',
      name: 'Sentry',
      description: '捕获未处理的运行时错误，启动代理自动修补。',
      category: 'collaboration',
      connected: false,
      iconName: 'sentry'
    }
  ]);

  const handleConnect = (id: string, name: string) => {
    // Set loading state
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, loading: true };
      }
      return item;
    }));

    setTimeout(() => {
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          const nextState = !item.connected;
          onShowNotification(
            nextState 
              ? `已成功建立与 ${name} 的双向授权集成通道。` 
              : `已成功注销 ${name} 的关联集成授权。`, 
            nextState ? 'success' : 'info'
          );
          return { ...item, connected: nextState, loading: false };
        }
        return item;
      }));
    }, 1200);
  };

  const filteredIntegrations = useMemo(() => {
    if (searchQuery.trim() === '') return integrations;
    return integrations.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [integrations, searchQuery]);

  const versionControlItems = filteredIntegrations.filter(x => x.category === 'version-control');
  const collaborationItems = filteredIntegrations.filter(x => x.category === 'collaboration');

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    
    onShowNotification(`已将您的提议（"${suggestionText}"）反馈至产品研发部。感谢您的支持！`, 'success');
    setSuggestionText('');
    setSuggestModalOpen(false);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'github':
        return <div className="w-9 h-9 rounded bg-black flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs">GH</div>;
      case 'gitlab':
        return <div className="w-9 h-9 rounded bg-[#e24329] flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs">GL</div>;
      case 'slack':
        return <div className="w-9 h-9 rounded bg-[#4a154b] flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs"><Slack className="w-4 h-4" /></div>;
      case 'feishu':
        return <div className="w-9 h-9 rounded bg-[#3370ff] flex items-center justify-center text-white shrink-0 font-sans font-semibold text-xs tracking-wide">飞书</div>;
      case 'dingtalk':
        return <div className="w-9 h-9 rounded bg-[#007fff] flex items-center justify-center text-white shrink-0 font-sans font-semibold text-xs tracking-wide">钉钉</div>;
      case 'teams':
        return <div className="w-9 h-9 rounded bg-[#4653a5] flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs">🛜</div>;
      case 'linear':
        return <div className="w-9 h-9 rounded bg-neutral-900 flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs"><Network className="w-4 h-4" /></div>;
      case 'jira':
        return <div className="w-9 h-9 rounded bg-[#0052cc] flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs">Ji</div>;
      case 'sentry':
        return <div className="w-9 h-9 rounded bg-[#362d59] flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs"><Bug className="w-4 h-4" /></div>;
      default:
        return <div className="w-9 h-9 rounded bg-zinc-500 flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs">Int</div>;
    }
  };

  return (
    <div className="space-y-8 fade-in relative">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          集成
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          管理外部集成，例如代码版本控制和协作工具。
        </p>
      </div>

      {/* Styled Search bar matching screenshot layout */}
      <div className="relative">
        <Search className="w-4.5 h-4.5 text-brand-outline absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="在这里搜索您需要的工具，如 飞书、钉钉、GitHub、Slack..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-sans text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-brand-outline font-medium shadow-sm"
        />
      </div>

      {/* Grid structure dividing categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Version Control Column */}
        <section className="space-y-4">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-brand-outline-variant" />
            版本控制
          </h3>

          <div className="space-y-3">
            {versionControlItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-outline font-sans border border-[#EAEAE8] dark:border-zinc-800 rounded-lg">
                该分类下未找到符合搜索的集成
              </div>
            ) : (
              versionControlItems.map((item) => (
                <div key={item.id} className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {renderIcon(item.iconName)}
                    <div>
                      <h4 className="text-[13px] font-sans font-semibold text-brand-on-surface flex items-center gap-2">
                        {item.name}
                        {item.connected && (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-1.5 rounded flex items-center gap-0.5 font-medium">
                            <Check className="w-2.5 h-2.5" /> 已连接
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-sans text-brand-on-surface-variant leading-relaxed truncate max-w-[200px] sm:max-w-xs mt-0.5 font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnect(item.id, item.name)}
                    disabled={item.loading}
                    className={`px-3 py-1.5 rounded text-xs font-sans font-medium min-w-[70px] flex justify-center items-center cursor-pointer transition-all ${
                      item.connected
                        ? 'border border-[#EAEAE8] dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 bg-white dark:bg-zinc-950 text-brand-on-surface'
                        : 'bg-brand-primary text-brand-on-primary hover:bg-zinc-800 dark:hover:bg-zinc-100'
                    } ${item.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {item.loading ? '连接中...' : item.connected ? '断开' : '连接'}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Collaboration Tools Column */}
        <section className="space-y-4">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-brand-outline-variant" />
            协作工具
          </h3>

          <div className="space-y-3">
            {collaborationItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-outline font-sans border border-[#EAEAE8] dark:border-zinc-800 rounded-lg">
                该分类下未找到符合搜索的集成
              </div>
            ) : (
              collaborationItems.map((item) => (
                <div key={item.id} className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {renderIcon(item.iconName)}
                    <div>
                      <h4 className="text-[13px] font-sans font-semibold text-brand-on-surface flex items-center gap-2">
                        {item.name}
                        {item.connected && (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-1.5 rounded flex items-center gap-0.5 font-medium">
                            <Check className="w-2.5 h-2.5" /> 已激活
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-sans text-brand-on-surface-variant leading-relaxed truncate max-w-[200px] sm:max-w-xs mt-0.5 font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnect(item.id, item.name)}
                    disabled={item.loading}
                    className={`px-3 py-1.5 rounded text-xs font-sans font-medium min-w-[70px] flex justify-center items-center cursor-pointer transition-all ${
                      item.connected
                        ? 'border border-[#EAEAE8] dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 hover:border-red-400 hover:border-red-200 bg-white dark:bg-zinc-950 text-brand-on-surface'
                        : 'bg-brand-primary text-brand-on-primary hover:bg-zinc-800 dark:hover:bg-zinc-100'
                    } ${item.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {item.loading ? '切换中...' : item.connected ? '关闭' : '开启'}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Suggest integration CTA strip */}
      <section className="bg-brand-surface-low dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-secondary" />
            没有找到您需要的工具？我们可以为您集成它。
          </h4>
          <p className="text-xs font-sans text-brand-on-surface-variant font-sans">
            告诉我们您工作流中不可或缺的开发或消息协作平台，我们会将它排入排期表中。
          </p>
        </div>

        <button
          onClick={() => setSuggestModalOpen(true)}
          className="px-4 py-2 font-sans font-medium rounded text-xs bg-brand-primary text-brand-on-primary hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
        >
          提议新集成
        </button>
      </section>

      {/* Custom suggestion Modal popup dialogue box */}
      {suggestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg w-full max-w-md p-6 relative shadow-xl">
            <button
              onClick={() => setSuggestModalOpen(false)}
              className="absolute top-4 right-4 text-brand-outline hover:text-brand-on-surface p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-sans font-semibold text-brand-on-surface">提议新产品集成</h3>
            <p className="text-xs font-sans text-brand-on-surface-variant mt-1 mb-4 font-sans">
              填写以下信息，我们的团队会审查该提议工具。
            </p>

            <form onSubmit={handleSendSuggestion} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                  平台 / 工具名称
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如 Datadog APM, Discord, Google Drive..."
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuggestModalOpen(false)}
                  className="px-3.5 py-1.5 rounded border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-brand-on-surface font-sans font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-brand-primary text-brand-on-primary text-xs font-sans font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 inline-flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  提交建议
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
