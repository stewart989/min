/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  HelpCircle,
  FileCode2,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { UsageMetric } from '../types';

interface UsageTabProps {
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export default function UsageTab({ onShowNotification }: UsageTabProps) {
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | 'mtd'>('mtd');
  const [hasData, setHasData] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Mock active data points
  const usageMetrics: UsageMetric[] = [
    { date: '05-24', tokens: 12000, requests: 45, agentHours: 2.1 },
    { date: '05-25', tokens: 18500, requests: 62, agentHours: 3.5 },
    { date: '05-26', tokens: 5000,  requests: 12, agentHours: 0.8 },
    { date: '05-27', tokens: 28000, requests: 110, agentHours: 5.4 },
    { date: '05-28', tokens: 34000, requests: 135, agentHours: 7.0 },
    { date: '05-29', tokens: 21000, requests: 80, agentHours: 4.2 },
    { date: '05-30', tokens: 49000, requests: 198, agentHours: 9.8 },
  ];

  const maxTokens = Math.max(...usageMetrics.map(d => d.tokens));
  const maxRequests = Math.max(...usageMetrics.map(d => d.requests));

  const handleExportCSV = () => {
    if (!hasData) {
      onShowNotification('未捕获任何使用事件量，暂无法生成 CSV 财务报表。', 'info');
      return;
    }
    // Generate actual file download
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Tokens Consumed,API Requests,Agent Hours\n"
      + usageMetrics.map(m => `${m.date},${m.tokens},${m.requests},${m.agentHours}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Asteroid_usage_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowNotification('已开始自动下载 Asteroid API 会话用量导出报表！', 'success');
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
            用量
          </h2>
          <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
            监视并细分您的 Token 消耗、API 事件和代理会话时长指标。
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 font-sans font-medium rounded text-xs border border-[#EAEAE8] bg-white hover:bg-zinc-50 hover:text-brand-on-surface text-brand-on-surface-variant transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-brand-outline" />
          导出 CSV
        </button>
      </div>

      {/* Filter range toggles with generate mock support switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#EAEAE8]">
        <div className="inline-flex rounded-md p-0.5 bg-brand-surface-container border border-[#EAEAE8] self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('1d')}
            className={`px-3 py-1 text-xs font-sans rounded transition-all ${
              timeframe === '1d' ? 'bg-white text-brand-on-surface shadow-sm font-medium' : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            1天
          </button>
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1 text-xs font-sans rounded transition-all ${
              timeframe === '7d' ? 'bg-white text-brand-on-surface shadow-sm font-medium' : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            7天
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1 text-xs font-sans rounded transition-all ${
              timeframe === '30d' ? 'bg-white text-brand-on-surface shadow-sm font-medium' : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            30天
          </button>
          <button
            onClick={() => setTimeframe('mtd')}
            className={`px-3 py-1 text-xs font-sans rounded transition-all ${
              timeframe === 'mtd' ? 'bg-white text-brand-on-surface shadow-sm font-medium' : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            MTD
          </button>
        </div>

        {/* Data presence control panel */}
        <button
          onClick={() => {
            setHasData(!hasData);
            onShowNotification(
              !hasData 
                ? '已自动加载测试用量折线统计数据，悬停节点可查看详细日均。' 
                : '用量统计数据已重置归零。', 
              'info'
            );
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-surface-low border border-[#EAEAE8] hover:bg-[#EAEAE8] transition-colors text-xs font-sans font-medium text-brand-on-surface cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-outline" />
          {hasData ? "重置为默认空状态" : "生成模拟用量统计"}
        </button>
      </div>

      {/* Main visualization container board */}
      {!hasData ? (
        /* Precise replication of Screen 7 ("未找到事件") */
        <section className="bg-white rounded-lg border border-[#EAEAE8] py-16 sm:py-24 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-brand-surface-low border border-[#EAEAE8] flex items-center justify-center mb-6">
            <BarChart3 className="w-6 h-6 text-brand-outline-variant" />
          </div>

          <div className="max-w-md space-y-2 mb-6">
            <h3 className="text-sm font-sans font-semibold text-brand-on-surface">
              未找到事件
            </h3>
            <p className="text-xs font-sans text-brand-on-surface-variant leading-relaxed">
              目前您尚未配置或开始运行 API 通讯请求。集成源控制或调用测试之后，此处的消耗将以图表形式实时呈现。
            </p>
          </div>

          <button
            onClick={() => onShowNotification('正在前往文档管理控制页...', 'info')}
            className="px-4 py-1.5 rounded border border-[#EAEAE8] bg-white hover:bg-zinc-50 text-xs font-sans font-medium text-brand-on-surface transition-colors cursor-pointer"
          >
            查看文档
          </button>
        </section>
      ) : (
        /* Premium custom dynamic interactive SVG chart component showing Token usage */
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tokens card summary */}
            <div className="bg-white p-5 rounded-lg border border-[#EAEAE8]">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-outline font-sans">
                时间段内消费 Token
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-sans font-bold text-brand-on-surface">166,500</span>
                <span className="text-xs text-brand-on-surface-variant font-sans">Tokens</span>
              </div>
            </div>

            {/* Total Queries summary */}
            <div className="bg-white p-5 rounded-lg border border-[#EAEAE8]">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-outline font-sans">
                时间段内 API 请求频次
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-sans font-bold text-brand-on-surface">640</span>
                <span className="text-xs text-brand-on-surface-variant font-sans">次请求</span>
              </div>
            </div>

            {/* Hours spent summary */}
            <div className="bg-white p-5 rounded-lg border border-[#EAEAE8]">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-outline font-sans">
                累积代理工作运行时
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-sans font-bold text-brand-on-surface">32.8</span>
                <span className="text-xs text-brand-on-surface-variant font-sans">小时</span>
              </div>
            </div>
          </div>

          {/* Core Interactive Line Graph Chart represented dynamically in SVG */}
          <div className="bg-white rounded-lg border border-[#EAEAE8] p-6 space-y-4">
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-brand-outline-variant flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
              Token 与请求日吞吐曲线图 · 交互式悬停
            </h3>

            {/* SVG implementation */}
            <div className="relative pt-4">
              <svg viewBox="0 0 600 240" className="w-full overflow-visible">
                {/* Y-Axis helper grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((scale, i) => (
                  <line 
                    key={i} 
                    x1="40" 
                    y1={20 + scale * 180} 
                    x2="590" 
                    y2={20 + scale * 180} 
                    stroke="#F3F4F3" 
                    strokeWidth="1" 
                    strokeDasharray="2,2" 
                  />
                ))}

                {/* X-axis base line */}
                <line x1="40" y1="200" x2="595" y2="200" stroke="#EEEEED" strokeWidth="1" />

                {/* Draw Areas for Tokens */}
                <path
                  d={`
                    M 40 200
                    ${usageMetrics.map((point, index) => {
                      const x = 50 + index * 85;
                      const y = 200 - (point.tokens / maxTokens) * 160;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L 560 200 Z
                  `}
                  fill="url(#gradient-tokens)"
                  opacity="0.1"
                />

                {/* Draw Line for Tokens (Cyan `#2de1c2`) */}
                <path
                  d={usageMetrics.map((point, index) => {
                    const x = 50 + index * 85;
                    const y = 200 - (point.tokens / maxTokens) * 160;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#2de1c2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data point circle dots */}
                {usageMetrics.map((point, index) => {
                  const x = 50 + index * 85;
                  const y = 200 - (point.tokens / maxTokens) * 160;
                  const isHovered = hoveredIndex === index;
                  return (
                    <g 
                      key={index}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer"
                    >
                      {/* Interactive enlarged circle boundary shield */}
                      <circle cx={x} cy={y} r="18" fill="transparent" />
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isHovered ? "6" : "4.5"} 
                        fill="#ffffff" 
                        stroke="#006b5b" 
                        strokeWidth="2.5" 
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}

                {/* Linear Gradients definitions */}
                <defs>
                  <linearGradient id="gradient-tokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2de1c2" />
                    <stop offset="100%" stopColor="#2de1c2" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Dynamic tooltip popup alignment depending on state */}
              {hoveredIndex !== null && (
                <div 
                  className="absolute p-3 rounded bg-zinc-950 text-white min-w-[150px] shadow-lg pointer-events-none text-left z-30 space-y-1.5 transition-all duration-150"
                  style={{
                    left: `${50 + hoveredIndex * 8.5}%`,
                    top: '10px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <p className="text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                    日期: 2026-{usageMetrics[hoveredIndex].date}
                  </p>
                  <div className="h-px bg-zinc-800" />
                  <p className="text-xs font-sans flex justify-between gap-4">
                    <span className="text-teal-400 font-medium">Tokens consumed:</span>
                    <span className="font-semibold">{usageMetrics[hoveredIndex].tokens.toLocaleString()}</span>
                  </p>
                  <p className="text-[11px] font-sans flex justify-between gap-4 text-zinc-300">
                    <span>API queries:</span>
                    <span>{usageMetrics[hoveredIndex].requests} rqs</span>
                  </p>
                  <p className="text-[11px] font-sans flex justify-between gap-4 text-zinc-300">
                    <span>Agent uptime:</span>
                    <span>{usageMetrics[hoveredIndex].agentHours} hrs</span>
                  </p>
                </div>
              )}
            </div>

            {/* Label Row */}
            <div className="flex justify-between px-10 pt-2 text-[11px] font-mono font-medium text-brand-outline select-none">
              {usageMetrics.map((point, index) => (
                <span key={index}>{point.date}</span>
              ))}
            </div>
          </div>

          {/* Usage alert guidelines */}
          <div className="p-4 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#006b5b] dark:text-[#2DE1C2] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-sans font-semibold text-[#00705f] dark:text-emerald-400">用量统计与结账对账</h4>
              <p className="text-[11px] font-sans text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                所有用量每 60 分钟自动对账汇总一次。可用 Tokens 限额将在账期第一天自动归零或补充。
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
