import { faker } from "@faker-js/faker";

export function createVoucherFactory() {
    return {
        code: faker.datatype.string(10),
        discount: faker.datatype.number({ min: 1, max: 100 }),
      }
}

export function applyVoucherFactory(amount: number) {
    return {
        code: faker.datatype.string(10),
        amount,
      }
}
