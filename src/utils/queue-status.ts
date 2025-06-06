export enum Status {
  CALLING = 'calling',
  WAITING = 'waiting',
  STANDING = 'standing',
  EXPIRED = 'expired',
  SERVED = 'served',
}

export type QueueStatus = {
  [key in Status]: number[];
} & {
  waiting_details: {
    man: number;
    woman: number;
    boy: number;
    girl: number;
  };
};
