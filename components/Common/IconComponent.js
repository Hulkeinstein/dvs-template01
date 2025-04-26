"use client";

/**
 * IconComponent - 모든 아이콘 사용을 위한 컴포넌트
 * 
 * @param {string} iconName - 아이콘 클래스 이름 (예: "feather-camera")
 * @param {string} className - 추가 CSS 클래스 (선택사항)
 * @returns {JSX.Element} 아이콘 요소
 */
export const IconComponent = ({ iconName, className = "" }) => {
  return <i className={`${iconName} ${className}`} />;
}; 