export const generateEventId = (eventName = "event") => {
  return `${eventName}_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;
};