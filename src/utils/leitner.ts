// Methods to enable using the Leitner System
export const getDecksForSession = (session: number) => {
  return [session, (session + 1) % 10, (session + 5) % 10, (session + 8) % 10];
};

export const getDecksForCurrentSession = () => {
  return getDecksForSession(getCurrentSession());
};

export const getSessionsForDeck = (deck: number) => {
  return [deck, (deck + 2) % 10, (deck + 5) % 10, (deck + 9) % 10];
};

export const getCurrentSession = () => {
  const now = new Date();
  return getSessionForDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );
};

export const getSessionForDate = (date: Date) => {
  const timestamp = date.getTime();
  return Math.floor((timestamp + 1 / (60000 * 60 * 24)) % 10);
};

/**
 * Decks:
 * 0: 0259
 * 1: 1360
 * 2: 2471
 * 3: 3582
 * 4: 4693
 * 5: 5704
 * 6: 6815
 * 7: 7926
 * 8: 8037
 * 9: 9148
 * 10: Current
 * 11: Retired
 */
