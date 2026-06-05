/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Puzzle, 
  Search, 
  Plus, 
  Check, 
  Info,
  SlidersHorizontal 
} from 'lucide-react';
import { PluginItem } from '../types';

interface PluginsTabProps {
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export default function PluginsTab({ onShowNotification }: PluginsTabProps) {
  const [filterType, setFilterType] = useState<'all' | 'required' | 'optional'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial plugins from the mockups
  const [plugins, setPlugins] = useState<PluginItem[]>([
    {
      id: 'p1',
      name: 'Datadog MCP',
      description: '在您的软件工作流中实现 Datadog 的日志分析与监控上报。',
      required: true,
      added: true,
      iconName: 'datadog'
    },
    {
      id: 'p2',
      name: 'Slack MCP',
      description: '与您的 Slack 实例连接，实现高效日志反馈与即时聊天协作。',
      required: false,
      added: true,
      iconName: 'slack'
    },
    {
      id: 'p3',
      name: 'Figma MCP',
      description: '访问并检索 Figma 文件元数据资产以使产品形态快速呈现。',
      required: false,
      added: false,
      iconName: 'figma'
    },
    {
      id: 'p4',
      name: 'Linear MCP',
      description: '将您的反馈问题、工单与代码库快速合并至 Linear 跟踪系统中。',
      required: false,
      added: false,
      iconName: 'linear'
    }
  ]);

  const filteredPlugins = useMemo(() => {
    return plugins.filter(p => {
      // Filter by tab
      if (filterType === 'required' && !p.required) return false;
      if (filterType === 'optional' && p.required) return false;
      
      // Filter by search text
      if (searchQuery.trim() !== '') {
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               p.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [plugins, filterType, searchQuery]);

  const handleTogglePlugin = (id: string, name: string, alreadyAdded: boolean) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, added: !alreadyAdded };
      }
      return p;
    }));

    if (alreadyAdded) {
      onShowNotification(`已成功卸载插件: ${name}`, 'info');
    } else {
      onShowNotification(`插件 "${name}" 已成功安装并激活!`, 'success');
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'datadog':
        return (
          <div className="w-10 h-10 rounded-md bg-purple-600 flex items-center justify-center text-white shrink-0 font-sans font-bold text-xs">
            🐾 DD
          </div>
        );
      case 'slack':
        return (
          <div className="w-10 h-10 rounded-md bg-amber-500 flex items-center justify-center text-white shrink-0 font-sans font-bold text-sm">
            💬 Sl
          </div>
        );
      case 'figma':
        return (
          <div className="w-10 h-10 rounded-md bg-rose-500 flex items-center justify-center text-white shrink-0 font-sans font-bold text-sm">
            🎨 Fi
          </div>
        );
      case 'linear':
        return (
          <div className="w-10 h-10 rounded-md bg-zinc-900 flex items-center justify-center text-white shrink-0 font-sans font-bold text-sm">
            📐 Li
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-md bg-zinc-500 flex items-center justify-center text-white shrink-0">
            <Puzzle className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          插件
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          安装插件以在 AsteroidRouter 流程中使用外部工具。有些插件是必需的，您不能将其卸载。
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left side standard segmented controls */}
        <div className="inline-flex rounded-md p-0.5 bg-brand-surface-container border border-[#EAEAE8] self-start">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 text-xs font-sans rounded transition-all ${
              filterType === 'all' 
                ? 'bg-white text-brand-on-surface shadow-sm font-medium' 
                : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('required')}
            className={`px-3.5 py-1.5 text-xs font-sans rounded transition-all ${
              filterType === 'required' 
                ? 'bg-white text-brand-on-surface shadow-sm font-medium' 
                : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            必需的
          </button>
          <button
            onClick={() => setFilterType('optional')}
            className={`px-3.5 py-1.5 text-xs font-sans rounded transition-all ${
              filterType === 'optional' 
                ? 'bg-white text-brand-on-surface shadow-sm font-medium' 
                : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            选修的
          </button>
        </div>

        {/* Search bar */}
        <div className="relative min-w-[260px] w-full sm:w-auto">
          <Search className="w-4 h-4 text-brand-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜寻可用组件和系统..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[260px] pl-9 pr-4 py-1.5 rounded-md border border-[#EAEAE8] bg-white text-xs font-sans focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-brand-outline font-medium"
          />
        </div>
      </div>

      {/* Master Grid list of Plugins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlugins.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-12 text-center border border-dashed border-[#EAEAE8] rounded-lg bg-[#FAF9F8]">
            <p className="text-xs text-brand-outline font-sans">没有找到符合特定筛选条件的插件工具</p>
          </div>
        ) : (
          filteredPlugins.map((plugin) => (
            <div 
              key={plugin.id}
              className="bg-white border border-[#EAEAE8] rounded-lg p-5 flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  {renderIcon(plugin.iconName)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
                        {plugin.name}
                      </h3>
                      {plugin.required && (
                        <span className="text-[10px] uppercase font-sans font-bold bg-brand-surface-container text-brand-on-surface px-1.5 py-0.5 rounded tracking-wide">
                          必需的
                        </span>
                      )}
                    </div>
                    {/* Fake micro details */}
                    <span className="text-[10px] font-mono text-brand-outline">
                      v1.0.{plugin.required ? '8' : '2'} · AST-ROUTER COMPLIANT
                    </span>
                  </div>
                </div>

                <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed font-sans">
                  {plugin.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#F3F4F3] flex items-center justify-between">
                <span className="text-[10px] font-sans text-brand-outline flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-brand-outline-variant" />
                  独立沙箱运行环境
                </span>

                {plugin.required ? (
                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded bg-brand-surface-container text-[#909393] text-xs font-sans font-semibold cursor-not-allowed"
                  >
                    核心必需
                  </button>
                ) : (
                  <button
                    onClick={() => handleTogglePlugin(plugin.id, plugin.name, plugin.added)}
                    className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded text-xs font-sans font-medium transition-all cursor-pointer ${
                      plugin.added
                        ? 'border border-[#EAEAE8] bg-white text-brand-outline hover:bg-zinc-50'
                        : 'bg-brand-primary text-brand-on-primary hover:bg-zinc-800'
                    }`}
                  >
                    {plugin.added ? (
                      <>
                        <Check className="w-3 h-3" />
                        已添加
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        添加
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info warning */}
      <div className="p-4 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-sans font-semibold text-blue-900 dark:text-blue-300">插件系统安全模型</h4>
          <p className="text-[11px] font-sans text-blue-700 dark:text-blue-400 leading-relaxed font-sans">
            所有安装的 MCP (Model Context Protocol) 插件均会在独立的 Docker 容器沙箱内运行。绝不访问或窃取您的主系统机密配置。
          </p>
        </div>
      </div>
    </div>
  );
}
