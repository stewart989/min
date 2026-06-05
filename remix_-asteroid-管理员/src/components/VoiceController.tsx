/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab } from '../types';

interface VoiceControllerProps {
  onNavigate: (tab: ActiveTab) => void;
  onLogout: () => void;
  showNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceController({ onNavigate, onLogout, showNotification }: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const processCommand = useCallback((text: string) => {
    const command = text.toLowerCase().trim();
    console.log('Voice Command:', command);

    if (command.includes('概览') || command.includes('主页') || command.includes('dashboard')) {
      onNavigate('overview');
      showNotification('正在切换至主页概览', 'success');
      return true;
    }
    if (command.includes('设置') || command.includes('配置') || command.includes('settings')) {
      onNavigate('settings');
      showNotification('已打开系统设置', 'success');
      return true;
    }
    if (command.includes('云') || command.includes('资源') || command.includes('cloud')) {
      onNavigate('cloud');
      showNotification('正在进入云端资源管理', 'success');
      return true;
    }
    if (command.includes('调试') || command.includes('开发') || command.includes('debug')) {
      onNavigate('debug');
      showNotification('进入开发者调试模式', 'info');
      return true;
    }
    if (command.includes('插件') || command.includes('扩展') || command.includes('plugin')) {
      onNavigate('plugins');
      showNotification('查看可用插件库', 'success');
      return true;
    }
    if (command.includes('集成') || command.includes('对接') || command.includes('integration')) {
      onNavigate('integrations');
      showNotification('正在加载服务集成', 'success');
      return true;
    }
    if (command.includes('密钥') || command.includes('api') || command.includes('key')) {
      onNavigate('api-keys');
      showNotification('访问 API 密钥管理', 'info');
      return true;
    }
    if (command.includes('成员') || command.includes('团队') || command.includes('member')) {
      onNavigate('members');
      showNotification('查看组织成员', 'success');
      return true;
    }
    if (command.includes('用量') || command.includes('统计') || command.includes('usage')) {
      onNavigate('usage');
      showNotification('获取实时资源用量统计', 'success');
      return true;
    }
    if (command.includes('账单') || command.includes('费用') || command.includes('billing')) {
      onNavigate('billing');
      showNotification('加载财务账单', 'success');
      return true;
    }
    if (command.includes('注销') || command.includes('退出') || command.includes('logout')) {
      onLogout();
      return true;
    }

    return false;
  }, [onNavigate, onLogout, showNotification]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
      
      const recognized = processCommand(text);
      if (!recognized) {
        showNotification(`未识别指令: "${text}"`, 'info');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        showNotification('请允许访问麦克风权限以使用语音控制', 'error');
      } else {
        showNotification(`语音识别错误: ${event.error}`, 'error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isSupported) return null;

  return (
    <div className="relative flex items-center gap-3 px-3 py-1.5 bg-brand-surface-low rounded-full border border-brand-outline-variant transition-all hover:border-brand-outline">
      <button
        onClick={toggleListening}
        id="voice-control-trigger"
        className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          isListening 
            ? 'bg-brand-error text-white shadow-lg animate-pulse' 
            : 'hover:bg-brand-surface-container text-brand-on-surface-variant'
        }`}
        title={isListening ? '正在收听...' : '点击开启语音控制'}
      >
        {isListening ? (
          <div className="relative">
            <Mic size={18} />
            <motion.div
              layoutId="mic-wave"
              className="absolute -inset-2 border-2 border-brand-error rounded-full"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeOut' }}
            />
          </div>
        ) : (
          <Mic size={18} />
        )}
      </button>

      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-brand-outline tracking-wider uppercase">Voice Admin</span>
        <div className="h-4 flex items-center">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1.5"
              >
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 h-2 bg-brand-error rounded-full"
                      animate={{ height: [8, 16, 8] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.6, 
                        delay: i * 0.1,
                        ease: "easeInOut" 
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-brand-error font-medium">请说话...</span>
              </motion.div>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: transcript ? 1 : 0.6 }}
                className="text-xs text-brand-on-surface-variant truncate max-w-[120px]"
              >
                {transcript || '语音导航已就绪'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
