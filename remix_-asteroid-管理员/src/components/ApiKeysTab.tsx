/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Trash2, 
  Check, 
  Plus, 
  Eye, 
  EyeOff,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ApiKeysTabProps {
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyVal: string;
  scope: 'all' | 'read' | 'write';
  created: string;
  lastUsed: string;
  visible: boolean;
}

export default function ApiKeysTab({ onShowNotification }: ApiKeysTabProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    { id: 'k1', name: 'Core Server Key', keyVal: 'ast_live_7a3d90f2b3e8910d55ac', scope: 'all', created: '2026年3月14日', lastUsed: '3 分钟前', visible: false },
    { id: 'k2', name: 'Sandbox Read', keyVal: 'ast_live_e991c0db7214ff9841ab', scope: 'read', created: '2026年4月20日', lastUsed: '大约 5 小时前', visible: false },
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'all' | 'read' | 'write'>('read');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    // Generate random mock key
    const randChars = Array.from({ length: 20 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const newKey: ApiKeyItem = {
      id: `k-${Date.now()}`,
      name: newKeyName,
      keyVal: `ast_live_${randChars}`,
      scope: newKeyScope,
      created: '刚刚',
      lastUsed: '从未使用',
      visible: true
    };

    setKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    onShowNotification(`已成功生成密钥对: ${newKeyName}!`, 'success');
  };

  const handleCopyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowNotification('API 密钥已复制至您的系统剪贴板。', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteKey = (id: string, name: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
    onShowNotification(`已彻底注销销毁 API 密钥: ${name}`, 'info');
  };

  const toggleVisibility = (id: string) => {
    setKeys(prev => prev.map(k => {
      if (k.id === id) return { ...k, visible: !k.visible };
      return k;
    }));
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          API 密钥
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          管理您代码库或工作宿主连接 Asteroid 管理接口的授权凭证。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Creator Panel */}
        <div className="lg:col-span-1 bg-white border border-[#EAEAE8] p-5 rounded-lg h-fit space-y-4">
          <h3 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-brand-outline" />
            新建密钥凭证
          </h3>

          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                名称标签
              </label>
              <input
                type="text"
                required
                placeholder="例如 Production Router..."
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-brand-outline font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                权限领域 (Scope)
              </label>
              <select
                value={newKeyScope}
                onChange={(e) => setNewKeyScope(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-[#EAEAE8] bg-white rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
              >
                <option value="read">只读权限 (Read Only)</option>
                <option value="write">写入权限 (Write Only)</option>
                <option value="all">管理员完全控制 (Full Control)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 font-sans font-semibold rounded text-xs bg-brand-primary text-brand-on-primary hover:bg-zinc-800 transition-colors cursor-pointer text-center"
            >
              生成 API 密钥
            </button>
          </form>
        </div>

        {/* Right Active Keys List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#EAEAE8] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#EAEAE8] bg-brand-surface-low bg-opacity-30 flex items-center justify-between">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline flex items-center gap-1.5">
                <Key className="w-4 h-4 text-brand-outline-variant" />
                当前的活跃凭证
              </span>
            </div>

            <div className="divide-y divide-[#EAEAE8]">
              {keys.length === 0 ? (
                <div className="p-8 text-center text-xs text-brand-outline font-sans">
                  没有活跃的密钥凭证。创建一个新的密钥。
                </div>
              ) : (
                keys.map((k) => (
                  <div key={k.id} className="p-4 sm:p-5 space-y-3 hover:bg-zinc-50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-sans font-semibold text-brand-on-surface">{k.name}</h4>
                        <div className="flex flex-wrap gap-2 items-center mt-1">
                          <span className="text-[10px] font-mono bg-brand-surface-container text-brand-outline px-1.5 py-0.5 rounded uppercase font-semibold">
                            {k.scope === 'all' ? 'Full' : k.scope}
                          </span>
                          <span className="text-[10px] font-sans text-brand-outline flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 使用于: {k.lastUsed}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyKey(k.id, k.keyVal)}
                          className="p-1.5 rounded border border-[#EAEAE8] bg-white text-zinc-500 hover:text-black hover:bg-zinc-100 transition-all cursor-pointer"
                          title="复制到剪贴板"
                        >
                          {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => toggleVisibility(k.id)}
                          className="p-1.5 rounded border border-[#EAEAE8] bg-white text-zinc-500 hover:text-black hover:bg-zinc-100 transition-all cursor-pointer"
                          title={k.visible ? "隐藏机密" : "明文显示"}
                        >
                          {k.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteKey(k.id, k.name)}
                          className="p-1.5 rounded border border-red-100 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                          title="销毁销证"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Copiable Credentials Input Container */}
                    <div className="relative">
                      <input
                        type={k.visible ? "text" : "password"}
                        readOnly
                        value={k.keyVal}
                        className="w-full bg-brand-surface-low bg-opacity-35 font-mono text-[11px] text-brand-on-surface px-3 py-1.5 pr-10 border border-[#EAEAE8] rounded focus:outline-none select-all"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-orange-50/30 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900/30 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
            <p className="text-[11px] font-sans text-orange-800 dark:text-orange-300 leading-relaxed font-sans">
              <strong>机密重要通知:</strong> 所有的 API 令牌仅在创建时完整显示一次。请务必将它们写入安全的 Vault，不要将其公开在任何代码仓库或网页端。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
