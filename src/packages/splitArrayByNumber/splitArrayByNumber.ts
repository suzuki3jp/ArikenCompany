export const splitArrayByNumber = <T>(array: T[], number: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += number) {
        result.push(array.slice(i, i + number));
    }
    return result;
};
