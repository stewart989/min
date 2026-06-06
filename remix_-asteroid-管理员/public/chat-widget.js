(function() {
  // Styles Injection
  const css = `
    #asteroid-chat-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .asteroid-chat-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #FF5E3A 0%, #FF2A54 100%);
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(255, 42, 84, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .asteroid-chat-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(255, 42, 84, 0.45);
    }
    .asteroid-chat-btn:active {
      transform: translateY(0);
    }
    .asteroid-chat-window {
      position: absolute;
      bottom: 64px;
      right: 0;
      width: 380px;
      height: 520px;
      background: rgba(12, 22, 40, 0.95);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.9) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: bottom-right;
    }
    .asteroid-chat-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
    @media (max-width: 480px) {
      .asteroid-chat-window {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        top: 0;
        width: 100% !important;
        height: 100% !important;
        border-radius: 0;
      }
    }
    .asteroid-chat-header {
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .asteroid-chat-agent {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .asteroid-chat-avatar {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid rgba(0, 255, 209, 0.3);
      overflow: hidden;
      background: #020408;
    }
    .asteroid-chat-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .asteroid-chat-status-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 8.5px;
      height: 8.5px;
      background: #00FFD1;
      border: 1.5px solid #0c1628;
      border-radius: 50%;
    }
    .asteroid-chat-agent-info h4 {
      margin: 0;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 700;
    }
    .asteroid-chat-agent-info p {
      margin: 0;
      color: rgba(255, 255, 255, 0.4);
      font-size: 10.5px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }
    .asteroid-chat-close-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      transition: color 0.2s;
    }
    .asteroid-chat-close-btn:hover {
      color: #ffffff;
    }
    .asteroid-chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    .asteroid-chat-body::-webkit-scrollbar {
      width: 4px;
    }
    .asteroid-chat-body::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
    }
    .asteroid-msg {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .asteroid-msg-agent {
      background: rgba(255, 255, 255, 0.03);
      color: #e2e8f0;
      border-top-left-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.03);
      align-self: flex-start;
    }
    .asteroid-msg-agent a {
      color: #00FFD1;
      text-decoration: none;
      font-weight: 600;
    }
    .asteroid-msg-agent a:hover {
      text-decoration: underline;
    }
    .asteroid-msg-user {
      background: linear-gradient(135deg, #FF5E3A 0%, #FF2A54 100%);
      color: #ffffff;
      border-top-right-radius: 4px;
      align-self: flex-end;
      box-shadow: 0 4px 15px rgba(255, 42, 84, 0.15);
    }
    .asteroid-chat-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
      align-self: flex-start;
    }
    .asteroid-reply-btn {
      background: rgba(0, 255, 209, 0.05);
      border: 1px solid rgba(0, 255, 209, 0.15);
      color: #00FFD1;
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .asteroid-reply-btn:hover {
      background: rgba(0, 255, 209, 0.12);
      border-color: rgba(0, 255, 209, 0.35);
      transform: translateY(-1px);
    }
    .asteroid-chat-footer {
      padding: 16px 20px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .asteroid-chat-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 10px 14px;
      color: #ffffff;
      font-size: 13px;
      outline: none;
      transition: all 0.2s;
    }
    .asteroid-chat-input:focus {
      border-color: rgba(0, 255, 209, 0.25);
      background: rgba(255, 255, 255, 0.05);
    }
    .asteroid-chat-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: #FF4B26;
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .asteroid-chat-send-btn:hover {
      transform: scale(1.05);
      background: #ff5c3b;
    }
    .asteroid-chat-send-btn:active {
      transform: scale(1);
    }
    .asteroid-typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
    }
    .asteroid-typing-dot {
      width: 6px;
      height: 6px;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 50%;
      animation: asteroidBlink 1.4s infinite both;
    }
    .asteroid-typing-dot:nth-child(2) { animation-delay: .2s; }
    .asteroid-typing-dot:nth-child(3) { animation-delay: .4s; }
    @keyframes asteroidBlink {
      0% { opacity: .2; }
      20% { opacity: 1; }
      100% { opacity: .2; }
    }
  `;

  // Dynamic Translations Dictionary
  const translations = {
    zh: {
      buttonText: "在线聊天",
      headerTitle: "Asteroid 在线客服",
      headerStatus: "在线",
      placeholderText: "输入您的消息...",
      quickReplies: [
        "如何生成 API Key?",
        "如何配置 Base URL?",
        "支持哪些 AI 模型?",
        "我想联系人工客服"
      ],
      welcomeMessage: "您好！欢迎使用 AsteroidRouter。我是您的智能助手，有什么我可以帮您的吗？",
      answers: {
        "如何生成 API Key?": "要在 AsteroidRouter 中生成 API 密钥：\n1. 登录到您的 [控制台](/?goto=console)\n2. 导航到 **API Keys** 页面并点击 **Generate API Key**\n3. 复制生成的密钥（开头为 `sk-ar-...`）。出于安全考虑，系统不会再次完整显示此密钥。",
        "如何配置 Base URL?": "在您的 OpenAI SDK 或 HTTP 请求代码中，将 `baseURL` 配置为：\n`https://api.asteroidrouter.ai/v1`\n\n然后在 Authorization 字段中传入您的 API 密钥即可直接调用路由。",
        "支持哪些 AI 模型?": "AsteroidRouter 支持 74+ 个顶级模型，包括：\n- **OpenAI**: GPT-4o, GPT-4o-mini, o1\n- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus\n- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash\n- **DeepSeek**: DeepSeek-V3, DeepSeek-Coder\n全部直接支持底价按量付费，无需单独订阅。",
        "我想联系人工客服": "已为您链接客服。请在下方输入您的 **电子邮箱** 或具体问题，或者直接发信至 **support@asteroidclothing.com**，我们会在 2 小时内回复您。"
      },
      defaultResponse: "感谢您的来信！为了方便我们的人工客服联系您，能请您留下您的 **电子邮箱地址** 吗？或者您也可以直接发信至 **support@asteroidclothing.com**，我们会在 2 小时内回复您。",
      emailResponse: "非常感谢！我们已收到您的联系邮箱：{email}。我们的客服人员将会在 2 小时内给您答复。"
    },
    en: {
      buttonText: "Live Chat",
      headerTitle: "Asteroid Support Desk",
      headerStatus: "Online",
      placeholderText: "Type your message...",
      quickReplies: [
        "How to generate API Key?",
        "How to configure Base URL?",
        "Which models are supported?",
        "I want to contact human support"
      ],
      welcomeMessage: "Hello! Welcome to AsteroidRouter. I'm your AI assistant. How can I help you today?",
      answers: {
        "How to generate API Key?": "To generate an API key:\n1. Log into your [Console](/?goto=console)\n2. Navigate to the **API Keys** tab\n3. Click the **Generate API Key** button\n4. Copy the key starting with `sk-ar-...` immediately. For security, it won't be displayed again.",
        "How to configure Base URL?": "To route requests, update the `baseURL` parameter in your OpenAI SDK (or custom client) to:\n`https://api.asteroidrouter.ai/v1`\n\nThen authenticate using your AsteroidRouter API Key.",
        "Which models are supported?": "AsteroidRouter supports 74+ flagship models including:\n- **OpenAI**: GPT-4o, GPT-4o-mini, o1\n- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus\n- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash\n- **DeepSeek**: DeepSeek-V3, DeepSeek-Coder\nand many more from Meta, Mistral, Grok, Zhipu, etc. at direct low token rates.",
        "I want to contact human support": "I will connect you with a human support agent. Please enter your **email address** here, or send an email directly to **support@asteroidclothing.com**. We will get back to you within 2 hours."
      },
      defaultResponse: "Thank you for reaching out! To help our support team contact you, could you please provide your **email address**? Alternatively, you can contact us directly at **support@asteroidclothing.com**. We respond within 2 hours.",
      emailResponse: "Thank you! We've saved your contact email: {email}. A support agent will respond to you within 2 hours."
    },
    ja: {
      buttonText: "チャット",
      headerTitle: "Asteroid サポート",
      headerStatus: "オンライン",
      placeholderText: "メッセージを入力...",
      quickReplies: [
        "APIキーの生成方法は？",
        "ベースURLの設定方法は？",
        "どのモデルがサポートされていますか？",
        "有人サポートに連絡したい"
      ],
      welcomeMessage: "こんにちは！AsteroidRouterへようこそ。どのようなご用件でしょうか？",
      answers: {
        "APIキーの生成方法は？": "APIキーを生成するには：\n1. [コンソール](/?goto=console)にログインします\n2. **API Keys**tabに移動します\n3. **Generate API Key**ボタンをクリックします\n4. `sk-ar-...`で始まるキーをすぐにコピーします。セキュリティのため、再表示されません。",
        "ベースURLの設定方法は？": "リクエストをルーティングするには、OpenAI SDKなどの`baseURL`パラメータを以下に変更します：\n`https://api.asteroidrouter.ai/v1`\n\nその後、AsteroidRouterのAPIキーを使用して認証します。",
        "どのモデルがサポートされていますか？": "GPT-4o、Claude 3.5 Sonnet、Gemini 1.5 Pro、DeepSeek-V3を含む74以上の主要モデルをサポートしており、低価格なトークン料金でご利用いただけます。",
        "有人サポートに連絡したい": "担当のサポートエージェントにお繋ぎします。ご連絡可能な**メールアドレス**を入力するか、**support@asteroidclothing.com**まで直接お問い合わせください。2時間以内に返信いたします。"
      },
      defaultResponse: "お問い合わせいただきありがとうございます。サポートチームからご連絡させていただくため、**メールアドレス**をご入力いただけますでしょうか？または、**support@asteroidclothing.com**まで直接ご連絡ください。",
      emailResponse: "ありがとうございます！ご連絡先メールアドレス（{email}）を保存しました。2時間以内にエージェントより回答いたします。"
    },
    ko: {
      buttonText: "실시간 채팅",
      headerTitle: "Asteroid 고객 지원",
      headerStatus: "온라인",
      placeholderText: "메시지 입력...",
      quickReplies: [
        "API 키는 어떻게 생성하나요?",
        "Base URL 설정은 어떻게 하나요?",
        "어떤 모델들을 지원하나요?",
        "상담원 연결을 원합니다"
      ],
      welcomeMessage: "안녕하세요! AsteroidRouter에 오신 것을 환영합니다. 무엇을 도와드릴까요?",
      answers: {
        "API 키는 어떻게 생성하나요?": "API 키 발급 방법:\n1. [콘솔](/?goto=console)에 로그인합니다\n2. **API Keys** 탭으로 이동합니다\n3. **Generate API Key** 버튼을 클릭합니다\n4. `sk-ar-...`로 시작하는 키를 즉시 복사합니다. 보안상 다시 표시되지 않습니다.",
        "Base URL 설정은 어떻게 하나요?": "요청을 라우팅하려면 OpenAI SDK 등의 `baseURL` 파라미터를 아래 주소로 변경하십시오:\n`https://api.asteroidrouter.ai/v1`\n\n그런 다음 AsteroidRouter API 키를 사용해 인증합니다.",
        "어떤 모델들을 지원하나요?": "GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek-V3를 포함한 74개 이상의 주요 모델을 지원하고 있습니다.",
        "상담원 연결을 원합니다": "담당 지원 에이전트에게 연결해 드리겠습니다. 답변받으실 **이메일 주소**를 입력하시거나, **support@asteroidclothing.com**으로 직접 문의해 주십시오. 2시간 이내에 답변해 드리겠습니다."
      },
      defaultResponse: "문의해 주셔서 감사합니다! 상담원이 연락해 드릴 수 있도록 **이메일 주소**를 남겨주시겠습니까? 또는 **support@asteroidclothing.com**으로 직접 메일을 보내주시면 2시간 이내에 회신해 드리겠습니다.",
      emailResponse: "감사합니다! 연락처 이메일({email})이 저장되었습니다. 2시간 이내에 담당자가 답변을 드리겠습니다."
    },
    es: {
      buttonText: "Chat en vivo",
      headerTitle: "Soporte Asteroid",
      headerStatus: "En línea",
      placeholderText: "Escribe tu mensaje...",
      quickReplies: [
        "¿Cómo generar clave API?",
        "¿Cómo configurar URL Base?",
        "¿Qué modelos son soportados?",
        "Quiero hablar con soporte humano"
      ],
      welcomeMessage: "¡Hola! Bienvenido a AsteroidRouter. Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?",
      answers: {
        "¿Cómo generar clave API?": "Para generar una clave API:\n1. Inicie sesión en su [Consola](/?goto=console)\n2. Vaya a la pestaña **API Keys**\n3. Haga clic en el botón **Generate API Key**\n4. Copie la clave que comienza con `sk-ar-...` de inmediato. No se volverá a mostrar.",
        "¿Cómo configurar URL Base?": "Para enrutar solicitudes, cambie el parámetro `baseURL` en su SDK de OpenAI o cliente personalizado a:\n`https://api.asteroidrouter.ai/v1`\n\nY use su clave API de AsteroidRouter.",
        "¿Qué modelos son soportados?": "Soportamos más de 74 modelos premium, incluidos GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro y DeepSeek-V3 a las tarifas de token más bajas.",
        "Quiero hablar con soporte humano": "Lo conectaré con un agente. Por favor, deje su **dirección de correo electrónico** aquí o envíe un correo directamente a **support@asteroidclothing.com**. Le responderemos dentro de 2 horas."
      },
      defaultResponse: "¡Gracias por contactarnos! Para que nuestro equipo pueda comunicarse con usted, ¿podría proporcionar su **correo electrónico**? O escríbanos directamente a **support@asteroidclothing.com**.",
      emailResponse: "¡Gracias! Hemos registrado su correo: {email}. Un agente de soporte se comunicará con usted dentro de 2 horas."
    }
  };

  // Configuration for API Connection
  const CONFIG = {
  API_URL: window.ASTEROID_CHAT_API || '/api/chat'
};
  // Generate / Retrieve unique sessionToken
  let sessionToken = localStorage.getItem('asteroid_chat_session');
  if (!sessionToken) {
    sessionToken = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('asteroid_chat_session', sessionToken);
  }

  // To prevent showing the same message multiple times when polling
  const displayedMessageIds = new Set();
  let pollInterval = null;

  // Helper to parse simple markdown links and line breaks
  function parseMarkdown(text) {
    let html = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return html.replace(/\n/g, '<br/>');
  }

  // Get current active language configuration
  function getLangConfig() {
    let savedLang = localStorage.getItem('asteroid_lang') || 'en';
    savedLang = savedLang.toLowerCase();
    return translations[savedLang] || translations['en'];
  }

  // Inject Styles into Document Head
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Widget Container
  const container = document.createElement('div');
  container.id = 'asteroid-chat-widget';
  document.body.appendChild(container);

  // Initial render matching translation
  const config = getLangConfig();
  container.innerHTML = `
    <button class="asteroid-chat-btn">
      <i class="fas fa-headset text-base"></i>
      <span>${config.buttonText}</span>
    </button>
    <div class="asteroid-chat-window">
      <div class="asteroid-chat-header">
        <div class="asteroid-chat-agent">
          <div class="asteroid-chat-avatar">
            <img src="/founder.png" alt="Support avatar" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=Asteroid'"/>
            <div class="asteroid-chat-status-dot"></div>
          </div>
          <div class="asteroid-chat-agent-info">
            <h4>${config.headerTitle}</h4>
            <p><span style="width: 5px; height: 5px; border-radius: 50%; background: #00FFD1; display: inline-block;"></span>${config.headerStatus}</p>
          </div>
        </div>
        <button class="asteroid-chat-close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="asteroid-chat-body" id="asteroid-chat-body">
        <div class="asteroid-msg asteroid-msg-agent" id="asteroid-welcome-message-container">
          ${parseMarkdown(config.welcomeMessage)}
        </div>
        <div class="asteroid-chat-replies" id="asteroid-chat-replies"></div>
      </div>
      <div class="asteroid-chat-footer">
        <input type="text" class="asteroid-chat-input" placeholder="${config.placeholderText}" id="asteroid-chat-input"/>
        <button class="asteroid-chat-send-btn" id="asteroid-chat-send">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;

  // DOM Elements
  const chatBtn = container.querySelector('.asteroid-chat-btn');
  const chatWindow = container.querySelector('.asteroid-chat-window');
  const closeBtn = container.querySelector('.asteroid-chat-close-btn');
  const chatBody = container.querySelector('#asteroid-chat-body');
  const repliesContainer = container.querySelector('#asteroid-chat-replies');
  const chatInput = container.querySelector('#asteroid-chat-input');
  const sendBtn = container.querySelector('#asteroid-chat-send');

  // Toggle Visibility
  chatBtn.addEventListener('click', () => {
    const isOpening = !chatWindow.classList.contains('open');
    chatWindow.classList.toggle('open');
    if (isOpening) {
      updateLanguageAndReplies();
      chatInput.focus();
      chatBody.scrollTop = chatBody.scrollHeight;
      startPolling();
    } else {
      stopPolling();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
    stopPolling();
  });

  // Render quick reply options
  function renderQuickReplies(currentConfig) {
    repliesContainer.innerHTML = '';
    currentConfig.quickReplies.forEach(reply => {
      const btn = document.createElement('button');
      btn.className = 'asteroid-reply-btn';
      btn.innerText = reply;
      btn.addEventListener('click', () => handleUserMsg(reply));
      repliesContainer.appendChild(btn);
    });
  }

  // Update i18n content dynamically on open
  function updateLanguageAndReplies() {
    const currentConfig = getLangConfig();
    chatBtn.querySelector('span').innerText = currentConfig.buttonText;
    chatWindow.querySelector('.asteroid-chat-agent-info h4').innerText = currentConfig.headerTitle;
    chatWindow.querySelector('.asteroid-chat-agent-info p').innerHTML = `<span style="width: 5px; height: 5px; border-radius: 50%; background: #00FFD1; display: inline-block; margin-right: 4px;"></span>${currentConfig.headerStatus}`;
    chatInput.placeholder = currentConfig.placeholderText;
    renderQuickReplies(currentConfig);
  }

  // Fetch past messages from DB
  async function loadChatHistory() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/messages?sessionToken=${sessionToken}`);
      if (res.ok) {
        const messages = await res.json();
        if (messages.length > 0) {
          // Remove default template welcome message
          const welcomeMsg = document.getElementById('asteroid-welcome-message-container');
          if (welcomeMsg) welcomeMsg.remove();
          
          messages.forEach(msg => {
            appendMessage(msg.text, msg.sender, msg.id);
          });
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }

  // Start polling backend for replies from agent
  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${CONFIG.API_URL}/messages?sessionToken=${sessionToken}`);
        if (res.ok) {
          const messages = await res.json();
          let hasNew = false;
          messages.forEach(msg => {
            if (!displayedMessageIds.has(msg.id)) {
              appendMessage(msg.text, msg.sender, msg.id);
              hasNew = true;
            }
          });
          if (hasNew) {
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        }
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }, 3000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Handle User Input Submission
  async function handleUserMsg(messageText) {
    if (!messageText.trim()) return;

    // Remove welcome message container if present
    const welcomeMsg = document.getElementById('asteroid-welcome-message-container');
    if (welcomeMsg) welcomeMsg.remove();

    // 1. Append User message in UI immediately
    appendMessage(messageText, 'user');
    chatBody.scrollTop = chatBody.scrollHeight;

    const isEmail = messageText.includes('@') && messageText.match(/\S+@\S+\.\S+/);
    const emailVal = isEmail ? messageText : null;

    // 2. Save User message to Database via API
    try {
      const res = await fetch(`${CONFIG.API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          sender: 'user',
          text: messageText,
          email: emailVal
        })
      });
      if (res.ok) {
        const savedMsg = await res.json();
        displayedMessageIds.add(savedMsg.id);
      }
    } catch (err) {
      console.error("Failed to send user message to DB:", err);
    }

    // 3. Simulated Response & Bot Auto-responder
    const typingIndicator = showTypingIndicator();
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(async () => {
      // Remove typing indicator
      typingIndicator.remove();

      const currentConfig = getLangConfig();
      let responseText = '';

      // Match replies or email pattern
      if (currentConfig.answers[messageText]) {
        responseText = currentConfig.answers[messageText];
      } else if (isEmail) {
        responseText = currentConfig.emailResponse.replace('{email}', messageText);
      } else {
        responseText = currentConfig.defaultResponse;
      }

      // Render bot response in UI
      appendMessage(responseText, 'agent');
      chatBody.scrollTop = chatBody.scrollHeight;

      // Save Bot response to Database
      try {
        const res = await fetch(`${CONFIG.API_URL}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken,
            sender: 'agent',
            text: responseText
          })
        });
        if (res.ok) {
          const savedMsg = await res.json();
          displayedMessageIds.add(savedMsg.id);
        }
      } catch (err) {
        console.error("Failed to save bot message to DB:", err);
      }
    }, 1000);
  }

  function appendMessage(text, sender, id = null) {
    if (id) {
      if (displayedMessageIds.has(id)) return;
      displayedMessageIds.add(id);
    }
    const msg = document.createElement('div');
    msg.className = `asteroid-msg asteroid-msg-${sender}`;
    msg.innerHTML = parseMarkdown(text);
    chatBody.appendChild(msg);
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'asteroid-msg asteroid-msg-agent';
    indicator.innerHTML = `
      <div class="asteroid-typing-indicator">
        <div class="asteroid-typing-dot"></div>
        <div class="asteroid-typing-dot"></div>
        <div class="asteroid-typing-dot"></div>
      </div>
    `;
    chatBody.appendChild(indicator);
    return indicator;
  }

  // Event handlers for inputs
  sendBtn.addEventListener('click', () => {
    const val = chatInput.value;
    if (val.trim()) {
      handleUserMsg(val);
      chatInput.value = '';
    }
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = chatInput.value;
      if (val.trim()) {
        handleUserMsg(val);
        chatInput.value = '';
      }
    }
  });

  // Watch language switches
  window.addEventListener('storage', (e) => {
    if (e.key === 'asteroid_lang') {
      updateLanguageAndReplies();
    }
  });

  // Initialize and load history immediately
  loadChatHistory();
})();
