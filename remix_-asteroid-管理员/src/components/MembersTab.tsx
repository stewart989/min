/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Check, 
  ChevronRight,
  Shield,
  Mail,
  MoreVertical,
  X,
  ClipboardList
} from 'lucide-react';

interface MembersTabProps {
  onShowNotification: (message: string, type: 'success' | 'info') => void;
  userEmail: string;
}

interface TeamMember {
  id: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Developer' | 'Billing';
  status: 'Active' | 'Pending';
}

interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'info';
  ip: string;
}

export default function MembersTab({ onShowNotification, userEmail }: MembersTabProps) {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'm1', email: userEmail, role: 'Owner', status: 'Active' },
    { id: 'm2', email: 'git-automation@asteroid.sh', role: 'Developer', status: 'Active' },
    { id: 'm3', email: 'finance-audit@asteroid.sh', role: 'Billing', status: 'Active' },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Developer' | 'Billing'>('Developer');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-06-01 08:35:12',
      operator: userEmail,
      action: '系统设置变更',
      details: '更改系统外观主题与 PR 目标平台编辑器首选项。',
      status: 'info',
      ip: '103.24.108.91'
    },
    {
      id: 'log-2',
      timestamp: '2026-06-01 08:11:04',
      operator: userEmail,
      action: 'API 密钥创建',
      details: '成功生成主实例生产级 API 密钥 (••••••••4k2e)。',
      status: 'success',
      ip: '103.24.108.91'
    },
    {
      id: 'log-3',
      timestamp: '2026-05-31 16:50:23',
      operator: 'finance-audit@asteroid.sh',
      action: '组织账单同步',
      details: '通过主链路安全审核，完成当前账单周期的用量结算对账。',
      status: 'success',
      ip: '204.18.23.44'
    },
    {
      id: 'log-4',
      timestamp: '2026-05-30 11:24:55',
      operator: 'git-automation@asteroid.sh',
      action: '外部集成触发',
      details: '自动同步并连接 Datadog MCP 监控流插件。',
      status: 'success',
      ip: '8.210.35.122'
    }
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    // Email basic check
    if (!inviteEmail.includes('@')) {
      onShowNotification('请输入正确的邮箱地址！', 'info');
      return;
    }

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Pending'
    };

    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');

    // Append to audit logs
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      operator: userEmail,
      action: '成员席位邀请',
      details: `通过安全信道邀请 "${inviteEmail.trim()}" 加入协作组织，分配角色为 "${inviteRole}"。`,
      status: 'info',
      ip: '103.24.108.91'
    };
    setLogs(prev => [newLog, ...prev]);

    onShowNotification(`已成功邀请 "${inviteEmail}" 加入组织，验证邮件已发送。`, 'success');
  };

  const handleRemoveMember = (id: string, email: string) => {
    if (email === userEmail) {
      onShowNotification('无法注销您自己作为组织最高拥有者 (Owner) 的席位。', 'info');
      return;
    }

    setMembers(prev => prev.filter(m => m.id !== id));

    // Append to audit logs
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      operator: userEmail,
      action: '成员席位撤销',
      details: `注销并在安全策略模型中撤销团队成员 "${email}" 在当前组织内的所有席位与授权。`,
      status: 'warning',
      ip: '103.24.108.91'
    };
    setLogs(prev => [newLog, ...prev]);

    onShowNotification(`已撤销 "${email}" 在当前组织内的所有席位与授权。`, 'info');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.operator.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && log.status === statusFilter;
  });

  return (
    <div className="space-y-8 fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          成员
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          授权并管理参与您 Asteroid 管理项目的协作组织开发团队席位。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invite Area */}
        <section className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 p-5 rounded-lg h-fit space-y-4">
          <h3 className="text-sm font-sans font-semibold text-brand-on-surface flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-brand-outline" />
            邀请新的协作团队席位
          </h3>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                成员邮箱地址
              </label>
              <input
                type="email"
                required
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-brand-outline font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-brand-on-surface mb-1">
                组织授权角色 (Role)
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
              >
                <option value="Developer">开发者 (Developer)</option>
                <option value="Admin">管理员 (Admin)</option>
                <option value="Billing">财务管理员 (Billing Analyst)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 font-sans font-semibold rounded text-xs bg-brand-primary text-brand-on-primary hover:bg-zinc-800 transition-colors cursor-pointer text-center"
            >
              发送邀请
            </button>
          </form>
        </section>

        {/* Members List */}
        <section className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#EAEAE8] dark:border-zinc-800 bg-brand-surface-low bg-opacity-30">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-outline-variant" />
                当前团队成员 ({members.length} 人)
              </span>
            </div>

            <div className="divide-y divide-[#EAEAE8] dark:divide-zinc-800">
              {members.map((m) => (
                <div key={m.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-surface-container flex items-center justify-center font-sans font-medium text-xs text-brand-on-surface">
                      {m.email.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h4 className="text-xs font-sans font-semibold text-brand-on-surface flex items-center gap-2">
                        {m.email}
                        {m.status === 'Pending' && (
                          <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 px-1 py-0.5 rounded font-sans">
                            等待接受
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] font-sans text-brand-on-surface-variant flex items-center gap-1 mt-0.5 font-sans">
                        <Shield className="w-3 h-3 text-brand-outline" /> Role: {m.role}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(m.id, m.email)}
                    className="p-1.5 rounded border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30 transition-colors cursor-pointer"
                    title="注销此人席位"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Security Audit Session Logs */}
      <section className="bg-white dark:bg-zinc-900 border border-[#EAEAE8] dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:px-6 border-b border-[#EAEAE8] dark:border-zinc-800 bg-brand-surface-low bg-opacity-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-brand-outline-variant" />
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline">
              组织安全审核日志 (Security Audit Logs)
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <input
              type="text"
              placeholder="搜索审计事件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2.5 py-1 text-[11px] border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-brand-outline font-medium w-full sm:w-44"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-[11px] border border-[#EAEAE8] dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium cursor-pointer w-full sm:w-auto"
            >
              <option value="all">所有日志级别</option>
              <option value="success">成就/成功 (Success)</option>
              <option value="warning">管理警告 (Warning)</option>
              <option value="info">系统通告 (Info)</option>
            </select>
            <button
              onClick={() => {
                const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
                setLogs(prev => [
                  {
                    id: `log-${Date.now()}`,
                    timestamp: nowStr,
                    operator: userEmail,
                    action: '审计日志刷新',
                    details: '系统管理员手动请求同步并刷新当前的组织安全验证密钥树与操作日志空间。',
                    status: 'success',
                    ip: '103.24.108.91'
                  },
                  ...prev
                ]);
                onShowNotification('安全审计日志缓存刷新同步成功', 'success');
              }}
              className="p-1 px-2 border border-[#EAEAE8] dark:border-zinc-800 text-[10px] bg-white dark:bg-zinc-950 text-brand-on-surface rounded hover:bg-neutral-50 dark:hover:bg-zinc-900 font-sans font-medium transition-colors cursor-pointer w-full sm:w-auto"
              title="手动刷新"
            >
              同步刷新
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAEAE8] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-950 text-[10px] font-sans font-bold text-brand-outline uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold w-[150px]">时间戳 (UTC)</th>
                <th className="py-2.5 px-4 font-semibold w-[180px]">操作账号 (Operator)</th>
                <th className="py-2.5 px-4 font-semibold w-[120px]">事件分类</th>
                <th className="py-2.5 px-4 font-semibold">详细审计消息内容</th>
                <th className="py-2.5 px-4 font-semibold w-[110px] text-right">来源 IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAE8] dark:divide-zinc-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-xs font-sans text-brand-outline">
                    未检索到符合过滤条件的审计日志项目。
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  let statusBadgeClass = '';
                  if (log.status === 'success') statusBadgeClass = 'bg-[#2DE1C2] bg-opacity-10 text-[#00705f] dark:text-[#2DE1C2] border-[#2DE1C2] border-opacity-30';
                  else if (log.status === 'warning') statusBadgeClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40';
                  else if (log.status === 'info') statusBadgeClass = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/40';
                  else statusBadgeClass = 'bg-neutral-50 dark:bg-zinc-855 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-zinc-700';

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
