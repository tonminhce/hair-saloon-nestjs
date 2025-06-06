import { Prisma } from '@prisma/client';
import { isArray } from 'class-validator';
import { TimeSlot, DayOfWeek } from '@prisma/client';
import { timezoneConfig } from '../config/timezone.config';
import { getTimezoneOffset } from 'date-fns-tz';

export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async trash<M, A>(
        this: M,
        where: Prisma.Args<M, 'delete'>['where'],
      ): Promise<Prisma.Result<M, A, 'update'>> {
        const context = Prisma.getExtensionContext(this);
        const date = new Date();
        return (context as any).update({
          where,
          data: {
            deleted_at: date,
          },
        });
      },
    },
  },
});

export const softDeleteMany = Prisma.defineExtension({
  name: 'softDeleteMany',
  model: {
    $allModels: {
      async trashMany<M, A>(
        this: M,
        where: Prisma.Args<M, 'deleteMany'>['where'],
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        const context = Prisma.getExtensionContext(this);
        const date = new Date();
        return (context as any).updateMany({
          where,
          data: {
            deleted_at: date,
          },
        });
      },
    },
  },
});

export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const operations = [
          'findUnique',
          'findFirst',
          'findMany',
          'update',
          'updateMany',
          'findUniqueOrThrow',
          'findFirstOrThrow',
        ] as const;

        if (operations.includes(operation as (typeof operations)[number])) {
          // @ts-expect-error type bound to specific operations, already checked
          args.where = { ...args.where, deleted_at: null };
          return query(args);
        }
        return query(args);
      },
    },
  },
});

export const restore = Prisma.defineExtension({
  name: 'restoreSoftDeleted',
  model: {
    $allModels: {
      async restore(id: number | number[]) {
        const context = Prisma.getExtensionContext(this);
        return (context as any).updateMany({
          where: {
            id: isArray(id) ? { in: id } : id,
          },
          data: {
            deleted_at: null,
          },
        });
      },
    },
  },
});

function getTimeSlot(date: Date): TimeSlot {
  const zonedDate = utcToGMT(date, timezoneConfig.time_zone);
  const hour = zonedDate.getUTCHours();
  return `a${hour}_${hour + 1}` as TimeSlot;
}

function getDayOfWeek(date: Date): DayOfWeek {
  const zonedDate = utcToGMT(date, timezoneConfig.time_zone);
  const days: DayOfWeek[] = [
    DayOfWeek.SUN,
    DayOfWeek.MON,
    DayOfWeek.TUE,
    DayOfWeek.WED,
    DayOfWeek.THU,
    DayOfWeek.FRI,
    DayOfWeek.SAT,
  ];
  return days[zonedDate.getDay()];
}

function getTimeZoneDate(date: Date): Date {
  return utcToGMT(date, timezoneConfig.time_zone);
}

function utcToGMT(date: Date, timezone: string): Date {
  return new Date(date.getTime() + getTimezoneOffset(timezone));
}

export const ticketTimeExtension = {
  name: 'ticketTime',
  query: {
    ticket: {
      async create({ args, query }) {
        const created_at = args.data.created_at || new Date();
        args.data.time_slot = getTimeSlot(created_at);
        args.data.day_of_week = getDayOfWeek(created_at);
        args.data.time_zone_date = getTimeZoneDate(created_at);
        return query(args);
      },
      async createMany({ args, query }) {
        if (args.data && Array.isArray(args.data)) {
          args.data = args.data.map((ticket) => {
            const created_at = ticket.created_at || new Date();
            return {
              ...ticket,
              time_slot: getTimeSlot(created_at),
              day_of_week: getDayOfWeek(created_at),
              time_zone_date: getTimeZoneDate(created_at),
            };
          });
        }
        return query(args);
      },
    },
  },
};

export const actionTimeExtension = {
  name: 'actionTime',
  query: {
    action: {
      async create({ args, query }) {
        const created_at = args.data.created_at || new Date();
        args.data.time_zone_date = getTimeZoneDate(created_at);
        return query(args);
      },
      async createMany({ args, query }) {
        if (args.data && Array.isArray(args.data)) {
          args.data = args.data.map((action) => {
            const created_at = action.created_at || new Date();
            return {
              ...action,
              time_zone_date: getTimeZoneDate(created_at),
            };
          });
        }
        return query(args);
      },
    },
  },
};
