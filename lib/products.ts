import { generateProductId, getProductImage } from "@/lib/utils"

export type SizeOptionBase = {
  id: string
  name: string
  price: number
  sizeInfo?: string // New field to explain size codes
}

export type SizeOption =
  | (SizeOptionBase & {
      inStock: boolean
      instockDomestic?: boolean
      instockInternational?: boolean
    })
  | (SizeOptionBase & {
      instockDomestic: boolean
      instockInternational: boolean
      inStock?: boolean
    })

export type SubscriptionOption = {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  intervalCount: number
  description?: string
}

export type Product = {
  id: string
  name: string
  category: string
  // Replace single categorySlug with an array of category slugs
  categorySlug: string // Kept for backward compatibility
  categoryIds: string[] // New field for multiple categories
  description: string
  price: number // Base price (lowest price option)
  sizeOptions?: SizeOption[] // New field for size options
  subscriptionOptions?: SubscriptionOption[] // New field for subscription options
  image: string
  quantity: string
  chemicalName?: string
  casNumber?: string
  concentration?: string
  featured?: boolean
  new?: boolean
  bestSeller?: boolean
  purity?: string
  storage?: string
  halfLife?: string
  molecularFormula?: string
  molecularWeight?: string
  relatedProducts?: string[]
  sizeInfo?: string // New field to explain size codes for products
}

export const categories = [
  {
    id: "peptides-skin",
    name: "Clinical Skincare",
    description: "Serums, creams, and treatments for barrier repair and glow",
    image: "/images/skin-pixlr.webp",
  },
  {
    id: "health-wellness",
    name: "Beauty Supplements",
    description: "Daily essentials for hydration, collagen, and radiance",
    image: "/images/deals.png",
  },
  {
    id: "metabolic-longevity",
    name: "Longevity & Vitality",
    description: "Antioxidant and adaptogenic support for long-term glow",
    image: "/images/weight-pixlr.webp",
  },
  {
    id: "sleep-recovery",
    name: "Sleep & Recovery",
    description: "Evening rituals to support deep rest and overnight renewal",
    image: "/images/bulk-bundle-products.png",
  },
  {
    id: "specialized-compounds",
    name: "Targeted Treatments",
    description: "SPF, scalp, and on-the-go protective care",
    image: "/images/vials-sub-inject.png",
  },
  {
    id: "coenzymes",
    name: "Cellular Energy",
    description: "Coenzymes and NAD+ support for resilient skin",
    image: "/images/sarms-tablet-products.webp",
  },
  {
    id: "weight-management",
    name: "Metabolic Balance",
    description: "Gentle support for steady energy and balance",
    image: "/images/muscle-pixlr.webp",
  },
  {
    id: "dermatologics",
    name: "Dermatology Care",
    description: "Professional-grade topical support for sensitive skin",
    image: "/images/gel.png",
  },
]

export const products: Product[] = [
  
  {
    id: generateProductId("Radiance Collagen"),
    name: "Radiance Collagen – Marine Peptides + Vitamin C",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "A daily collagen blend designed to support elasticity, glow, and hydration from within. Formulated with marine collagen peptides, vitamin C, and hyaluronic acid for a luminous finish.",
    price: 58.0,
    sizeOptions: [
      { id: "rc30", name: "30 Servings", price: 58.0, inStock: true },
      { id: "rc60", name: "60 Servings", price: 96.0, inStock: true },
    ],
    subscriptionOptions: [
      { id: "rc30-monthly", name: "30 Servings Monthly", price: 52.2, interval: "month", intervalCount: 1, description: "Monthly collagen ritual" },
      { id: "rc60-monthly", name: "60 Servings Monthly", price: 86.4, interval: "month", intervalCount: 1, description: "60-serving monthly ritual" },
    ],
    image: getProductImage("health-wellness"),
    quantity: "30 servings",
    chemicalName: "Hydrolyzed marine collagen + L-ascorbic acid",
    casNumber: "N/A",
    concentration: "10 g peptides + 120 mg vitamin C",
    purity: "Clinical-grade blend",
    storage: "Store in a cool, dry place",
    halfLife: "N/A",
    molecularFormula: "Blend",
    molecularWeight: "Varies",
    featured: true,
    relatedProducts: ["marine-hyaluronic", "glow-electrolytes", "biotin-zinc-complex"],
  },
  {
    id: generateProductId("Barrier Repair Serum"),
    name: "Barrier Repair Serum – Ceramide + Niacinamide",
    category: "Peptides for skin health and tissue regeneration",
    categorySlug: "peptides-skin",
    categoryIds: ["peptides-skin"],
    description:
      "A silky, fast-absorbing serum that reinforces the skin barrier with ceramides, niacinamide, and panthenol for calm, even tone.",
    price: 68.0,
    sizeOptions: [
      { id: "br30", name: "30 mL", price: 68.0, inStock: true },
      { id: "br50", name: "50 mL", price: 92.0, inStock: true },
    ],
    image: getProductImage("peptides-skin"),
    quantity: "30 mL",
    chemicalName: "Niacinamide 5% + ceramide complex",
    casNumber: "98-92-0",
    concentration: "5% niacinamide",
    purity: "Dermatology-grade",
    storage: "Store below 25°C, away from direct light",
    halfLife: "N/A",
    molecularFormula: "C₆H₆N₂O",
    molecularWeight: "122.12 g/mol",
    relatedProducts: ["hydra-balance-tonic", "renewal-serum", "eye-revival-gel"],
  },
  {
    id: generateProductId("Hydra Balance Tonic"),
    name: "Hydra Balance Tonic – Hyaluronic + Mineral",
    category: "Peptides for skin health and tissue regeneration",
    categorySlug: "peptides-skin",
    categoryIds: ["peptides-skin"],
    description:
      "A weightless hydrating tonic that floods skin with multi-weight hyaluronic acid and mineral electrolytes for lasting bounce.",
    price: 54.0,
    sizeOptions: [
      { id: "hb100", name: "100 mL", price: 54.0, inStock: true },
      { id: "hb150", name: "150 mL", price: 72.0, inStock: true },
    ],
    image: getProductImage("peptides-skin"),
    quantity: "100 mL",
    chemicalName: "Sodium hyaluronate",
    casNumber: "9067-32-7",
    concentration: "1.2% multi-weight HA",
    purity: "Cosmetic-grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "(C₁₄H₂₁NO₁₁)ₙ",
    molecularWeight: "Variable",
    relatedProducts: ["barrier-repair-serum", "luminous-skin-complex", "radiant-oil"],
  },
  {
    id: generateProductId("Vitamin C Brightening Ampoule"),
    name: "Vitamin C Brightening Ampoule – 15% L-Ascorbic",
    category: "Peptides for skin health and tissue regeneration",
    categorySlug: "peptides-skin",
    categoryIds: ["peptides-skin"],
    description:
      "A fresh, concentrated ampoule that targets dullness and uneven tone for a clearer, brighter finish.",
    price: 62.0,
    sizeOptions: [
      { id: "vc15", name: "15 mL", price: 62.0, inStock: true },
      { id: "vc30", name: "30 mL", price: 88.0, inStock: true },
    ],
    image: getProductImage("peptides-skin"),
    quantity: "15 mL",
    chemicalName: "L-ascorbic acid",
    casNumber: "50-81-7",
    concentration: "15%",
    purity: "Stabilized",
    storage: "Store refrigerated after opening",
    halfLife: "N/A",
    molecularFormula: "C₆H₈O₆",
    molecularWeight: "176.12 g/mol",
    relatedProducts: ["renewal-serum", "barrier-repair-serum", "radiant-oil"],
  },
  {
    id: generateProductId("Renewal Serum"),
    name: "Renewal Serum – Bakuchiol Night Repair",
    category: "Peptides for skin health and tissue regeneration",
    categorySlug: "peptides-skin",
    categoryIds: ["peptides-skin"],
    description:
      "A gentle, retinol-alternative night serum with bakuchiol and peptides to smooth texture and soften lines.",
    price: 70.0,
    sizeOptions: [
      { id: "rn30", name: "30 mL", price: 70.0, inStock: true },
      { id: "rn50", name: "50 mL", price: 96.0, inStock: true },
    ],
    image: getProductImage("peptides-skin"),
    quantity: "30 mL",
    chemicalName: "Bakuchiol",
    casNumber: "10309-37-2",
    concentration: "1.2%",
    purity: "Cosmetic-grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₁₈H₂₄O",
    molecularWeight: "256.38 g/mol",
    relatedProducts: ["vitamin-c-brightening-ampoule", "barrier-repair-serum", "eye-revival-gel"],
  },
  {
    id: generateProductId("Radiant Oil"),
    name: "Radiant Oil – Squalane + Omega",
    category: "Peptides for skin health and tissue regeneration",
    categorySlug: "peptides-skin",
    categoryIds: ["peptides-skin"],
    description:
      "A featherlight facial oil with plant squalane and omega-rich lipids to seal in moisture and amplify glow.",
    price: 58.0,
    sizeOptions: [
      { id: "ro30", name: "30 mL", price: 58.0, inStock: true },
      { id: "ro50", name: "50 mL", price: 78.0, inStock: true },
    ],
    image: getProductImage("peptides-skin"),
    quantity: "30 mL",
    chemicalName: "Squalane",
    casNumber: "111-01-3",
    concentration: "100% squalane blend",
    purity: "Cosmetic-grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₃₀H₆₂",
    molecularWeight: "422.81 g/mol",
    relatedProducts: ["hydra-balance-tonic", "barrier-repair-serum", "vitamin-c-brightening-ampoule"],
  },
  {
    id: generateProductId("Eye Revival Gel"),
    name: "Eye Revival Gel – Peptide + Caffeine",
    category: "Peptides for skin health and tissue regeneration",
    categorySlug: "peptides-skin",
    categoryIds: ["peptides-skin"],
    description:
      "A cooling gel that targets puffiness and fine lines with caffeine, peptides, and botanical actives.",
    price: 48.0,
    sizeOptions: [
      { id: "er15", name: "15 mL", price: 48.0, inStock: true },
    ],
    image: getProductImage("peptides-skin"),
    quantity: "15 mL",
    chemicalName: "Caffeine",
    casNumber: "58-08-2",
    concentration: "1%",
    purity: "Cosmetic-grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₈H₁₀N₄O₂",
    molecularWeight: "194.19 g/mol",
    relatedProducts: ["renewal-serum", "barrier-repair-serum", "radiant-oil"],
  },
  {
    id: generateProductId("Ceramide Cloud Cream"),
    name: "Ceramide Cloud Cream – Barrier Moisturiser",
    category: "Peptides for skin health and tissue regeneration",
    categorySlug: "peptides-skin",
    categoryIds: ["peptides-skin"],
    description:
      "A plush, breathable cream that locks in hydration and reinforces the lipid barrier for all-day softness.",
    price: 64.0,
    sizeOptions: [
      { id: "cc50", name: "50 mL", price: 64.0, inStock: true },
      { id: "cc75", name: "75 mL", price: 82.0, inStock: true },
    ],
    image: getProductImage("peptides-skin"),
    quantity: "50 mL",
    chemicalName: "Ceramide NP",
    casNumber: "100403-19-8",
    concentration: "2% ceramide complex",
    purity: "Cosmetic-grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₃₄H₆₉NO₃",
    molecularWeight: "539.92 g/mol",
    relatedProducts: ["barrier-repair-serum", "hydra-balance-tonic", "renewal-serum"],
  },
  {
    id: generateProductId("Glow Defense SPF Mist"),
    name: "Glow Defense SPF Mist – Broad Spectrum 50",
    category: "Specialized compounds",
    categorySlug: "specialized-compounds",
    categoryIds: ["specialized-compounds"],
    description:
      "An ultra-fine SPF mist that layers over skincare and makeup with a soft, dewy finish.",
    price: 46.0,
    sizeOptions: [
      { id: "spf75", name: "75 mL", price: 46.0, inStock: true },
    ],
    image: getProductImage("specialized-compounds"),
    quantity: "75 mL",
    chemicalName: "Octocrylene + Zinc Oxide",
    casNumber: "6197-30-4",
    concentration: "SPF 50",
    purity: "Dermatology-grade",
    storage: "Store below 30°C",
    halfLife: "N/A",
    molecularFormula: "C₂₄H₂₇NO₂",
    molecularWeight: "361.48 g/mol",
    relatedProducts: ["ceramide-cloud-cream", "vitamin-c-brightening-ampoule"],
  },
  {
    id: generateProductId("Luminous Skin Complex"),
    name: "Luminous Skin Complex – Astaxanthin + CoQ10",
    category: "Metabolic & longevity support",
    categorySlug: "metabolic-longevity",
    categoryIds: ["metabolic-longevity"],
    description:
      "A daily antioxidant complex that supports skin clarity, tone, and resilience from within.",
    price: 62.0,
    sizeOptions: [
      { id: "ls30", name: "30 Capsules", price: 62.0, inStock: true },
      { id: "ls60", name: "60 Capsules", price: 96.0, inStock: true },
    ],
    image: getProductImage("metabolic-longevity"),
    quantity: "30 capsules",
    chemicalName: "Astaxanthin + Coenzyme Q10",
    casNumber: "472-61-7",
    concentration: "8 mg astaxanthin + 100 mg CoQ10",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₄₀H₅₂O₄",
    molecularWeight: "596.84 g/mol",
    bestSeller: true,
    relatedProducts: ["radiance-collagen", "omega-glow-capsules", "biotin-zinc-complex"],
  },
  {
    id: generateProductId("Marine Hyaluronic"),
    name: "Marine Hyaluronic – Hydration Capsules",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "Hydration capsules with marine-sourced hyaluronic acid and silica to support plump, supple skin.",
    price: 44.0,
    sizeOptions: [
      { id: "mh30", name: "30 Capsules", price: 44.0, inStock: true },
      { id: "mh90", name: "90 Capsules", price: 98.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "30 capsules",
    chemicalName: "Sodium hyaluronate",
    casNumber: "9067-32-7",
    concentration: "120 mg",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "(C₁₄H₂₁NO₁₁)ₙ",
    molecularWeight: "Variable",
    relatedProducts: ["radiance-collagen", "luminous-skin-complex", "glow-electrolytes"],
  },
  {
    id: generateProductId("Gut-Skin Support"),
    name: "Gut-Skin Support – Probiotic + Prebiotic",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "A synbiotic blend with clinically studied strains to support digestion and clear-looking skin.",
    price: 52.0,
    sizeOptions: [
      { id: "gs30", name: "30 Capsules", price: 52.0, inStock: true },
      { id: "gs60", name: "60 Capsules", price: 84.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "30 capsules",
    chemicalName: "Lactobacillus blend",
    casNumber: "N/A",
    concentration: "10B CFU",
    purity: "Clinically formulated",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "Probiotic culture",
    molecularWeight: "N/A",
    relatedProducts: ["luminous-skin-complex", "radiance-collagen", "biotin-zinc-complex"],
  },
  {
    id: generateProductId("Biotin Zinc Complex"),
    name: "Biotin + Zinc Complex – Hair & Nail",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "A daily complex supporting stronger hair, nails, and skin clarity with biotin, zinc, and copper.",
    price: 38.0,
    sizeOptions: [
      { id: "bz60", name: "60 Capsules", price: 38.0, inStock: true },
      { id: "bz120", name: "120 Capsules", price: 64.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "60 capsules",
    chemicalName: "Biotin + zinc gluconate",
    casNumber: "58-85-5",
    concentration: "5000 mcg biotin + 15 mg zinc",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₁₀H₁₆N₂O₃S",
    molecularWeight: "244.31 g/mol",
    relatedProducts: ["radiance-collagen", "omega-glow-capsules", "luminous-skin-complex"],
  },
  {
    id: generateProductId("Omega Glow Capsules"),
    name: "Omega Glow Capsules – EPA/DHA",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "High-purity omega oils to support barrier health and a calm, luminous complexion.",
    price: 48.0,
    sizeOptions: [
      { id: "og60", name: "60 Softgels", price: 48.0, inStock: true },
      { id: "og120", name: "120 Softgels", price: 78.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "60 softgels",
    chemicalName: "Eicosapentaenoic acid",
    casNumber: "10417-94-4",
    concentration: "600 mg EPA/DHA",
    purity: "IFOS certified",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₂₀H₃₀O₂",
    molecularWeight: "302.45 g/mol",
    relatedProducts: ["luminous-skin-complex", "biotin-zinc-complex", "radiance-collagen"],
  },
  {
    id: generateProductId("Calm Magnesium"),
    name: "Calm Magnesium – Glycinate Powder",
    category: "Sleep & recovery",
    categorySlug: "sleep-recovery",
    categoryIds: ["sleep-recovery"],
    description:
      "A soothing magnesium blend to support restful sleep, stress balance, and recovery.",
    price: 42.0,
    sizeOptions: [
      { id: "mg30", name: "30 Servings", price: 42.0, inStock: true },
      { id: "mg60", name: "60 Servings", price: 68.0, inStock: true },
    ],
    image: getProductImage("sleep-recovery"),
    quantity: "30 servings",
    chemicalName: "Magnesium bisglycinate",
    casNumber: "14281-85-7",
    concentration: "200 mg magnesium",
    purity: "Chelated",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₄H₈MgN₂O₄",
    molecularWeight: "172.42 g/mol",
    relatedProducts: ["night-repair-capsules", "glow-electrolytes", "adaptogenic-calm"],
  },
  {
    id: generateProductId("Night Repair Capsules"),
    name: "Night Repair Capsules – Sleep + Skin",
    category: "Sleep & recovery",
    categorySlug: "sleep-recovery",
    categoryIds: ["sleep-recovery"],
    description:
      "A gentle evening formula with L-theanine, magnesium, and botanical extracts to support deep rest and overnight renewal.",
    price: 48.0,
    sizeOptions: [
      { id: "nr30", name: "30 Capsules", price: 48.0, inStock: true },
      { id: "nr60", name: "60 Capsules", price: 78.0, inStock: true },
    ],
    image: getProductImage("sleep-recovery"),
    quantity: "30 capsules",
    chemicalName: "L-theanine + magnesium blend",
    casNumber: "3081-61-6",
    concentration: "200 mg L-theanine",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₇H₁₄N₂O₃",
    molecularWeight: "174.20 g/mol",
    relatedProducts: ["calm-magnesium", "adaptogenic-calm", "glow-electrolytes"],
  },
  {
    id: generateProductId("Glow Electrolytes"),
    name: "Glow Electrolytes – Hydration Powder",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "Mineral hydration with sodium, potassium, and magnesium to keep skin hydrated and energy steady.",
    price: 36.0,
    sizeOptions: [
      { id: "ge20", name: "20 Servings", price: 36.0, inStock: true },
      { id: "ge40", name: "40 Servings", price: 58.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "20 servings",
    chemicalName: "Electrolyte mineral blend",
    casNumber: "N/A",
    concentration: "Sodium 300 mg + Potassium 200 mg",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "Blend",
    molecularWeight: "Varies",
    relatedProducts: ["radiance-collagen", "marine-hyaluronic", "calm-magnesium"],
  },
  {
    id: generateProductId("Adaptogenic Calm"),
    name: "Adaptogenic Calm – Ashwagandha + Rhodiola",
    category: "Metabolic & longevity support",
    categorySlug: "metabolic-longevity",
    categoryIds: ["metabolic-longevity"],
    description:
      "A focused adaptogenic blend designed to balance stress and support overall vitality.",
    price: 46.0,
    sizeOptions: [
      { id: "ac60", name: "60 Capsules", price: 46.0, inStock: true },
      { id: "ac120", name: "120 Capsules", price: 78.0, inStock: true },
    ],
    image: getProductImage("metabolic-longevity"),
    quantity: "60 capsules",
    chemicalName: "Withania somnifera extract",
    casNumber: "90147-43-6",
    concentration: "600 mg extract",
    purity: "Standardized 5% withanolides",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₂₈H₃₈O₆",
    molecularWeight: "470.60 g/mol",
    relatedProducts: ["calm-magnesium", "night-repair-capsules", "luminous-skin-complex"],
  },
  {
    id: generateProductId("NAD+ Cellular Recharge"),
    name: "NAD+ Cellular Recharge – Nicotinamide Riboside",
    category: "Coenzymes for cellular metabolism",
    categorySlug: "coenzymes",
    categoryIds: ["coenzymes"],
    description:
      "A daily NR complex designed to support cellular energy, vitality, and skin resilience.",
    price: 72.0,
    sizeOptions: [
      { id: "nr30", name: "30 Capsules", price: 72.0, inStock: true },
      { id: "nr60", name: "60 Capsules", price: 118.0, inStock: true },
    ],
    image: getProductImage("coenzymes"),
    quantity: "30 capsules",
    chemicalName: "Nicotinamide riboside chloride",
    casNumber: "23111-00-4",
    concentration: "300 mg NR",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₁₁H₁₅ClN₂O₅",
    molecularWeight: "290.70 g/mol",
    relatedProducts: ["luminous-skin-complex", "adaptogenic-calm", "radiance-collagen"],
  },
  {
    id: generateProductId("Metabolic Balance Blend"),
    name: "Metabolic Balance Blend – Chromium + Berberine",
    category: "Weight management support",
    categorySlug: "weight-management",
    categoryIds: ["weight-management"],
    description:
      "A gentle metabolic blend to support steady energy and balanced appetite as part of a holistic routine.",
    price: 58.0,
    sizeOptions: [
      { id: "mb30", name: "30 Capsules", price: 58.0, inStock: true },
      { id: "mb60", name: "60 Capsules", price: 94.0, inStock: true },
    ],
    image: getProductImage("weight-management"),
    quantity: "30 capsules",
    chemicalName: "Berberine HCl",
    casNumber: "633-65-8",
    concentration: "500 mg berberine",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₂₀H₁₈ClNO₄",
    molecularWeight: "371.82 g/mol",
    relatedProducts: ["glow-electrolytes", "adaptogenic-calm", "luminous-skin-complex"],
  },
  {
    id: generateProductId("Daily Glow Sachets"),
    name: "Daily Glow Sachets – Collagen + Mineral",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "Single-serve sachets with collagen peptides, silica, and vitamin C for daily glow support.",
    price: 32.0,
    sizeOptions: [
      { id: "dg14", name: "14 Sachets", price: 32.0, inStock: true },
      { id: "dg28", name: "28 Sachets", price: 52.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "14 sachets",
    chemicalName: "Hydrolyzed collagen peptides",
    casNumber: "N/A",
    concentration: "8 g collagen per sachet",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "Blend",
    molecularWeight: "Varies",
    relatedProducts: ["radiance-collagen", "marine-hyaluronic", "glow-electrolytes"],
  },
  {
    id: generateProductId("Scalp Renewal Serum"),
    name: "Scalp Renewal Serum – Peptide + Caffeine",
    category: "Specialized compounds",
    categorySlug: "specialized-compounds",
    categoryIds: ["specialized-compounds"],
    description:
      "A scalp-focused serum with peptides and caffeine to support a healthier-looking scalp and stronger hair.",
    price: 66.0,
    sizeOptions: [
      { id: "sr50", name: "50 mL", price: 66.0, inStock: true },
    ],
    image: getProductImage("specialized-compounds"),
    quantity: "50 mL",
    chemicalName: "Copper peptide complex",
    casNumber: "49557-75-7",
    concentration: "0.2% peptide complex",
    purity: "Cosmetic-grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₁₄H₂₄CuN₆O₄",
    molecularWeight: "403.93 g/mol",
    relatedProducts: ["biotin-zinc-complex", "radiant-oil", "barrier-repair-serum"],
  },
  {
    id: generateProductId("Skin Barrier Gummies"),
    name: "Skin Barrier Gummies – Ceramide + Vitamin D",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "Soft gummies with ceramides, vitamin D, and zinc to support the skin barrier and glow.",
    price: 34.0,
    sizeOptions: [
      { id: "sg60", name: "60 Gummies", price: 34.0, inStock: true },
      { id: "sg120", name: "120 Gummies", price: 58.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "60 gummies",
    chemicalName: "Ceramide NP",
    casNumber: "100403-19-8",
    concentration: "30 mg ceramide",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₃₄H₆₉NO₃",
    molecularWeight: "539.92 g/mol",
    relatedProducts: ["biotin-zinc-complex", "radiance-collagen", "luminous-skin-complex"],
  },
  {
    id: generateProductId("Blue Light Defense Mist"),
    name: "Blue Light Defense Mist – Antioxidant Shield",
    category: "Specialized compounds",
    categorySlug: "specialized-compounds",
    categoryIds: ["specialized-compounds"],
    description:
      "An antioxidant-rich mist to refresh and protect skin from environmental stressors throughout the day.",
    price: 42.0,
    sizeOptions: [
      { id: "bl100", name: "100 mL", price: 42.0, inStock: true },
    ],
    image: getProductImage("specialized-compounds"),
    quantity: "100 mL",
    chemicalName: "Resveratrol + green tea",
    casNumber: "501-36-0",
    concentration: "0.5% antioxidant complex",
    purity: "Cosmetic-grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₁₄H₁₂O₃",
    molecularWeight: "228.25 g/mol",
    relatedProducts: ["vitamin-c-brightening-ampoule", "ceramide-cloud-cream"],
  },
  {
    id: generateProductId("Radiance Matcha Latte"),
    name: "Radiance Matcha Latte – Collagen + L-Theanine",
    category: "Health & wellness essentials",
    categorySlug: "health-wellness",
    categoryIds: ["health-wellness"],
    description:
      "A creamy matcha blend with collagen peptides and L-theanine to support calm energy and skin glow.",
    price: 38.0,
    sizeOptions: [
      { id: "rm15", name: "15 Servings", price: 38.0, inStock: true },
      { id: "rm30", name: "30 Servings", price: 58.0, inStock: true },
    ],
    image: getProductImage("health-wellness"),
    quantity: "15 servings",
    chemicalName: "L-theanine",
    casNumber: "3081-61-6",
    concentration: "100 mg L-theanine",
    purity: "Nutraceutical grade",
    storage: "Store below 25°C",
    halfLife: "N/A",
    molecularFormula: "C₇H₁₄N₂O₃",
    molecularWeight: "174.20 g/mol",
    relatedProducts: ["radiance-collagen", "calm-magnesium", "night-repair-capsules"],
  },

  // --- END AUTO-INSERTED OILS & TABLETS ---
// END OF NEW PRODUCTS
]

/**
 * Get products by category slug
 * Updated to support multiple categories
 */
export function getProductsByCategory(categorySlug: string): Product[] {
  // Log for debugging
  console.log(`Getting products for category: ${categorySlug}`)

  // Filter products that match the category slug in their categoryIds array
  const filteredProducts = products.filter((product) => {
    // Check if the product has the category in its categoryIds array
    return product.categoryIds.some((id) => id.toLowerCase() === categorySlug.toLowerCase())
  })

  // Log the number of products found
  console.log(`Found ${filteredProducts.length} products in category ${categorySlug}`)

  return filteredProducts
}

// Other utility functions remain unchanged
export function getProductById(id: string) {
  return products.find((product) => product.id === id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured)
}

export function getNewProducts(): Product[] {
  return products.filter((product) => product.new)
}

export function getBestSellerProducts(): Product[] {
  return products.filter((product) => product.bestSeller)
}

export function getRelatedProducts(productId: string): Product[] {
  const product = getProductById(productId)
  if (!product || !product.relatedProducts || product.relatedProducts.length === 0) {
    return []
  }

  return products.filter((p) => product.relatedProducts?.includes(p.id))
}

export function searchProducts(query: string): Product[] {
  const searchTerm = query.toLowerCase().trim()
  if (!searchTerm) return []

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.chemicalName && product.chemicalName.toLowerCase().includes(searchTerm)) ||
      (product.casNumber && product.casNumber.toLowerCase().includes(searchTerm)),
  )
}

export function getSpecificProductImage(product: Product): string {
  // For Bacteriostatic Water
  if (product.id === "bacteriostatic-water") {
    return "/images/bacterial_water.webp"
  }

  // For products that include two products in one (deals)
  if (product.name.includes("+") || (product.description && product.description.includes("combination"))) {
    return "/images/deals.png"
  }

  // For products with multiple (2+) products (bundles)
  if (product.id === "anabolic" || product.id === "glow" || product.categorySlug === "peptide-stacks") {
    return "/images/bulk-bundle-products.png"
  }

  // For SARMs and other orally digested products
  if (product.categorySlug === "sarms" || product.categorySlug === "aromatase-inhibitors") {
    return "/images/sarms-tablet-products.webp"
  }

  // For products that use vials and/or require subcutaneous injection
  if (
    product.categorySlug === "peptides-muscle" ||
    product.categorySlug === "peptides-skin" ||
    product.categorySlug === "growth-hormone" ||
    product.categorySlug === "weight-management" ||
    product.categorySlug === "coenzymes"
  ) {
    return "/images/vials-sub-inject.png"
  }

  // Default to category image
  return getProductImage(product.categorySlug)
}

// Helper functions for size options
export function normalizeSizeOption(option: SizeOption): SizeOption {
  const instockDomestic = (option as any).instockDomestic ?? false
  const instockInternational = (option as any).instockInternational ?? true
  const inStock = instockDomestic || instockInternational

  return {
    ...(option as any),
    instockDomestic,
    instockInternational,
    inStock,
  }
}

const DOMESTIC_IN_STOCK_PRODUCT_IDS = new Set<string>([
  // GLP-1s
  generateProductId("Retatrutide"),
  generateProductId("Tirzepatide"),
  generateProductId("Semaglutide"),
  generateProductId("Cagrilintide"),

  // Growth hormone (excluding Tesamorelin)
  generateProductId("HGH 191AA"),
  generateProductId("HGH Fragment 176-191"),
  generateProductId("CJC-1295"),
  generateProductId("Ipamorelin"),

  // Other
  generateProductId("ghkcu"),
  generateProductId("GLOW"),
  generateProductId("Melanotan 2 - Tanning Peptide"),
  generateProductId("IGF-1 LR3"),
  generateProductId("Selank - Anxiolytic Nootropic Peptide"),
  generateProductId("Semax - Nootropic Peptide"),
])

export function normalizeSizeOptionForProduct(product: Product, option: SizeOption): SizeOption {
  const normalized = normalizeSizeOption(option) as any
  if (DOMESTIC_IN_STOCK_PRODUCT_IDS.has(product.id)) {
    normalized.instockDomestic = true
    normalized.inStock = !!normalized.instockDomestic || !!normalized.instockInternational
  }
  return normalized
}

export function getDefaultSizeOption(product: Product): SizeOption | undefined {
  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return undefined
  }
  return normalizeSizeOptionForProduct(product, product.sizeOptions[0])
}

export function getSizeOptionById(product: Product, sizeId: string): SizeOption | undefined {
  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return undefined
  }
  const found = product.sizeOptions.find((option) => option.id === sizeId)
  return found ? normalizeSizeOptionForProduct(product, found) : undefined
}

/**
 * Get all categories for a product
 * New helper function to get category names for a product
 */
export function getProductCategories(product: Product): string[] {
  return product.categoryIds
    .map((categoryId) => {
      const category = categories.find((cat) => cat.id === categoryId)
      return category ? category.name : ""
    })
    .filter(Boolean)
}

/**
 * Get largest size option for a product
 */
export function getLargestSizeOption(product: Product): SizeOption | undefined {
  if (!product.sizeOptions || product.sizeOptions.length === 0) {
    return undefined
  }
  // Return the size option with the highest price (assuming larger = more expensive)
  return product.sizeOptions.reduce((largest, current) => 
    current.price > largest.price ? current : largest
  )
}

/**
 * Get all product names for AI matching
 */
export function getAllProductNames(): { name: string; id: string; aliases: string[] }[] {
  return products.map(product => ({
    name: product.name,
    id: product.id,
    aliases: [
      product.chemicalName || '',
      product.name.toLowerCase(),
      // Extract common peptide abbreviations
      ...extractPeptideAbbreviations(product.name)
    ].filter(Boolean)
  }))
}

function extractPeptideAbbreviations(name: string): string[] {
  const abbreviations: string[] = []
  
  // Common peptide patterns
  const patterns = [
    /([A-Z]{2,}-\d+)/g, // RAD-140, MK-677, etc.
    /([A-Z]{3,}\d*)/g,  // BPC157, CJC1295, etc.
    /\b([A-Z]{2,})\b/g  // HGH, IGF, etc.
  ]
  
  patterns.forEach(pattern => {
    const matches = name.match(pattern)
    if (matches) {
      abbreviations.push(...matches)
    }
  })
  
  return abbreviations
}

/**
 * Helper function to generate size information for product codes
 */
export function generateSizeInfo(productName: string, sizeCode: string, concentration?: string): string {
  // Extract product abbreviation from size code
  const match = sizeCode.match(/^([A-Z]+)(\d+)/)
  if (!match) return sizeCode
  
  const [, code, amount] = match
  
  // Common product code mappings
  const codeMap: Record<string, string> = {
    'RT': 'Retatrutide',
    'TZ': 'Tirzepatide', 
    'SZ': 'Semaglutide',
    'CJC': 'CJC-1295',
    'HGH': 'HGH',
    'BPC': 'BPC-157',
    'TB': 'TB-500',
    'GHK': 'GHK-Cu',
    'RAD': 'RAD-140',
    'MK': 'MK-677',
    'YK': 'YK-11',
    'OST': 'Ostarine',
    'AND': 'Andarine'
  }
  
  const productFullName = codeMap[code] || code
  return `${code} = ${productFullName} ${amount}mg`
}
