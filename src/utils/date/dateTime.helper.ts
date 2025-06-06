import { Injectable } from '@nestjs/common';
import { Store } from '@prisma/client';
import { TIME_RANGE_REGEX } from '../validateConst';

@Injectable()
export class DateService {
  private todayStart: Date;
  private todayEnd: Date;
  private lastUpdate: Date;

  constructor() {
    this.updateDates();
  }

  private updateDates() {
    const now = new Date();
    this.todayStart = new Date(now.setHours(0, 0, 0, 0));
    this.todayEnd = new Date(now.setHours(23, 59, 59, 999));
    this.lastUpdate = now;
  }

  public getTodayRange() {
    const now = new Date();
    if (now.getDate() !== this.lastUpdate.getDate()) {
      this.updateDates();
    }
    return {
      gte: this.todayStart,
      lt: this.todayEnd,
    };
  }

  public getEventRange() {
    const now = new Date();

    const day_start = new Date(now);
    const day_end = new Date(now);
    // For the case the store operates overnight. We don't want the queue data, or the stylist activity data suddenly become empty at 00:00.
    // Pretends from 0:00 - 3:00 GMT7 of today belongs to yesterday => (start from 3:00 GMT7 yesterday)
    if (now.getUTCHours() >= 20) {
      // from 3AM today -> 3AM next day
      day_start.setUTCHours(20, 0, 0, 0);

      day_end.setUTCDate(day_start.getUTCDate() + 1);
      day_end.setUTCHours(19, 59, 59, 999);
    } else {
      day_start.setUTCDate(day_start.getUTCDate() - 1);
      day_start.setUTCHours(20, 0, 0, 0);

      day_end.setUTCHours(19, 59, 59, 999);
    }
    return {
      gte: day_start,
      lte: day_end,
    };
  }

  public parseClosingTime(
    store: Store,
    date: Date,
  ): {
    hours: number;
    minutes: number;
  } {
    const time_range_regex = TIME_RANGE_REGEX;

    const business_hours =
      date.getDay() >= 6
        ? store.businessHoursWeekends
        : store.businessHoursWeekdays;

    if (time_range_regex.test(business_hours)) {
      const match = business_hours.match(time_range_regex);
      const closingTime = `${match[4]}:${match[5]} ${match[6]}`;
      const parsedTime = this.convertTo24HourFormat(closingTime);

      return { hours: parsedTime.hours, minutes: parsedTime.minutes };
    }

    return { hours: 23, minutes: 59 };
  }

  private convertTo24HourFormat(time_string: string) {
    const [time, meridian] = time_string.split(/\s+/);

    // eslint-disable-next-line prefer-const
    let [hours, minutes] = time.split(':').map(Number);

    if (meridian.toUpperCase() === 'PM' && hours !== 12) hours += 12;

    return { hours, minutes };
  }
}
