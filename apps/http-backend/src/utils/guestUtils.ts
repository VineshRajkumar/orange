

export const generateRandomUsername = () => {
  return "guest_" + Math.random().toString(36).substring(2, 8);
};

export const isGuestUsername = (username: string): boolean => {
  return username.startsWith("guest_");
};