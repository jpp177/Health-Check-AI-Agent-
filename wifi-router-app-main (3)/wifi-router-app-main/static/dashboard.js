// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

function initDashboard() {
  // Initialize event listeners
  setupEventListeners();
  
  // Load initial data
  loadDashboardData();
  
  // Auto-refresh every 30 seconds
  setInterval(loadDashboardData, 30000);
}

function setupEventListeners() {
  const refreshBtn = document.getElementById('refreshBtn');
  const runDiagnosticsBtn = document.getElementById('runDiagnosticsBtn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDashboardData();
      showNotification('Dashboard refreshed', 'success');
    });
  }
  
  if (runDiagnosticsBtn) {
    runDiagnosticsBtn.addEventListener('click', runDiagnostics);
  }
}

async function loadDashboardData() {
  try {
    const response = await fetch('/api/wifi-metrics');
    
    if (!response.ok) {
      throw new Error('Failed to fetch WiFi metrics');
    }
    
    const data = await response.json();
    
    // Update status cards with real data
    updateStatusCards({
      routerStatus: data.overview.health_status,
      statusIcon: data.overview.status_icon,
      healthScore: data.overview.health_score,
      signalStrength: `${data.signal.avg_rssi} dBm`,
      signalQuality: data.signal.signal_quality,
      deviceCount: data.overview.total_devices,
      networkSpeed: `${data.network_speed.avg_tx_speed_mbps} Mbps`
    });
    
    // Update metrics with WiFi-specific data
    updateMetrics({
      txRetransmit: (data.transmission.avg_tx_retransmit_ppm / 1000).toFixed(1),
      txFail: (data.transmission.avg_tx_fail_ppm / 1000).toFixed(1),
      rxDrop: (data.transmission.avg_rx_drop_ppm / 1000).toFixed(1),
      healthScore: data.overview.health_score
    });
    
    // Update anomalies list
    updateAnomaliesList(data.recent_anomalies);
    
    // Update frequency distribution
    updateFrequencyDistribution(data);
    
    // Update network statistics
    updateNetworkStatistics(data);
    
    // Update anomaly donut chart
    updateAnomalyChart(data);
    
    // Update anomalies by model chart
    updateAnomalyByModelChart(data);
    
    // Update anomalies by firmware chart
    updateAnomalyByFirmwareChart(data);
    
    // Store data for chart updates
    window.wifiMetrics = data;
    
    console.log('Dashboard data loaded successfully');
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Failed to load dashboard data', 'error');
  }
}

function updateStatusCards(data) {
  const elements = {
    routerStatus: document.getElementById('routerStatus'),
    statusIcon: document.querySelector('.status-icon'),
    signalStrength: document.getElementById('signalStrength'),
    signalLabel: document.querySelector('.status-card:nth-child(2) .status-label'),
    deviceCount: document.getElementById('deviceCount'),
    networkSpeed: document.getElementById('networkSpeed')
  };
  
  if (elements.routerStatus) {
    elements.routerStatus.textContent = data.routerStatus;
    // Update status icon color
    if (elements.statusIcon) {
      elements.statusIcon.textContent = data.statusIcon;
    }
  }
  
  if (elements.signalStrength) {
    elements.signalStrength.textContent = data.signalStrength;
    if (elements.signalLabel) {
      elements.signalLabel.textContent = data.signalQuality;
    }
  }
  
  if (elements.deviceCount) elements.deviceCount.textContent = data.deviceCount;
  if (elements.networkSpeed) elements.networkSpeed.textContent = data.networkSpeed;
}

function updateMetrics(data) {
  // Update metric bars and values with WiFi-specific metrics
  const metrics = document.querySelectorAll('.metric-item');
  
  if (metrics.length >= 4) {
    // TX Retransmit Rate
    const txRetransmitBar = metrics[0].querySelector('.metric-bar');
    const txRetransmitValue = metrics[0].querySelector('.metric-value');
    const txRetransmitLabel = metrics[0].querySelector('.metric-label');
    if (txRetransmitLabel) txRetransmitLabel.textContent = 'TX Retransmit Rate';
    if (txRetransmitBar) txRetransmitBar.style.width = `${Math.min(data.txRetransmit, 100)}%`;
    if (txRetransmitValue) txRetransmitValue.textContent = `${data.txRetransmit}‰`;
    
    // TX Failure Rate
    const txFailBar = metrics[1].querySelector('.metric-bar');
    const txFailValue = metrics[1].querySelector('.metric-value');
    const txFailLabel = metrics[1].querySelector('.metric-label');
    if (txFailLabel) txFailLabel.textContent = 'TX Failure Rate';
    if (txFailBar) txFailBar.style.width = `${Math.min(data.txFail, 100)}%`;
    if (txFailValue) txFailValue.textContent = `${data.txFail}‰`;
    
    // RX Drop Rate
    const rxDropBar = metrics[2].querySelector('.metric-bar');
    const rxDropValue = metrics[2].querySelector('.metric-value');
    const rxDropLabel = metrics[2].querySelector('.metric-label');
    if (rxDropLabel) rxDropLabel.textContent = 'RX Drop Rate';
    if (rxDropBar) rxDropBar.style.width = `${Math.min(data.rxDrop, 100)}%`;
    if (rxDropValue) rxDropValue.textContent = `${data.rxDrop}‰`;
    
    // Overall Health Score
    const healthBar = metrics[3].querySelector('.metric-bar');
    const healthValue = metrics[3].querySelector('.metric-value');
    const healthLabel = metrics[3].querySelector('.metric-label');
    if (healthLabel) healthLabel.textContent = 'Overall Health Score';
    if (healthBar) healthBar.style.width = `${data.healthScore}%`;
    if (healthValue) healthValue.textContent = `${data.healthScore}%`;
  }
}

function updateAnomaliesList(anomalies) {
  const anomaliesList = document.querySelector('.anomalies-list');
  const anomalyBadge = document.querySelector('.anomalies-card .badge');
  
  if (!anomaliesList) return;
  
  // Update anomaly count badge
  if (anomalyBadge) {
    anomalyBadge.textContent = anomalies.length;
  }
  
  // Clear existing anomalies
  anomaliesList.innerHTML = '';
  
  if (anomalies.length === 0) {
    anomaliesList.innerHTML = '<p style="color: #8b949e; text-align: center; padding: 20px;">No recent anomalies detected</p>';
    return;
  }
  
  // Add new anomalies
  anomalies.forEach(anomaly => {
    const anomalyItem = document.createElement('div');
    anomalyItem.className = 'anomaly-item warning';
    
    const timestamp = new Date(anomaly.timestamp);
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo;
    if (diffDays > 0) {
      timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = 'Just now';
    }
    
    anomalyItem.innerHTML = `
      <span class="anomaly-icon">⚠️</span>
      <div class="anomaly-content">
        <p class="anomaly-title">${anomaly.reason}</p>
        <span class="anomaly-time">${timeAgo} - ${anomaly.device.substring(0, 17)}...</span>
      </div>
    `;
    
    // Make anomaly item clickable
    anomalyItem.addEventListener('click', () => {
      showAnomalyModal(anomaly, timeAgo);
    });
    
    anomaliesList.appendChild(anomalyItem);
  });
}

function updateFrequencyDistribution(data) {
  const totalDeviceBadge = document.getElementById('totalDeviceBadge');
  const freq2ghzDetail = document.getElementById('freq2ghzDetail');
  const freq5ghzDetail = document.getElementById('freq5ghzDetail');
  const wpa3Detail = document.getElementById('wpa3Detail');
  const securityIssues = document.getElementById('securityIssues');
  
  if (totalDeviceBadge) {
    totalDeviceBadge.textContent = data.overview.total_devices;
  }
  
  if (freq2ghzDetail) {
    freq2ghzDetail.textContent = `${data.frequency.freq_2ghz_count} devices (${data.frequency.freq_2ghz_pct}%)`;
  }
  
  if (freq5ghzDetail) {
    freq5ghzDetail.textContent = `${data.frequency.freq_5ghz_count} devices (${data.frequency.freq_5ghz_pct}%)`;
  }
  
  if (wpa3Detail) {
    wpa3Detail.textContent = `${data.security.wpa3_count} devices`;
  }
  
  if (securityIssues) {
    securityIssues.textContent = `${data.security.open_count} devices`;
  }
}

function updateNetworkStatistics(data) {
  const avgUploadSpeed = document.getElementById('avgUploadSpeed');
  const avgDownloadSpeed = document.getElementById('avgDownloadSpeed');
  const highRetransCount = document.getElementById('highRetransCount');
  const highTxFailCount = document.getElementById('highTxFailCount');
  
  if (avgUploadSpeed) {
    avgUploadSpeed.textContent = `${data.network_speed.avg_tx_speed_mbps} Mbps`;
  }
  
  if (avgDownloadSpeed) {
    avgDownloadSpeed.textContent = `${data.network_speed.avg_rx_speed_mbps} Mbps`;
  }
  
  if (highRetransCount) {
    highRetransCount.textContent = `${data.transmission.high_retransmit_count} devices`;
  }
  
  if (highTxFailCount) {
    highTxFailCount.textContent = `${data.transmission.high_tx_fail_count} devices`;
  }
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

let anomalyChartInstance = null;
let modelChartInstance = null;
let firmwareChartInstance = null;

function updateAnomalyChart(data) {
  const canvas = document.getElementById('anomalyChart');
  const badge = document.getElementById('anomalyChartBadge');
  
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Update badge
  if (badge) {
    const anomalyPct = ((data.overview.anomaly_count / data.overview.total_devices) * 100).toFixed(1);
    badge.textContent = `${anomalyPct}% Anomalies`;
  }
  
  // Destroy existing chart if it exists
  if (anomalyChartInstance) {
    anomalyChartInstance.destroy();
  }
  
  // Create new donut chart
  anomalyChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Normal', 'Anomaly'],
      datasets: [{
        data: [data.overview.normal_count, data.overview.anomaly_count],
        backgroundColor: [
          '#10b981',  // Green for normal
          '#ef4444'   // Red for anomaly
        ],
        borderColor: [
          '#0d9668',
          '#dc2626'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#c9d1d9',
            font: {
              size: 14,
              family: 'Segoe UI'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#161b22',
          titleColor: '#c9d1d9',
          bodyColor: '#c9d1d9',
          borderColor: '#30363d',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} devices (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%',
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
}

function updateAnomalyByModelChart(data) {
  const canvas = document.getElementById('anomalyByModelChart');
  const badge = document.getElementById('modelChartBadge');
  
  if (!canvas || !data.anomalies_by_model) return;
  
  const ctx = canvas.getContext('2d');
  
  // Prepare data
  const models = Object.keys(data.anomalies_by_model);
  const percentages = models.map(model => data.anomalies_by_model[model].percentage);
  const anomalyCounts = models.map(model => data.anomalies_by_model[model].anomalies);
  const normalCounts = models.map(model => data.anomalies_by_model[model].total - data.anomalies_by_model[model].anomalies);
  const totalCounts = models.map(model => data.anomalies_by_model[model].total);
  
  // Update badge
  if (badge) {
    const totalDevices = totalCounts.reduce((a, b) => a + b, 0);
    const totalAnomalies = anomalyCounts.reduce((a, b) => a + b, 0);
    badge.textContent = `${totalAnomalies} / ${totalDevices} Anomalies`;
  }
  
  // Destroy existing chart if it exists
  if (modelChartInstance) {
    modelChartInstance.destroy();
  }
  
  // Create stacked horizontal bar chart
  modelChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: models,
      datasets: [
        {
          label: 'Normal',
          data: normalCounts,
          backgroundColor: '#10b981',
          borderColor: '#0d9668',
          borderWidth: 1
        },
        {
          label: 'Anomaly',
          data: anomalyCounts,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#c9d1d9',
            font: {
              size: 12,
              family: 'Segoe UI'
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'rect'
          }
        },
        tooltip: {
          backgroundColor: '#161b22',
          titleColor: '#c9d1d9',
          bodyColor: '#c9d1d9',
          borderColor: '#30363d',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.x || 0;
              const index = context.dataIndex;
              const total = totalCounts[index];
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} devices (${percentage}%)`;
            },
            afterBody: function(context) {
              if (context.length > 0) {
                const index = context[0].dataIndex;
                return `Total: ${totalCounts[index]} devices`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            color: '#8b949e',
            callback: function(value) {
              return value;
            }
          },
          grid: {
            color: '#21262d'
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: '#c9d1d9',
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function updateAnomalyByFirmwareChart(data) {
  const canvas = document.getElementById('anomalyByFirmwareChart');
  const badge = document.getElementById('firmwareChartBadge');
  
  if (!canvas || !data.anomalies_by_firmware) return;
  
  const ctx = canvas.getContext('2d');
  
  // Prepare data - sort by total count descending
  const firmwares = Object.keys(data.anomalies_by_firmware);
  const firmwareData = firmwares.map(fw => ({
    firmware: fw,
    percentage: data.anomalies_by_firmware[fw].percentage,
    anomalies: data.anomalies_by_firmware[fw].anomalies,
    normal: data.anomalies_by_firmware[fw].total - data.anomalies_by_firmware[fw].anomalies,
    total: data.anomalies_by_firmware[fw].total
  })).sort((a, b) => b.total - a.total);
  
  // Take top 15 firmware versions for readability
  const topFirmware = firmwareData.slice(0, 15);
  const labels = topFirmware.map(f => f.firmware);
  const percentages = topFirmware.map(f => f.percentage);
  const anomalyCounts = topFirmware.map(f => f.anomalies);
  const normalCounts = topFirmware.map(f => f.normal);
  const totalCounts = topFirmware.map(f => f.total);
  
  // Update badge
  if (badge) {
    const totalDevices = totalCounts.reduce((a, b) => a + b, 0);
    const totalAnomalies = anomalyCounts.reduce((a, b) => a + b, 0);
    badge.textContent = `${totalAnomalies} / ${totalDevices} Anomalies`;
  }
  
  // Destroy existing chart if it exists
  if (firmwareChartInstance) {
    firmwareChartInstance.destroy();
  }
  
  // Create stacked horizontal bar chart
  firmwareChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Normal',
          data: normalCounts,
          backgroundColor: '#10b981',
          borderColor: '#0d9668',
          borderWidth: 1
        },
        {
          label: 'Anomaly',
          data: anomalyCounts,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#c9d1d9',
            font: {
              size: 12,
              family: 'Segoe UI'
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'rect'
          }
        },
        tooltip: {
          backgroundColor: '#161b22',
          titleColor: '#c9d1d9',
          bodyColor: '#c9d1d9',
          borderColor: '#30363d',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.x || 0;
              const index = context.dataIndex;
              const total = totalCounts[index];
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} devices (${percentage}%)`;
            },
            afterBody: function(context) {
              if (context.length > 0) {
                const index = context[0].dataIndex;
                return `Total: ${totalCounts[index]} devices`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            color: '#8b949e',
            callback: function(value) {
              return value;
            }
          },
          grid: {
            color: '#21262d'
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: '#c9d1d9',
            font: {
              size: 10
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
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

// Modal Functions
let currentAnomalyData = null;

function showAnomalyModal(anomaly, timeAgo) {
  currentAnomalyData = anomaly;
  const modal = document.getElementById('anomalyModal');
  
  // Populate modal with anomaly data
  document.getElementById('modalAnomalyType').textContent = anomaly.reason;
  document.getElementById('modalTimestamp').textContent = timeAgo + ' (' + new Date(anomaly.timestamp).toLocaleString() + ')';
  document.getElementById('modalMacAddress').textContent = anomaly.device;
  document.getElementById('modalModel').textContent = anomaly.model || 'Unknown';
  document.getElementById('modalFirmware').textContent = anomaly.firmware || 'Unknown';
  
  // Format RSSI with quality indicator
  const rssi = anomaly.rssi;
  let rssiQuality = '';
  if (rssi > -50) rssiQuality = '(Excellent)';
  else if (rssi > -60) rssiQuality = '(Good)';
  else if (rssi > -70) rssiQuality = '(Fair)';
  else rssiQuality = '(Poor)';
  document.getElementById('modalRssi').textContent = `${rssi} dBm ${rssiQuality}`;
  
  // Format frequency
  const freq = anomaly.frequency;
  const freqText = freq === 2 ? '2.4 GHz' : freq === 5 ? '5 GHz' : `${freq} GHz`;
  document.getElementById('modalFrequency').textContent = freqText;
  
  // Generate recommendations based on anomaly type and metrics
  const recommendations = generateRecommendations(anomaly);
  const recList = document.getElementById('modalRecommendations');
  recList.innerHTML = '';
  recommendations.forEach(rec => {
    const li = document.createElement('li');
    li.textContent = rec;
    recList.appendChild(li);
  });
  
  // Show modal
  modal.style.display = 'block';
}

function closeAnomalyModal() {
  const modal = document.getElementById('anomalyModal');
  modal.style.display = 'none';
  currentAnomalyData = null;
}

function generateRecommendations(anomaly) {
  const recommendations = [];
  const reason = anomaly.reason.toLowerCase();
  const rssi = anomaly.rssi;
  
  // RSSI-based recommendations
  if (rssi < -70) {
    recommendations.push('Consider moving the device closer to the router or access point');
    recommendations.push('Check for physical obstructions or interference sources');
  }
  
  // Anomaly type specific recommendations
  if (reason.includes('signal') || reason.includes('rssi')) {
    recommendations.push('Verify router antenna positioning and orientation');
    recommendations.push('Consider adding a WiFi extender or mesh node');
  }
  
  if (reason.includes('retransmit') || reason.includes('fail') || reason.includes('drop')) {
    recommendations.push('Check for channel congestion and consider changing WiFi channel');
    recommendations.push('Update device firmware to the latest version');
    recommendations.push('Reduce number of devices on the same frequency band');
  }
  
  if (reason.includes('latency') || reason.includes('ping')) {
    recommendations.push('Run speed test to verify internet connection');
    recommendations.push('Check for background applications consuming bandwidth');
  }
  
  if (reason.includes('connection') || reason.includes('disconnect')) {
    recommendations.push('Verify device WiFi drivers are up to date');
    recommendations.push('Check router logs for disconnection events');
    recommendations.push('Consider disabling power saving mode on the device');
  }
  
  // Frequency-specific recommendations
  if (anomaly.frequency === 2) {
    recommendations.push('2.4 GHz band is more prone to interference - consider switching to 5 GHz if supported');
  }
  
  // Generic recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push('Monitor device performance over the next few hours');
    recommendations.push('Check router dashboard for additional diagnostic information');
    recommendations.push('Contact support if issue persists');
  }
  
  return recommendations;
}

function createTicketFromAnomaly() {
  if (!currentAnomalyData) return;
  
  // This would integrate with your ticketing system
  showNotification('Ticket creation feature coming soon!', 'info');
  console.log('Creating ticket for anomaly:', currentAnomalyData);
  
  // Close modal after ticket creation
  // closeAnomalyModal();
}

// Close modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById('anomalyModal');
  if (event.target === modal) {
    closeAnomalyModal();
  }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeAnomalyModal();
  }
});

// Setup modal close button after DOM loads
function setupModalHandlers() {
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAnomalyModal);
  }
}

// Call setup after dashboard is initialized
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupModalHandlers);
} else {
  setupModalHandlers();
}
