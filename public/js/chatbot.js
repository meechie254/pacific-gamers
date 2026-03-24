// Pacific Gamers AI Support Bot (X-Bot)
document.addEventListener('DOMContentLoaded', () => {
    // Create Widget HTML
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
        <div class="chat-bubble" id="chatBubble">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </div>
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 10px; height: 10px; background: #000; border-radius: 50%; animation: pulse 1s infinite;"></div>
                    <span>X-Bot Elite Support</span>
                </div>
                <button id="closeChat" style="background:none; border:none; color:black; font-size:1.8rem; cursor:pointer; font-weight:bold;">&times;</button>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="msg msg-bot">Welcome to the Grid. I am X-Bot, your elite gaming assistant. How can I help you level up today?</div>
            </div>
            <form class="chat-footer" id="chatForm">
                <input type="text" class="chat-input" id="chatInput" placeholder="Ask X-Bot anything..." autocomplete="off">
                <button type="submit" class="btn-send">Send</button>
            </form>
        </div>
    `;
    document.body.appendChild(chatWidget);

    const bubble = document.getElementById('chatBubble');
    const window = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('closeChat');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    bubble.addEventListener('click', () => {
        window.classList.toggle('active');
        if(window.classList.contains('active')) chatInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        window.classList.remove('active');
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if(!text) return;

        // Add user message
        addMessage(text, 'user');
        chatInput.value = '';

        // Typing indicator
        const typingMsg = addMessage('...', 'bot');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Server error');

            // Remove typing indicator and add real reply
            typingMsg.remove();
            setTimeout(() => addMessage(data.reply, 'bot'), 300);
        } catch (err) {
            console.error('Chat AI Error:', err);
            typingMsg.remove();
            addMessage("Systems offline. Please verify you are using port 3000. Error: " + err.message, 'bot');
        }
    });

    function addMessage(text, side) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg msg-${side}`;
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return msgDiv;
    }
});
