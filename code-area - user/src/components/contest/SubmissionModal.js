import React from 'react';
import SubmissionStats from './SolveProblems/SubmissionStats';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: '100vw',
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflowY: 'auto',
};

const contentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  position: 'relative',
  width:'90vw',
  maxHeight: '90%',
  overflowY: 'auto'
};

const closeBtnStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  fontSize: '20px',
  cursor: 'pointer',
  fontWeight: 'bold',
  border: 'none',
  background: 'none'
};

const SubmissionModal = ({ submission, onClose }) => {
  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button onClick={onClose} style={closeBtnStyle}>×</button>
        <SubmissionStats submission={submission} />
      </div>
    </div>
  );
};

export default SubmissionModal;
