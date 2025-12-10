import {
  PrismaClient,
  UserRole,
  OrderStatus,
  Prisma,
} from '../generated/prisma/client.js';

// @ts-expect-error prisma client constructor type mismatch in generated d.ts
const prisma = new PrismaClient();

const SAMPLE_IMAGE =
  'https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dw8157ca84/images/funko/upload/1/86434_HP_S18_HarryWHourglass_POP_GLAM-WEB.png?sw=346&sh=346';

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Очистка (опционально можно убрать, если нужно оставить данные)
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ---------- USER ----------
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'hashed_password',
      role: UserRole.USER,
    },
  });

  // ---------- CATEGORIES ----------
  const categoriesData = [
    { name: 'Harry Potter', images: SAMPLE_IMAGE },
    { name: 'Naruto', images: SAMPLE_IMAGE },
    { name: 'Dragon Ball', images: SAMPLE_IMAGE },
    { name: 'Marvel', images: SAMPLE_IMAGE },
    { name: 'DC Comics', images: SAMPLE_IMAGE },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.create({
        data: {
          name: cat.name,
          slug: makeSlug(cat.name),
          images: cat.images,
        },
      }),
    ),
  );

  // ---------- PRODUCTS ----------
  const productsData = [
    { name: 'Harry Potter', category: 'Harry Potter', price: 2990 },
    { name: 'Hermione Granger', category: 'Harry Potter', price: 2890 },
    { name: 'Naruto Uzumaki', category: 'Naruto', price: 2890 },
    { name: 'Sasuke Uchiha', category: 'Naruto', price: 2500 },
    { name: 'Goku Super Saiyan', category: 'Dragon Ball', price: 2700 },
    { name: 'Vegeta', category: 'Dragon Ball', price: 2700 },
    { name: 'Spider-Man', category: 'Marvel', price: 2800 },
    { name: 'Iron Man', category: 'Marvel', price: 2890 },
    { name: 'Batman', category: 'DC Comics', price: 2890 },
    { name: 'Superman', category: 'DC Comics', price: 2890 },
  ];

  const products: Array<{ id: string; price: number }> = [];
  for (const p of productsData) {
    const category = categories.find((c) => c.name === p.category);
    if (!category) continue;

    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: makeSlug(p.name),
        images: [SAMPLE_IMAGE],
        price: p.price,
        description: `${p.name} collectible Funko Pop.`,
        categoryID: category.id,
        isActive: true,
      },
    });
    products.push({ id: created.id, price: created.price });
  }

  // ---------- CART ----------
  const cartItems = products.slice(0, 3).map((prod) => ({
    productID: prod.id,
    quantity: 1,
    price: prod.price,
  }));

  const cart = await prisma.cart.create({
    data: {
      userID: user.id,
      token: 'demo_cart_token',
      totalAmount: cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      cartItems: {
        create: cartItems.map((item) => ({
          productID: item.productID,
          quantity: item.quantity,
        })),
      },
    },
    include: { cartItems: true },
  });

  // ---------- ORDER (пример) ----------
  await prisma.order.create({
    data: {
      userId: user.id,
      token: cart.token,
      totalAmount: cart.totalAmount,
      status: OrderStatus.PENDING,
      items: cartItems as unknown as Prisma.InputJsonValue,
      fullName: user.name,
      email: user.email,
      phone: '+70000000000',
      address: 'Demo street, 1',
    },
  });

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
