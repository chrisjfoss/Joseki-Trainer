// Methods to enable using the Leitner System
export const getDecksForSession = (session: number) => {
  return [
    session,
    (session + 1) % 10,
    (session + 5) % 10,
    (session + 8) % 10,
    (session + 9) % 10
  ];
};

export const getDecksForCurrentSession = () => {
  return getDecksForSession(getCurrentSession());
};

export const getSessionsForDeck = (deck: number) => {
  return [deck, deck + 1, (deck + 2) % 10, (deck + 5) % 10, (deck + 9) % 10];
};

export const getDeckWithSessionAtIndex = (session: number, index: number) => {
  const modifier = [0, 1, 2, 5, 9];
  return (session - modifier[index]) % 10;
};

export const getCurrentSession = () => {
  return getSessionForDate(new Date());
};

export const getSessionForDate = (date: Date) => {
  const sessionDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const timestamp = sessionDate.getTime();
  return Math.floor((timestamp + 1) / (60000 * 60 * 24)) % 10;
};

export const getNextDateForDeck = (deck: number) => {
  const sessions = getSessionsForDeck(deck);

  const proposedDate = new Date();
  if (deck === 10) {
    return proposedDate;
  } else if (deck === 11) {
    proposedDate.setFullYear(proposedDate.getFullYear() + 1);
    return proposedDate;
  }

  proposedDate.setDate(proposedDate.getDate() + 1);
  let i = 0;
  while (!sessions.includes(getSessionForDate(proposedDate)) && i <= 10) {
    proposedDate.setDate(proposedDate.getDate() + 1);
    ++i;
  }
  return proposedDate;
};

export const isFinalSession = (deck: number) => {
  const sessions = getSessionsForDeck(deck);
  return sessions[sessions.length - 1] === getCurrentSession();
};

export const switchToEquivalentDeck = (deck: number, timestamp: number) => {
  if (deck === 10 || deck === 11) {
    return deck;
  }
  const session = getSessionForDate(new Date(timestamp));
  const targetSessions = getSessionsForDeck(deck);
  if (targetSessions.includes(session)) {
    const index = targetSessions.indexOf(session);
    return getDeckWithSessionAtIndex(getCurrentSession(), index);
  } else {
    return 10;
  }
};

export const getNewDeck = (
  success: boolean,
  prevDeck: number,
  prevSessionTimestamp: number
) => {
  if (!success) {
    return 10;
  }
  const session = getCurrentSession();
  const transformedPrevDeck = switchToEquivalentDeck(
    prevDeck,
    prevSessionTimestamp
  );
  if (isFinalSession(transformedPrevDeck)) {
    return 11;
  }
  return transformedPrevDeck === 10 ? session : transformedPrevDeck;
};
