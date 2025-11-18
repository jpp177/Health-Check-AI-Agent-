// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

function initDashboard() {
  // Initialize event listeners
  setupEventListeners();
  
  // Load initial data
  loadDashboardData();
  
  // Setup chart
  setupPerformanceChart();
  
  // Auto-refresh every 30 seconds
  setInterval(loadDashboardData, 30000);
}

function setupEventListeners() {
  const refreshBtn = document.getElementById('refreshBtn');
  const runDiagnosticsBtn = document.getElementById('runDiagnosticsBtn');
  const timeRange = document.getElementById('timeRange');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDashboardData();
      showNotification('Dashboard refreshed', 'success');
    });
  }
  
  if (runDiagnosticsBtn) {
    runDiagnosticsBtn.addEventListener('click', runDiagnostics);
  }
  
  if (timeRange) {
    timeRange.addEventListener('change', (e) => {
      updateChartTimeRange(e.target.value);
    });
  }
}

async function loadDashboardData() {
  try {
    // TODO: Replace with actual API calls
    // const response = await fetch('/api/dashboard-data');
    // const data = await response.json();
    
    // For now, using mock data
    updateStatusCards({
      routerStatus: 'Healthy',
      signalStrength: '-45 dBm',
      deviceCount: 12,
      networkSpeed: '248 Mbps'
    });
    
    updateMetrics({
      cpu: 45,
      memory: 62,
      temperature: 58,
      uptime: 99.8
    });
    
    console.log('Dashboard data loaded');
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Failed to load dashboard data', 'error');
  }
}

function updateStatusCards(data) {
  const elements = {
    routerStatus: document.getElementById('routerStatus'),
    signalStrength: document.getElementById('signalStrength'),
    deviceCount: document.getElementById('deviceCount'),
    networkSpeed: document.getElementById('networkSpeed')
  };
  
  if (elements.routerStatus) elements.routerStatus.textContent = data.routerStatus;
  if (elements.signalStrength) elements.signalStrength.textContent = data.signalStrength;
  if (elements.deviceCount) elements.deviceCount.textContent = data.deviceCount;
  if (elements.networkSpeed) elements.networkSpeed.textContent = data.networkSpeed;
}

function updateMetrics(data) {
  // Update metric bars
  const metrics = document.querySelectorAll('.metric-item');
  const values = [data.cpu, data.memory, data.temperature, data.uptime];
  
  metrics.forEach((metric, index) => {
    const bar = metric.querySelector('.metric-bar');
    const value = metric.querySelector('.metric-value');
    
    if (bar && values[index] !== undefined) {
      bar.style.width = `${values[index]}%`;
    }
  });
}

async function runDiagnostics() {
  const btn = document.getElementById('runDiagnosticsBtn');
  
  if (!btn) return;
  
  btn.disabled = true;
  btn.textContent = '⏳ Running...';
  
  try {
    const response = await fetch('/run-diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (result.ok) {
      showNotification(result.msg || 'Diagnostics completed', 'success');
      loadDashboardData();
    } else {
      showNotification('Diagnostics failed', 'error');
    }
  } catch (error) {
    console.error('Error running diagnostics:', error);
    showNotification('Error running diagnostics', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Run Diagnostics';
  }
}

function setupPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  
  if (!canvas) return;
  
  // TODO: Implement actual chart using Chart.js or similar library
  // For now, display placeholder text
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#8b949e';
  ctx.font = '16px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('Performance Chart', canvas.width / 2, canvas.height / 2);
  ctx.font = '12px Segoe UI';
  ctx.fillText('(Chart.js integration pending)', canvas.width / 2, canvas.height / 2 + 25);
}

function updateChartTimeRange(range) {
  console.log('Updating chart time range to:', range);
  // TODO: Fetch and update chart data based on time range
  showNotification(`Time range updated to ${range}`, 'info');
}

function showNotification(message, type = 'info') {
  // Simple notification system
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#4f8cff',
    color: 'white',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: '1000',
    animation: 'slideIn 0.3s ease-out'
  });
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
