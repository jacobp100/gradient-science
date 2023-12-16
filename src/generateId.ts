let current = 0;

export const generateId = () => {
  const id = current.toString(36);
  current += 1;
  return id;
};
