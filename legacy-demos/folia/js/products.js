/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Product Catalogue Data (12 Specimens)
 */

export const CATEGORIES = [
  { id: 'large', label: 'Large', emptyMessage: 'Large plants are coming soon.' },
  { id: 'small', label: 'Small', emptyMessage: 'Small plants are coming soon.' },
  { id: 'pots', label: 'Pots', emptyMessage: 'Pots are coming soon.' },
  { id: 'care', label: 'Care', emptyMessage: 'Care is coming soon.' },
];

export const DEFAULT_POTS = [
  { id: 'charcoal-stoneware', label: 'Charcoal stoneware' },
  { id: 'raw-terracotta', label: 'Raw terracotta' },
  { id: 'matte-white-ceramic', label: 'Matte white ceramic' },
];

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  trailingZeroDisplay: 'stripIfInteger',
});

/**
 * Formats an integer pence value (e.g. 14500) into GBP currency (e.g. "£145").
 * @param {number} pence
 * @returns {string}
 */
export function formatPrice(pence) {
  return gbpFormatter.format(pence / 100);
}

export const PRODUCTS = [
  {
    id: 'ficus-lyrata',
    slugs: ['ficus-lyrata', 'fiddle-leaf-fig'],
    name: 'Fiddle leaf fig',
    latin: 'Ficus lyrata',
    size: '120 cm',
    height: 'About 120 cm including a 30 cm pot',
    potSize: '30 cm',
    price: 14500,
    category: 'large',
    image: '/public/images/cells/ficus-lyrata.jpg',
    images: [
      '/public/images/products/fiddle-leaf-fig/01.jpg',
      '/public/images/products/fiddle-leaf-fig/02.jpg',
      '/public/images/products/fiddle-leaf-fig/03.jpg',
    ],
    alts: [
      'Full-length studio portrait of a Fiddle leaf fig (Ficus lyrata, 120 cm) in a charcoal stoneware pot against a mid-grey backdrop',
      'Close-up of glossy, violin-shaped Ficus lyrata leaves showing pale green sculptural veining',
      'Detail of the Fiddle leaf fig woody stem and hand-thrown charcoal stoneware planter',
    ],
    description:
      'A sculptural specimen tree with broad, violin-shaped leaves and an upright branching habit. Grown to maturity for immediate architectural presence in bright rooms.',
    pots: [...DEFAULT_POTS],
    care: {
      light: 'Bright indirect light.',
      water: 'When the top 5 cm of soil feels dry, usually every 7 to 10 days.',
      pets: 'Toxic to cats and dogs if eaten.',
    },
    href: '/products/ficus-lyrata',
  },
  {
    id: 'olive-tree',
    name: 'Olive tree',
    latin: 'Olea europaea',
    size: '140 cm',
    height: 'About 140 cm',
    potSize: '30 cm',
    price: 18900,
    category: 'large',
    image: '/public/images/cells/olive-tree.jpg',
    images: ['/public/images/cells/olive-tree.jpg'],
    alts: [
      'Olive tree (Olea europaea, 140 cm) with silvery-green foliage in a studio pot against a mid-grey backdrop',
    ],
    description:
      'A pruned Mediterranean standard with narrow, silvery-green leaves and a pale woody trunk. Suited to sun-drenched corners and south-facing windows.',
    pots: [...DEFAULT_POTS],
    href: '/products/olive-tree',
  },
  {
    id: 'strelitzia-nicolai',
    name: 'Bird of paradise',
    latin: 'Strelitzia nicolai',
    size: '150 cm',
    height: 'About 150 cm',
    potSize: '32 cm',
    price: 21000,
    category: 'large',
    image: '/public/images/cells/strelitzia-nicolai.jpg',
    images: ['/public/images/cells/strelitzia-nicolai.jpg'],
    alts: [
      'Bird of paradise (Strelitzia nicolai, 150 cm) with tall fan-like leaves in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Tall, fan-arranged stems carrying broad, paddle-shaped leaves that split naturally with age. Built for high ceilings and generous floor space.',
    pots: [...DEFAULT_POTS],
    href: '/products/strelitzia-nicolai',
  },
  {
    id: 'zamioculcas-zamiifolia',
    name: 'ZZ plant',
    latin: 'Zamioculcas zamiifolia',
    size: '55 cm',
    height: 'About 55 cm',
    potSize: '18 cm',
    price: 5800,
    category: 'small',
    image: '/public/images/cells/zamioculcas-zamiifolia.jpg',
    images: ['/public/images/cells/zamioculcas-zamiifolia.jpg'],
    alts: [
      'ZZ plant (Zamioculcas zamiifolia, 55 cm) with glossy dark green arching stems in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Waxy, deep green leaflets arranged symmetrically along fleshy, water-storing stems. Exceptionally tolerant of low light and irregular watering.',
    pots: [...DEFAULT_POTS],
    href: '/products/zamioculcas-zamiifolia',
  },
  {
    id: 'calathea-orbifolia',
    name: 'Round-leaf calathea',
    latin: 'Goeppertia orbifolia',
    size: '45 cm',
    height: 'About 45 cm',
    potSize: '18 cm',
    price: 5200,
    category: 'small',
    image: '/public/images/cells/calathea-orbifolia.jpg',
    images: ['/public/images/cells/calathea-orbifolia.jpg'],
    alts: [
      'Round-leaf calathea (Goeppertia orbifolia, 45 cm) with silver-banded round leaves in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Wide, pleated leaves striped with pale silver-green brushstrokes that rise and fold quietly between day and night.',
    pots: [...DEFAULT_POTS],
    href: '/products/calathea-orbifolia',
  },
  {
    id: 'dracaena-angolensis',
    name: 'Cylindrical snake plant',
    latin: 'Dracaena angolensis',
    size: '60 cm',
    height: 'About 60 cm',
    potSize: '18 cm',
    price: 4800,
    category: 'small',
    image: '/public/images/cells/dracaena-angolensis.jpg',
    images: ['/public/images/cells/dracaena-angolensis.jpg'],
    alts: [
      'Cylindrical snake plant (Dracaena angolensis, 60 cm) with upright tubular spears in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Rigid, cylindrical spears banded in muted sage and deep forest green. A minimalist vertical form that thrives on neglect.',
    pots: [...DEFAULT_POTS],
    href: '/products/dracaena-angolensis',
  },
  {
    id: 'monstera-deliciosa',
    name: 'Swiss cheese plant',
    latin: 'Monstera deliciosa',
    size: '90 cm',
    height: 'About 90 cm',
    potSize: '26 cm',
    price: 9800,
    category: 'large',
    image: '/public/images/cells/monstera-deliciosa.jpg',
    images: ['/public/images/cells/monstera-deliciosa.jpg'],
    alts: [
      'Swiss cheese plant (Monstera deliciosa, 90 cm) with fenestrated dark green leaves in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Heavy, perforated leaves that cast graphic shadows across plaster and stone. Trained upright on a discreet central support.',
    pots: [...DEFAULT_POTS],
    href: '/products/monstera-deliciosa',
  },
  {
    id: 'philodendron-hederaceum',
    name: 'Heartleaf philodendron',
    latin: 'Philodendron hederaceum',
    size: '35 cm',
    height: 'About 35 cm',
    potSize: '15 cm',
    price: 3800,
    category: 'small',
    image: '/public/images/cells/philodendron-hederaceum.jpg',
    images: ['/public/images/cells/philodendron-hederaceum.jpg'],
    alts: [
      'Heartleaf philodendron (Philodendron hederaceum, 35 cm) with trailing heart-shaped leaves in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Softly trailing stems of matte, heart-shaped foliage. Ideal for open shelving, stone plinths, or shaded studies.',
    pots: [...DEFAULT_POTS],
    href: '/products/philodendron-hederaceum',
  },
  {
    id: 'ficus-elastica-burgundy',
    name: 'Rubber plant',
    latin: "Ficus elastica 'Burgundy'",
    size: '100 cm',
    height: 'About 100 cm',
    potSize: '26 cm',
    price: 7900,
    category: 'large',
    image: '/public/images/cells/ficus-elastica-burgundy.jpg',
    images: ['/public/images/cells/ficus-elastica-burgundy.jpg'],
    alts: [
      "Rubber plant (Ficus elastica 'Burgundy', 100 cm) with near-black leathery foliage in a studio pot against a mid-grey backdrop",
    ],
    description:
      'Thick, oval leaves in deep espresso and oxblood tones emerging from ruby sheaths. A strong dark vertical accent.',
    pots: [...DEFAULT_POTS],
    href: '/products/ficus-elastica-burgundy',
  },
  {
    id: 'alocasia-polly',
    name: "Alocasia 'Polly'",
    latin: "Alocasia × amazonica 'Polly'",
    size: '45 cm',
    height: 'About 45 cm',
    potSize: '18 cm',
    price: 4400,
    category: 'small',
    image: '/public/images/cells/alocasia-polly.jpg',
    images: ['/public/images/cells/alocasia-polly.jpg'],
    alts: [
      "Alocasia 'Polly' (Alocasia × amazonica 'Polly', 45 cm) with arrow-shaped leaves and pale veins in a studio pot against a mid-grey backdrop",
    ],
    description:
      'Arrowhead leaves with scalloped margins and high-contrast ivory ribs over deep green blades.',
    pots: [...DEFAULT_POTS],
    href: '/products/alocasia-polly',
  },
  {
    id: 'yucca-elephantipes',
    name: 'Yucca',
    latin: 'Yucca elephantipes',
    size: '110 cm',
    height: 'About 110 cm',
    potSize: '28 cm',
    price: 9200,
    category: 'large',
    image: '/public/images/cells/yucca-elephantipes.jpg',
    images: ['/public/images/cells/yucca-elephantipes.jpg'],
    alts: [
      'Yucca (Yucca elephantipes, 110 cm) with a thick woody cane and sword-like leaves in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Stout, rugged canes crowned with rosettes of firm, sword-shaped leaves. Thrives in bright, dry interiors.',
    pots: [...DEFAULT_POTS],
    href: '/products/yucca-elephantipes',
  },
  {
    id: 'euphorbia-ammak',
    name: 'Candelabra euphorbia',
    latin: 'Euphorbia ammak',
    size: '80 cm',
    height: 'About 80 cm',
    potSize: '24 cm',
    price: 8400,
    category: 'small',
    image: '/public/images/cells/euphorbia-ammak.jpg',
    images: ['/public/images/cells/euphorbia-ammak.jpg'],
    alts: [
      'Candelabra euphorbia (Euphorbia ammak, 80 cm) with ribbed columnar stems in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Ribbed, four-angled succulent columns with ascending arms that read like carved stone against plain walls.',
    pots: [...DEFAULT_POTS],
    href: '/products/euphorbia-ammak',
  },
];

/**
 * Finds a product by its id or alias slug.
 * @param {string} id
 * @returns {object | undefined}
 */
export function getProductById(id) {
  if (!id) return undefined;
  const normalized = decodeURIComponent(id).trim().toLowerCase();
  return PRODUCTS.find(
    (product) =>
      product.id === normalized ||
      (Array.isArray(product.slugs) && product.slugs.includes(normalized))
  );
}
