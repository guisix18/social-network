import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function run() {
  await prisma.user.deleteMany();

  const promises = [];

  for (let i = 0; i < 25; i++) {
    promises.push(
      prisma.user.create({
        data: {
          id: randomUUID(),
          name: faker.person.firstName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          createdAt: new Date(),
        },
      }),
    );
  }

  await Promise.all(promises);
}

run().then(async () => {
  await prisma.$disconnect();
});
