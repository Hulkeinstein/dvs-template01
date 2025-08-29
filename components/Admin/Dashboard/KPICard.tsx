'use client';

import React from 'react';
import CountUp from 'react-countup';
import { KPIData } from '@/types/dashboard';

interface Props {
  data: KPIData;
}

const KPICard: React.FC<Props> = ({ data }) => {
  const getTrendIcon = () => {
    switch (data.direction) {
      case 'up':
        return 'feather-trending-up';
      case 'down':
        return 'feather-trending-down';
      default:
        return 'feather-minus';
    }
  };

  const getTrendColor = () => {
    switch (data.direction) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-danger';
      default:
        return 'text-warning';
    }
  };

  const getBackgroundClass = () => {
    const colorMap: Record<string, string> = {
      primary: 'bg-primary-opacity',
      success: 'bg-success-opacity',
      violet: 'bg-violet-opacity',
      coral: 'bg-coral-opacity',
      warning: 'bg-warning-opacity',
      info: 'bg-info-opacity',
    };
    return colorMap[data.color || 'primary'] || 'bg-primary-opacity';
  };

  const getTextClass = () => {
    const colorMap: Record<string, string> = {
      primary: 'color-primary',
      success: 'color-success',
      violet: 'color-violet',
      coral: 'color-coral',
      warning: 'color-warning',
      info: 'color-info',
    };
    return colorMap[data.color || 'primary'] || 'color-primary';
  };

  // Mini sparkline component
  const Sparkline = () => {
    if (!data.sparkline || data.sparkline.length === 0) return null;

    const max = Math.max(...data.sparkline);
    const min = Math.min(...data.sparkline);
    const range = max - min || 1;
    const width = 80;
    const height = 30;

    const points = data.sparkline
      .map((value, index) => {
        const x = (index / (data.sparkline!.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="mt-2">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          className={getTextClass()}
          opacity="0.5"
        />
      </svg>
    );
  };

  return (
    <div className={`rbt-counterup variation-02 ${getBackgroundClass()}`}>
      <div className="inner">
        <div className="rbt-round-icon">
          <i className={data.icon || 'feather-activity'}></i>
        </div>
        <div className="content">
          <h3 className={`counter ${getTextClass()}`}>
            <span className="odometer">
              {data.label === 'Monthly Revenue' ? '$' : ''}
              <CountUp
                end={data.value}
                duration={2}
                separator=","
                decimals={data.label === 'Monthly Revenue' ? 0 : 0}
              />
            </span>
          </h3>
          <span className="subtitle">{data.label}</span>

          {/* Trend indicator */}
          <div className="d-flex align-items-center mt-2">
            <span className={`${getTrendColor()} d-flex align-items-center`}>
              <i className={`${getTrendIcon()} me-1`}></i>
              <small className="fw-bold">{Math.abs(data.deltaPct)}%</small>
            </span>
            <small className="text-muted ms-2">vs last month</small>
          </div>

          {/* Sparkline */}
          {data.sparkline && <Sparkline />}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
