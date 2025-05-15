import { imageUrl } from "@cloudinary/url-gen/qualifiers/source";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const games = [
    {
      title: "The Legend of Zelda: Breath of the Wild",
      description: "An open-world adventure game set in the kingdom of Hyrule.",
      price: 59.99,
      rating: 4.9,
      releaseDate: new Date("2017-03-03"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747298963/7137262b5a64d921e193653f8aa0b722925abc5680380ca0e18a5cfd91697f58_jbiic5.avif",
    },
    {
      title: "The Witcher 3: Wild Hunt",
      description:
        "An action RPG set in a fantasy world full of monsters and magic.",
      price: 39.99,
      rating: 4.8,
      releaseDate: new Date("2015-05-19"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747299359/hq720_lsfbuq.jpg"
    },
    {
      title: "Red Dead Redemption 2",
      description: "An open-world western adventure game.",
      price: 59.99,
      rating: 4.7,
      releaseDate: new Date("2018-10-26"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747299499/download_1_rwaaof.jpg"
    },
    {
      title: "God of War",
      description: "An action-adventure game based on Norse mythology.",
      price: 49.99,
      rating: 4.9,
      releaseDate: new Date("2018-04-20"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747299937/download_2_ibobe6.jpg"
    },
    {
      title: "Minecraft",
      description:
        "A sandbox game where players can build and explore their own worlds.",
      price: 26.95,
      rating: 4.8,
      releaseDate: new Date("2011-11-18"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747300195/download_3_mdsehb.jpg"
    },
    {
      title: "Fortnite",
      description:
        "A battle royale game where players fight to be the last one standing.",
      price: 0.0,
      rating: 4.5,
      releaseDate: new Date("2017-07-25"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747300453/download_4_ngmbro.jpg"
    },
    {
      title: "Cyberpunk 2077",
      description: "An open-world RPG set in a dystopian future.",
      price: 59.99,
      rating: 4.0,
      releaseDate: new Date("2020-12-10"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747300568/images_mm1vc5.jpg"
    },
    {
      title: "Among Us",
      description:
        "A multiplayer game where players work together to complete tasks on a spaceship.",
      price: 4.99,
      rating: 4.4,
      releaseDate: new Date("2018-06-15"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747300654/download_5_uib0vg.jpg"
    },
    {
      title: "Animal Crossing: New Horizons",
      description:
        "A life simulation game where players can build and manage their own island.",
      price: 59.99,
      rating: 4.9,
      releaseDate: new Date("2020-03-20"),
      imageUrl:"https://res.cloudinary.com/djmlrjvf7/image/upload/v1747300757/9989957eae3a6b545194c42fec2071675c34aadacd65e6b33fdfe7b3b6a86c3a_oxvyjw.avif"
    },
    {
      title: "Hades",
      description:
        "A rogue-like dungeon crawler where players fight their way out of the Underworld.",
      price: 24.99,
      rating: 4.9,
      releaseDate: new Date("2020-09-17"),
      imageUrl: "https://res.cloudinary.com/djmlrjvf7/image/upload/v1747300835/download_6_rspa34.jpg"
    },
  ];

  for (const game of games) {
    await prisma.game.create({ data: game });
  }

  console.log("👾 Games created successfully");

  const categories = [
    {
      title: "Action",
      description:
        "Games that require quick reflexes and hand-eye coordination.",
    },
    {
      title: "Adventure",
      description: "Games that involve exploration and puzzle-solving.",
    },
    {
      title: "RPG",
      description: "Games that focus on character development and story.",
    },
    {
      title: "Simulation",
      description: "Games that simulate real-world activities or systems.",
    },
    {
      title: "Strategy",
      description: "Games that require strategic thinking and planning.",
    },
    {
      title: "Puzzle",
      description:
        "Games that challenge players with logic and problem-solving.",
    },
    {
      title: "Sports",
      description: "Games that simulate sports or physical activities.",
    },
    {
      title: "Multiplayer",
      description: "Games that can be played with multiple players.",
    },
    {
      title: "Indie",
      description: "Games developed by independent studios or individuals.",
    },
    {
      title: "Horror",
      description: "Games that aim to scare or unsettle players.",
    },
  ];

  for (const games of categories) {
    await prisma.category.create({ data: games });
  }

  console.log("🎮 Categories created successfully");

  console.log("🔗 Linking each game to a category");

  // Fetch games from the database
  const dbGames = await prisma.game.findMany();

  // Fetch categories from the database
  const dbCategories = await prisma.category.findMany();

  // Link each game to a category
  for (const game of dbGames) {
    const category =
      dbCategories[Math.floor(Math.random() * dbCategories.length)];
    await prisma.game.update({
      where: { id: game.id },
      data: { categoryId: category.id },
    });
  }

  console.log("🔗 Games and categories linked successfully");

  console.log("Seed data created successfully");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
