import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()
  ; (async () => {

    for (let i = 0; i < 50; i++) {
      await prisma.product.create({
        data: {
          stockAvailable: faker.number.int({ min: 2, max: 50 }),
          shopId: 'testtest',
          title: faker.commerce.productName(),
          images: { create: [{ fileName: 'test-image1.jpg', fileSize: 122000, fileType: 'image/jpg' }] },
          price: faker.number.int({ min: 200, max: 1000 }),
          isActive: true,
          description: faker.commerce.productDescription(),
        }
      })
    }


  })()

