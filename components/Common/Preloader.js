'use client';

import React from 'react';
import { useAppContext } from '@/context/Context';

const Preloader = () => {
  const { isLightTheme } = useAppContext();

  // 테마에 따라 배경색 설정
  const bgColor = isLightTheme ? '#ffffff' : '#192335';

  return (
    <div
      className="preloader"
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <div className="loader-container">
        <svg className="spinner" viewBox="0 0 50 50">
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          ></circle>
        </svg>
      </div>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4361ee" />
            <stop offset="100%" stopColor="#7209b7" />
          </linearGradient>
        </defs>
      </svg>
      <style jsx>{`
        .loader-container {
          width: 40px;
          height: 40px;
          position: relative;
        }
        .spinner {
          animation: rotate 2s linear infinite;
          z-index: 2;
          width: 40px;
          height: 40px;
        }
        .path {
          stroke: url(#gradient);
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
