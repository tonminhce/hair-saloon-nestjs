import { fakerVI } from '@faker-js/faker';
import { StoresService } from '../src/stores/stores.service';
import { PrismaService } from './prisma.service';
import { StylistsService } from '../src/stylists/stylists.service';
import { Gender, StoreType, StylistStatus, WorkType } from '@prisma/client';
import { PHONE } from '../src/utils/validateConst';

const NUM_STORE = 10;
const NUM_STAFF = 35;
const prismaService = new PrismaService();
const main = async () => {
  /**
   * Store
   */
  const prismaStore = new StoresService(prismaService);
  for (let i = 0; i < NUM_STORE; i++) {
    await prismaStore.create({
      name: fakerVI.company.name(),
      address: fakerVI.location.city(),
      businessHoursWeekdays: '9:00 AM - 7:00 PM',
      businessHoursWeekends: '9:00 AM - 7:00 PM',
      man_price: 150000,
      woman_price: 200000,
      boy_price: 100000,
      girl_price: 120000,
      seat_count: fakerVI.number.int({ min: 2, max: 12 }),
      store_type: fakerVI.helpers.enumValue(StoreType),
      store_type_text: fakerVI.lorem.sentence(),
      area: fakerVI.number.float({ min: 20, max: 200, fractionDigits: 2 }),
      opened_date: fakerVI.date.recent(),
    });
  }

  /**
   * Stylist
   */
  const prismaStylist = new StylistsService(prismaService);
  for (let i = 0; i < NUM_STAFF; i++) {
    const randomizer = Math.random();
    let role: string;
    if (randomizer < 0.75) role = 'Stylist';
    else if (randomizer < 0.9) role = 'Leader';
    else role = 'Manager';

    await prismaStylist.create(
      {
        status:
          Math.random() <= 0.9 ? StylistStatus.Active : StylistStatus.Inactive,
        name: fakerVI.person.fullName(),
        gender: fakerVI.helpers.enumValue(Gender),
        phone_number: fakerVI.phone
          .number({ style: 'human' })
          .replaceAll('-', '')
          .replaceAll(' ', '')
          .substring(0, PHONE - 1),
        date_of_birth: fakerVI.date.birthdate(),
        email: fakerVI.internet.email(),
        date_hired: fakerVI.date.recent(),
        position: role,
        work_type: Math.random() <= 0.8 ? WorkType.FullTime : WorkType.PartTime,
        living_area: fakerVI.location.city(),
        registered_store_id: fakerVI.number.int({ min: 1, max: NUM_STORE }),
        notes: fakerVI.lorem.sentence(),
      },
      true,
    );
  }
};

main().catch((err) => {
  console.log(err);
});
