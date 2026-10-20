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
    potSizes: [
      { id: '30-cm', label: '30 cm' },
      { id: '34-cm', label: '34 cm' },
      { id: '38-cm', label: '38 cm' },
    ],
    price: 14500,
    category: 'large',
    image: './images/cells/ficus-lyrata.jpg',
    images: [
      './images/products/fiddle-leaf-fig/01.jpg',
      './images/products/fiddle-leaf-fig/02.jpg',
      './images/products/fiddle-leaf-fig/03.jpg',
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
    href: './product.html?id=ficus-lyrata',
  },
  {
    id: 'olive-tree',
    name: 'Olive tree',
    latin: 'Olea europaea',
    size: '140 cm',
    height: 'About 140 cm',
    potSize: '30 cm',
    potSizes: [
      { id: '30-cm', label: '30 cm' },
      { id: '34-cm', label: '34 cm' },
      { id: '38-cm', label: '38 cm' },
      { id: '42-cm', label: '42 cm' },
    ],
    price: 18900,
    category: 'large',
    image: './images/cells/olive-tree.jpg',
    images: [
      './images/products/olive-tree/01.jpg',
      './images/products/olive-tree/02.jpg',
    ],
    alts: [
      'Olive tree (Olea europaea, 140 cm) with silvery-green foliage in a studio pot against a mid-grey backdrop',
      'Close-up of narrow, silvery-green Olea europaea leaves showing fine veining and matte undersides',
    ],
    description:
      'A pruned Mediterranean standard with narrow, silvery-green leaves and a pale woody trunk. Suited to sun-drenched corners and south-facing windows.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=olive-tree',
  },
  {
    id: 'strelitzia-nicolai',
    name: 'Bird of paradise',
    latin: 'Strelitzia nicolai',
    size: '150 cm',
    height: 'About 150 cm',
    potSize: '32 cm',
    potSizes: [
      { id: '32-cm', label: '32 cm' },
      { id: '36-cm', label: '36 cm' },
      { id: '40-cm', label: '40 cm' },
    ],
    price: 21000,
    category: 'large',
    image: './images/cells/strelitzia-nicolai.jpg',
    images: [
      './images/products/strelitzia-nicolai/01.jpg',
      './images/products/strelitzia-nicolai/02.jpg',
    ],
    alts: [
      'Bird of paradise (Strelitzia nicolai, 150 cm) with tall fan-like leaves in a studio pot against a mid-grey backdrop',
      'Close-up of paddle-shaped Strelitzia nicolai leaves showing parallel lateral ribbing and central midrib',
    ],
    description:
      'Tall, fan-arranged stems carrying broad, paddle-shaped leaves that split naturally with age. Built for high ceilings and generous floor space.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=strelitzia-nicolai',
  },
  {
    id: 'zamioculcas-zamiifolia',
    name: 'ZZ plant',
    latin: 'Zamioculcas zamiifolia',
    size: '55 cm',
    height: 'About 55 cm',
    potSize: '18 cm',
    potSizes: [
      { id: '18-cm', label: '18 cm' },
      { id: '21-cm', label: '21 cm' },
      { id: '24-cm', label: '24 cm' },
    ],
    price: 5800,
    category: 'small',
    image: './images/cells/zamioculcas-zamiifolia.jpg',
    images: ['./images/cells/zamioculcas-zamiifolia.jpg'],
    alts: [
      'ZZ plant (Zamioculcas zamiifolia, 55 cm) with glossy dark green arching stems in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Waxy, deep green leaflets arranged symmetrically along fleshy, water-storing stems. Exceptionally tolerant of low light and irregular watering.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=zamioculcas-zamiifolia',
  },
  {
    id: 'calathea-orbifolia',
    name: 'Round-leaf calathea',
    latin: 'Goeppertia orbifolia',
    size: '45 cm',
    height: 'About 45 cm',
    potSize: '18 cm',
    potSizes: [
      { id: '18-cm', label: '18 cm' },
      { id: '21-cm', label: '21 cm' },
    ],
    price: 5200,
    category: 'small',
    image: './images/cells/calathea-orbifolia.jpg',
    images: [
      './images/products/calathea-orbifolia/01.jpg',
      './images/products/calathea-orbifolia/02.jpg',
    ],
    alts: [
      'Round-leaf calathea (Goeppertia orbifolia, 45 cm) with silver-banded round leaves in a studio pot against a mid-grey backdrop',
      'Close-up of pleated Goeppertia orbifolia leaves with alternating pale silver-green and deep green stripes',
    ],
    description:
      'Wide, pleated leaves striped with pale silver-green brushstrokes that rise and fold quietly between day and night.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=calathea-orbifolia',
  },
  {
    id: 'dracaena-angolensis',
    name: 'Cylindrical snake plant',
    latin: 'Dracaena angolensis',
    size: '60 cm',
    height: 'About 60 cm',
    potSize: '18 cm',
    potSizes: [
      { id: '18-cm', label: '18 cm' },
      { id: '21-cm', label: '21 cm' },
      { id: '24-cm', label: '24 cm' },
    ],
    price: 4800,
    category: 'small',
    image: './images/cells/dracaena-angolensis.jpg',
    images: ['./images/cells/dracaena-angolensis.jpg'],
    alts: [
      'Cylindrical snake plant (Dracaena angolensis, 60 cm) with upright tubular spears in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Rigid, cylindrical spears banded in muted sage and deep forest green. A minimalist vertical form that thrives on neglect.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=dracaena-angolensis',
  },
  {
    id: 'monstera-deliciosa',
    name: 'Swiss cheese plant',
    latin: 'Monstera deliciosa',
    size: '90 cm',
    height: 'About 90 cm',
    potSize: '26 cm',
    potSizes: [
      { id: '26-cm', label: '26 cm' },
      { id: '30-cm', label: '30 cm' },
      { id: '34-cm', label: '34 cm' },
      { id: '38-cm', label: '38 cm' },
    ],
    price: 9800,
    category: 'large',
    image: './images/cells/monstera-deliciosa.jpg',
    images: [
      './images/products/monstera-deliciosa/01.jpg',
      './images/products/monstera-deliciosa/02.jpg',
    ],
    alts: [
      'Swiss cheese plant (Monstera deliciosa, 90 cm) with fenestrated dark green leaves in a studio pot against a mid-grey backdrop',
      'Close-up of fenestrated Monstera deliciosa leaves showing deep lobes, surface texture, and primary veins',
    ],
    description:
      'Heavy, perforated leaves that cast graphic shadows across plaster and stone. Trained upright on a discreet central support.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=monstera-deliciosa',
  },
  {
    id: 'philodendron-hederaceum',
    name: 'Heartleaf philodendron',
    latin: 'Philodendron hederaceum',
    size: '35 cm',
    height: 'About 35 cm',
    potSize: '15 cm',
    potSizes: [
      { id: '15-cm', label: '15 cm' },
      { id: '18-cm', label: '18 cm' },
      { id: '21-cm', label: '21 cm' },
    ],
    price: 3800,
    category: 'small',
    image: './images/cells/philodendron-hederaceum.jpg',
    images: ['./images/cells/philodendron-hederaceum.jpg'],
    alts: [
      'Heartleaf philodendron (Philodendron hederaceum, 35 cm) with trailing heart-shaped leaves in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Softly trailing stems of matte, heart-shaped foliage. Ideal for open shelving, stone plinths, or shaded studies.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=philodendron-hederaceum',
  },
  {
    id: 'ficus-elastica-burgundy',
    name: 'Rubber plant',
    latin: "Ficus elastica 'Burgundy'",
    size: '100 cm',
    height: 'About 100 cm',
    potSize: '26 cm',
    potSizes: [
      { id: '26-cm', label: '26 cm' },
      { id: '30-cm', label: '30 cm' },
    ],
    price: 7900,
    category: 'large',
    image: './images/cells/ficus-elastica-burgundy.jpg',
    images: ['./images/cells/ficus-elastica-burgundy.jpg'],
    alts: [
      "Rubber plant (Ficus elastica 'Burgundy', 100 cm) with near-black leathery foliage in a studio pot against a mid-grey backdrop",
    ],
    description:
      'Thick, oval leaves in deep espresso and oxblood tones emerging from ruby sheaths. A strong dark vertical accent.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=ficus-elastica-burgundy',
  },
  {
    id: 'alocasia-polly',
    name: "Alocasia 'Polly'",
    latin: "Alocasia × amazonica 'Polly'",
    size: '45 cm',
    height: 'About 45 cm',
    potSize: '18 cm',
    potSizes: [
      { id: '18-cm', label: '18 cm' },
      { id: '21-cm', label: '21 cm' },
    ],
    price: 4400,
    category: 'small',
    image: './images/cells/alocasia-polly.jpg',
    images: [
      './images/products/alocasia-polly/01.jpg',
      './images/products/alocasia-polly/02.jpg',
    ],
    alts: [
      "Alocasia 'Polly' (Alocasia × amazonica 'Polly', 45 cm) with arrow-shaped leaves and pale veins in a studio pot against a mid-grey backdrop",
      "Close-up of arrow-shaped Alocasia × amazonica 'Polly' leaves showing high-contrast ivory ribs and scalloped margins",
    ],
    description:
      'Arrowhead leaves with scalloped margins and high-contrast ivory ribs over deep green blades.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=alocasia-polly',
  },
  {
    id: 'yucca-elephantipes',
    name: 'Yucca',
    latin: 'Yucca elephantipes',
    size: '110 cm',
    height: 'About 110 cm',
    potSize: '28 cm',
    potSizes: [
      { id: '28-cm', label: '28 cm' },
      { id: '32-cm', label: '32 cm' },
      { id: '36-cm', label: '36 cm' },
      { id: '40-cm', label: '40 cm' },
    ],
    price: 9200,
    category: 'large',
    image: './images/cells/yucca-elephantipes.jpg',
    images: ['./images/cells/yucca-elephantipes.jpg'],
    alts: [
      'Yucca (Yucca elephantipes, 110 cm) with a thick woody cane and sword-like leaves in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Stout, rugged canes crowned with rosettes of firm, sword-shaped leaves. Thrives in bright, dry interiors.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=yucca-elephantipes',
  },
  {
    id: 'euphorbia-ammak',
    name: 'Candelabra euphorbia',
    latin: 'Euphorbia ammak',
    size: '80 cm',
    height: 'About 80 cm',
    potSize: '24 cm',
    potSizes: [
      { id: '24-cm', label: '24 cm' },
      { id: '28-cm', label: '28 cm' },
      { id: '32-cm', label: '32 cm' },
    ],
    price: 8400,
    category: 'small',
    image: './images/cells/euphorbia-ammak.jpg',
    images: ['./images/cells/euphorbia-ammak.jpg'],
    alts: [
      'Candelabra euphorbia (Euphorbia ammak, 80 cm) with ribbed columnar stems in a studio pot against a mid-grey backdrop',
    ],
    description:
      'Ribbed, four-angled succulent columns with ascending arms that read like carved stone against plain walls.',
    pots: [...DEFAULT_POTS],
    href: './product.html?id=euphorbia-ammak',
  },
];

/**
 * Formats a composite variant ID from a pot finish ID and pot size ID.
 * @param {string} potId
 * @param {string} [potSizeId]
 * @returns {string}
 */
export function formatVariantId(potId, potSizeId) {
  return potSizeId ? `${potId}:${potSizeId}` : potId;
}

/**
 * Validates and resolves a variantId (either "potId:potSizeId" or legacy "potId")
 * against a product's available pots and potSizes.
 * @param {object} product
 * @param {string} variantId
 * @returns {{ variantId: string, pot: { id: string, label: string }, potSize: { id: string, label: string } | null, label: string } | null}
 */
export function resolveProductVariant(product, variantId) {
  if (!product || typeof variantId !== 'string' || !variantId.trim()) {
    return null;
  }

  const [rawPotId, rawPotSizeId, ...rest] = variantId.trim().split(':');
  if (!rawPotId || rest.length > 0) {
    return null;
  }

  const pots = Array.isArray(product.pots) ? product.pots : [];
  const pot = pots.find((p) => p.id === rawPotId);
  if (!pot) {
    return null;
  }

  const potSizes = Array.isArray(product.potSizes) ? product.potSizes : [];
  let potSize = null;

  if (rawPotSizeId) {
    potSize = potSizes.find((s) => s.id === rawPotSizeId) || null;
    if (!potSize) {
      return null;
    }
  } else if (potSizes.length > 0) {
    potSize = potSizes[0];
  }

  return {
    variantId: formatVariantId(pot.id, potSize?.id),
    pot,
    potSize,
    label: potSize ? `${pot.label}, ${potSize.label}` : pot.label,
  };
}

/**
 * Returns the relative prefix back to the storefront directory root from the
 * current location ('../' on '/products/<slug>' routes, './' everywhere else).
 * @param {string} [pathname]
 * @returns {string}
 */
export function getStorefrontRootPrefix(pathname = window.location.pathname) {
  return /\/products\/[^/]*$/.test(pathname) ? '../' : './';
}

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
