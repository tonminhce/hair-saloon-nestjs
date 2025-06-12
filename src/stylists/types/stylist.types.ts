import { StylistRealTimeStatus } from '@prisma/client';

export type StylistActivity = {
  id: number;
  name: string;
  status: StylistRealTimeStatus;
  manServed: number;
  womanServed: number;
  boysServed: number;
  girlsServed: number;
};

export type StylistsActivity = {
  [key: number]: StylistActivity;
};
