import React, { useState, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = ({ user, onBackHome, onViewPerformance }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    totalAttempts: 0,
    bestScore: 0,
    averageScore: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = () => {
    try {
      const savedProfile = localStorage.getItem(`profile_${user.uid}`);
      const userScores = JSON.parse(localStorage.getItem(`scores_${user.uid}`) || '[]');
      
      const baseProfile = {
        name: user.displayName || '',
        email: user.email || '',
        phone: '',
        location: '',
        joinDate: user.metadata.creationTime || new Date().toISOString(),
        totalAttempts: userScores.length,
        bestScore: userScores.length > 0 ? Math.max(...userScores.map(s => s.streakScore || 0)) : 0,
        averageScore: userScores.length > 0 ? 
          Math.round(userScores.reduce((sum, s) => sum + (s.streakScore || 0), 0) / userScores.length) : 0
      };

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData({ ...baseProfile, ...parsedProfile });
      } else {
        setProfileData(baseProfile);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    try {
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(editData));
      setProfileData(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <button className="back-btn" onClick={onBackHome}>
          ← Back to Home
        </button>
        <h1>My Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="profile-avatar"
            />
            <div className="profile-basic-info">
              <h2>{profileData.name}</h2>
              <p className="member-since">
                Member since {formatDate(profileData.joinDate)}
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{profileData.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.bestScore}</div>
              <div className="stat-label">Best Streak</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{profileData.averageScore}</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div className="profile-details">
            <h3>Personal Information</h3>
            
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter your location"
                  />
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleSave}>Save Changes</button>
                  <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{profileData.name || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profileData.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{profileData.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Location:</label>
                  <span>{profileData.location || 'Not provided'}</span>
                </div>
                <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
              </div>
            )}
          </div>

          <div className="profile-actions">
            <button className="performance-btn" onClick={onViewPerformance}>
              📊 View Performance Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;