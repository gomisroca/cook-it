import { PrismaPg } from '@prisma/adapter-pg';
import { Difficulty, PrismaClient } from '@/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ----------------------
  // 1. Create Tags
  // ----------------------
  await prisma.tag.createMany({
    data: [
      { name: 'Vegan' },
      { name: 'Dessert' },
      { name: 'Quick' },
      { name: 'Keto' },
      { name: 'Gluten-Free' },
      { name: 'Breakfast' },
      { name: 'Lunch' },
      { name: 'Dinner' },
    ],
    skipDuplicates: true,
  });

  // ----------------------
  // 2. Create Users
  // ----------------------
  await prisma.user.createMany({
    data: [
      {
        username: 'chefAlice',
        email: 'alice@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
      },
      {
        username: 'chefBob',
        email: 'bob@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=2',
      },
      {
        username: 'chefCharlie',
        email: 'charlie@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
      },
    ],
    skipDuplicates: true,
  });

  const allUsers = await prisma.user.findMany();

  // ----------------------
  // 3. Create Recipes
  // ----------------------
  const recipesData = [
    {
      title: 'Classic Pancakes',
      description: 'Fluffy pancakes perfect for breakfast.',
      coverImageUrl: 'https://source.unsplash.com/600x400/?pancakes',
      cookingTime: 20,
      difficulty: 'EASY',
      servings: 4,
      authorId: allUsers[0].id,
      tags: ['Breakfast', 'Quick'],
      ingredients: [
        { name: 'Flour', quantity: 200, unit: 'g' },
        { name: 'Milk', quantity: 300, unit: 'ml' },
        { name: 'Egg', quantity: 2, unit: 'pcs' },
        { name: 'Sugar', quantity: 2, unit: 'tbsp' },
      ],
      steps: [
        { order: 1, instruction: 'Mix dry ingredients in a bowl.' },
        { order: 2, instruction: 'Add milk and eggs, whisk until smooth.' },
        { order: 3, instruction: 'Cook on a non-stick pan until golden.' },
      ],
    },
    {
      title: 'Avocado Toast',
      description: 'Simple and healthy avocado toast.',
      coverImageUrl: 'https://source.unsplash.com/600x400/?avocado-toast',
      cookingTime: 10,
      difficulty: 'EASY',
      servings: 1,
      authorId: allUsers[1].id,
      tags: ['Vegan', 'Breakfast', 'Quick'],
      ingredients: [
        { name: 'Bread Slice', quantity: 1, unit: 'pcs' },
        { name: 'Avocado', quantity: 1, unit: 'pcs' },
        { name: 'Salt', quantity: 0.5, unit: 'tsp' },
      ],
      steps: [
        { order: 1, instruction: 'Toast the bread.' },
        { order: 2, instruction: 'Mash the avocado and season with salt.' },
        { order: 3, instruction: 'Spread avocado on toast.' },
      ],
    },
  ];

  for (const r of recipesData) {
    const recipe = await prisma.recipe.create({
      data: {
        title: r.title,
        slug: r.title.toLowerCase().replaceAll(' ', '-'),
        description: r.description,
        coverImageUrl: r.coverImageUrl,
        cookingTime: r.cookingTime,
        difficulty: r.difficulty as Difficulty,
        servings: r.servings,
        authorId: r.authorId,
        ingredients: { create: r.ingredients },
        steps: { create: r.steps },
        tags: {
          create: r.tags.map((tagName) => ({
            tag: { connect: { name: tagName } },
          })),
        },
      },
    });

    // Add some favorites for demo
    await prisma.favorite.create({
      data: {
        userId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
        recipeId: recipe.id,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
