/**
 * 日付をフォーマットする。
 * 月と日に関しては一文字の場合先頭に0をつける
 * @param year
 * @param month
 * @param day
 */
export const formatDate = (
    year: number | string,
    month: number | string,
    day: number | string
): {
    year: string;
    month: string;
    day: string;
    formatted: string;
} => {
    year = year.toString();
    month = month.toString();
    day = day.toString();

    month = month.length === 1 ? `0${month}` : month;
    day = day.length === 1 ? `0${day}` : day;

    return { year, month, day, formatted: `${year}/${month}/${day}` };
};
