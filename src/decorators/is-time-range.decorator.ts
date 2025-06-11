import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { TIME_RANGE_REGEX } from '../utils/validateConst';

export function IsTimeRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTimeRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | null | undefined) {
          if (!value) return true; 
          if (!TIME_RANGE_REGEX.test(value)) {
            return false;
          }

          if (!/\s-\s/.test(value)) {
            return false;
          }

          // Additional validation to ensure start time is before end time
          const [startStr, endStr] = value.split('-').map((t) => t.trim());
          const start = new Date(`2000/01/01 ${startStr}`);
          const end = new Date(`2000/01/01 ${endStr}`);

          return start < end;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be in format "HH:MM AM/PM - HH:MM AM/PM" and start time must be before end time`;
        },
      },
    });
  };
}
