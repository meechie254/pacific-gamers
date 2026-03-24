/**
 * Pacific Gamers - Live Chat Component
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject HTML
    const chatHTML = `
        <div class="live-chat-widget">
            <div class="chat-button" id="chatBtn">
                <svg viewBox="0 0 24 24"><path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"/></svg>
            </div>
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <h3>Pacific Support</h3>
                    <span id="closeChat" style="cursor:pointer; font-size: 1.5rem;">&times;</span>
                </div>
                <div class="chat-body" id="chatBody">
                    <div class="message admin">Welcome to Pacific Gamers! How can we help you level up today?</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" class="chat-input" id="chatInput" placeholder="Type your message...">
                    <button class="btn-send" id="sendBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    const btn = document.getElementById('chatBtn');
    const window = document.getElementById('chatWindow');
    const close = document.getElementById('closeChat');
    const body = document.getElementById('chatBody');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('sendBtn');

    btn.onclick = () => window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
    close.onclick = () => window.style.display = 'none';

    function sendMessage() {
        if (!input.value.trim()) return;
        
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.textContent = input.value;
        body.appendChild(userMsg);
        
        // Save to server message board
        fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Live Chat User',
                email: 'chat@local',
                subject: 'Live Support Request',
                message: input.value,
                message_type: 'support'
            })
        });

        input.value = '';
        body.scrollTop = body.scrollHeight;

        // Auto-reply simulation
        setTimeout(() => {
            const adminMsg = document.createElement('div');
            adminMsg.className = 'message admin';
            adminMsg.textContent = "An elite support agent will be with you shortly. Thank you for choosing Pacific Gamers!";
            body.appendChild(adminMsg);
            body.scrollTop = body.scrollHeight;
        }, 1000);
    }

    send.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
});
