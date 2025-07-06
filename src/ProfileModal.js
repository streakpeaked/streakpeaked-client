import React from 'react';

function ProfileModal({ user, onClose, onShowTracker }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, zIndex: 2000,
      width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '32px', minWidth: 350, boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: 0, marginBottom: 16 }}>My Profile</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: 16 }}>
          <img src={user.photoURL} alt="profile" style={{ width: 60, height: 60, borderRadius: '50%' }} />
          <div>
            <div><b>Name:</b> {user.displayName}</div>
            <div><b>Email:</b> {user.email}</div>
            {/* Optionally add phone number or contact if available */}
          </div>
        </div>
        <button 
          style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, marginBottom: 10 }}
          onClick={onShowTracker}
        >
          Performance Tracker
        </button>
        <button
          style={{ background: '#e0e7ef', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', marginLeft: 12 }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ProfileModal;