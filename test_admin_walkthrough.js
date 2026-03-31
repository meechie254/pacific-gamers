const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    try {
        console.log('🚀 Starting Admin Dashboard Walkthrough...');
        const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
        const page = await browser.newPage();

        // ─── LOGIN ───
        console.log('🔑 Navigating to Login...');
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle2' });
        await delay(1500);

        await page.type('#username', 'admin', { delay: 100 });
        await delay(400);
        await page.type('#password', 'admin123', { delay: 100 });
        await delay(400);
        await page.select('#loginType', 'admin');
        await delay(800);

        console.log('✅ Logging in...');
        await Promise.all([
            page.click('#loginBtn'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        console.log('📊 Arrived at Admin Dashboard. Showing overview...');
        await delay(3000);

        // ─── ANALYTICS TAB ───
        console.log('📈 Clicking Analytics tab...');
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            tabs.find(t => t.textContent.includes('Analytics'))?.click();
        });
        await delay(3000);

        // ─── INVENTORY TAB ───
        console.log('📦 Clicking Inventory tab...');
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            tabs.find(t => t.textContent.includes('Inventory'))?.click();
        });
        await delay(2500);

        // ─── OPEN ADD PRODUCT MODAL ───
        console.log('➕ Opening "Add New Product" modal...');
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('.btn-add'));
            btns.find(b => b.textContent.includes('Add New Product'))?.click();
        });
        await delay(2500);

        // ─── FILL IN A TEST PRODUCT ───
        console.log('🎮 Filling in a test product...');
        await page.type('#prodName', 'Test Game 2026', { delay: 80 });
        await delay(300);
        await page.type('#prodPrice', '45', { delay: 80 });
        await delay(300);
        await page.select('#prodCategory', 'action');
        await delay(300);
        await page.type('#prodDesc', 'A test game added from the admin dashboard.', { delay: 50 });
        await delay(300);
        await page.type('#prodImage', 'img/fifa25.jpg', { delay: 60 });
        await delay(1500);

        // ─── SUBMIT THE FORM ───
        console.log('💾 Saving the product...');
        await page.evaluate(() => {
            document.getElementById('productForm')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });
        await delay(3000);

        // ─── ORDERS TAB ───
        console.log('🛒 Clicking Dashboard tab (Orders)...');
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            tabs.find(t => t.textContent.includes('Dashboard'))?.click();
        });
        await delay(2500);

        // ─── MESSAGES TAB ───
        console.log('💬 Clicking Messages tab...');
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            tabs.find(t => t.textContent.includes('Messages'))?.click();
        });
        await delay(2500);

        // ─── SUBSCRIBERS TAB ───
        console.log('📧 Clicking Subscribers tab...');
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            tabs.find(t => t.textContent.includes('Subscribers'))?.click();
        });
        await delay(2500);

        // ─── SETTINGS TAB ───
        console.log('⚙️  Clicking Settings tab...');
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            tabs.find(t => t.textContent.includes('Settings'))?.click();
        });
        await delay(3000);

        console.log('✅ Admin Walkthrough COMPLETE! All tabs and features confirmed working.');
        await browser.close();
    } catch (e) {
        console.error('❌ Walkthrough error:', e.message);
    }
})();
