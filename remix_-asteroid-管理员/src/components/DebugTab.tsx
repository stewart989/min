/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Terminal, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Cpu, 
  Sparkles,
  Layers,
  Code
} from 'lucide-react';

interface DebugTabProps {
  onShowNotification: (message: string, type: 'success' | 'info') => void;
}

export default function DebugTab({ onShowNotification }: DebugTabProps) {
  const [selectedFile, setSelectedFile] = useState('Router.js');
  const [codeContent, setCodeContent] = useState(() => `// Asteroid Routing Core Definition
const Router = {
  port: 3000,
  enableLogs: true,
  enableSentryProxy: false,
  plugins: ["datadog", "slack"],
  
  onBeforeRequest(req) {
    console.log("Incoming request for path:", req.url);
    return true; // proceed
  }
};`);

  const [logs, setLogs] = useState<string[]>([]);
  const [compiling, setCompiling] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleRunCode = () => {
    if (compiling) return;
    setCompiling(true);
    setLogs([]);

    const logLines = [
      `[system] (${new Date().toLocaleTimeString()}) 初始化 Asteroid 编译环境沙箱...`,
      `[system] 关联本地配置文件: ${selectedFile}...`,
      `[sandbox] 检查依赖加载状态: OK`,
      `[sandbox] 加载已安装插件: Datadog MCP, Slack MCP...`,
      `[compile] 正在执行解析器转换成 AST 结构...`,
      `[compile] 代码特征码核验: 0x8FA2D1`,
    ];

    let lineIdx = 0;
    const interval = setInterval(() => {
      if (lineIdx < logLines.length) {
        setLogs(prev => [...prev, logLines[lineIdx]]);
        lineIdx++;
      } else {
        clearInterval(interval);
        
        // Finalize compiling with output derived from current text
        const hasSentry = codeContent.includes('enableSentryProxy: true');
        const finalLogs = [
          `[runtime] 代理宿主端口绑定: 3000`,
          hasSentry ? `[runtime] 已检测到 Sentry 接入，正在开启错误自动拦截器...` : `[runtime] Sentry 控制已被中置过滤`,
          `[success] 沙箱调试执行完毕，消耗 328ms，错误码: 0 (正常结束)`
        ];
        
        setLogs(prev => [...prev, ...finalLogs]);
        setCompiling(false);
        onShowNotification(`"${selectedFile}" 沙箱执行完毕！`, 'success');
      }
    }, 250);
  };

  const clearLogs = () => {
    setLogs([]);
    onShowNotification('调试控制台日志已清空。', 'info');
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-sans font-semibold text-brand-on-surface leading-tight">
          调试沙箱
        </h2>
        <p className="text-sm font-sans text-brand-on-surface-variant mt-1 font-sans">
          在完全安全的物理进程沙箱内对您的 AsteroidRouter 配置文件进行测试。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor block (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#EAEAE8] flex flex-col justify-between overflow-hidden shadow-sm min-h-[400px]">
          {/* Editor Header controls */}
          <div className="p-3 bg-brand-surface-low border-b border-[#EAEAE8] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedFile('Router.js');
                  setCodeContent(`// Asteroid Routing Core Definition
const Router = {
  port: 3000,
  enableLogs: true,
  enableSentryProxy: false,
  plugins: ["datadog", "slack"],
  
  onBeforeRequest(req) {
    console.log("Incoming request for path:", req.url);
    return true; // proceed
  }
};`);
                }}
                className={`px-3 py-1 text-xs font-mono rounded ${selectedFile === 'Router.js' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-500 hover:text-black'}`}
              >
                Router.js
              </button>
              <button
                onClick={() => {
                  setSelectedFile('ModelAdapter.ts');
                  setCodeContent(`// LLM Core Adapter
export class ModelAdapter {
  provider = "google-genai";
  preferModel = "gemini-2.5-flash";
  maxResponseTokens = 8192;
  
  async invoke(prompt: string) {
    const response = await ai.models.generateContent({
      model: this.preferModel,
      contents: prompt
    });
    return response.text;
  }
}`);
                }}
                className={`px-3 py-1 text-xs font-mono rounded ${selectedFile === 'ModelAdapter.ts' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-500 hover:text-black'}`}
              >
                ModelAdapter.ts
              </button>
            </div>

            {/* Run button */}
            <button
              onClick={handleRunCode}
              disabled={compiling}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black hover:bg-zinc-800 text-white text-xs font-sans font-semibold transition-colors cursor-pointer ${compiling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {compiling ? '编译中...' : '编译并运行'}
            </button>
          </div>

          {/* Interactive Textarea behaving like a code editor */}
          <div className="flex-1 relative flex">
            {/* Monospace Code line numbers decoration */}
            <div className="p-4 bg-brand-surface-low border-r border-[#EAEAE8] text-[11px] font-mono text-brand-outline-variant text-right select-none space-y-1 Hidden sm:block">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i}>{i+1}</div>
              ))}
            </div>
            
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className="flex-1 p-4 font-mono text-xs text-brand-on-surface bg-brand-surface-lowest focus:outline-none resize-none leading-relaxed h-[340px]"
              style={{ tabSize: 2 }}
            />
          </div>
        </div>

        {/* Output Logging Console (Span 5) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col justify-between overflow-hidden shadow-md max-h-[460px] lg:max-h-none min-h-[300px]">
          {/* Console Header */}
          <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center text-white select-none">
            <span className="text-[11px] font-sans font-bold flex items-center gap-1.5 uppercase text-zinc-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              调试输出控制台
            </span>
            <button
              onClick={clearLogs}
              title="清除日志"
              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Logs printing feed */}
          <div className="flex-1 p-4 font-mono text-[11px] text-emerald-400 space-y-2 overflow-y-auto max-h-[360px] lg:max-h-[340px]">
            {logs.length === 0 ? (
              <div className="text-zinc-600 italic h-full flex items-center justify-center">
                点击左侧“编译并运行”以在沙箱内查看系统调用栈。
              </div>
            ) : (
              logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={
                    log.includes('[success]') ? 'text-emerald-300 font-bold' :
                    log.includes('[compile]') ? 'text-blue-300' :
                    log.includes('[runtime]') ? 'text-amber-300' : 'text-zinc-400'
                  }
                >
                  {log}
                </div>
              ))
            )}
            <div ref={consoleBottomRef} />
          </div>

          <div className="p-3 bg-zinc-900 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono flex items-center justify-between select-none">
            <span>SANDBOX STATUS: READY</span>
            <span>PORT: 3000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
