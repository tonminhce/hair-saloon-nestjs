export const scheduleConfig = {
  expiry_time: parseInt(process.env.TICKET_EXPIRY_TIME || '1800000'),
  prefix: process.env.TICKET_PREFIX || 'expire_',
};
