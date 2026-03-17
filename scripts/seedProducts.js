const fs = require('fs');
const path = require('path');
const db = require('../src/models/Database');

// Products to add (name must be unique enough to avoid duplicates):
const products = [
  {
    name: "The Legend of Zelda: Tears of the Kingdom",
    price: 69,
    description: "An open-world adventure where you explore the skies, the land, and everything in between.",
    image_url: "img/zelda_totk.svg",
    category: "adventure"
  },
  {
    name: "God of War Ragnarök",
    price: 69,
    description: "Kratos and Atreus face the end of days in Norse myth.",
    image_url: "img/god_of_war_ragnarok.svg",
    category: "action"
  },
  {
    name: "Cyberpunk 2077",
    price: 49,
    description: "Explore Night City and become a cyber-enhanced mercenary in a neon-soaked future.",
    image_url: "img/cyberpunk2077.svg",
    category: "rpg"
  },
  {
    name: "Hogwarts Legacy",
    price: 59,
    description: "Live the wizarding fantasy and attend Hogwarts in the 1800s.",
    image_url: "img/hogwarts_legacy.svg",
    category: "rpg"
  },
  {
    name: "Call of Duty: Modern Warfare II",
    price: 69,
    description: "High-intensity modern combat with a cinematic single-player campaign.",
    image_url: "img/cod_mw2.svg",
    category: "shooter"
  },
  {
    name: "Red Dead Redemption 2",
    price: 59,
    description: "An epic tale of life in America’s unforgiving heartland.",
    image_url: "img/red_dead_redemption_2.svg",
    category: "action"
  },
  {
    name: "The Witcher 3: Wild Hunt",
    price: 39,
    description: "Hunt monsters and navigate a war-torn world as Geralt of Rivia.",
    image_url: "img/witcher_3.svg",
    category: "rpg"
  },
  {
    name: "Horizon Forbidden West",
    price: 59,
    description: "Explore a lush post-apocalyptic America ruled by machines.",
    image_url: "img/horizon_forbidden_west.svg",
    category: "action"
  },
  {
    name: "Super Mario Odyssey",
    price: 59,
    description: "A globe-trotting 3D Mario adventure with Cappy-powered moves.",
    image_url: "img/super_mario_odyssey.svg",
    category: "platformer"
  },
  {
    name: "Splatoon 3",
    price: 49,
    description: "Colorful team-based turf war with a fresh roster of weapons.",
    image_url: "img/splatoon_3.svg",
    category: "shooter"
  },
  {
    name: "Forza Horizon 5",
    price: 59,
    description: "Race across a beautiful open-world version of Mexico.",
    image_url: "img/forza_horizon_5.svg",
    category: "racing"
  },
  {
    name: "Animal Crossing: New Horizons",
    price: 49,
    description: "Build your island paradise and hang out with charming animal neighbors.",
    image_url: "img/animal_crossing_nh.svg",
    category: "simulation"
  },
  {
    name: "Apex Legends",
    price: 0,
    description: "Fast-paced battle royale with unique legend abilities.",
    image_url: "img/apex_legends.svg",
    category: "shooter"
  },
  {
    name: "Destiny 2",
    price: 0,
    description: "A shared-world shooter with raids, questing, and deep progression.",
    image_url: "img/destiny_2.svg",
    category: "shooter"
  },
  {
    name: "Overwatch 2",
    price: 0,
    description: "Team-based hero shooter with fast-paced objective gameplay.",
    image_url: "img/overwatch_2.svg",
    category: "shooter"
  },
  {
    name: "Starfield",
    price: 69,
    description: "Explore space in an epic sci-fi RPG from Bethesda.",
    image_url: "img/starfield.svg",
    category: "rpg"
  },
  {
    name: "Persona 5 Royal",
    price: 49,
    description: "A stylish JRPG about students who become phantom thieves.",
    image_url: "img/persona_5_royal.svg",
    category: "rpg"
  },
  {
    name: "Diablo IV",
    price: 69,
    description: "A dark action-RPG with epic loot and brutal combat.",
    image_url: "img/diablo_4.svg",
    category: "rpg"
  },
  {
    name: "Elden Ring",
    price: 59,
    description: "A vast open world from the makers of Dark Souls.",
    image_url: "img/eldenring.jpg",
    category: "action"
  },
  {
    name: "Mortal Kombat 1",
    price: 59,
    description: "The reboot of the bloody fighting franchise.",
    image_url: "img/mk1.jpg",
    category: "fighting"
  }
];

const imgDir = path.join(__dirname, '..', 'img');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeSvgPlaceholder(text) {
  const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="330">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2b2b2b" />
      <stop offset="100%" stop-color="#101010" />
    </linearGradient>
  </defs>
  <rect width="600" height="330" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
    ${safeText}
  </text>
</svg>
`;
}

async function ensureImageExists(imagePath, name) {
  const fullPath = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(fullPath)) return;

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(fullPath, makeSvgPlaceholder(name), 'utf8');
}

async function addProducts() {
  for (const prod of products) {
    await ensureImageExists(prod.image_url, prod.name);

    const existing = await db.get('SELECT id FROM products WHERE name = ?', [prod.name]);
    if (existing) {
      console.log(`✔ Skipping existing product: ${prod.name}`);
      continue;
    }

    await db.run(
      'INSERT INTO products (name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?)',
      [prod.name, prod.price, prod.description, prod.image_url, prod.category]
    );

    console.log(`✅ Added product: ${prod.name}`);
  }

  console.log('\nDone. Products are now available via /api/products');
  process.exit(0);
}

addProducts().catch(err => {
  console.error('Error seeding products:', err);
  process.exit(1);
});
