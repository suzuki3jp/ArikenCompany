/**
 * Convert a Object to a string of env variables
 * @param data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toEnv = (data: Record<any, any>): string => {
    const env = Object.entries(data)
        .map(([key, value]) => `${key} = "${value}"`)
        .join('\n');
    return env;
};
