export const countBy = (str: string, target: string): number => {
    const regex = new RegExp(`\\${target}`, 'g');
    return (str.match(regex) || []).length;
};
