'use client';

import Link from 'next/link';
import React from 'react';
import { getSettingsUrl, UserRole } from '@/app/lib/utils/roleRoutes';

interface EditProfileLinkProps {
  role?: UserRole | string | null;
  className?: string;
}

/**
 * Client-side Edit Profile link component
 * Uses simple Link component for navigation
 * Shows loading state when role is not yet determined
 */
export default function EditProfileLink({
  role,
  className = '',
}: EditProfileLinkProps) {
  // Show loading state if role is not yet determined
  if (!role) {
    return (
      <button
        className={`rbt-btn btn-sm btn-gradient opacity-50 cursor-not-allowed ${className}`}
        disabled
        aria-disabled="true"
      >
        <span className="icon-reverse-wrapper">
          <span className="btn-text">Loading...</span>
          <span className="btn-icon">
            <i className="feather-loader"></i>
          </span>
        </span>
      </button>
    );
  }

  // Generate the appropriate settings URL based on role
  const href = getSettingsUrl(role as UserRole);

  return (
    <Link
      href={href}
      className={`rbt-btn btn-sm btn-gradient hover-icon-reverse ${className}`}
    >
      <span className="icon-reverse-wrapper">
        <span className="btn-text">Edit Profile</span>
        <span className="btn-icon">
          <i className="feather-edit"></i>
        </span>
        <span className="btn-icon">
          <i className="feather-edit"></i>
        </span>
      </span>
    </Link>
  );
}
