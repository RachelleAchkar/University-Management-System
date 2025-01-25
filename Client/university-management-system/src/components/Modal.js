import React, { useEffect } from 'react';
import './Modal.css'; // Style for the modal

const Modal = ({ isOpen, onClose, instructorName, cvData, downloadLink }) => {
  useEffect(() => {
    // Disable background scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup on modal close
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{instructorName}'s CV</h2>
        <embed
          src={`data:application/pdf;base64,${cvData}`}
          width="100%"
          height="500px"
          type="application/pdf"
        />
        <div className="modal-actions">
          <a
            href={downloadLink}
            download={`${instructorName}_CV.pdf`}
            className="download-button"
          >
            Download CV
          </a>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
