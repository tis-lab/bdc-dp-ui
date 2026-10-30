export const getEnv = (name: string): string | undefined =>
  import.meta.env[name];
