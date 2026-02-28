/* ============================================================
   STUDIOAI — chat.js
   Chat logic, Anthropic API integration, Roblox AI specialist
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const { store, requireAuth, toast, renderMarkdown, autoResize, populateUserUI, formatTime } = window.SAI;
  const Credits = window.Credits;

  const user = requireAuth();
  if (!user) return;

  populateUserUI(user);

  // ── State ─────────────────────────────────────────────────
  const modelId = new URLSearchParams(location.search).get('model') || 'roblox-ai';
  let messages  = [];
  let isLoading = false;
  let chatId    = generateId();

  const MODEL_META = {
    'roblox-ai':  { name: 'Roblox Studio AI', icon: '🎮', sub: 'Especialista en Lua, Studio & APIs', cost: 3 },
    'code-ai':    { name: 'Code AI',           icon: '⌨️', sub: 'Programación general',               cost: 2 },
    'general-ai': { name: 'General AI',        icon: '🤖', sub: 'Asistente de propósito general',     cost: 2 },
    'debug-ai':   { name: 'Debug AI',          icon: '🐛', sub: 'Detección y corrección de errores',  cost: 2 },
  };

  const SYSTEM_PROMPTS = {
    'roblox-ai': `Eres StudioAI, un asistente de IA especializado en Roblox Studio y desarrollo de juegos en Roblox. 
Tu conocimiento incluye:
- Lua y Luau (el lenguaje de scripting de Roblox)
- Roblox Studio: interfaz, herramientas, workspace, explorer
- Servicios de Roblox: DataStoreService, RemoteEvents, RemoteFunctions, TweenService, RunService, Players, etc.
- Scripting: Scripts, LocalScripts, ModuleScripts y sus diferencias
- Arquitectura cliente-servidor en Roblox
- Sistemas de juego: leaderstats, inventarios, shops, combat, vehicles
- UIs con ScreenGui, Frame, TextLabel, TextButton, ImageLabel
- Física de Roblox: BasePart, Anchored, CanCollide, assemblies
- Buenas prácticas, optimización y seguridad en Roblox
- Roblox APIs: HttpService, MessagingService, MarketplaceService

Responde siempre en español a menos que el usuario escriba en otro idioma.
Cuando escribas código Lua/Luau, usa bloques de código con \`\`\`lua.
Sé conciso, claro y práctico. Proporciona ejemplos de código cuando sea relevante.`,

    'code-ai': `Eres StudioAI Code, un asistente experto en programación. Ayudas con múltiples lenguajes incluyendo JavaScript, Python, TypeScript, Lua, C#, y más. Responde en español. Usa bloques de código apropiados.`,

    'general-ai': `Eres StudioAI, un asistente de IA útil y amable. Responde en español con claridad y precisión.`,

    'debug-ai': `Eres StudioAI Debug, especializado en encontrar y corregir errores de código. Analiza código, identifica bugs y explica las correcciones. Responde en español. Usa bloques de código para mostrar la solución.`
  };

  const meta = MODEL_META[modelId] || MODEL_META['roblox-ai'];

  // ── DOM ───────────────────────────────────────────────────
  const messagesEl  = document.getElementById('messages');
  const emptyState  = document.getElementById('empty-state');
  const textarea    = document.getElementById('chat-input');
  const sendBtn     = document.getElementById('send-btn');
  const chatTitle   = document.getElementById('chat-title');
  const historyList = document.getElementById('chat-history-list');
  const newChatBtn  = document.getElementById('new-chat-btn');
  const modelIcon   = document.getElementById('model-icon');
  const modelName   = document.getElementById('model-name');
  const modelSub    = document.getElementById('model-sub');
  const apiKeyInput = document.getElementById('api-key-input');
  const apiSaveBtn  = document.getElementById('api-save-btn');
  const costLabel   = document.getElementById('credit-cost');

  // ── Init UI ───────────────────────────────────────────────
  if (modelIcon) modelIcon.textContent = meta.icon;
  if (modelName) modelName.textContent = meta.name;
  if (modelSub)  modelSub.textContent  = meta.sub;
  if (chatTitle) chatTitle.textContent = meta.name;
  if (costLabel) costLabel.textContent = `${meta.cost} crédito${meta.cost > 1 ? 's' : ''} por mensaje`;

  // Load saved API key
  const savedKey = store.get('sai_api_key');
  if (apiKeyInput && savedKey) apiKeyInput.value = savedKey;

  // Credits
  updateCreditsDisplay();

  document.addEventListener('credits-updated', ({ detail }) => {
    updateCreditsDisplay(detail.balance);
  });

  // ── Load chat history ─────────────────────────────────────
  loadHistory();

  // ── Event listeners ───────────────────────────────────────
  textarea?.addEventListener('input', () => {
    autoResize(textarea);
    sendBtn.disabled = !textarea.value.trim() || isLoading;
  });

  textarea?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn?.addEventListener('click', sendMessage);

  newChatBtn?.addEventListener('click', startNewChat);

  apiSaveBtn?.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) return toast('Ingresa tu API Key', 'error');
    if (!key.startsWith('sk-ant-')) return toast('API Key inválida (debe iniciar con sk-ant-)', 'error');
    store.set('sai_api_key', key);
    toast('API Key guardada ✓', 'success');
  });

  // Quick prompts
  document.querySelectorAll('.quick-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.prompt;
      if (textarea) {
        textarea.value = prompt;
        autoResize(textarea);
        sendBtn.disabled = false;
        textarea.focus();
      }
    });
  });

  // Topup credits
  document.querySelectorAll('.topup-btn').forEach(btn => {
    btn.addEventListener('click', () => Credits.showTopupModal());
  });

  // ── Core Functions ────────────────────────────────────────
  async function sendMessage() {
    const text = textarea.value.trim();
    if (!text || isLoading) return;

    // Check credits
    const cost = meta.cost;
    if (!Credits.canAfford(modelId)) {
      toast('Sin créditos suficientes. ¡Recarga para continuar!', 'error');
      Credits.showTopupModal();
      return;
    }

    // Hide empty state
    if (emptyState) emptyState.style.display = 'none';

    textarea.value = '';
    autoResize(textarea);
    sendBtn.disabled = true;

    // Add user message
    appendMessage('user', text);
    messages.push({ role: 'user', content: text });

    // Show typing
    const typingEl = appendTyping();
    isLoading = true;

    try {
      const apiKey = store.get('sai_api_key');

      let responseText;

      if (apiKey) {
        // Real API call
        responseText = await callAnthropicAPI(apiKey, messages, SYSTEM_PROMPTS[modelId]);
      } else {
        // Demo mode fallback
        responseText = await demoResponse(text, modelId);
      }

      // Spend credits
      Credits.spend(cost, user.email);

      typingEl.remove();
      appendMessage('ai', responseText);
      messages.push({ role: 'assistant', content: responseText });

      // Save chat
      saveCurrentChat(text);
      loadHistory();
      updateCreditsDisplay();

    } catch (err) {
      typingEl.remove();
      appendMessage('ai', '❌ Error al conectar con la IA. Verifica tu API Key en la configuración.');
      console.error(err);
    }

    isLoading = false;
    sendBtn.disabled = false;
  }

  // ── Anthropic API ────────────────────────────────────────
  async function callAnthropicAPI(apiKey, msgs, systemPrompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: systemPrompt,
        messages: msgs.slice(-20) // Keep last 20 messages for context
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Sin respuesta.';
  }

  // ── Demo responses (no API key) ───────────────────────────
  async function demoResponse(userText, model) {
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    const lower = userText.toLowerCase();

    if (model === 'roblox-ai') {
      if (lower.includes('datastoreservice') || lower.includes('datastore')) {
        return `Aquí te muestro cómo usar **DataStoreService** en Roblox para guardar datos de jugadores:

\`\`\`lua
local DataStoreService = game:GetService("DataStoreService")
local playerDataStore = DataStoreService:GetDataStore("PlayerData")

-- Guardar datos
local function saveData(player, data)
    local success, err = pcall(function()
        playerDataStore:SetAsync(tostring(player.UserId), data)
    end)
    if not success then
        warn("Error al guardar datos: " .. err)
    end
end

-- Cargar datos
local function loadData(player)
    local success, data = pcall(function()
        return playerDataStore:GetAsync(tostring(player.UserId))
    end)
    if success and data then
        return data
    end
    return { coins = 0, level = 1 } -- valores por defecto
end

-- Conectar eventos de jugadores
game.Players.PlayerAdded:Connect(function(player)
    local data = loadData(player)
    -- Aplicar datos al jugador...
end)

game.Players.PlayerRemoving:Connect(function(player)
    -- saveData(player, datosDelJugador)
end)
\`\`\`

> ⚠️ Nota: Esta es una demostración. Agrega tu **API Key de Anthropic** en la configuración para respuestas completas y personalizadas.`;
      }

      if (lower.includes('leaderstats') || lower.includes('stats')) {
        return `Para crear un sistema de **leaderstats** en Roblox Studio, usa este Script en ServerScriptService:

\`\`\`lua
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    -- Crear carpeta leaderstats
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    -- Añadir estadísticas
    local coins = Instance.new("IntValue")
    coins.Name = "Monedas"
    coins.Value = 0
    coins.Parent = leaderstats

    local level = Instance.new("IntValue")
    level.Name = "Nivel"
    level.Value = 1
    level.Parent = leaderstats
end)
\`\`\`

Las leaderstats aparecen automáticamente en el leaderboard del juego. ¡Listo!

> ⚠️ Agrega tu API Key para respuestas más detalladas.`;
      }

      return `Hola! Soy el **Roblox Studio AI**. 🎮

Puedo ayudarte con:
- Scripts de Lua/Luau
- DataStoreService y persistencia de datos
- RemoteEvents y comunicación cliente-servidor
- GUIs y interfaces de usuario
- Sistemas de juego (inventarios, monedas, levels)
- Optimización y buenas prácticas

> ⚠️ Esta es una demostración. Para respuestas completas con IA real, agrega tu **API Key de Anthropic** (la puedes obtener en [console.anthropic.com](https://console.anthropic.com)) en la sección de Configuración del panel izquierdo.`;
    }

    return `Modo **demostración**. Para usar el AI con respuestas reales, agrega tu API Key de Anthropic en la configuración del panel izquierdo. Puedes obtener una en [console.anthropic.com](https://console.anthropic.com).`;
  }

  // ── DOM helpers ───────────────────────────────────────────
  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;

    const avatarInitial = role === 'user'
      ? (user.name || user.email || 'U').slice(0, 2).toUpperCase()
      : meta.icon;

    div.innerHTML = `
      <div class="msg-avatar ${role}">${avatarInitial}</div>
      <div>
        <div class="msg-bubble">${renderMarkdown(text)}</div>
        <div class="msg-time">${formatTime(new Date())}</div>
      </div>
    `;

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'message ai typing-indicator';
    div.innerHTML = `
      <div class="msg-avatar ai">${meta.icon}</div>
      <div class="msg-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  // ── Chat persistence ──────────────────────────────────────
  function saveCurrentChat(lastMsg) {
    const all = store.get('sai_chats', {});
    all[chatId] = {
      id: chatId,
      model: modelId,
      title: lastMsg.slice(0, 50) || 'Nueva conversación',
      messages,
      updatedAt: new Date().toISOString()
    };
    store.set('sai_chats', all);
  }

  function loadHistory() {
    if (!historyList) return;
    const all = store.get('sai_chats', {});
    const modelChats = Object.values(all)
      .filter(c => c.model === modelId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 20);

    historyList.innerHTML = '';

    if (modelChats.length === 0) {
      historyList.innerHTML = '<div style="padding:10px;font-size:12px;color:var(--text-3);text-align:center">Sin conversaciones aún</div>';
      return;
    }

    modelChats.forEach(chat => {
      const el = document.createElement('div');
      el.className = `chat-history-item${chat.id === chatId ? ' active' : ''}`;
      el.innerHTML = `
        <div class="h-title">${escapeHtml(chat.title)}</div>
        <div class="h-date">${window.SAI.timeAgo(chat.updatedAt)}</div>
      `;
      el.addEventListener('click', () => loadChat(chat));
      historyList.appendChild(el);
    });
  }

  function loadChat(chat) {
    chatId   = chat.id;
    messages = chat.messages || [];

    messagesEl.innerHTML = '';
    if (emptyState) emptyState.style.display = messages.length ? 'none' : 'flex';

    messages.forEach(msg => appendMessage(msg.role === 'user' ? 'user' : 'ai', msg.content));
    loadHistory();
  }

  function startNewChat() {
    chatId   = generateId();
    messages = [];
    messagesEl.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    loadHistory();
  }

  function updateCreditsDisplay(balance) {
    const b = balance ?? Credits.getBalance(user.email);
    document.querySelectorAll('[data-credits-balance]').forEach(el => {
      el.textContent = b;
    });
  }

  function generateId() {
    return Math.random().toString(36).slice(2, 11);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});