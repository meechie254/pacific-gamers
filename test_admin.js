const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        console.log('Starting local browser test...');
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/login.html');
        
        console.log('Logging in...');
        await new Promise(r => setTimeout(r, 1000));
        await page.type('#username', 'admin', { delay: 100 });
        await new Promise(r => setTimeout(r, 500));
        await page.type('#password', 'admin123', { delay: 100 });
        await new Promise(r => setTimeout(r, 500));
        await page.select('#loginType', 'admin');
        
        await new Promise(r => setTimeout(r, 1000));
        await Promise.all([
            page.click('#loginBtn'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        console.log('Landed on URL:', page.url());
        if (!page.url().includes('admin.html')) {
            console.log('Failed to reach admin.html');
            await browser.close();
            return;
        }

        console.log('Taking screenshot of dashboard...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('Attempting to click Settings Tab...');
        // Find Settings tab and click it
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            const settingsTab = tabs.find(t => t.textContent.includes('Settings'));
            if (settingsTab) settingsTab.click();
        });
        
        await new Promise(r => setTimeout(r, 2500));

        console.log('Attempting to click Inventory Tab...');
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            const invTab = tabs.find(t => t.textContent.includes('Inventory'));
            if (invTab) invTab.click();
        });

        await new Promise(r => setTimeout(r, 1500));

        console.log('Attempting to click Product Modal...');
        // Find "+ Add New Product" and click it
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('.btn-add'));
            const addBtn = btns.find(b => b.textContent.includes('Add New Product'));
            if (addBtn) addBtn.click();
        });

        await new Promise(r => setTimeout(r, 3000));

        console.log('Done showing the user!');
        await browser.close();
        console.log('Test complete.');
    } catch (e) {
        console.error('Test failed:', e);
    }
})();
