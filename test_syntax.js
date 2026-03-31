
    // ── WAIT FOR DOM READY ──
    document.addEventListener('DOMContentLoaded', function() {

      // ─── LOGOUT BUTTON ───
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', logout);

      // ─── TAB SWITCHING (wired directly to DOM) ───
      document.querySelectorAll('#adminTabBar .tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          document.querySelectorAll('#adminTabBar .tab-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const tabId = this.getAttribute('data-tab');
          const tabEl = document.getElementById(tabId);
          if (tabEl) tabEl.classList.add('active');
        });
      });

      // ─── PRODUCT FORM SUBMIT ───
      const productForm = document.getElementById('productForm');
      if (productForm) {
        productForm.addEventListener('submit', saveProduct);
      }

      // ─── PASSWORD CHANGE FORM ───
      const passForm = document.getElementById('passwordChangeForm');
      if (passForm) {
        passForm.addEventListener('submit', changePasswordHandler);
      }

      // ─── AUTH CHECK (non-blocking, only redirect if explicitly rejected) ───
      const token = localStorage.getItem('pacific_token');
      if (!token) {
        window.location.href = 'login.html';
        return;
      }
      fetch('/api/auth/check', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(r => r.json())
        .then(data => {
          if (data.authenticated === false) {
            window.location.href = 'login.html';
          }
        })
        .catch(() => { /* keep showing dashboard on network error */ });

      // Load all data
      loadData();
    });

    function logout() {
      if (!confirm('Are you sure you want to logout?')) return;
      localStorage.removeItem('pacific_token');
      localStorage.removeItem('pacific_user');
      window.location.href = 'login.html';
    }

    async function loadData() {
      const token = localStorage.getItem('pacific_token');
      try {
        // Parallel fetching for speed
        const [ordRes, msgRes, prodRes, bookRes, polyRes, subRes, topRes] = await Promise.all([
          fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/messages', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/products/all', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/subscriptions', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/top-sellers', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const [ordersData, messages, allInvProductsData, bookings, analytics, subscribers, topSellers] = await Promise.all([
          ordRes.json(),
          msgRes.json(),
          prodRes.json(),
          bookRes.json(),
          polyRes.json(),
          subRes.json(),
          topRes.json()
        ]);
        
        // Orders Processing
        const orders = Array.isArray(ordersData) ? ordersData : [];
        const paidOrders = orders.filter(o => o.status === 'Paid');
        const revenue = paidOrders.reduce((acc, o) => {
            const val = parseFloat(o.total.replace(/[^0-9.]/g, ''));
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
        
        document.getElementById('statRevenue').textContent = `KES ${revenue.toLocaleString()}`;
        document.getElementById('statOrders').textContent = orders.length;
        document.getElementById('statAvg').textContent = paidOrders.length > 0 ? `KES ${(revenue / paidOrders.length).toFixed(0)}` : 'KES 0';
        
        const ordBody = document.getElementById('ordersBody');
        ordBody.innerHTML = orders.map(o => `
          <tr>
            <td><code style="color: #888;">#ORD-${String(o.id).padStart(4, '0')}</code></td>
            <td><strong>${o.name}</strong><br><small style="color: #666;">${o.email}</small></td>
            <td><span style="font-size: 0.85rem;">${JSON.parse(o.items).map(i => `${i.name} (x${i.quantity || 1})`).join(', ')}</span></td>
            <td style="color: var(--primary); font-weight: bold;">${o.total}</td>
            <td><span class="status-badge ${o.status === 'Paid' ? 'status-paid' : 'status-pending'}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>
              ${o.status === 'Pending' ? `<button onclick="updateStatus(${o.id})" style="padding: 6px 12px; cursor: pointer; background: var(--primary); color: black; border: none; border-radius: 6px; font-size: 0.7rem; font-weight: bold; transition: all 0.2s;">MARK PAID</button>` : '<span style="color: #555; font-size: 0.7rem;">COMPLETED</span>'}
            </td>
          </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center;">No orders found.</td></tr>';

        // Messages Processing
        document.getElementById('statMessages').textContent = messages.length;
        const msgBody = document.getElementById('messagesBody');
        const msgBodyTab = document.getElementById('messagesBodyTab');
        const msgHtml = messages.map(m => `
          <tr>
            <td>#${m.id}</td>
            <td><strong>${m.name}</strong><br><small style="color: #666;">${m.email}</small></td>
            <td>${m.subject}</td>
            <td style="max-width: 300px; font-size: 0.9rem; color: #aaa;">${m.message}</td>
            <td>${new Date(m.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">No messages found.</td></tr>';
        
        msgBody.innerHTML = msgHtml;
        msgBodyTab.innerHTML = msgHtml;

        // Inventory Processing
        allInvProducts = Array.isArray(allInvProductsData) ? allInvProductsData : [];
        renderProductsTable(allInvProducts);

        // Bookings Processing
        const bookBody = document.getElementById('bookingsBody');
        bookBody.innerHTML = bookings.map(b => `
          <tr>
            <td><code style="color: #888;">#BK-${String(b.id).padStart(3, '0')}</code></td>
            <td>
              <strong>${b.name}</strong><br>
              <span style="font-size: 0.7rem; color: #888;">${b.email} | ${b.phone}</span>
            </td>
            <td><span class="status-badge" style="background: rgba(0,255,204,0.1); border-color: var(--primary); color: var(--primary);">${b.tournament}</span></td>
            <td><span style="font-size: 0.85rem; color: #aaa;">${new Date(b.date).toLocaleDateString()}</span></td>
            <td style="max-width: 250px; font-size: 0.85rem; color: #888;">${b.message || '-'}</td>
            <td><span class="status-badge status-paid" style="font-size: 0.6rem;">Confirmed</span></td>
          </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;">No bookings yet.</td></tr>';

        // Subscribers Processing
        document.getElementById('statSubscribers').textContent = subscribers.length;
        const subsBody = document.getElementById('subsBody');
        subsBody.innerHTML = subscribers.map(s => `
          <tr>
            <td>#SUB-${String(s.id).padStart(3, '0')}</td>
            <td><strong>${s.email}</strong></td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('') || '<tr><td colspan="3" style="text-align:center;">No subscribers yet.</td></tr>';

        // Analytics Processing
        renderChart(analytics, orders);

        // Top Sellers Table
        const topBody = document.getElementById('topSellersBody');
        topBody.innerHTML = topSellers.map(s => `
          <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.total_sold} units</td>
            <td style="color: var(--primary); font-weight: bold;">KES ${s.revenue.toLocaleString()}</td>
          </tr>
        `).join('') || '<tr><td colspan="3" style="text-align:center;">No sales data available yet.</td></tr>';

      } catch (err) {
        console.error('Failed to load data:', err);
      }
    }

    let myChart = null;
    let myCategoryChart = null;
    let analyticsCharts = {};

    function renderChart(analytics, orders) {
      const ctx = document.getElementById('growthChart').getContext('2d');
      if (myChart) myChart.destroy();
      const catCtx = document.getElementById('categoryChart')?.getContext('2d');
      if (myCategoryChart) myCategoryChart.destroy();

      const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      };

      // Revenue line chart
      myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analytics.map(a => a.day),
          datasets: [{
            label: 'Revenue (KES)',
            data: analytics.map(a => a.revenue),
            borderColor: '#00ffcc',
            tension: 0.4, fill: true,
            backgroundColor: 'rgba(0,255,204,0.07)',
            pointBackgroundColor: '#00ffcc',
            pointRadius: 4
          }]
        },
        options: { ...commonOptions,
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
            x: { grid: { display: false }, ticks: { color: '#666' } }
          }
        }
      });

      // Category donut chart
      if (catCtx && orders?.length) {
        const cats = {};
        orders.forEach(o => {
          try {
            const items = JSON.parse(o.items);
            items.forEach(i => { cats[i.category || 'General'] = (cats[i.category || 'General'] || 0) + 1; });
          } catch {}
        });
        myCategoryChart = new Chart(catCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(cats),
            datasets: [{ data: Object.values(cats),
              backgroundColor: ['#00ffcc','#00aaff','#ff6b6b','#ffc107','#a855f7'],
              borderWidth: 0
            }]
          },
          options: { ...commonOptions,
            plugins: { legend: { display: true, position: 'bottom', labels: { color: '#888', font: { size: 10 } } } }
          }
        });
      }

      // Analytics tab charts
      const aRevCtx = document.getElementById('analyticsRevenueChart')?.getContext('2d');
      if (aRevCtx) {
        if (analyticsCharts.rev) analyticsCharts.rev.destroy();
        analyticsCharts.rev = new Chart(aRevCtx, {
          type: 'bar',
          data: {
            labels: analytics.map(a => a.day),
            datasets: [{ label: 'KES', data: analytics.map(a => a.revenue),
              backgroundColor: 'rgba(0,255,204,0.3)', borderColor: '#00ffcc', borderWidth: 1, borderRadius: 6 }]
          },
          options: { ...commonOptions,
            scales: {
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
              x: { grid: { display: false }, ticks: { color: '#666' } }
            }
          }
        });
      }

      const aStatusCtx = document.getElementById('analyticsStatusChart')?.getContext('2d');
      if (aStatusCtx && orders) {
        const paid = orders.filter(o => o.status === 'Paid').length;
        const pending = orders.length - paid;
        if (analyticsCharts.status) analyticsCharts.status.destroy();
        analyticsCharts.status = new Chart(aStatusCtx, {
          type: 'pie',
          data: {
            labels: ['Paid', 'Pending'],
            datasets: [{ data: [paid, pending],
              backgroundColor: ['rgba(0,255,204,0.7)', 'rgba(243,156,18,0.7)'], borderWidth: 0 }]
          },
          options: { ...commonOptions,
            plugins: { legend: { display: true, position: 'bottom', labels: { color: '#888' } } }
          }
        });
      }

      const aBarCtx = document.getElementById('analyticsBarChart')?.getContext('2d');
      if (aBarCtx) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const currentMonth = new Date().getMonth();
        const monthLabels = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
        if (analyticsCharts.bar) analyticsCharts.bar.destroy();
        analyticsCharts.bar = new Chart(aBarCtx, {
          type: 'bar',
          data: {
            labels: monthLabels,
            datasets: [{ label: 'Orders', data: monthLabels.map(() => Math.floor(Math.random() * 20 + 5)),
              backgroundColor: 'rgba(168,85,247,0.4)', borderColor: '#a855f7', borderWidth: 1, borderRadius: 6 }]
          },
          options: { ...commonOptions,
            scales: {
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
              x: { grid: { display: false }, ticks: { color: '#666' } }
            }
          }
        });
      }
    }

    async function updateStatus(id) {
      if (!confirm('Mark this order as Paid?')) return;
      try {
        await fetch(`/api/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('pacific_token')}`
          },
          body: JSON.stringify({ status: 'Paid' })
        });
        loadData();
      } catch (err) {
        alert('Failed to update status');
      }
    }


    function editProduct(p) {
      openProductModal(p);
    }

    function openProductModal(p = null) {
      const modal = document.getElementById('productModal');
      const form = document.getElementById('productForm');
      modal.style.display = 'flex';
      
      if (p) {
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodDesc').value = p.description;
        document.getElementById('prodImage').value = p.image_url;
      } else {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        form.reset();
        document.getElementById('prodId').value = '';
      }
    }

    function closeProductModal() {
      document.getElementById('productModal').style.display = 'none';
    }

    async function saveProduct(e) {
      e.preventDefault();
      const id = document.getElementById('prodId').value;
      const product = {
        name: document.getElementById('prodName').value,
        price: document.getElementById('prodPrice').value,
        category: document.getElementById('prodCategory').value,
        description: document.getElementById('prodDesc').value,
        image_url: document.getElementById('prodImage').value,
        status: 'available'
      };
      try {
        const url = id ? `/api/products/${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('pacific_token')}`
          },
          body: JSON.stringify(product)
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        closeProductModal();
        loadData();
      } catch (err) {
        alert('Error saving product: ' + err.message);
      }
    }

    let deleteTimestamps = {}; // Track local deletions for 30s countdown

    async function restoreProduct(id) {
      try {
        await fetch(`/api/products/${id}/restore`, { 
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('pacific_token')}` }
        });
        delete deleteTimestamps[id]; // Clear timer
        loadData();
      } catch (err) {
        alert('Error restoring product');
      }
    }

    async function deleteProduct(id) {
      if (!confirm('Product will be permanently deleted after 30 seconds. Proceed?')) return;
      try {
        await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('pacific_token')}` }
        });
        deleteTimestamps[id] = Date.now();
        loadData();
      } catch (err) {
        alert('Error deleting product');
      }
    }

    // Global interval for the 30s countdown
    setInterval(() => {
      const timers = document.querySelectorAll('.delete-timer');
      timers.forEach(t => {
        let left = parseInt(t.getAttribute('data-left'));
        if (left > 0) {
          left--;
          t.setAttribute('data-left', left);
          t.textContent = ` (${left}s left)`;
          if (left === 0) {
              // Time's up, refresh the data to remove the row from the UI
              setTimeout(() => loadData(), 500);
          }
        }
      });
    }, 1000);

    let allInvProducts = [];
    function filterProducts() {
      const q = document.getElementById('productSearch').value.toLowerCase();
      const filtered = allInvProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      renderProductsTable(filtered);
    }

    function renderProductsTable(products) {
      const prodBody = document.getElementById('productsBody');
      prodBody.innerHTML = products.map(p => {
        const isDeleted = p.is_deleted === 1;
        return `
          <tr style="${isDeleted ? 'opacity: 0.5; background: rgba(255,0,0,0.02);' : ''}">
            <td><code style="color: #888;">#PRD-${String(p.id).padStart(3, '0')}</code></td>
            <td style="display: flex; align-items: center; gap: 10px;">
              <img src="${p.image_url}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
              <div><strong>${p.name}</strong></div>
            </td>
            <td><span style="text-transform: capitalize; color: #888;">${p.category}</span></td>
            <td style="font-weight: bold; color: var(--primary);">$${p.price}</td>
            <td>
              ${isDeleted 
                ? '<span class="status-badge" style="background: rgba(255,68,68,0.2); color: #ff4444; border: 1px solid #ff4444;">DELETED</span>' 
                : '<span class="status-badge status-paid" style="font-size: 0.6rem;">Available</span>'}
            </td>
            <td>
              ${(() => {
                if (isDeleted) {
                    let timerHtml = '';
                    if (deleteTimestamps[p.id]) {
                        const elapsed = Math.floor((Date.now() - deleteTimestamps[p.id]) / 1000);
                        const remaining = 30 - elapsed;
                        if (remaining > 0) {
                            timerHtml = `<span class="delete-timer" data-id="${p.id}" data-left="${remaining}" style="font-size: 0.7rem; color: #ff4444; margin-left: 5px; font-weight: bold;"> (${remaining}s left)</span>`;
                        } else {
                            timerHtml = `<span style="font-size: 0.7rem; color: #888; margin-left: 5px;"> (Deleting...)</span>`;
                        }
                    }
                    return `<button onclick="restoreProduct(${p.id})" style="padding: 5px 10px; cursor: pointer; background: var(--primary); color: black; border: none; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">UNDO DELETE</button>${timerHtml}`;
                } else {
                    return `<button onclick="editProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="padding: 5px 10px; cursor: pointer; background: none; border: 1px solid var(--primary); color: var(--primary); border-radius: 4px; font-size: 0.7rem;">EDIT</button>
                    <button onclick="deleteProduct(${p.id})" style="padding: 5px 10px; cursor: pointer; background: none; border: 1px solid #ff4444; color: #ff4444; border-radius: 4px; font-size: 0.7rem; margin-left: 5px;">DELETE</button>`;
                }
              })()}
            </td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="6" style="text-align:center;">No products found.</td></tr>';
    }

    /* ─── CHANGE PASSWORD HANDLER ─── */
    async function changePasswordHandler(e) {
      e.preventDefault();
      const curr = document.getElementById('currPass').value;
      const pass = document.getElementById('newPass').value;
      const conf = document.getElementById('confirmPass').value;
      if (pass !== conf) return alert('New passwords do not match!');
      if (pass.length < 6) return alert('Password must be at least 6 characters!');
      let adminUser = 'admin';
      try { adminUser = JSON.parse(localStorage.getItem('pacific_user')).username; } catch(e) {}
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('pacific_token') },
          body: JSON.stringify({ username: adminUser, currentPassword: curr, newPassword: pass })
        });
        const result = await res.json();
        if (res.ok) {
          alert('Password changed! Please log in with your new credentials.');
          localStorage.clear();
          window.location.href = 'login.html';
        } else alert('Error: ' + (result.error || result.message));
      } catch (err) { alert('Could not connect to server.'); }
    }

    // loadData is called inside DOMContentLoaded above
  