// src/matchmaking/GameSession.js
class GameSession {
  constructor(matchId, players, mode, startTime, status = 'active') {
    this.matchId = matchId;
    this.players = players; // array of UIDs
    this.mode = mode;       // 'compete-60' or 'compete-120'
    this.startTime = startTime;
    this.status = status;
  }
}

export default GameSession;