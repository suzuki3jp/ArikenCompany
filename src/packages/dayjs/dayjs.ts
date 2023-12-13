import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

// load dayjs plugins
dayjs.extend(utc);
dayjs.extend(tz);

export { dayjs };
