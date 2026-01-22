export const isMockMode = () => {
  return String(process.env.MOCK_MODE || '').toLowerCase() === 'true';
};

export const getEnv = (key: string) => process.env[key];

export const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};
