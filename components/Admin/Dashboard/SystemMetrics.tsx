'use client';

import React, { useState, useEffect } from 'react';

interface SystemMetric {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: string;
}

const SystemMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching system metrics
    const fetchMetrics = () => {
      const mockMetrics: SystemMetric[] = [
        {
          label: 'Server CPU',
          value: Math.floor(Math.random() * 30 + 20),
          unit: '%',
          status: 'good',
          icon: 'feather-cpu',
        },
        {
          label: 'Memory Usage',
          value: Math.floor(Math.random() * 20 + 60),
          unit: '%',
          status: Math.random() > 0.7 ? 'warning' : 'good',
          icon: 'feather-hard-drive',
        },
        {
          label: 'Database Connections',
          value: Math.floor(Math.random() * 50 + 100),
          unit: '',
          status: 'good',
          icon: 'feather-database',
        },
        {
          label: 'API Response Time',
          value: Math.floor(Math.random() * 100 + 50),
          unit: 'ms',
          status: Math.random() > 0.8 ? 'warning' : 'good',
          icon: 'feather-zap',
        },
        {
          label: 'Storage Used',
          value: Math.floor(Math.random() * 20 + 40),
          unit: 'GB',
          status: 'good',
          icon: 'feather-server',
        },
        {
          label: 'Active Sessions',
          value: Math.floor(Math.random() * 500 + 200),
          unit: '',
          status: 'good',
          icon: 'feather-users',
        },
      ];

      // Update status based on values
      mockMetrics.forEach((metric) => {
        if (metric.label === 'Server CPU' || metric.label === 'Memory Usage') {
          if (metric.value > 80) metric.status = 'critical';
          else if (metric.value > 60) metric.status = 'warning';
        }
        if (metric.label === 'API Response Time') {
          if (metric.value > 200) metric.status = 'critical';
          else if (metric.value > 150) metric.status = 'warning';
        }
      });

      setMetrics(mockMetrics);
      setLoading(false);
    };

    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemMetric['status']) => {
    const colors = {
      good: 'text-success',
      warning: 'text-warning',
      critical: 'text-danger',
    };
    return colors[status];
  };

  const getStatusBg = (status: SystemMetric['status']) => {
    const backgrounds = {
      good: 'bg-success-opacity',
      warning: 'bg-warning-opacity',
      critical: 'bg-danger-opacity',
    };
    return backgrounds[status];
  };

  const getProgressBarClass = (status: SystemMetric['status']) => {
    const classes = {
      good: 'bg-success',
      warning: 'bg-warning',
      critical: 'bg-danger',
    };
    return classes[status];
  };

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title mb--30">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="rbt-title-style-3">System Metrics</h4>
              <p className="b3 text-muted">Real-time platform performance</p>
            </div>
            <small className="text-muted">
              <i className="feather-refresh-cw me-1"></i>
              Auto-refresh: 30s
            </small>
          </div>
        </div>

        <div className="row g-4">
          {metrics.map((metric, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div className={`p-4 rounded-3 ${getStatusBg(metric.status)}`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <i
                      className={`${metric.icon} ${getStatusColor(metric.status)} me-2`}
                    ></i>
                    <span className="fw-bold">{metric.label}</span>
                  </div>
                  <span className={`fw-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                    {metric.unit}
                  </span>
                </div>

                {metric.unit === '%' && (
                  <div className="progress" style={{ height: '4px' }}>
                    <div
                      className={`progress-bar ${getProgressBarClass(metric.status)}`}
                      role="progressbar"
                      style={{ width: `${metric.value}%` }}
                      aria-valuenow={metric.value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* System Health Summary */}
        <div className="mt-5 p-4 bg-light rounded-3">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="mb-2">
                <i className="feather-shield text-success me-2"></i>
                System Health Status
              </h5>
              <p className="mb-0 text-muted">
                All systems are operating within normal parameters. Last check:{' '}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button className="rbt-btn btn-sm btn-outline-primary">
                <i className="feather-download me-2"></i>
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
