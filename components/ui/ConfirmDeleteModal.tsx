'use client';

import React, { useEffect } from 'react';

interface ConfirmDeleteModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  show,
  onHide,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) => {
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content bg-color-white">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="rbt-round-btn"
                onClick={onHide}
                aria-label="Close"
              >
                <i className="feather-x"></i>
              </button>
            </div>
            <div className="modal-body pb--30">
              <p>{message}</p>
            </div>
            <div className="modal-footer pt--20 pb--20 border-top-light justify-content-end gap-2">
              <button
                type="button"
                className="rbt-btn bg-primary-opacity btn-md radius-round-10 hover-icon-reverse"
                onClick={onHide}
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">{cancelLabel}</span>
                  <span className="btn-icon">
                    <i className="feather-x"></i>
                  </span>
                  <span className="btn-icon">
                    <i className="feather-x"></i>
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="rbt-btn btn-gradient btn-md radius-round-10 hover-icon-reverse"
                onClick={onConfirm}
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">{confirmLabel}</span>
                  <span className="btn-icon">
                    <i className="feather-trash-2"></i>
                  </span>
                  <span className="btn-icon">
                    <i className="feather-trash-2"></i>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ConfirmDeleteModal;
