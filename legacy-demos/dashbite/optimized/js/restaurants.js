/**
 * DashBite - Restaurant Feed & Menu Taxonomy Data
 * High-fidelity catalog simulating on-demand food delivery scale.
 */

export const CATEGORIES = [
  { id: 'all', name: 'All Cuisines', icon: '🍽️' },
  { id: 'burgers', name: 'Burgers & Fries', icon: '🍔' },
  { id: 'sushi', name: 'Sushi & Japanese', icon: '🍣' },
  { id: 'pizza', name: 'Pizza & Wings', icon: '🍕' },
  { id: 'mexican', name: 'Tacos & Burritos', icon: '🌮' },
  { id: 'bowls', name: 'Poke & Healthy', icon: '🥗' },
  { id: 'pasta', name: 'Italian & Pasta', icon: '🍝' },
  { id: 'drinks', name: 'Boba & Shakes', icon: '🧋' },
  { id: 'desserts', name: 'Bakery & Treats', icon: '🍰' }
];

export const RESTAURANTS = [
  {
    id: 'res-burger-joint',
    name: 'Artisan Burger Foundry',
    cuisine: 'Burgers & American',
    categoryId: 'burgers',
    rating: 4.9,
    reviewCount: '1.8k+',
    deliveryTimeMin: 20,
    deliveryTimeMax: 30,
    deliveryFee: 0.99,
    isDashPass: true,
    priceTier: '$$',
    distanceMiles: 1.2,
    image: 'assets/images/burger.jpg',
    heroImage: 'assets/images/burger.jpg',
    promoTag: '$0 Delivery with DashPass',
    offerText: 'Spend $25, Save $5',
    menu: [
      {
        id: 'item-bf-01',
        name: 'The Double Black Angus Truffle Smash',
        description: 'Two 1/4 lb certified Angus patties, aged Wisconsin cheddar, caramelized shallots, black truffle aioli on toasted brioche.',
        basePrice: 16.50,
        image: 'assets/images/burger.jpg',
        isPopular: true,
        tags: ['Featured', 'Chef Special'],
        options: [
          {
            name: 'Choice of Size',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Double Patty (Standard)', priceDelta: 0 },
              { name: 'Triple Monster Patty', priceDelta: 3.50 }
            ]
          },
          {
            name: 'Extra Gourmet Add-ons',
            type: 'checkbox',
            required: false,
            choices: [
              { name: 'Applewood Smoked Thick Bacon', priceDelta: 2.50 },
              { name: 'Extra Melted Sharp Cheddar', priceDelta: 1.50 },
              { name: 'Fried Cage-Free Egg', priceDelta: 1.75 },
              { name: 'Grilled Wild Jalapeños', priceDelta: 1.00 }
            ]
          }
        ]
      },
      {
        id: 'item-bf-02',
        name: 'Crispy Garlic Herb Fries Platter',
        description: 'Fresh hand-cut Idaho potatoes tossed in roasted garlic oil, fresh parsley, and smoked sea salt with house dipping sauce.',
        basePrice: 6.95,
        image: 'assets/images/burger.jpg',
        isPopular: true,
        tags: ['Vegetarian'],
        options: [
          {
            name: 'Side Dipping Sauce',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Truffle Mayo', priceDelta: 0 },
              { name: 'Chipotle Crema', priceDelta: 0 },
              { name: 'Smoky Bourbon BBQ', priceDelta: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'res-sakura-sushi',
    name: 'Sakura Omakase & Raw Bar',
    cuisine: 'Sushi & Japanese',
    categoryId: 'sushi',
    rating: 4.9,
    reviewCount: '2.4k+',
    deliveryTimeMin: 25,
    deliveryTimeMax: 35,
    deliveryFee: 1.99,
    isDashPass: true,
    priceTier: '$$$',
    distanceMiles: 2.1,
    image: 'assets/images/sushi.jpg',
    heroImage: 'assets/images/sushi.jpg',
    promoTag: 'Free Edamame on $30+',
    offerText: '20% Off Select Rolls',
    menu: [
      {
        id: 'item-ss-01',
        name: 'Imperial Omakase Nigiri Set (8 pcs)',
        description: 'Chef selection of bluefin otoro, king salmon, yellowtail, unagi, and seasonal Hokkaido scallop with fresh wasabi.',
        basePrice: 32.00,
        image: 'assets/images/sushi.jpg',
        isPopular: true,
        tags: ['Raw', 'Gluten-Free Option'],
        options: [
          {
            name: 'Soy Sauce Preference',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Aged House Tamari (Gluten-Free)', priceDelta: 0 },
              { name: 'Low Sodium Soy Sauce', priceDelta: 0 }
            ]
          },
          {
            name: 'Custom Accompaniments',
            type: 'checkbox',
            required: false,
            choices: [
              { name: 'Fresh Grated Shizuoka Real Wasabi', priceDelta: 3.00 },
              { name: 'Side Seaweed Salad with Yuzu Dressing', priceDelta: 4.50 }
            ]
          }
        ]
      },
      {
        id: 'item-ss-02',
        name: 'Dragon Roll with Torched Avocado & Unagi',
        description: 'Shrimp tempura, cucumber, wrapped with eel, ripe avocado, tobiko caviar, and sweet tare glaze.',
        basePrice: 18.50,
        image: 'assets/images/sushi.jpg',
        isPopular: true,
        tags: ['Signature Roll'],
        options: [
          {
            name: 'Spice Level',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Mild / Traditional', priceDelta: 0 },
              { name: 'Spicy Sriracha Drizzle', priceDelta: 0.50 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'res-margherita-oven',
    name: 'Luigi’s Wood-Fired Neapolitan',
    cuisine: 'Pizza & Wings',
    categoryId: 'pizza',
    rating: 4.8,
    reviewCount: '3.1k+',
    deliveryTimeMin: 15,
    deliveryTimeMax: 25,
    deliveryFee: 0.00,
    isDashPass: true,
    priceTier: '$$',
    distanceMiles: 0.8,
    image: 'assets/images/pizza.jpg',
    heroImage: 'assets/images/pizza.jpg',
    promoTag: '$0 Delivery Fee',
    offerText: 'Buy 1 Large Pizza, Get 1 Free Drink',
    menu: [
      {
        id: 'item-pz-01',
        name: 'Classica Margherita DOP',
        description: 'San Marzano tomato coulis, fresh buffalo mozzarella, hand-torn sweet basil, extra virgin olive oil on fermented sourdough crust.',
        basePrice: 19.50,
        image: 'assets/images/pizza.jpg',
        isPopular: true,
        tags: ['Vegetarian', 'Authentic Neapolitan'],
        options: [
          {
            name: 'Crust Style',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Classic Neapolitan 12"', priceDelta: 0 },
              { name: 'Family Size 16"', priceDelta: 6.00 }
            ]
          },
          {
            name: 'Extra Toppings',
            type: 'checkbox',
            required: false,
            choices: [
              { name: 'Spicy Calabrian Salami', priceDelta: 3.00 },
              { name: 'Prosciutto di Parma 24-Month', priceDelta: 4.50 },
              { name: 'Hot Honey Drizzle', priceDelta: 1.50 },
              { name: 'Roasted Wild Mushrooms', priceDelta: 2.00 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'res-taqueria-sabor',
    name: 'Taquería El Sabor & Cantina',
    cuisine: 'Tacos & Burritos',
    categoryId: 'mexican',
    rating: 4.8,
    reviewCount: '1.2k+',
    deliveryTimeMin: 20,
    deliveryTimeMax: 30,
    deliveryFee: 1.49,
    isDashPass: false,
    priceTier: '$',
    distanceMiles: 1.5,
    image: 'assets/images/tacos.jpg',
    heroImage: 'assets/images/tacos.jpg',
    promoTag: 'Popular Near You',
    offerText: 'Free Chips & Salsa over $20',
    menu: [
      {
        id: 'item-tc-01',
        name: 'Slow-Braised Jalisco Beef Birria Tacos (3x)',
        description: 'Handmade corn tortillas, tender stewed beef, melted Oaxaca cheese, cilantro, onions, served with rich consommé dipping broth.',
        basePrice: 15.75,
        image: 'assets/images/tacos.jpg',
        isPopular: true,
        tags: ['Gluten-Free', 'Staff Favorite'],
        options: [
          {
            name: 'Salsa Heat Level',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Salsa Verde (Mild)', priceDelta: 0 },
              { name: 'Salsa Roja Habanero (Very Spicy)', priceDelta: 0 }
            ]
          },
          {
            name: 'Sides & Dips',
            type: 'checkbox',
            required: false,
            choices: [
              { name: 'Hand-Mashed Fresh Guacamole', priceDelta: 3.75 },
              { name: 'Mexican Street Corn Esquites', priceDelta: 4.25 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'res-pacific-poke',
    name: 'Pacific Bowl & Poke Co.',
    cuisine: 'Poke & Healthy',
    categoryId: 'bowls',
    rating: 4.9,
    reviewCount: '980+',
    deliveryTimeMin: 15,
    deliveryTimeMax: 25,
    deliveryFee: 0.99,
    isDashPass: true,
    priceTier: '$$',
    distanceMiles: 1.0,
    image: 'assets/images/poke.jpg',
    heroImage: 'assets/images/poke.jpg',
    promoTag: 'DashPass Exclusive',
    offerText: '$3 Off with Code POKELIFE',
    menu: [
      {
        id: 'item-pk-01',
        name: 'Signature Ahi Tuna & Mango Poke Bowl',
        description: 'Wild-caught sashimi tuna, avocado fans, edamame, sweet mango cubes, pickled purple cabbage, furikake over sushi rice.',
        basePrice: 17.25,
        image: 'assets/images/poke.jpg',
        isPopular: true,
        tags: ['High Protein', 'Dairy-Free'],
        options: [
          {
            name: 'Base Selection',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Seasoned Sushi Rice', priceDelta: 0 },
              { name: 'Organic Brown Rice', priceDelta: 0 },
              { name: 'Fresh Spring Greens Salad', priceDelta: 0 }
            ]
          },
          {
            name: 'Dressings',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Spicy Togarashi Mayo', priceDelta: 0 },
              { name: 'Sweet Sesame Ponzu (Vegan)', priceDelta: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'res-tiger-boba',
    name: 'Tiger Tea & Boba Lounge',
    cuisine: 'Boba & Shakes',
    categoryId: 'drinks',
    rating: 4.9,
    reviewCount: '4.5k+',
    deliveryTimeMin: 10,
    deliveryTimeMax: 20,
    deliveryFee: 0.49,
    isDashPass: true,
    priceTier: '$',
    distanceMiles: 0.6,
    image: 'assets/images/boba.jpg',
    heroImage: 'assets/images/boba.jpg',
    promoTag: 'Fastest Delivery',
    offerText: 'Buy 2 Milk Teas, Get 1 Free Topping',
    menu: [
      {
        id: 'item-bb-01',
        name: 'Brown Sugar Tiger Fresh Milk with Boba',
        description: 'Slow-cooked warm brown sugar tapioca pearls, organic whole milk, torch-caramelized sea salt cheese foam cap.',
        basePrice: 6.75,
        image: 'assets/images/boba.jpg',
        isPopular: true,
        tags: ['Sweet', 'Bestseller'],
        options: [
          {
            name: 'Sweetness Level',
            type: 'radio',
            required: true,
            choices: [
              { name: '100% Regular Sweet', priceDelta: 0 },
              { name: '70% Less Sweet', priceDelta: 0 },
              { name: '30% Light Sweet', priceDelta: 0 }
            ]
          },
          {
            name: 'Ice Level',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Regular Ice', priceDelta: 0 },
              { name: 'Less Ice', priceDelta: 0 },
              { name: 'No Ice', priceDelta: 0.50 }
            ]
          },
          {
            name: 'Additional Toppings',
            type: 'checkbox',
            required: false,
            choices: [
              { name: 'Egg Pudding', priceDelta: 0.85 },
              { name: 'Herbal Grass Jelly', priceDelta: 0.85 },
              { name: 'Popping Lychee Boba', priceDelta: 1.00 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'res-trattoria-pasta',
    name: 'Trattoria Bella Pasta',
    cuisine: 'Italian & Pasta',
    categoryId: 'pasta',
    rating: 4.8,
    reviewCount: '1.5k+',
    deliveryTimeMin: 25,
    deliveryTimeMax: 35,
    deliveryFee: 1.99,
    isDashPass: true,
    priceTier: '$$$',
    distanceMiles: 2.4,
    image: 'assets/images/pasta.jpg',
    heroImage: 'assets/images/pasta.jpg',
    promoTag: 'Top Rated Italian',
    offerText: 'Free Garlic Focaccia on $35+',
    menu: [
      {
        id: 'item-ps-01',
        name: 'Handmade Truffle Tagliatelle con Parmigiano',
        description: 'Egg pasta ribbons tossed in cultured butter, cream of black Norcia truffles, freshly shaved seasonal truffles, 24-month Parmigiano-Reggiano.',
        basePrice: 24.50,
        image: 'assets/images/pasta.jpg',
        isPopular: true,
        tags: ['Vegetarian', 'Handmade Daily'],
        options: [
          {
            name: 'Add Italian Protein',
            type: 'checkbox',
            required: false,
            choices: [
              { name: 'Grilled Wild Shrimp (4x)', priceDelta: 6.00 },
              { name: 'Crispy Pancetta Bits', priceDelta: 3.50 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'res-choc-bakery',
    name: 'The French Cocoa Atelier',
    cuisine: 'Bakery & Treats',
    categoryId: 'desserts',
    rating: 4.9,
    reviewCount: '890+',
    deliveryTimeMin: 15,
    deliveryTimeMax: 25,
    deliveryFee: 0.99,
    isDashPass: false,
    priceTier: '$$',
    distanceMiles: 1.8,
    image: 'assets/images/dessert.jpg',
    heroImage: 'assets/images/dessert.jpg',
    promoTag: 'Sweet Deals',
    offerText: '$2 Off Any 2 Desserts',
    menu: [
      {
        id: 'item-ds-01',
        name: 'Warm Valrhona Molten Lava Cake',
        description: 'Decadent 70% dark Valrhona chocolate cake with liquid chocolate center, Madagascar vanilla bean gelato, raspberry coulis.',
        basePrice: 11.50,
        image: 'assets/images/dessert.jpg',
        isPopular: true,
        tags: ['Dessert', 'Vegetarian'],
        options: [
          {
            name: 'Ice Cream Pairing',
            type: 'radio',
            required: true,
            choices: [
              { name: 'Tahitian Vanilla Gelato', priceDelta: 0 },
              { name: 'Salted Caramel Crunch Gelato', priceDelta: 1.00 },
              { name: 'Double Espresso Gelato', priceDelta: 1.00 }
            ]
          }
        ]
      }
    ]
  }
];
