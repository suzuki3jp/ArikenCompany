/**
 * Convert a Object to a string of env variables
 * @param data
 * @returns
 */
export const toEnv = (data: Record<any, any>): string => {
    const env = Object.entries(data)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    return env;
};
