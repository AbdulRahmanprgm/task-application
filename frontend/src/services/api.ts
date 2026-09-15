import type {
  HealthResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  ImageAnalyzeRequest,
  ImageAnalyzeResponse,
  JobStatusResponse,
  VisionResultResponse,
  TextAnalyzeRequest,
  TextAnalyzeResponse,
} from '../types/api';

// Default to relative /api which Vite proxies to http://127.0.0.1:8000
let customBaseUrl = '';

export const setApiBaseUrl = (url: string) => {
  customBaseUrl = url.replace(/\/$/, '');
};

export const getApiBaseUrl = () => customBaseUrl || 'http://127.0.0.1:8000';

const getEndpointUrl = (path: string) => {
  if (customBaseUrl) {
    return `${customBaseUrl}${path}`;
  }
  return path;
};

// --- HEALTH SERVICE ---

export const fetchHealthCheck = async (): Promise<HealthResponse> => {
  const res = await fetch(getEndpointUrl('/health'));
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
};

export const pingBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(getEndpointUrl('/health'));
    return res.ok;
  } catch {
    // Fallback check on auth me endpoint
    try {
      const authRes = await fetch(getEndpointUrl('/api/auth/me'), {
        headers: { Authorization: 'Bearer ping' },
      });
      return authRes.status === 401 || authRes.ok;
    } catch {
      return false;
    }
  }
};

// --- AUTH SERVICES ---

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const res = await fetch(getEndpointUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Login failed with status ${res.status}`);
  }
  return res.json();
};

export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const res = await fetch(getEndpointUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Registration failed with status ${res.status}`);
  }
  return res.json();
};

export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const res = await fetch(getEndpointUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch profile (${res.status})`);
  }
  return res.json();
};

// --- AI / VISION SERVICES ---

export const startImageAnalysis = async (req: ImageAnalyzeRequest): Promise<ImageAnalyzeResponse> => {
  const res = await fetch(getEndpointUrl('/api/vision/analyze-image'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Image analysis request failed (${res.status})`);
  }
  return res.json();
};

export const checkJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const res = await fetch(getEndpointUrl(`/api/vision/status/${jobId}`));
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to check job status (${res.status})`);
  }
  return res.json();
};

export const getVisionResult = async (jobId: string): Promise<VisionResultResponse> => {
  const res = await fetch(getEndpointUrl(`/api/vision/result/${jobId}`));
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch vision results (${res.status})`);
  }
  return res.json();
};

export const analyzeText = async (req: TextAnalyzeRequest): Promise<TextAnalyzeResponse> => {
  const res = await fetch(getEndpointUrl('/api/vision/analyze-text'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Text analysis request failed (${res.status})`);
  }
  return res.json();
};
