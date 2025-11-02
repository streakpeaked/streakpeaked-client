import React from 'react';
import './ModeSelectModal.css';
import MatchMaker from '../MatchMaking/MatchMaker';   // ✅ folder name should match exactly
import Players from '../MatchMaking/Players';           // ✅ file is Player.js, not Players.js

const ModeSelectModal = ({ user, onClose, onSelectMode, onMatchFound }) => {
  const handleSelectMode = async (mode, timeLimit) => {
    if (mode === 'compete') {
      // Wrap Firebase user into Player object
      const player = new Players(user.uid, user.displayName, user.photoURL);

      // Try to join matchmaking queue
      const matchId = await MatchMaker.joinQueue(player, timeLimit);

      if (matchId) {
        // Opponent found immediately
        onMatchFound(matchId, mode, timeLimit);
      } else {
        // Still waiting for opponent
        console.log('Waiting for opponent...');
      }
    } else {
      // Streak mode or other modes
      onSelectMode(mode, timeLimit);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Select Mode</h2>
        <button onClick={() => handleSelectMode('streak', null)}>Play Streak Mode</button>
        <h3>Compete Online</h3>
        <button onClick={() => handleSelectMode('compete', 60)}>1 Minute Match</button>
        <button onClick={() => handleSelectMode('compete', 120)}>2 Minute Match</button>
        <button className="close-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ModeSelectModal;
