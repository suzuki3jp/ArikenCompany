export const secondsToHHMMSS = (second: number): { hours: string; minutes: string; seconds: string } => {
    const hours = Math.floor(second / 3600);
    const minutes = Math.floor((second - hours * 3600) / 60);
    const seconds = second - hours * 3600 - minutes * 60;
    return { hours: hours.toString(), minutes: minutes.toString(), seconds: seconds.toString() };
};
