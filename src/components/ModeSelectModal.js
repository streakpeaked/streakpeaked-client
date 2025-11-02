import React from 'react';
import './ModeSelectModal.css';
import MatchMaker from '../MatchMaking/MatchMaker';//matching
import Players from '../MatchMaking/Players';//matching
const user = new Players(user.uid, user.displayName, user.photoURL);//matching
const matchId = await MatchMaker.joinQueue(user, 60);//matching


const ModeSelectModal = ({ onClose, onSelectMode }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Select Mode</h2>
        <button onClick={() => onSelectMode('streak', null)}>Play Streak Mode</button>
        <h3>Compete Online</h3>
        <button onClick={() => onSelectMode('compete', 60)}>1 Minute Match</button>
        <button onClick={() => onSelectMode('compete', 120)}>2 Minute Match</button>
        <button className="close-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ModeSelectModal;
