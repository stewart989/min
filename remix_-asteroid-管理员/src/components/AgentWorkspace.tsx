import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  PlusSquare, 
  Bot, 
  Cpu, 
  LayoutDashboard, 
  Cloud, 
  Zap, 
  ChevronDown, 
  Layers, 
  Image as ImageIcon, 
  ArrowUp, 
  Terminal, 
  Sparkles, 
  Archive,
  ArrowRight,
  Paperclip,
  RefreshCw,
  CheckCircle2,
  Play,
  Settings,
  Globe,
  GitFork,
  Trash2,
  Clock,
  Plus,
  MessageSquare,
  ChevronRight,
  Tv,
  Menu,
  X,
  BookOpen,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgentWorkspaceProps {
  onShowNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  userEmail: string;
  currentPlan: 'free' | 'pro' | 'enterprise';
  onNavigateToConsole: (tab?: string) => void;
  onLogout: () => void;
}

interface SimulatedAgent {
  id: string;
  name: string;
  prompt: string;
  model: string;
  timestamp: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  steps: { label: string; status: 'pending' | 'running' | 'done' }[];
  logs: string[];
  response?: string;
  files?: {
    id: string;
    name: string;
    size: string;
    type: 'file' | 'image';
    url?: string;
  }[];
}

interface PipelineLog {
  id: string;
  time: string;
  desc: string;
  badge: string;
}

interface AutomationPipeline {
  id: string;
  title: string;
  type: 'github' | 'cron' | 'custom';
  triggerText: string;
  executor: string;
  enabled: boolean;
  logs: PipelineLog[];
}

const AGENT_TEMPLATES = [
  {
    id: 'coder',
    name: 'AsteroidRouter-Coder',
    description: '专业的全栈架构师，擅长代码库重构、Bug 修复及性能优化。',
    tag: 'Coding',
    model: 'GPT-5.5 High',
    color: '#000000',
    icon: <Terminal className="w-5 h-5 text-[#2DE1C2]" />
  },
  {
    id: 'auditor',
    name: 'Security Shield Auditor',
    description: '安全合规专家，专注漏洞扫描、权限审计及生产环境风险评估。',
    tag: 'Security',
    model: 'GPT-5.5 High',
    color: '#e2f9f1',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />
  },
  {
    id: 'designer',
    name: 'UX/UI Architect',
    description: '交互视觉架构师，精通 Tailwind CSS、响应式动画及设计系统维护。',
    tag: 'Design',
    model: 'GPT-5.5 High',
    color: '#eef2ff',
    icon: <Layers className="w-5 h-5 text-indigo-500" />
  }
];

export default function AgentWorkspace({
  onShowNotification,
  userEmail,
  currentPlan,
  onNavigateToConsole,
  onLogout
}: AgentWorkspaceProps) {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-5.5 High');
  const [piiMaskingEnabled, setPiiMaskingEnabled] = useState(true);
  const [showModelsDropdown, setShowModelsDropdown] = useState(false);
  const [showMcpDropdown, setShowMcpDropdown] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'new' | 'automation' | 'bugbot'>('new');
  const [activeAgentTemplate, setActiveAgentTemplate] = useState(AGENT_TEMPLATES[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agents, setAgents] = useState<SimulatedAgent[]>([]);
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
  const [attachedFiles, setAttachedFiles] = useState<{
    id: string;
    name: string;
    size: string;
    type: 'file' | 'image';
    url?: string;
  }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [recentHistory, setRecentHistory] = useState([
    { id: 'h-1', title: '内存泄漏深度审计', time: '1小时前', prompt: '这个项目的内存泄漏问题怎么解决？', response: '针对您项目中发现的内存泄漏，我建议从以下几个维度进行审计：\n1. 检查 useEffect 中的清理函数。\n2. 识别全局监听器是否正确移除。\n3. 使用 Chrome DevTools 的 Memory 面板进行堆快照对比。' },
    { id: 'h-2', title: '部署故障排查: router-pod', time: '3小时前', prompt: 'router-pod 部署失败了，报错是探针检查未通过。', response: '这通常是因为启动时间超过了 initialDelaySeconds。建议检查 livenessProbe 和 readinessProbe 的配置，并确认服务端口 3000 已在容器中正确监听。' },
    { id: 'h-3', title: '用户注册接口重构', time: '昨天', prompt: '重构注册接口，需要支持 OAuth2 联动。', response: '好的，我已经规划了重构路径。我们将引入 passport 策略模式，并确保在数据层保持原子性操作以防止用户数据不一致。' },
  ]);

  const restoreSession = (item: typeof recentHistory[0]) => {
    onShowNotification(`正在恢复会话: ${item.title}`, 'info');
    setActiveSideTab('new');
    
    // Create a mock restored agent session
    const restoredAgent: SimulatedAgent = {
      id: `restored-${item.id}`,
      name: item.title,
      prompt: item.prompt || '恢复的历史提示词',
      model: 'GPT-5.5 High',
      status: 'completed',
      progress: 100,
      steps: [],
      timestamp: String(new Date().toLocaleTimeString()),
      logs: [`[system] 会话已从备份库恢复。`, `[auth] 令牌验证成功。`],
      files: [],
      response: item.response || '这是恢复的内容。'
    };
    
    setAgents([restoredAgent]);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: '确认删除记录',
      message: '此操作将永久删除该条对话记录，无法撤销。',
      confirmText: '确认删除',
      isDestructive: true,
      onConfirm: () => {
        setRecentHistory(prev => prev.filter(item => item.id !== id));
        onShowNotification('记录已删除', 'info');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: '清空所有记录',
      message: '确定要清空所有对话记录吗？此操作不可恢复。',
      confirmText: '全部清空',
      isDestructive: true,
      onConfirm: () => {
        setRecentHistory([]);
        onShowNotification('所有历史记录已清空', 'info');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const clearCurrentSession = () => {
    if (agents.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: '重置当前会话',
      message: '确定要清除当前正在进行的会话吗？未保存的内容将会丢失。',
      confirmText: '确认重置',
      isDestructive: true,
      onConfirm: () => {
        setAgents([]);
        onShowNotification('当前会话已重置', 'info');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deletePipeline = (pipe: AutomationPipeline) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除自动化流水线',
      message: `确定要删除 "${pipe.title}" 吗？此操作无法撤销。`,
      confirmText: '确认删除',
      isDestructive: true,
      onConfirm: () => {
        setPipelines(prev => prev.filter(p => p.id !== pipe.id));
        onShowNotification(`已剥离并删除 "${pipe.title}" 节点自动化。`, 'info');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const formatTimeHHMM = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  const generateAgentResponse = (prompt: string, model: string, templateId: string = 'coder'): string => {
    const norm = prompt.trim();
    if (norm === '你好' || norm === 'hello' || norm === 'Hi' || norm === '哈喽' || norm === '') {
      if (templateId === 'auditor') {
        return '安全审计员 Security Shield 已就绪。\n\n**核心关注**: 漏洞防御、权限越权、生产环境合规。\n\n请上传代码或描述您关注的安全风险点。';
      }
      if (templateId === 'designer') {
        return '你好！我是您的交互视觉架构师。\n\n**专业方向**: Tailwind CSS 实战、响应式动效、设计系统构建。\n\n我们可以开始讨论 UI 设计稿或动画方案。';
      }
      return '你好。我是 AsteroidRouter。\n\n**技术栈**: TypeScript, JavaScript, SQL, Node.js, 架构设计。\n\n请提交你的代码、系统设计或技术问题。';
    }
    
    if (norm.includes('内存泄漏')) {
      return '### 🔍 内存泄漏分析报告\n\n针对您提交的代码，已启动代码审计和内存分配追踪：\n\n1. **检测到闭包不当引用**: 在 `useEffect` 订阅或局部闭包中未能及时释放定时器或外部变量引用。\n2. **DOM 关联解绑残留**: 脱离文档流的 DOM 元素仍在组件全局 Ref 中缓存，导致 GC (垃圾回收) 无法清理。\n3. **观察者模式未解绑**: 事件监听器 `addEventListener` 未在组件销毁钩子中取消调用。\n\n**💡 推荐方案**: 确保在组件 `cleanup` 阶段彻底执行 `clearInterval` / `removeEventListener` 并置为空引用。';
    }
    
    if (templateId === 'auditor') {
      return `### 🛡️ 安全合规审计报告 (节点: \`${model}\`)\n\n我已对您输入的逻辑进行了多维度的安全深度遍历：\n\n- **静态指纹匹配**: 未发现明显的硬编码密钥或明文凭据泄露。\n- **SQL 注入风险**: 检测到您的数据查询层未充分使用参数化查询，建议立即重构。\n- **依赖项健康**: 项目引用的第三方包中有 2 个存在已知的 CVE 中级漏洞，建议执行 \`npm audit fix\`。\n\n请指示是否需要我针对发现的漏洞生成自动修复 PR？`;
    }

    if (templateId === 'designer') {
       return `### 🎨 UI/UX 优化建议 (设计引擎: \`${model}\`)\n\n已基于现代 Web 设计规范对您的构想进行了视觉分层：\n\n- **色彩系统**: 建议将主色调饱和度降低 5%，以提升暗光环境下用户长时间使用的舒适度。\n- **布局节奏**: 这里的卡片间隙建议从 \`gap-4\` 升级为 \`gap-6\`，以提供更多的“呼吸感”。\n- **交互反馈**: 为按钮增加 \`motion\` scale 动效，可以在触觉反馈上显著提升产品的精致感。\n\n需要我为您编写具体的 Tailwind CSS 布局代码吗？`;
    }

    if (norm.includes('自驱动自动化') || norm.includes('自动化')) {
      return '### ⚙️ 自动驾驶流水线就绪\n\n我已为您激活自驱动自动化装配流程。\n\n- **自动化监测已绑定**: 项目现已挂接 GitHub Webhook 拦截器。\n- **静态分析与测试构建**: 每当您更新 `/src` 中的核心组件，我将自动拦截并运行全量的 AST 编译合规检查。\n- **错误自动追踪**: 遇到异常逻辑后将直接通知「机器机器人」进行定位和一键漏洞修复。';
    }
    
    return `### 🚀 收到高级指令：编译、审查与打包指令

你好！我是 AsteroidRouter 智能引擎 (计算引擎: \`${model}\`)。已成功接入您的工作区环境。

- **正在定位文件语义树**: 完成了核心运行时、类声明单元及环境契约的审计。
- **正在审查高危隐患**: 未检测到严重的全局拒绝服务 (DDoS) 漏洞，但针对外部 API 已开启沙盒拦截。
- **正在合成代码变动**: 如果需要，我可以帮助您直接注入新的逻辑代码至内存缓冲区，支持在线静态打包发布。

请告诉我们需要执行哪一部分的具体代码重构或单元测试编写！`;
  };

  const parseInlineFormatting = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;
    const formatRegex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    let match;
    
    while ((match = formatRegex.exec(text)) !== null) {
      const matchStart = match.index;
      if (matchStart > currentIdx) {
        parts.push(text.substring(currentIdx, matchStart));
      }
      
      if (match[2]) {
        parts.push(<strong key={matchStart} className="font-bold text-neutral-900 font-sans">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(
          <code key={matchStart} className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10.5px] text-zinc-800 font-mono mx-0.5">
            {match[3]}
          </code>
        );
      }
      
      currentIdx = formatRegex.lastIndex;
    }
    
    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const formatMessageText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-neutral-900 mt-2.5 mb-2 font-sans">
            {parseInlineFormatting(line.slice(4))}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        const isOrdered = /^\d+\.\s/.test(line);
        const content = isOrdered ? line.replace(/^\d+\.\s/, '') : line.slice(2);
        return (
          <div key={idx} className="flex gap-2 text-xs text-neutral-700 ml-3 my-1 font-sans">
            <span className="text-zinc-400 shrink-0 select-none">
              {isOrdered ? line.match(/^\d+\./)?.[0] : '•'}
            </span>
            <span className="leading-relaxed">{parseInlineFormatting(content)}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="text-[12.5px] text-[#444748] leading-relaxed min-h-[0.8rem] my-1 font-sans">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  const toggleLogs = (agentId: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList) return;

    const newAttachments: { id: string; name: string; size: string; type: 'file' | 'image'; url?: string }[] = [];

    Array.from(filesList).forEach((file: any) => {
      const isImage = file.type.startsWith('image/');
      const formattedSize = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      const attachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: formattedSize,
        type: (isImage ? 'image' : 'file') as 'file' | 'image',
        url: isImage ? URL.createObjectURL(file) : undefined
      };
      newAttachments.push(attachment);
    });

    setAttachedFiles(prev => [...prev, ...newAttachments]);
    onShowNotification(`已添加 ${newAttachments.length} 个文件和图片！`, 'success');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const filesList = e.dataTransfer.files;
    if (!filesList) return;

    const newAttachments: { id: string; name: string; size: string; type: 'file' | 'image'; url?: string }[] = [];

    Array.from(filesList).forEach((file: any) => {
      const isImage = file.type.startsWith('image/');
      const formattedSize = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      const attachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: formattedSize,
        type: (isImage ? 'image' : 'file') as 'file' | 'image',
        url: isImage ? URL.createObjectURL(file) : undefined
      };
      newAttachments.push(attachment);
    });

    setAttachedFiles(prev => [...prev, ...newAttachments]);
    onShowNotification(`已通过拖拽添加 ${newAttachments.length} 个文件！`, 'success');
  };
  const [pipelines, setPipelines] = useState<AutomationPipeline[]>([
    {
      id: 'pipe-1',
      title: 'GitHub 代码自动审查代理',
      type: 'github',
      triggerText: '频率: 即时出发 (代码合并/提交)',
      executor: 'AsteroidRouter-Coder',
      enabled: true,
      logs: [
        { id: 'log-1-1', time: '10-24 15:30', desc: '审查 PR #413: 内存分配标准正常，修复 2 处未处理 of Exception', badge: '450T' },
        { id: 'log-1-2', time: '10-24 12:12', desc: '审查 PR #412: 未检测到异常，无痛合并', badge: '310T' }
      ]
    },
    {
      id: 'pipe-2',
      title: '每日晨会 SaaS 核心指标总结',
      type: 'cron',
      triggerText: '频率: 每天 09:00 AM',
      executor: 'GPT-5.5 High',
      enabled: false,
      logs: [
        { id: 'log-2-1', time: '10-24 09:00', desc: '指标生成成功: 激活率提升 14.5%，昨日异常告警 0 起', badge: '890T' }
      ]
    }
  ]);
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [newPipeTitle, setNewPipeTitle] = useState('');
  const [newPipeTrigger, setNewPipeTrigger] = useState('频率: 每天 18:00 PM');
  const [newPipeExecutor, setNewPipeExecutor] = useState('AsteroidRouter-Coder');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea on keypress '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        if (document.activeElement !== textareaRef.current) {
          e.preventDefault();
          if (textareaRef.current) {
            textareaRef.current.focus();
            setInputText(prev => prev.startsWith('/') ? prev : '/' + prev);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendPrompt = (textToSend = inputText) => {
    if (!textToSend.trim() && attachedFiles.length === 0) {
      onShowNotification('请先输入指令想法，或添加文件/图片附件以激活代理！', 'error');
      return;
    }

    const newAgentPrompt = textToSend.trim() || `已发送 ${attachedFiles.length} 个附件进行自动化分析`;
    const newAgentName = textToSend.trim() 
      ? (textToSend.length > 15 ? textToSend.substring(0, 15) + '...' : textToSend)
      : `附件解析：${attachedFiles[0]?.name || '未命名'}`;

    // Add to recent history if it's the first message of a new session
    if (agents.length === 0) {
      setRecentHistory(prev => [
        { id: `h-${Date.now()}`, title: newAgentName, time: '刚刚' },
        ...prev
      ].slice(0, 15)); // Keep last 15
    }
    const newAgent: SimulatedAgent = {
      id: `agent-${Date.now().toString().slice(-4)}`,
      name: newAgentName,
      prompt: newAgentPrompt,
      model: selectedModel,
      timestamp: formatTimeHHMM(),
      status: 'running',
      progress: 10,
      steps: [
        { label: '解析需求与指令模式', status: 'running' },
        { label: '定位微服务文件树模块', status: 'pending' },
        { label: '重构并渲染 TypeScript 主机编译包', status: 'pending' },
        { label: '部署验证并进行静态类型合规检查', status: 'pending' },
      ],
      logs: [
        `[${formatTimeHHMM()}] [system] 初始化开发代理计算节点。`,
        `[${formatTimeHHMM()}] [compiler] 载入大语言代码模型配置: ${selectedModel}。`,
        `[${formatTimeHHMM()}] [network] 建立临时远程双向热重载通道。`
      ],
      files: [...attachedFiles],
      response: generateAgentResponse(newAgentPrompt, selectedModel, activeAgentTemplate.id)
    };

    setAgents(prev => [newAgent, ...prev]);
    setInputText('');
    setAttachedFiles([]);
    onShowNotification('🎉 代理创建成功，正在开始自动化构建！', 'success');

    // Simulate build progress
    let currentProgress = 10;
    const interval = setInterval(() => {
      setAgents(prev => {
        return prev.map(a => {
          if (a.id === newAgent.id) {
            if (a.progress >= 100) {
              clearInterval(interval);
              return { ...a, status: 'completed' as const, progress: 100 };
            }

            const nextProgress = a.progress + 30;
            const updatedSteps = [...a.steps];
            const updatedLogs = [...a.logs];

            if (nextProgress >= 40 && nextProgress < 70) {
              updatedSteps[0] = { ...updatedSteps[0], status: 'done' };
              updatedSteps[1] = { ...updatedSteps[1], status: 'running' };
              updatedLogs.push(`[${new Date().toLocaleTimeString()}] [analyzer] 成功定位并锁定 12 个关联 AST 组件块。`);
            } else if (nextProgress >= 70 && nextProgress < 100) {
              updatedSteps[1] = { ...updatedSteps[1], status: 'done' };
              updatedSteps[2] = { ...updatedSteps[2], status: 'running' };
              updatedLogs.push(`[${new Date().toLocaleTimeString()}] [generator] 代码优化编辑就绪，已智能补足 ${Math.floor(Math.random() * 50) + 12} 行安全断言。`);
            } else if (nextProgress >= 100) {
              updatedSteps[2] = { ...updatedSteps[2], status: 'done' };
              updatedSteps[3] = { ...updatedSteps[3], status: 'done' };
              updatedLogs.push(`[${new Date().toLocaleTimeString()}] [deploy] 临时测试编译沙箱通过(0个语法错误)，云端同步构建已就绪！`);
            }

            return {
              ...a,
              progress: Math.min(nextProgress, 100),
              steps: updatedSteps,
              logs: updatedLogs
            };
          }
          return a;
        });
      });
    }, 1500);
  };

  const userName = userEmail.split('@')[0];

  return (
    <div className="min-h-screen bg-[#f9f9f8] text-[#1a1c1c] flex font-sans antialiased relative">
      
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white/95 backdrop-blur border-b border-[#c4c7c7] flex items-center justify-between px-4 z-40 select-none shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#1a1c1c] cursor-pointer"
          >
            <Menu className="w-5 h-5 text-[#1a1c1c]" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white">
              <Rocket className="w-3.5 h-3.5 text-[#2DE1C2]" />
            </div>
            <span className="text-xs font-bold text-black font-sans leading-none">AsteroidRouter</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold bg-[#2DE1C2] text-[#005c4d] leading-none font-sans">
            PRO
          </span>
        </div>
      </header>

      {/* 1. SideNavBar Panel (Desktop) */}
      <aside className="hidden md:flex w-[240px] h-screen fixed left-0 top-0 border-r border-[#c4c7c7] bg-[#f9f9f8] flex-col p-4 z-30">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white">
            <Rocket className="w-4.5 h-4.5 text-[#2DE1C2]" />
          </div>
          <div>
            <h1 className="text-sm font-sans font-bold text-black tracking-tight leading-none">AsteroidRouter</h1>
            <div className="flex items-center gap-1.5 mt-1.5 select-none font-sans shrink-0">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold bg-[#2DE1C2] text-[#005c4d] leading-none">
                PRO
              </span>
              <span className="text-[10px] text-neutral-600 font-sans font-medium leading-none">
                专业版计划 · 已启用
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {/* New Chat */}
          <button 
            onClick={clearCurrentSession}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-left cursor-pointer ${
              activeSideTab === 'new' 
                ? 'text-black font-bold bg-[#eeeeed] scale-[0.98]' 
                : 'text-[#444748] hover:bg-[#f3f4f3]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PlusSquare className="w-4 h-4 text-black shrink-0" />
              <span className="text-xs font-sans">新建聊天</span>
            </div>
            <Plus className="w-3 h-3 text-zinc-400" />
          </button>

          {/* Automation */}
          <button 
            onClick={() => {
              setActiveSideTab('automation');
              onShowNotification('进入自动化流水线工作空间。', 'info');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-left cursor-pointer ${
              activeSideTab === 'automation' 
                ? 'text-black font-bold bg-[#eeeeed] scale-[0.98]' 
                : 'text-[#444748] hover:bg-[#f3f4f3]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GitFork className="w-4 h-4 text-zinc-500 shrink-0 transform rotate-90" />
              <span className="text-xs font-sans">自动化</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Bug Bot */}
          <button 
            onClick={() => {
              setActiveSideTab('bugbot');
              onShowNotification('正在分析项目运行时错误收集端，启动错误微修护。', 'info');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-left cursor-pointer ${
              activeSideTab === 'bugbot' 
                ? 'text-black font-bold bg-[#eeeeed] scale-[0.98]' 
                : 'text-[#444748] hover:bg-[#f3f4f3]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs font-sans">机器机器人</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Console Option */}
          <button 
            onClick={() => {
              onShowNotification('成功接入 Asteroid 控制台底座中心。', 'success');
              onNavigateToConsole();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-[#444748] hover:bg-[#f3f4f3] rounded-lg transition-colors text-left cursor-pointer font-sans"
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs font-sans">控制台</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          </button>

          {/* Realtime monitoring */}
          <button 
            onClick={() => {
              onShowNotification('启动实时微秒级代理链路流量分析面板。', 'info');
              onNavigateToConsole('usage');
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-[#444748] hover:bg-[#f3f4f3] rounded-lg transition-colors text-left cursor-pointer font-sans"
          >
            <div className="flex items-center gap-2.5">
              <Tv className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs font-sans">实时监控</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
          </button>

          {/* Docs link */}
          <a
            href="https://www.asteroidclothing.com/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 text-[#444748] hover:bg-[#f3f4f3] rounded-lg transition-colors text-left cursor-pointer font-sans no-underline"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs font-sans">官方技术文档</span>
            </div>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>

          {/* Recent History Section */}
          <div className="pt-8 pb-2 px-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span>最近记录</span>
                <Clock className="w-3 h-3 text-zinc-300" />
              </div>
              {recentHistory.length > 0 && (
                <button 
                  onClick={clearAllHistory}
                  className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="清空全部"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {recentHistory.length > 0 ? (
                recentHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => restoreSession(item)}
                    className="w-full flex items-center justify-between px-2 py-2 text-left rounded-lg hover:bg-[#f3f4f3] active:scale-[0.98] group transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex flex-col items-start overflow-hidden mr-6">
                      <div className="flex items-center gap-1.5 w-full">
                        <MessageSquare className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                        <span className="text-[11px] font-medium text-neutral-700 truncate w-full group-hover:text-black">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-400 mt-0.5 ml-4">{item.time}</span>
                    </div>
                    
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 rounded text-zinc-400 hover:text-rose-600 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center border-2 border-dashed border-zinc-100 rounded-xl">
                  <p className="text-[9px] text-zinc-400 font-sans">暂无最近对话记录</p>
                </div>
              )}
            </div>
          </div>

        </nav>

        {/* Profile & Logoff */}
        <div className="mt-auto pt-4 border-t border-[#c4c7c7] flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs ring-1 ring-zinc-200 shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#1a1c1c] truncate capitalize">{userName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded py-1.5 px-2 text-left transition-colors font-sans mt-1"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* SideNavBar Panel (Mobile Trigger Slide-out) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Modal mask backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
            />
            
            {/* Sidebar sliding block with tactile drag dismissal */}
            <motion.aside 
              drag="x"
              dragConstraints={{ left: -240, right: 0 }}
              dragElastic={{ left: 0.15, right: 0 }}
              dragMomentum={false}
              onDragEnd={(event, info) => {
                if (info.offset.x < -60 || info.velocity.x < -200) {
                  setMobileMenuOpen(false);
                }
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="relative w-[240px] h-full border-r border-[#c4c7c7] bg-[#f9f9f8] flex flex-col p-4 z-50 shadow-2xl touch-pan-y"
            >
              {/* Swipe dismissal visual indicator/pull handle */}
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-20 flex items-center justify-center cursor-ew-resize active:cursor-grabbing md:hidden pointer-events-none">
                <div className="w-1.5 h-12 bg-zinc-400/70 rounded-full shadow-xs animate-pulse" />
              </div>

              <div className="flex items-center justify-between mb-8 px-2 pr-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white">
                    <Rocket className="w-4.5 h-4.5 text-[#2DE1C2]" />
                  </div>
                  <div>
                    <h1 className="text-sm font-sans font-bold text-black tracking-tight leading-none mr-2">AsteroidRouter</h1>
                    <div className="flex items-center gap-1.5 mt-1.5 select-none font-sans shrink-0">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold bg-[#2DE1C2] text-[#005c4d] leading-none">
                        PRO
                      </span>
                      <span className="text-[10px] text-neutral-600 font-sans font-medium leading-none">
                        专业版计划
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#eeeeed] text-zinc-500 cursor-pointer"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {/* New Chat */}
                <button 
                  onClick={() => {
                    setActiveSideTab('new');
                    setMobileMenuOpen(false);
                    setAgents([]);
                    onShowNotification('已为您开启全新的 Coder 代理会话。', 'success');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                    activeSideTab === 'new'
                      ? 'text-black font-bold bg-[#eeeeed] scale-[0.98]' 
                      : 'text-[#444748] hover:bg-[#f3f4f3]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PlusSquare className="w-4 h-4 text-black shrink-0" />
                    <span className="text-xs font-sans">新建聊天</span>
                  </div>
                  <Plus className="w-3 h-3 text-zinc-400" />
                </button>

                {/* Automation */}
                <button 
                  onClick={() => {
                    setActiveSideTab('automation');
                    setMobileMenuOpen(false);
                    onShowNotification('进入自动化流水线工作空间。', 'info');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-all duration-200 cursor-pointer ${
                    activeSideTab === 'automation' 
                      ? 'text-black font-bold bg-[#eeeeed] scale-[0.98]' 
                      : 'text-[#444748] hover:bg-[#f3f4f3]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GitFork className="w-4 h-4 text-zinc-500 shrink-0 transform rotate-90" />
                    <span className="text-xs font-sans">自动化</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Bug Bot */}
                <button 
                  onClick={() => {
                    setActiveSideTab('bugbot');
                    setMobileMenuOpen(false);
                    onShowNotification('正在分析项目运行时错误收集端，启动错误微修护。', 'info');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-all duration-200 cursor-pointer ${
                    activeSideTab === 'bugbot' 
                      ? 'text-black font-bold bg-[#eeeeed] scale-[0.98]' 
                      : 'text-[#444748] hover:bg-[#f3f4f3]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-xs font-sans">机器机器人</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Console Option */}
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onShowNotification('成功接入 Asteroid 控制台底座中心。', 'success');
                    onNavigateToConsole();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[#444748] hover:bg-[#f3f4f3] rounded-lg transition-colors text-left cursor-pointer font-sans"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-xs font-sans">控制台</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                </button>

                {/* Realtime monitoring */}
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onShowNotification('启动实时微秒级代理链路流量分析面板。', 'info');
                    onNavigateToConsole('usage');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[#444748] hover:bg-[#f3f4f3] rounded-lg transition-colors text-left cursor-pointer font-sans"
                >
                  <div className="flex items-center gap-2.5">
                    <Tv className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-xs font-sans">实时监控</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                </button>

                {/* Docs link */}
                <a
                  href="https://www.asteroidclothing.com/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 text-[#444748] hover:bg-[#f3f4f3] rounded-lg transition-colors text-left cursor-pointer font-sans no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="text-xs font-sans">官方技术文档</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>

              </nav>

              {/* Profile & Logoff */}
              <div className="mt-auto pt-4 border-t border-[#c4c7c7] flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs ring-1 ring-zinc-200 shrink-0 select-none">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#1a1c1c] truncate capitalize leading-tight">{userName}</p>
                    <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">{userEmail}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded py-1.5 px-2 text-left transition-colors font-sans mt-1"
                >
                  退出登录
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main Workspace Area */}
      <main className="ml-0 md:ml-[240px] flex-1 min-h-screen flex flex-col items-center w-full pt-14 md:pt-0">
        
        {/* Top Banner Notification */}
        <div className="w-full max-w-4xl mt-4 md:mt-8 px-4 md:px-6">
          <div className="flex items-center justify-between bg-[#E5F7F4]/90 backdrop-blur border border-[#BEECE4] px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-xs text-[#0F5B4E] font-medium font-sans">
                使用云代理实时搜索需要订阅升级
              </span>
            </div>
            <button 
              onClick={() => onNavigateToConsole('checkout')}
              className="text-[#0F5B4E] hover:text-emerald-950 font-bold text-xs hover:underline transition-all flex items-center gap-1 cursor-pointer font-sans"
            >
              升级企业云通道 ↗
            </button>
          </div>
        </div>

        {/* Dynamic Center Workstation or Active Agents Feed */}
        <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center py-4 md:py-6 px-4 md:px-6 pb-12">
          
          {/* 1. New Agent Workspace (default) */}
          {activeSideTab === 'new' && (
            <div className="w-full flex flex-col items-center">
              
              {agents.length === 0 && (
                <>
                  <div className="w-full max-w-3xl mb-8 animate-fade-in">
                  <div className="mb-6">
                    <h2 className="text-xl font-extrabold font-sans text-neutral-800 tracking-tight">
                      开启新会话
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-sans">
                      选择一个专业代理模版开始构建您的工作流
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {AGENT_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setActiveAgentTemplate(template);
                          onShowNotification(`已切换至 "${template.name}"`, 'success');
                        }}
                        className={`group relative p-5 bg-white border rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col ${
                          activeAgentTemplate.id === template.id 
                            ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                            : 'border-[#c4c7c7] border-dashed hover:border-neutral-800 hover:border-solid'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
                          style={{ backgroundColor: activeAgentTemplate.id === template.id ? template.color : '#f3f4f3' }}
                        >
                          {template.icon}
                        </div>
                        
                        <h4 className="text-sm font-bold text-neutral-800 mb-1.5">{template.name}</h4>
                        <p className="text-[10px] text-neutral-500 leading-normal font-sans mb-4 flex-1">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center gap-2 pt-3 border-t border-neutral-50">
                          <Cpu className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tighter">{template.model}</span>
                        </div>

                        {activeAgentTemplate.id === template.id && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              {/* Main prompt center workstation box */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="w-full max-w-3xl bg-white border border-[#c4c7c7] rounded-xl md:rounded-[24px] shadow-sm p-4 md:p-6 mb-6 transition-all hover:border-[#747878] relative"
              >
                    {/* Drag-and-drop state overlay */}
                    {isDragging && (
                      <div className="absolute inset-0 bg-neutral-900/5 backdrop-blur-[1px] border-2 border-dashed border-indigo-505 rounded-[24px] flex items-center justify-center z-40 pointer-events-none">
                        <p className="text-sm font-bold text-indigo-700 font-sans">把文件或图片拖放到这里上传 📂</p>
                      </div>
                    )}

                    {/* Attachment Chips list */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 mt-1 pb-3 border-b border-zinc-100">
                        {attachedFiles.map((file) => (
                          <div key={file.id} className="relative group flex items-center gap-2 bg-[#f4f4f3] border border-[#D5D7D7] rounded-xl p-2 pr-8 shrink-0 max-w-[200px]">
                            {file.type === 'image' ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-250 shrink-0">
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center shrink-0">
                                <Archive className="w-4 h-4 text-zinc-650" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 truncate leading-tight">{file.name}</p>
                              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">{file.size}</p>
                            </div>
                            <button 
                              onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                              className="absolute right-1 text-zinc-400 hover:text-rose-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Input Area */}
                    <div className="min-h-[100px]">
                      <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPrompt();
                          }
                        }}
                        className="w-full border-none focus:ring-0 text-sm bg-transparent placeholder-neutral-400 resize-none font-sans outline-none focus:outline-none focus:ring-transparent text-[#1a1c1c] leading-relaxed"
                        placeholder={`让 ${activeAgentTemplate.name} 展示其能力...`}
                        rows={3}
                      />
                    </div>
                    
                    {/* Quick suggestions/actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {activeAgentTemplate.id === 'coder' && (
                        <>
                          <button onClick={() => setInputText('在此项目中实现一个简单的用户验证系统。')} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer">
                            实现认证系统
                          </button>
                          <button onClick={() => setInputText('分析当前项目的依赖树并检查冗余项。')} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer">
                            审计依赖项
                          </button>
                        </>
                      )}
                      {activeAgentTemplate.id === 'auditor' && (
                        <>
                          <button onClick={() => setInputText('扫描此存储库中的硬编码密钥和凭据。')} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer">
                            漏洞扫描
                          </button>
                          <button onClick={() => setInputText('检查所有的 SQL 查询是否存在注入漏洞。')} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer">
                            SQL 安全审计
                          </button>
                        </>
                      )}
                      {activeAgentTemplate.id === 'designer' && (
                        <>
                          <button onClick={() => setInputText('为当前的控制台界面生成一套深色模式配色方案。')} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer">
                            深色模式建议
                          </button>
                          <button onClick={() => setInputText('提供几个现代化的按钮点击动效示例。')} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer">
                            高级动效开发
                          </button>
                        </>
                      )}
                    </div>

                    {/* Footer Buttons Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 relative">
                      <div className="flex items-center gap-2">
                        
                        {/* Model Selector Dropdown Trigger */}
                        <div className="relative">
                          <button 
                            onClick={() => {
                              setShowModelsDropdown(!showModelsDropdown);
                              setShowMcpDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f4f3] hover:bg-[#e2e2e1] transition-colors rounded-lg text-xs font-semibold text-neutral-800 cursor-pointer font-sans"
                          >
                            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                            {selectedModel}
                            <ChevronDown className="w-3 h-3 text-zinc-500" />
                          </button>

                          <AnimatePresence>
                            {showModelsDropdown && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute left-0 mt-1.5 w-44 bg-white border border-[#c4c7c7] rounded-lg shadow-lg py-1 z-50 text-xs font-sans"
                              >
                                {['GPT-5.5 High', 'Claude 4.8 Opus', 'Gemini 3.5 Pro', 'DeepThink V3'].map((m) => (
                                  <button
                                    key={m}
                                    onClick={() => {
                                      setSelectedModel(m);
                                      setShowModelsDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left hover:bg-[#f3f4f3] ${selectedModel === m ? 'font-bold bg-[#eeeeed]' : ''}`}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* MCP Tools Dropdown Trigger */}
                        <div className="relative">
                          <button 
                            onClick={() => {
                              setShowMcpDropdown(!showMcpDropdown);
                              setShowModelsDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5D7D7] hover:border-neutral-400 transition-colors rounded-lg text-xs font-semibold text-neutral-700 cursor-pointer font-sans"
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-500" />
                            MCP 桥接工具
                            <ChevronDown className="w-3 h-3 text-zinc-500" />
                          </button>

                          <AnimatePresence>
                            {showMcpDropdown && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute left-0 mt-1.5 w-52 bg-white border border-[#c4c7c7] rounded-lg shadow-lg p-2.5 z-50 text-xs font-sans space-y-2 text-[#444748]"
                              >
                                <p className="font-bold text-[#1a1c1c] border-b pb-1.5 mb-1.5 text-[10px] uppercase tracking-wider">可用物理底层插件 ({currentPlan === 'free' ? '免费版' : '专业级版'})</p>
                                <div className="space-y-1.5">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-black focus:ring-black w-3.5 h-3.5" />
                                    <span>FileSystem-Local API</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-black focus:ring-black w-3.5 h-3.5" />
                                    <span>WebSearch Grounding</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-zinc-300 text-black focus:ring-black w-3.5 h-3.5" />
                                    <span>Docker Host Execution</span>
                                  </label>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Independent Globe icon button */}
                        <button 
                          onClick={() => onShowNotification('已激活全球网页搜索增强通道 (WebSearch Grounding)。', 'info')}
                          className="flex items-center justify-center w-8 h-8 rounded-full border border-[#D5D7D7] bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-colors text-zinc-500 cursor-pointer"
                          title="激活网页实时获取"
                        >
                          <Globe className="w-4 h-4 text-zinc-500" />
                        </button>

                      </div>

                      {/* Utility actions on Right */}
                      <div className="flex items-center gap-2">
                        {/* Hidden input file picker for manual click */}
                        <input 
                          type="file" 
                          id="agent-file-picker-empty" 
                          className="hidden" 
                          multiple 
                          onChange={handleFileChange} 
                        />
                        <button 
                          onClick={() => document.getElementById('agent-file-picker-empty')?.click()}
                          className="p-1.5 shrink-0 border border-neutral-200 hover:bg-[#f3f4f3] rounded-lg transition-colors cursor-pointer text-zinc-500 flex items-center justify-center"
                          title="附加凭证、代码文本文件或设计图图片"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        
                        {/* Privacy Toggle (Empty State) */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPiiMaskingEnabled(!piiMaskingEnabled);
                              onShowNotification(`隐私 PII 脫敏功能已${!piiMaskingEnabled ? '开启' : '关闭'}`, 'info');
                            }}
                            className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border transition-all text-[9px] font-bold font-sans cursor-pointer ${
                              piiMaskingEnabled 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                            }`}
                          >
                            <ShieldCheck className={`w-3 h-3 ${piiMaskingEnabled ? 'text-emerald-500' : 'text-neutral-400'}`} />
                            {piiMaskingEnabled ? 'PII ON' : 'PII OFF'}
                          </button>
                        </div>

                        <button 
                          onClick={() => handleSendPrompt()}
                          className="w-8 h-8 bg-black text-white hover:bg-zinc-800 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs"
                          title="启动代理"
                        >
                          <ArrowUp className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* If agents list is NOT EMPTY (has items), we show:
                 1. Dynamic Feed showing active agents stack (Outputs/Feeds FIRST at the TOP)
                 2. Main prompt center workstation box (Inputs SECOND at the BOTTOM)
              */}
              {agents.length > 0 ? (
                <div className="w-full flex flex-col gap-6">
                  {/* Dynamic Feed showing active agents stack as dialogue FIRST */}
                  <div className="w-full flex flex-col space-y-6 text-left">
                    <div className="flex items-center justify-between border-b border-[#eeeeed] pb-3 mb-2">
                      <span className="text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
                        当前会话历史 ({agents.length} 轮)
                      </span>
                      <button 
                        onClick={clearCurrentSession} 
                        className="text-[10px] text-[#444748] hover:text-rose-600 transition-colors font-bold cursor-pointer font-sans"
                      >
                        清空会话
                      </button>
                    </div>

                    <div className="flex flex-col space-y-8 w-full">
                      {[...agents].reverse().map((agent) => (
                        <div key={agent.id} className="w-full flex flex-col space-y-6">
                          
                          {/* 1. User Message (Right Align) */}
                          <div className="flex justify-end items-start gap-2.5 w-full sm:w-[88%] ml-auto animate-fade-in">
                            <div className="flex flex-col items-end max-w-[88%] sm:max-w-[85%]">
                              {/* Attached Files & Images */}
                              {agent.files && agent.files.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                                  {agent.files.map((file) => (
                                    <div key={file.id} className="flex items-center gap-2 bg-[#eeeeed] border border-zinc-200 rounded-xl p-1.5 shrink-0 max-w-[200px]">
                                      {file.type === 'image' ? (
                                        <div className="w-6 h-6 rounded overflow-hidden bg-neutral-200 shrink-0">
                                          <img src={file.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 bg-black/5 rounded flex items-center justify-center shrink-0">
                                          <Archive className="w-3.5 h-3.5 text-zinc-650" />
                                        </div>
                                      )}
                                      <div className="overflow-hidden text-left pr-1">
                                        <p className="text-[10px] font-bold text-neutral-800 truncate leading-tight">{file.name}</p>
                                        <p className="text-[8px] text-zinc-500 mt-0.5 leading-none">{file.size}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Message bubble core */}
                              <div className="bg-[#1a1c1c] text-white rounded-2xl sm:rounded-[22px] rounded-tr-[4px] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-sans tracking-wide leading-relaxed shadow-xs text-left whitespace-pre-wrap">
                                {agent.prompt}
                              </div>
                              
                              {/* Timestamp */}
                              <span className="text-[10px] text-zinc-400 mt-1 mr-1 font-sans select-none">{agent.timestamp}</span>
                            </div>

                            {/* User Initial Avatar in a small rounded square */}
                            <div className="w-8 h-8 rounded-[10px] bg-black text-white flex items-center justify-center font-bold text-xs ring-1 ring-zinc-350 shrink-0 select-none shadow-xs">
                              U
                            </div>
                          </div>

                          {/* 2. Agent Reply Message (Left Align) */}
                          <div className="flex justify-start items-start gap-2.5 w-full sm:w-[92%] mr-auto animate-fade-in">
                            {/* Agent Blue circle avatar */}
                            <div className="w-8 h-8 rounded-full bg-[#108ee9] text-white flex items-center justify-center font-extrabold text-sm shrink-0 border border-[#0d7cd1] shadow-xs select-none">
                              A
                            </div>

                            <div className="flex flex-col items-start max-w-[88%] sm:max-w-[85%] w-full">
                              {/* Message bubble card */}
                              <div className="bg-white border border-[#dcdcdc] rounded-2xl md:rounded-[22px] rounded-tl-[4px] px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-sans text-neutral-800 leading-relaxed shadow-sm w-full">
                                {agent.status === 'running' ? (
                                  <div className="space-y-3 py-1">
                                    <div className="flex items-center gap-2 text-neutral-800 font-sans font-semibold text-xs">
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#108ee9]" />
                                      <span>正在解析您的需求并启动自动化装配器 ({agent.progress}%)...</span>
                                    </div>
                                    
                                    {/* Small checklist tracking block */}
                                    <div className="text-[11px] font-sans text-neutral-500 pl-4 border-l-2 border-[#108ee9] py-0.5 space-y-1">
                                      <p className="font-semibold text-neutral-700">当前任务进度：</p>
                                      {agent.steps.map((st, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[10px]">
                                          {st.status === 'done' ? (
                                            <span className="text-emerald-500 font-bold">✓</span>
                                          ) : st.status === 'running' ? (
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                          ) : (
                                            <span className="text-zinc-355">•</span>
                                          )}
                                          <span className={st.status === 'done' ? 'text-zinc-400 line-through' : ''}>{st.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {formatMessageText(agent.response || '')}
                                  </div>
                                )}
                              </div>

                              {/* Helper utility details button under the card */}
                              <div className="flex items-center gap-3 mt-2 ml-2 relative z-10 select-none">
                                <span className="text-[10px] text-zinc-400 font-sans">{agent.timestamp}</span>
                                <span className="text-zinc-300 text-xs select-none">·</span>
                                <span className="text-[9px] font-mono font-bold text-zinc-500 bg-[#eeeeed] border border-zinc-200 px-1.5 py-0.2 rounded leading-none uppercase shrink-0">
                                  {agent.model}
                                </span>
                                <span className="text-zinc-300 text-xs select-none">·</span>
                                <button 
                                  onClick={() => toggleLogs(agent.id)}
                                  className="text-[10px] font-sans font-semibold text-zinc-500 hover:text-black hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Terminal className="w-3 h-3 text-zinc-450" />
                                  {expandedAgents[agent.id] ? '收起控制台' : '查看部署装配日志 (Stdout)'}
                                </button>
                              </div>

                              {/* Expandable build system shell stdout */}
                              {expandedAgents[agent.id] && (
                                <div className="mt-3.5 ml-2 w-full max-w-xl p-4 bg-neutral-900 text-emerald-400 rounded-xl border border-zinc-800 font-mono text-[10px] leading-relaxed shadow-lg space-y-3.5 animate-fade-in shrink-0">
                                  <div>
                                    <div className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 mb-2">部署装配项清单</div>
                                    <div className="space-y-1 text-zinc-300">
                                      {agent.steps.map((st, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          {st.status === 'done' ? (
                                            <span className="text-emerald-500 font-bold">✓</span>
                                          ) : st.status === 'running' ? (
                                            <span className="text-amber-500 animate-pulse">▶</span>
                                          ) : (
                                            <span className="text-zinc-650">○</span>
                                          )}
                                          <span className={st.status === 'done' ? 'text-zinc-500 line-through font-normal' : 'font-semibold text-neutral-200'}>
                                            {st.label}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 mb-2 font-sans">活动输出 (Stdout)</div>
                                    <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                                      {agent.logs.map((lg, i) => (
                                        <p key={i} className="text-[#a5d6a7] leading-relaxed truncate">{lg}</p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main prompt center workstation box SECOND/BELOW */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="w-full bg-white border border-[#c4c7c7] rounded-xl md:rounded-[24px] shadow-sm p-4 md:p-6 mb-6 transition-all hover:border-[#747878] relative"
                  >
                    {/* Drag-and-drop state overlay */}
                    {isDragging && (
                      <div className="absolute inset-0 bg-neutral-900/5 backdrop-blur-[1px] border-2 border-dashed border-indigo-505 rounded-[24px] flex items-center justify-center z-40 pointer-events-none">
                        <p className="text-sm font-bold text-indigo-700 font-sans">把文件或图片拖放到这里上传 📂</p>
                      </div>
                    )}

                    {/* Attachment Chips list */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 mt-1 pb-3 border-b border-zinc-100">
                        {attachedFiles.map((file) => (
                          <div key={file.id} className="relative group flex items-center gap-2 bg-[#f4f4f3] border border-[#D5D7D7] rounded-xl p-2 pr-8 shrink-0 max-w-[200px]">
                            {file.type === 'image' ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-250 shrink-0">
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center shrink-0">
                                <Archive className="w-4 h-4 text-zinc-650" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-800 truncate leading-tight">{file.name}</p>
                              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">{file.size}</p>
                            </div>
                            <button 
                              onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                              className="absolute right-1 text-zinc-400 hover:text-rose-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Input Area */}
                    <div className="min-h-[100px]">
                      <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPrompt();
                          }
                        }}
                        className="w-full border-none focus:ring-0 text-sm bg-transparent placeholder-neutral-400 resize-none font-sans outline-none focus:outline-none focus:ring-transparent text-[#1a1c1c] leading-relaxed"
                        placeholder="连续对话或处理更多资产文件：让 AsteroidRouter-Coder 构建、修复 bug，或拖入文件图片"
                        rows={3}
                      />
                    </div>

                    {/* Quick suggestions/actions (Feedback) */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
                      <button onClick={() => setInputText('继续分析上述代码的边缘情况。')} className="px-3.5 py-1.8 bg-zinc-50 border border-zinc-200 hover:border-neutral-400 hover:bg-white transition-all rounded-full text-[10px] font-bold text-neutral-600 shadow-xs cursor-pointer active:scale-95">
                        <Sparkles className="w-3 h-3 text-amber-500 inline mr-1" />
                        分析边缘情况
                      </button>
                      <button onClick={() => setInputText('为此功能编写单元测试用例。')} className="px-3.5 py-1.8 bg-zinc-50 border border-zinc-200 hover:border-neutral-400 hover:bg-white transition-all rounded-full text-[10px] font-bold text-neutral-600 shadow-xs cursor-pointer active:scale-95">
                        <Archive className="w-3 h-3 text-indigo-500 inline mr-1" />
                        编写测试用例
                      </button>
                      <button onClick={() => setInputText('优化此实现的运行时性能。')} className="px-3.5 py-1.8 bg-zinc-50 border border-zinc-200 hover:border-neutral-400 hover:bg-white transition-all rounded-full text-[10px] font-bold text-neutral-600 shadow-xs cursor-pointer active:scale-95">
                        <Zap className="w-3 h-3 text-sky-500 inline mr-1" />
                        性能优化
                      </button>
                    </div>

                    {/* Footer Buttons Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 relative">
                      <div className="flex items-center gap-2">
                        
                        {/* Model Selector Dropdown Trigger */}
                        <div className="relative">
                          <button 
                            onClick={() => {
                              setShowModelsDropdown(!showModelsDropdown);
                              setShowMcpDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f4f3] hover:bg-[#e2e2e1] transition-colors rounded-lg text-xs font-semibold text-neutral-800 cursor-pointer font-sans"
                          >
                            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                            {selectedModel}
                            <ChevronDown className="w-3 h-3 text-zinc-500" />
                          </button>

                          <AnimatePresence>
                            {showModelsDropdown && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute left-0 mt-1.5 w-44 bg-white border border-[#c4c7c7] rounded-lg shadow-lg py-1 z-50 text-xs font-sans"
                              >
                                {['GPT-5.5 High', 'Claude 4.8 Opus', 'Gemini 3.5 Pro', 'DeepThink V3'].map((m) => (
                                  <button
                                    key={m}
                                    onClick={() => {
                                      setSelectedModel(m);
                                      setShowModelsDropdown(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left hover:bg-[#f3f4f3] ${selectedModel === m ? 'font-bold bg-[#eeeeed]' : ''}`}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* MCP Tools Dropdown Trigger */}
                        <div className="relative">
                          <button 
                            onClick={() => {
                              setShowMcpDropdown(!showMcpDropdown);
                              setShowModelsDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5D7D7] hover:border-neutral-400 transition-colors rounded-lg text-xs font-semibold text-neutral-700 cursor-pointer font-sans"
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-500" />
                            MCP 桥接工具
                            <ChevronDown className="w-3 h-3 text-zinc-500" />
                          </button>

                          <AnimatePresence>
                            {showMcpDropdown && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute left-0 mt-1.5 w-52 bg-white border border-[#c4c7c7] rounded-lg shadow-lg p-2.5 z-55 text-xs font-sans space-y-2 text-[#444748] text-left"
                              >
                                <p className="font-bold text-[#1a1c1c] border-b pb-1.5 mb-1.5 text-[10px] uppercase tracking-wider">可用物理底层插件 ({currentPlan === 'free' ? '免费版' : '专业级版'})</p>
                                <div className="space-y-1.5">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-black focus:ring-black w-3.5 h-3.5" />
                                    <span>FileSystem-Local API</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-black focus:ring-black w-3.5 h-3.5" />
                                    <span>WebSearch Grounding</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-zinc-300 text-black focus:ring-black w-3.5 h-3.5" />
                                    <span>Docker Host Execution</span>
                                  </label>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
 
                        {/* Independent Globe icon button */}
                        <button 
                          onClick={() => onShowNotification('已激活全球网页搜索增强通道 (WebSearch Grounding)。', 'info')}
                          className="flex items-center justify-center w-8 h-8 rounded-full border border-[#D5D7D7] bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-colors text-zinc-500 cursor-pointer"
                          title="激活网页实时获取"
                        >
                          <Globe className="w-4 h-4 text-zinc-500" />
                        </button>
                      </div>
 
                      {/* Utility actions on Right */}
                      <div className="flex items-center gap-2">
                        {/* Hidden input file picker for manual click */}
                        <input 
                          type="file" 
                          id="agent-file-picker-active" 
                          className="hidden" 
                          multiple 
                          onChange={handleFileChange} 
                        />
                        <button 
                          onClick={() => document.getElementById('agent-file-picker-active')?.click()}
                          className="p-1.5 shrink-0 border border-neutral-200 hover:bg-[#f3f4f3] rounded-lg transition-colors cursor-pointer text-zinc-500 flex items-center justify-center"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>

                        {/* Privacy Toggle (Active State) */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPiiMaskingEnabled(!piiMaskingEnabled);
                              onShowNotification(`隐私 PII 脫敏功能已${!piiMaskingEnabled ? '开启' : '关闭'}`, 'info');
                            }}
                            className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border transition-all text-[9px] font-bold font-sans cursor-pointer ${
                              piiMaskingEnabled 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                            }`}
                          >
                            <ShieldCheck className={`w-3 h-3 ${piiMaskingEnabled ? 'text-emerald-500' : 'text-neutral-400'}`} />
                            {piiMaskingEnabled ? 'PII ON' : 'PII OFF'}
                          </button>
                        </div>

                        <button 
                          onClick={() => handleSendPrompt()}
                          className="w-8 h-8 bg-black text-white hover:bg-zinc-800 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs"
                          title="启动代理"
                        >
                          <ArrowUp className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

            </div>
          )}

          {/* 2. Automation view adapted & fully responsive */}
          {activeSideTab === 'automation' && (
            <div className="w-full space-y-6 animate-fade-in text-left">
              {/* Header section identical to screenshot */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 w-full">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center text-[#108ee9]">
                    <GitFork className="w-5.5 h-5.5 text-emerald-600 transform rotate-90" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1a1c1c] tracking-tight flex items-center gap-2">
                      自动化流水线 (Event Pipelines)
                    </h2>
                    <p className="text-xs text-[#555a5a] mt-1 font-semibold font-sans max-w-xl">
                      配置无需人工开启的常态化触发管道，让 AI 代理全权运作部署检验、故障自愈 with system check
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsCreatePipelineOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.2 bg-black text-white hover:bg-neutral-800 transition-all rounded-full text-xs font-bold shadow-xs cursor-pointer select-none font-sans"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  新建自驱管道
                </button>
              </div>

              {/* List of pipelines */}
              <div className="space-y-4 sm:space-y-6 w-full">
                {pipelines.map(pipe => (
                  <div 
                    key={pipe.id} 
                    className="p-4 sm:p-6 bg-white border border-[#c4c7c7] rounded-2xl sm:rounded-[24px] shadow-xs hover:border-neutral-400 transition-all duration-200 space-y-4 w-full"
                  >
                    {/* Top row with details and toggle/actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4.5">
                      <div className="flex items-start gap-3">
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-neutral-100/80 rounded-xl flex items-center justify-center border shadow-xs text-zinc-700 shrink-0">
                          {pipe.type === 'github' ? (
                            <Layers className="w-5 sm:w-5.5 h-5 sm:h-5.5 text-zinc-550" />
                          ) : pipe.type === 'cron' ? (
                            <Clock className="w-5 sm:w-5.5 h-5 sm:h-5.5 text-sky-500" />
                          ) : (
                            <GitFork className="w-5 sm:w-5.5 h-5 sm:h-5.5 text-amber-500 transform rotate-90" />
                          )}
                        </div>
                        <div className="min-w-0 font-sans text-left">
                          <h3 className="text-sm font-extrabold text-[#1a1c1c] truncate">{pipe.title}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {/* Trigger details badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-neutral-200 bg-[#fbfbfa] text-[10px] text-zinc-650 font-semibold">
                              <Zap className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />
                              {pipe.triggerText}
                            </span>
                            {/* Executor details badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-neutral-200 bg-[#fbfbfa] text-[10px] text-zinc-650 font-semibold">
                              <span className="font-mono text-[9px] font-bold text-zinc-400">执行器:</span> 
                              <span className="truncate max-w-[80px] sm:max-w-none">{pipe.executor}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Switch and manual actions (Optimized for Mobile Touch) */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-3 sm:pt-0 border-t border-dashed border-[#edf0f0] sm:border-0 justify-end sm:justify-start w-full sm:w-auto">
                        <div className="flex items-center gap-2 mr-auto sm:mr-0 flex-wrap">
                          <span className="text-[10px] font-bold text-neutral-500 font-sans">
                            {pipe.enabled ? (
                              <span className="text-[#31C27D]">已启用监控</span>
                            ) : (
                              <span className="text-neutral-400">正挂起</span>
                            )}
                          </span>
                          {/* Toggle switch */}
                          <button
                            onClick={() => {
                              setPipelines(prev => prev.map(p => p.id === pipe.id ? { ...p, enabled: !p.enabled } : p));
                              onShowNotification(`"${pipe.title}" 自动化已${pipe.enabled ? '挂起暂停' : '启动在线'}`, 'info');
                            }}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                              pipe.enabled ? 'bg-[#31C27D]' : 'bg-neutral-205'
                            }`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${pipe.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Force Execute Run */}
                        <button
                          onClick={() => {
                            onShowNotification(`🚀 [即时发起] 正在人工调配 "${pipe.title}" 本地自驱进程...`, 'success');
                            setTimeout(() => {
                              const newLog: PipelineLog = {
                                id: `log-${Date.now()}`,
                                time: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                desc: `审查 PR #manual: 手工触发静态代码结构全项审计通过, 推送状态正常。`,
                                badge: '315T'
                              };
                              setPipelines(prev => prev.map(p => {
                                if (p.id === pipe.id) {
                                  return { ...p, logs: [newLog, ...p.logs] };
                                }
                                return p;
                              }));
                              onShowNotification(`🎉 "${pipe.title}" 人工调用已正常结单！`, 'success');
                            }, 1000);
                          }}
                          className="w-8 h-8 rounded-lg border border-[#D5D7D7] bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-all flex items-center justify-center cursor-pointer"
                          title="立刻手动运行一次"
                        >
                          <Play className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500" />
                        </button>

                        {/* Delete trigger */}
                        <button
                          onClick={() => deletePipeline(pipe)}
                          className="w-8 h-8 rounded-lg border border-red-100 bg-red-50 text-rose-600 hover:bg-red-100 hover:border-rose-200 transition-all flex items-center justify-center cursor-pointer"
                          title="删除配置"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-[10px] font-bold text-neutral-450 font-sans tracking-wide uppercase">
                        最新运行记录:
                      </p>
                      
                      <div className="mt-2.5 space-y-2.5">
                        {pipe.logs.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">暂无历史执行记录</p>
                        ) : (
                          pipe.logs.map(log => (
                            <div 
                              key={log.id}
                              className="flex items-center justify-between gap-4 py-2 border-b border-neutral-50 last:border-b-0 text-xs text-[#1a1c1c] font-sans animate-fade-in"
                            >
                              <div className="flex items-center gap-2 max-w-[85%]">
                                <span className="text-[#31C27D] shrink-0">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </span>
                                <span className="font-mono text-[11px] text-zinc-400 shrink-0 select-all">{log.time}</span>
                                <span className="text-neutral-600 font-medium truncate" title={log.desc}>{log.desc}</span>
                              </div>
                              <span className="text-[10px] font-bold font-mono border border-neutral-200 bg-neutral-50 px-1.5 py-0.2 rounded text-zinc-500">
                                {log.badge}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Floating Create Custom Pipeline Dialog overlay */}
              <AnimatePresence>
                {isCreatePipelineOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="bg-white border rounded-[24px] shadow-2xl p-6 max-w-md w-full relative z-10 text-left"
                    >
                      <h3 className="text-base font-extrabold text-neutral-900 font-sans leading-none">
                        新建自驱事件流水线 (Event Pipeline)
                      </h3>
                      <p className="text-xs text-neutral-500 mt-2 font-sans">
                        设置特定运行的代码大模型与时钟，让 Asteroid 代理托管完成静态审计与部署
                      </p>

                      <div className="space-y-4 mt-5">
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-500 uppercase font-sans mb-1.5">
                            流水线名称 (Pipeline Title)
                          </label>
                          <input 
                            type="text"
                            value={newPipeTitle}
                            onChange={(e) => setNewPipeTitle(e.target.value)}
                            placeholder="例如: 智能静态扫描并补全 TypeScript 代码"
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-sans outline-hidden focus:border-neutral-500 focus:ring-0"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-500 uppercase font-sans mb-1.5">
                            频率/触发时钟配置 (Cron Trigger Syntax)
                          </label>
                          <input 
                            type="text"
                            value={newPipeTrigger}
                            onChange={(e) => setNewPipeTrigger(e.target.value)}
                            placeholder="例如: 频率: 每天 18:00 PM"
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-sans outline-hidden focus:border-neutral-500 focus:ring-0"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-500 uppercase font-sans mb-1.5">
                            指定底层执行代理 (Executor Node)
                          </label>
                          <select
                            value={newPipeExecutor}
                            onChange={(e) => setNewPipeExecutor(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-sans outline-hidden focus:border-neutral-500 focus:ring-0"
                          >
                            <option value="AsteroidRouter-Coder">AsteroidRouter-Coder (延迟更低的首选审计层)</option>
                            <option value="GPT-5.5 High">GPT-5.5 High (高阶理解模型)</option>
                            <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet (静态语法理解层)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t">
                        <button
                          onClick={() => setIsCreatePipelineOpen(false)}
                          className="px-4 py-2 hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-sans font-semibold cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => {
                            if (!newPipeTitle.trim()) {
                              onShowNotification('流水线名称不能为空', 'error');
                              return;
                            }
                            const newPipe: AutomationPipeline = {
                              id: `pipe-${Date.now()}`,
                              title: newPipeTitle,
                              type: 'custom',
                              triggerText: newPipeTrigger,
                              executor: newPipeExecutor,
                              enabled: true,
                              logs: []
                            };
                            setPipelines(prev => [newPipe, ...prev]);
                            setIsCreatePipelineOpen(false);
                            setNewPipeTitle('');
                            onShowNotification('🎉 事件自驱流水线配置载入成功！', 'success');
                          }}
                          className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-sans font-bold cursor-pointer"
                        >
                          配置启动
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 3. Bug sandbox bot screen */}
          {activeSideTab === 'bugbot' && (
            <div className="w-full space-y-6 animate-fade-in text-left">
              <div className="flex items-start gap-3 border-b border-zinc-200 pb-5 w-full">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-[#108ee9] animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-neutral-850 tracking-tight flex items-center gap-2">
                    机器机器人 (Debug Sandbox Bot)
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 font-medium font-sans">
                    捕获并监控项目的运行时异常和控制台堆栈崩溃，实时由 Asteroid 控制拉取进行热修复
                  </p>
                </div>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="p-4 bg-white border border-[#D5D7D7] rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 bg-neutral-100 uppercase tracking-wider inline-block px-1.5 py-0.5 rounded leading-none">探针就绪度</p>
                  <p className="text-xl font-black font-sans mt-2 text-emerald-600">正常运转 100%</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-medium">无物理崩溃，探针响应流畅</p>
                </div>
                <div className="p-4 bg-white border border-[#D5D7D7] rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 bg-neutral-100 tracking-wider inline-block px-1.5 py-0.5 rounded leading-none">今日代码自愈</p>
                  <p className="text-xl font-black font-sans mt-2 text-[#1a1c1c]">已自修补 4 处</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-medium">自动核准后自动进行 PR 合并</p>
                </div>
                <div className="p-4 bg-white border border-[#D5D7D7] rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 bg-neutral-100 tracking-wider inline-block px-1.5 py-0.5 rounded leading-none">沙盒虚拟态</p>
                  <p className="text-xl font-black font-sans mt-2 text-indigo-600">双轨测试就绪</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-medium">零生产环境侵入审计</p>
                </div>
              </div>

              {/* Bug List */}
              <div className="bg-white border border-[#c4c7c7] rounded-[24px] p-6 space-y-4 w-full">
                <h3 className="text-sm font-extrabold text-neutral-800">最近运行时异常自愈记录</h3>
                
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between p-3.5 border rounded-xl hover:border-neutral-350 transition-colors bg-amber-50/10 border-amber-200">
                    <div>
                      <p className="text-xs font-bold text-neutral-800">TypeError: Cannot read properties of undefined (reading 'split')</p>
                      <p className="text-[10px] text-neutral-400 mt-1 font-mono">位置: /src/components/Sidebar.tsx - Line 142</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100/60 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">已修复并安全合并</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 border rounded-xl hover:border-neutral-350 transition-colors bg-amber-50/10 border-amber-200">
                    <div>
                      <p className="text-xs font-bold text-neutral-800">Array index out of bounds exception in AST parser</p>
                      <p className="text-[10px] text-neutral-400 mt-1 font-mono">位置: /backend/parser_core.ts - Line 89</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100/60 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">已修复并安全合并</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Ambient atmospheric backdrop vector glow */}
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.35] overflow-hidden bg-[#fafaf9]">
          <div className="absolute top-[-10%] left-[-15%] w-[55vw] h-[55vh] bg-[#3fe8c7] blur-[140px] rounded-full opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vh] bg-[#e3d3ff] blur-[140px] rounded-full opacity-70" />
        </div>

        {/* Custom Minimalist Confirmation Dialog */}
        <AnimatePresence>
          {confirmDialog.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white border border-[#c4c7c7] rounded-[24px] shadow-2xl p-6 md:p-8 max-w-[360px] w-full relative z-10 text-center"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 ${confirmDialog.isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {confirmDialog.isDestructive ? <Trash2 className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                
                <h3 className="text-base font-extrabold text-neutral-900 font-sans tracking-tight leading-snug">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-2.5 font-sans leading-relaxed">
                  {confirmDialog.message}
                </p>

                <div className="flex flex-col gap-2 mt-8">
                  <button
                    onClick={confirmDialog.onConfirm}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                      confirmDialog.isDestructive 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                        : 'bg-black hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {confirmDialog.confirmText || '确定执行'}
                  </button>
                  <button
                    onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                    className="w-full py-3.5 bg-transparent hover:bg-neutral-50 text-neutral-500 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
                  >
                    取消操作
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}
