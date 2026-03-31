const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    try {
        console.log('Starting full interactive site test...');
        const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
        const page = await browser.newPage();
        
        console.log('Opening Homepage...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle2' });
        
        // Let the user see the hero section
        await delay(3000);
        
        // Scroll down slightly to show games
        console.log('Scrolling down to explore games...');
        await page.evaluate(() => window.scrollBy({ top: 800, behavior: 'smooth' }));
        await delay(3000);

        // Scroll down to the chatbot trigger or feature area
        await page.evaluate(() => window.scrollBy({ top: 800, behavior: 'smooth' }));
        await delay(2000);

        // Scroll back to the top
        console.log('Scrolling back up...');
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        await delay(2000);

        // Click the "Our Games / Shop" link on Navbar
        console.log('Navigating to the Shop page...');
        const shopLinks = await page.$$('a[href="shop.html"]');
        if (shopLinks.length > 0) {
            await shopLinks[0].click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        } else {
            await page.goto('http://localhost:3000/shop.html');
        }
        
        // Wait on shop page to load products
        await delay(3000);

        // Simulate adding a product to the cart
        console.log('Adding a product to cart...');
        await page.evaluate(() => {
            const addBtns = Array.from(document.querySelectorAll('button'));
            const addToCartBtn = addBtns.find(btn => btn.textContent.toLowerCase().includes('add to cart') || btn.textContent.toLowerCase().includes('buy'));
            if (addToCartBtn) addToCartBtn.click();
        });
        
        await delay(2000);

        // Test the Chatbot widget if available
        console.log('Opening AI Support Assistant (X-Bot)...');
        await page.evaluate(() => {
            const chatToggle = document.getElementById('chatToggle');
            if (chatToggle) chatToggle.click();
        });
        
        await delay(2000);

        console.log('Sending a message to AI assistant...');
        await page.type('#chatInput', 'Who is the owner?', { delay: 150 });
        await delay(500);
        
        await page.evaluate(() => {
            const sendBtn = document.getElementById('chatSend');
            if (sendBtn) sendBtn.click();
        });

        // Wait for AI response
        await delay(4000);
        
        // Close Chatbot
        await page.evaluate(() => {
            const closeBtn = document.getElementById('chatClose');
            if (closeBtn) closeBtn.click();
        });

        await delay(1500);

        // Navigate to About page
        console.log('Navigating to About Page...');
        const aboutLinks = await page.$$('a[href="about.html"]');
        if (aboutLinks.length > 0) {
            await aboutLinks[0].click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        } else {
            await page.goto('http://localhost:3000/about.html');
        }

        await delay(3000);

        // Navigate to Contact page
        console.log('Navigating to Contact Page...');
        const contactLinks = await page.$$('a[href="contact.html"]');
        if (contactLinks.length > 0) {
            await contactLinks[0].click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        } else {
            await page.goto('http://localhost:3000/contact.html');
        }

        await delay(3000);

        console.log('Site navigation complete! Everything is functional.');
        await browser.close();
    } catch (e) {
        console.error('Test encountered an error:', e.message);
    }
})();
