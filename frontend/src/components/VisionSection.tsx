import React, { useState, useEffect } from 'react';
import { Camera, Play, CheckCircle2, Clock, Eye, AlertCircle, Layers } from 'lucide-react';
import { startImageAnalysis, checkJobStatus, getVisionResult } from '../services/api';
import type { VisionResultResponse } from '../types/api';

const PRESET_IMAGES = [
  { name: 'City Traffic', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Street Crowd', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' },
  { name: 'Modern Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' }
];

export const VisionSection: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [modelType, setModelType] = useState<string>('object_detection');
  
  // Job flow state
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [visionResult, setVisionResult] = useState<VisionResultResponse | null>(null);
  
  // UI indicators
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Poll job status every 1 second when active
  useEffect(() => {
    let interval: any = null;
    let timer: any = null;

    if (activeJobId && jobStatus === 'processing') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      interval = setInterval(async () => {
        try {
          const statusRes = await checkJobStatus(activeJobId);
          if (statusRes.progress_percent !== undefined) {
            setProgressPercent(statusRes.progress_percent);
          }
          if (statusRes.status === 'completed') {
            setJobStatus('completed');
            setProgressPercent(100);
            fetchResults(activeJobId);
          }
        } catch (err: any) {
          setError(err.message || 'Error polling job status');
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearInterval(timer);
    };
  }, [activeJobId, jobStatus]);

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setLoading(true);
    setError(null);
    setVisionResult(null);
    setElapsedSeconds(0);
    setProgressPercent(0);
    setJobStatus('processing');

    try {
      const res = await startImageAnalysis({ image_url: imageUrl, model_type: modelType });
      setActiveJobId(res.job_id);
    } catch (err: any) {
      setError(err.message || 'Failed to start image analysis job');
      setJobStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (jobId: string) => {
    try {
      const res = await getVisionResult(jobId);
      setVisionResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve vision result');
    }
  };

  return (
    <div className="grid-2">
      {/* Control & Input Card */}
      <div className="glass-card card-padding">
        <h2 className="section-title">
          <Camera size={20} className="text-cyan" /> Async Vision Analysis Setup
        </h2>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleStartAnalysis}>
          <div className="form-group">
            <label className="form-label">Image Source URL</label>
            <input
              type="url"
              className="input-field"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              required
            />
            <div className="preset-pills">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="pill"
                  onClick={() => setImageUrl(preset.url)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">AI Computer Vision Model</label>
            <select
              className="input-field"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="object_detection">Object Detection (bounding boxes)</option>
              <option value="face_recognition">Face Recognition & Landmark</option>
              <option value="segmentation">Instance Segmentation</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading || jobStatus === 'processing'}
          >
            <Play size={16} />
            {jobStatus === 'processing' ? 'Processing Job...' : 'Submit to AI Engine'}
          </button>
        </form>

        {/* Live Job Progress Poller Display */}
        {activeJobId && (
          <div className="job-status-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} className="text-cyan" />
                Job Monitor: <code style={{ color: 'var(--cyan)' }}>{activeJobId.slice(0, 8)}...</code>
              </div>

              <div className={`status-badge ${jobStatus === 'completed' ? 'online' : 'processing'}`} style={jobStatus === 'processing' ? { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.3)' } : {}}>
                {jobStatus === 'completed' ? (
                  <>
                    <CheckCircle2 size={14} /> Completed
                  </>
                ) : (
                  <>
                    <span className="pulse-dot"></span> Polling ({elapsedSeconds}s / ~5s)
                  </>
                )}
              </div>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent || Math.min((elapsedSeconds / 5) * 100, 100)}%` }}
              ></div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {jobStatus === 'processing'
                ? `Polling GET /api/vision/status/${activeJobId.slice(0, 8)}... (${progressPercent}%)`
                : 'Job finished! Visualizing output coordinates.'}
            </div>
          </div>
        )}
      </div>

      {/* Visual Canvas & Detection Output */}
      <div className="glass-card card-padding">
        <h2 className="section-title">
          <Eye size={20} style={{ color: 'var(--emerald)' }} /> Vision Canvas & Bounding Boxes
        </h2>

        {imageUrl ? (
          <div className="image-canvas-wrapper">
            <img src={imageUrl} alt="AI Input" onError={() => setError('Failed to load image from URL')} />

            {/* Render detected bounding boxes from FastAPI mock data when ready */}
            {jobStatus === 'completed' && visionResult?.detections && (
              <>
                {visionResult.detections.map((det, idx) => {
                  const [boxY, boxX, boxW, boxH] = det.box;
                  return (
                    <div
                      key={idx}
                      className="box-overlay"
                      style={{
                        top: `${(boxY / 500) * 100}%`,
                        left: `${(boxX / 600) * 100}%`,
                        width: `${(boxW / 600) * 100}%`,
                        height: `${(boxH / 500) * 100}%`,
                      }}
                    >
                      <div className="box-label">
                        {det.label} {Math.round(det.confidence * 100)}%
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          <div className="image-canvas-wrapper" style={{ color: 'var(--text-muted)' }}>
            No image selected
          </div>
        )}

        {/* Results JSON & Detections List */}
        <div style={{ marginTop: '1.25rem' }}>
          {visionResult ? (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {visionResult.detections.map((d, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--cyan)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {d.label}: {(d.confidence * 100).toFixed(0)}%
                  </span>
                ))}
              </div>

              <div className="code-block">
                {JSON.stringify(visionResult, null, 2)}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
              <Layers size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>Submit an analysis job to view bounding box outputs & JSON metadata.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
