export interface HealthResponse {
  status: string;
  service: string;
  uptime_sec: number;
  environment: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface UserProfile {
  username: string;
  email: string;
  role: string;
}

export interface ImageAnalyzeRequest {
  image_url: string;
  model_type: string;
}

export interface ImageAnalyzeResponse {
  message: string;
  job_id: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'processing' | 'completed' | string;
  progress_percent?: number;
}

export interface DetectionBox {
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [top, left, width, height]
}

export interface VisionResultResponse {
  job_id: string;
  model_type?: string;
  image_url?: string;
  detections: DetectionBox[];
  resolution: string;
}

export interface TextAnalyzeRequest {
  text: string;
}

export interface TextAnalyzeResponse {
  original_text: string;
  sentiment: string;
  keywords: string[];
}
