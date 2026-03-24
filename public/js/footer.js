/**
 * Pacific Gamers - Shared Footer HTML
 * Injected by footer.js into every page
 */

document.addEventListener('DOMContentLoaded', () => {
    const footerEl = document.querySelector('footer.footer');
    if (!footerEl) return;

    footerEl.innerHTML = `
    <div class="footer-inner">
        <div class="footer-brand">
            <h3>Pacific <span>Gamers</span></h3>
            <p>Meru's premier gaming destination.<br>Elite gear. Elite community. Elite play.</p>
            <div class="footer-socials">
                <a href="#" aria-label="Instagram">📸</a>
                <a href="#" aria-label="TikTok">🎵</a>
                <a href="#" aria-label="WhatsApp">💬</a>
                <a href="#" aria-label="YouTube">▶️</a>
            </div>
        </div>
        <div class="footer-links">
            <h4>Quick Links</h4>
            <ul>
                <li><a href="index.html">🏠 Home</a></li>
                <li><a href="shop.html">🛒 Shop</a></li>
                <li><a href="booking.html">📅 Book a Session</a></li>
                <li><a href="about.html">📖 About Us</a></li>
                <li><a href="contact.html">📞 Contact</a></li>
            </ul>
        </div>
        <div class="footer-links">
            <h4>Account</h4>
            <ul>
                <li><a href="login.html">🔑 Login</a></li>
                <li><a href="register.html">✨ Register</a></li>
                <li><a href="profile.html">👤 My Profile</a></li>
                <li><a href="checkout.html">🛒 Checkout</a></li>
            </ul>
        </div>
        <div class="footer-contact">
            <h4>Contact Us</h4>
            <ul>
                <li>📍 Sayen Makutano, Meru</li>
                <li>📍 Selenite Mall, Meru</li>
                <li>📞 +254 701 668 561</li>
                <li>📧 support@pacificgamers.com</li>
                <li>🕒 Mon–Sat: 9 AM – 8 PM</li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} Pacific Gamers. All rights reserved.</p>
        <p style="color:#444;">Made with ❤️ in Meru, Kenya</p>
    </div>
    `;
});
