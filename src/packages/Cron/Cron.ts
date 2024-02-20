import { scheduleJob } from 'node-schedule';

export class Cron {
    constructor() {}

    /**
     * 毎日実行するジョブを作成する
     * @param callback
     * @param hour 実行する時間。デフォルトでは朝５時
     * @returns
     */
    createDailyJob(callback: () => void, hour: number = 5) {
        return scheduleJob(`0 0 0 ${hour} * *`, callback);
    }

    /**
     * 毎週実行するジョブを作成する
     * @param callback
     * @param day 実行する曜日。デフォルトでは日曜日
     * @param hour 実行する時間。デフォルトでは朝５時
     * @returns
     */
    createWeeklyJob(callback: () => void, day: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 = 7, hour: number = 5) {
        return scheduleJob(`0 0 0 ${hour} * ${day}`, callback);
    }
}
