export const countBy = (str: string, target: string) => {
    let count = 0;
    for (const char of str) if (char === target) count++;
    return count;
};
