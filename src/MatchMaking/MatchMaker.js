// src/matchmaking/MatchMaker.js
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

class MatchMaker {
  /**
   * Join the matchmaking queue for a given mode (e.g. 60s or 120s compete).
   * If an opponent is found, create a match session and return matchId.
   * If not, add this player to the queue and return null.
   */
  static async joinQueue(player, mode) {
    const q = query(
      collection(db, 'matchmaking'),
      where('mode', '==', mode),
      where('status', '==', 'waiting'),
      orderBy('timestamp'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Found opponent
      const opponentDoc = snapshot.docs[0];
      const opponent = opponentDoc.data();
      const matchId = `${player.uid}_${opponent.uid}_${Date.now()}`;

      // Create match session
      await setDoc(doc(db, 'matches', matchId), {
        players: [player.uid, opponent.uid],
        mode,
        startTime: serverTimestamp(),
        status: 'active'
      });

      // Update opponent
      await updateDoc(opponentDoc.ref, { status: 'matched', matchId });

      // Add current player as matched
      await addDoc(collection(db, 'matchmaking'), {
        uid: player.uid,
        mode,
        status: 'matched',
        matchId,
        timestamp: serverTimestamp()
      });

      return matchId;
    } else {
      // No opponent yet, add self to queue
      await addDoc(collection(db, 'matchmaking'), {
        uid: player.uid,
        mode,
        status: 'waiting',
        timestamp: serverTimestamp()
      });
      return null;
    }
  }
}

export default MatchMaker;
