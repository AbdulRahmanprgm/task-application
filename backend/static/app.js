// DevOps AI Platform Interactive Script
document.addEventListener('DOMContentLoaded', () => {
  initHealthCheck();
  initTabs();
  initVisionPipeline();
  initAuthHandler();
  initNLP();
});

// --- API HOST BASE ---
const API_BASE = window.location.origin;

// Token storage
let jwtToken = localStorage.getItem('devops_jwt_token') || 'mock-jwt-token-777';
updateTokenDisplay();

// --- 1. HEALTH CHECK MONITOR ---
async function initHealthCheck() {
  const badge = document.getElementById('healthBadge');
  const text = document.getElementById('healthText');
  const latencyText = document.getElementById('healthLatency');

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/health`);
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        text.innerText = 'Service Healthy';
        latencyText.innerText = `${latency}ms`;
        badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      } else {
        text.innerText = 'Degraded';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      }
    } catch (err) {
      text.innerText = 'Offline';
      latencyText.innerText = '--ms';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.6)';
    }
  };

  checkHealth();
  setInterval(checkHealth, 15000);
}

// --- 2. TAB NAVIGATION ---
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });
}

// --- 3. ASYNC VISION PIPELINE ---
let activePollingInterval = null;

function setPresetImage(type) {
  const imgInput = document.getElementById('imageUrl');
  if (type === 'street') {
    imgInput.value = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop';
  } else if (type === 'office') {
    imgInput.value = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop';
  }
}

function initVisionPipeline() {
  const startBtn = document.getElementById('startVisionBtn');
  startBtn.addEventListener('click', async () => {
    const modelType = document.getElementById('modelType').value;
    const imageUrl = document.getElementById('imageUrl').value;

    if (!imageUrl) {
      alert('Please provide a valid image URL');
      return;
    }

    // Prepare UI state
    document.getElementById('jobIdleMessage').style.display = 'none';
    document.getElementById('jobActiveBox').style.display = 'block';
    document.getElementById('visionVisualizer').style.display = 'none';
    
    const progressBar = document.getElementById('jobProgressBar');
    const percentText = document.getElementById('jobPercentText');
    const statusBadge = document.getElementById('jobStatusBadge');
    const progressText = document.getElementById('jobProgressText');
    const jobIdTag = document.getElementById('currentJobId');

    progressBar.style.width = '5%';
    percentText.innerText = '5%';
    statusBadge.className = 'badge badge-processing';
    statusBadge.innerText = 'Processing';
    progressText.innerText = 'Submitting async job...';

    if (activePollingInterval) clearInterval(activePollingInterval);

    try {
      const startRes = await fetch(`${API_BASE}/api/vision/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, model_type: modelType })
      });

      const startData = await startRes.json();
      const jobId = startData.job_id;
      jobIdTag.innerText = jobId.substring(0, 18) + '...';

      // Start Polling loop
      activePollingInterval = setInterval(async () => {
        const statusRes = await fetch(`${API_BASE}/api/vision/status/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'processing') {
          const pct = statusData.progress_percent || 30;
          progressBar.style.width = `${pct}%`;
          percentText.innerText = `${pct}%`;
          progressText.innerText = `Job processing on worker node... (${pct}%)`;
        } else if (statusData.status === 'completed') {
          clearInterval(activePollingInterval);
          progressBar.style.width = '100%';
          percentText.innerText = '100%';
          statusBadge.className = 'badge badge-completed';
          statusBadge.innerText = 'Completed';
          progressText.innerText = 'Job execution finished! Fetching results...';

          // Fetch final result payload
          fetchVisionResult(jobId);
        }
      }, 1000);

    } catch (err) {
      alert('Failed to dispatch job: ' + err.message);
    }
  });
}

async function fetchVisionResult(jobId) {
  try {
    const res = await fetch(`${API_BASE}/api/vision/result/${jobId}`);
    const data = await res.json();

    document.getElementById('visionVisualizer').style.display = 'block';
    const imgEl = document.getElementById('analyzedImage');
    imgEl.src = data.image_url;

    imgEl.onload = () => {
      drawDetections(data.detections);
    };
  } catch (err) {
    console.error('Failed to get result:', err);
  }
}

function drawDetections(detections) {
  const canvas = document.getElementById('detectionCanvas');
  const img = document.getElementById('analyzedImage');
  const ctx = canvas.getContext('2d');

  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const colors = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b'];

  detections.forEach((det, idx) => {
    const color = colors[idx % colors.length];
    const [x, y, w, h] = det.box;

    // Scale factors relative to canvas display size
    const scaleX = canvas.width / 500;
    const scaleY = canvas.height / 350;

    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = w * scaleX;
    const sh = h * scaleY;

    // Bounding Box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, sw, sh);

    // Label Background
    ctx.fillStyle = color;
    const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = 'bold 12px Inter, sans-serif';
    const textWidth = ctx.measureText(labelText).width;
    ctx.fillRect(sx, sy > 20 ? sy - 20 : sy, textWidth + 10, 20);

    // Label Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, sx + 5, sy > 20 ? sy - 5 : sy + 15);
  });
}

// --- 4. AUTH HANDLER ---
function switchAuthTab(type) {
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');
  const subBtns = document.querySelectorAll('.sub-tab-btn');

  if (type === 'login') {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    subBtns[0].classList.add('active');
    subBtns[1].classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    subBtns[0].classList.remove('active');
    subBtns[1].classList.add('active');
  }
}

function initAuthHandler() {
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        jwtToken = data.access_token;
        localStorage.setItem('devops_jwt_token', jwtToken);
        updateTokenDisplay();
        alert('Authenticated successfully!');
      } else {
        alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
      }
    } catch (err) {
      alert('Login error: ' + err.message);
    }
  });

  document.getElementById('registerBtn').addEventListener('click', async () => {
    const email = document.getElementById('regEmail').value;
    const username = document.getElementById('regUser').value;
    const password = document.getElementById('regPass').value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      const data = await res.json();
      alert(`Registration result: ${JSON.stringify(data)}`);
    } catch (err) {
      alert('Registration error: ' + err.message);
    }
  });

  document.getElementById('getProfileBtn').addEventListener('click', async () => {
    const outPre = document.getElementById('profileResponseJson');
    outPre.innerText = 'Sending GET /api/auth/me...';

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      outPre.innerText = JSON.stringify({ status: res.status, data }, null, 2);
    } catch (err) {
      outPre.innerText = 'Error: ' + err.message;
    }
  });
}

function updateTokenDisplay() {
  const el = document.getElementById('currentTokenCode');
  if (el) {
    el.innerText = jwtToken ? `Bearer ${jwtToken}` : 'No token stored';
  }
}

function clearToken() {
  jwtToken = '';
  localStorage.removeItem('devops_jwt_token');
  updateTokenDisplay();
}

// --- 5. NLP TEXT ANALYZER ---
function initNLP() {
  document.getElementById('analyzeTextBtn').addEventListener('click', async () => {
    const text = document.getElementById('nlpInputText').value;
    const outPre = document.getElementById('nlpResponseJson');

    outPre.innerText = 'Analyzing...';
    try {
      const res = await fetch(`${API_BASE}/api/vision/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      outPre.innerText = JSON.stringify(data, null, 2);
    } catch (err) {
      outPre.innerText = 'Error: ' + err.message;
    }
  });
}

// --- 6. DEVOPS API BENCHMARK INSPECTOR ---
async function testEndpoint(type) {
  const consoleOut = document.getElementById('apiConsoleOutput');
  const latencyBadge = document.getElementById('apiLatencyBadge');

  let url = `${API_BASE}/health`;
  let method = 'GET';
  let body = null;
  let headers = {};

  if (type === 'health') {
    url = `${API_BASE}/health`;
  } else if (type === 'register') {
    url = `${API_BASE}/api/auth/register`;
    method = 'POST';
    body = { email: 'benchmark@test.com', username: 'bench', password: '123' };
    headers['Content-Type'] = 'application/json';
  } else if (type === 'login') {
    url = `${API_BASE}/api/auth/login`;
    method = 'POST';
    body = { username: 'admin', password: 'admin123' };
    headers['Content-Type'] = 'application/json';
  } else if (type === 'me') {
    url = `${API_BASE}/api/auth/me`;
    headers['Authorization'] = `Bearer ${jwtToken}`;
  } else if (type === 'analyzeImage') {
    url = `${API_BASE}/api/vision/analyze-image`;
    method = 'POST';
    body = { image_url: 'https://example.com/test.jpg', model_type: 'object_detection' };
    headers['Content-Type'] = 'application/json';
  } else if (type === 'analyzeText') {
    url = `${API_BASE}/api/vision/analyze-text`;
    method = 'POST';
    body = { text: 'Testing DevOps API performance' };
    headers['Content-Type'] = 'application/json';
  }

  consoleOut.innerText = `Sending ${method} ${url}...`;
  const start = performance.now();

  try {
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const latency = Math.round(performance.now() - start);
    const json = await res.json();

    latencyBadge.innerText = `${latency} ms`;
    consoleOut.innerText = `HTTP/1.1 ${res.status} ${res.statusText}\nLatency: ${latency}ms\n\nHeaders:\n${JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2)}\n\nPayload:\n${JSON.stringify(json, null, 2)}`;
  } catch (err) {
    consoleOut.innerText = `Request Failed: ${err.message}`;
  }
}
