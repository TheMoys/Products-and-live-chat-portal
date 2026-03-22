<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { io } from 'socket.io-client';
  import { chatService } from '../../services/chatService.js';
  import { appState } from '../state/appState.svelte.js';
  import '@/assets/styles/chat.css';

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || window.location.origin.replace(':5173', ':3000');

  let socket = null;
  let typingTimeout = null;

  let loading = $state(false);
  let error = $state('');
  let connected = $state(false);

  let newMessage = $state('');
  let messages = $state([]);
  let typingUsers = $state([]);
  let connectedUsers = $state([]);

  let messagesContainer = $state(null);

  const typingText = $derived.by(() => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} esta escribiendo...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} y ${typingUsers[1]} estan escribiendo...`;
    return `${typingUsers.length} personas estan escribiendo...`;
  });

  function goBack() {
    push('/products');
  }

  function getInitials(username) {
    if (!username) return 'U';
    const parts = username.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return username.slice(0, 2).toUpperCase();
  }

  function getUsername(message) {
    return message?.user?.username || message?.username || 'Usuario';
  }

  function getMessageUserId(message) {
    if (!message) return null;
    if (typeof message.user === 'string') return message.user;
    return message?.user?.id || message?.user?._id || null;
  }

  function isOwnMessage(message) {
    const msgUserId = getMessageUserId(message);
    const currentUserId = appState.user?._id || appState.user?.id;
    return Boolean(msgUserId && currentUserId && String(msgUserId) === String(currentUserId));
  }

  function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  async function loadMessages() {
    loading = true;
    error = '';
    try {
      const data = await chatService.getMessages(50);
      messages = Array.isArray(data) ? data : [];
      await scrollToBottom();
    } catch (err) {
      error = err?.response?.data?.message || err?.message || 'Error al cargar mensajes';
    } finally {
      loading = false;
    }
  }

  function addTypingUser(username) {
    if (!username) return;
    if (username === appState.user?.username) return;
    if (!typingUsers.includes(username)) {
      typingUsers = [...typingUsers, username];
    }
  }

  function removeTypingUser(username) {
    typingUsers = typingUsers.filter((u) => u !== username);
  }

  function initSocket() {
    const token = appState.token || localStorage.getItem('token');
    if (!token) return;

    socket = io(BACKEND_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      connected = true;
    });

    socket.on('disconnect', () => {
      connected = false;
    });

    socket.on('connect_error', (err) => {
      connected = false;
      error = err?.message || 'Error de conexion con chat';
    });

    socket.on('chat:message', async (message) => {
      messages = [...messages, message];
      await scrollToBottom();
    });

    socket.on('chat:user-typing', (data) => {
      addTypingUser(data?.username);
    });

    socket.on('chat:user-stop-typing', (data) => {
      removeTypingUser(data?.username);
    });

    socket.on('chat:users-update', (users) => {
      connectedUsers = Array.isArray(users) ? users : [];
    });
  }

  function emitStopTyping() {
    if (socket && connected) {
      socket.emit('chat:stop-typing');
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
  }

  function handleInput() {
    if (!socket || !connected) return;

    socket.emit('chat:typing');

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      emitStopTyping();
    }, 1000);
  }

  function sendMessage() {
    const text = newMessage.trim();
    if (!text || !socket || !connected) return;

    emitStopTyping();
    socket.emit('chat:message', { text });
    newMessage = '';
  }

  onMount(async () => {
    await loadMessages();
    initSocket();
  });

  onDestroy(() => {
    emitStopTyping();
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  });
</script>

<div class="chat-container">
  <header class="chat-header">
    <h1>CHAT EN VIVO</h1>

    <div class="connection-status" class:connected={connected}>
      <span class="status-dot"></span>
      {connected ? 'Conectado' : 'Desconectado'}
    </div>
  </header>

  <div class="chat-content">
    <aside class="chat-sidebar">
      <div class="user-info">
        <div class="user-avatar">{getInitials(appState.user?.username)}</div>
        <div class="user-details">
          <h3>{appState.user?.username || 'Usuario'}</h3>
          <p>{appState.user?.email || ''}</p>
        </div>
      </div>

      <div class="connected-users">
        <h3 class="users-title">Conectados ({connectedUsers.length})</h3>

        <div class="users-list">
          {#if connectedUsers.length === 0}
            <div class="no-users"><p>No hay usuarios conectados</p></div>
          {:else}
            {#each connectedUsers as user}
              <div class="user-item" class:current-user={user.username === appState.user?.username}>
                <div class="user-item-avatar">{getInitials(user.username)}</div>
                <div class="user-item-info">
                  <span class="user-item-name">
                    {user.username}
                    {#if user.username === appState.user?.username}
                      <span class="you-badge">Tu</span>
                    {/if}
                  </span>
                  <span class="user-item-status">En linea</span>
                </div>
                <div class="status-indicator"></div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </aside>

    <main class="chat-main">
      {#if loading}
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Cargando mensajes...</p>
        </div>
      {:else}
        {#if error}
          <div class="alert alert-danger" style="margin: 12px;">{error}</div>
        {/if}

        <div class="chat-messages" bind:this={messagesContainer}>
          {#each messages as message, index}
            <div class="message-wrapper" class:own-message={isOwnMessage(message)}>
              <div class="message">
                <div class="message-avatar">{getInitials(getUsername(message))}</div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-username">{getUsername(message)}</span>
                    <span class="message-time">{formatTime(message.createdAt)}</span>
                  </div>
                  <div class="message-text">{message.text}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if typingText}
          <div class="typing-indicator">
            <div class="typing-dots"><span></span><span></span><span></span></div>
            <span class="typing-text">{typingText}</span>
          </div>
        {/if}

        <div class="chat-input-container">
          <input
            class="chat-input"
            type="text"
            placeholder="Escribe un mensaje..."
            maxlength="500"
            bind:value={newMessage}
            oninput={handleInput}
            onkeydown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={!connected}
          />
          <button class="send-button" onclick={sendMessage} disabled={!newMessage.trim() || !connected}>
            Enviar
          </button>
        </div>
      {/if}
    </main>
  </div>
</div>