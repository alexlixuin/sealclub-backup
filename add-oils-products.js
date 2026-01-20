const fs = require('fs');
const path = require('path');

// Read the oils_tabs.json file
const oilsData = JSON.parse(fs.readFileSync('oils_tabs.json', 'utf8'));

// Helper function to parse price string to number
function parsePrice(priceString) {
  return parseFloat(priceString.replace('$', ''));
}

// Helper function to clean product name
function cleanProductName(name) {
  return name
    .replace(/\(/g, ' (')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to generate description
function generateDescription(name, quantity) {
  const cleanName = cleanProductName(name);
  return `${cleanName} - ${quantity} for research purposes only. This compound is designed for laboratory testing and scientific research applications.`;
}

// Helper function to determine category based on product type
function determineCategory(name, quantity) {
  const lowerName = name.toLowerCase();
  const lowerQuantity = quantity.toLowerCase();
  
  // Check if it's tablets/oral
  if (lowerQuantity.includes('tablets') || lowerQuantity.includes('pcs')) {
    // SARMs
    if (lowerName.includes('lgd') || lowerName.includes('mk-677') || lowerName.includes('sr9009') || 
        lowerName.includes('rad140') || lowerName.includes('ostarine') || lowerName.includes('andarine') ||
        lowerName.includes('cardarine') || lowerName.includes('yk11') || lowerName.includes('aicar')) {
      return {
        category: "SARMs",
        categorySlug: "sarms",
        categoryIds: ["sarms"]
      };
    }
    
    // Weight management peptides
    if (lowerName.includes('semaglutide') || lowerName.includes('tirzepatide') || 
        lowerName.includes('5-amino-1mq') || lowerName.includes('slu-pp-332') ||
        lowerName.includes('bam15') || lowerName.includes('orforglipron')) {
      return {
        category: "Weight Management",
        categorySlug: "weight-management", 
        categoryIds: ["weight-management"]
      };
    }
    
    // Recovery peptides
    if (lowerName.includes('bpc') || lowerName.includes('kpv') || lowerName.includes('dihexa')) {
      return {
        category: "Recovery & Healing",
        categorySlug: "recovery-healing",
        categoryIds: ["recovery-healing"]
      };
    }
    
    // Aromatase inhibitors and PCT
    if (lowerName.includes('clomid') || lowerName.includes('letrazole') || lowerName.includes('tamoxifen') ||
        lowerName.includes('aromasin') || lowerName.includes('anastrozole') || lowerName.includes('cabergoline') ||
        lowerName.includes('enclomiphene')) {
      return {
        category: "Aromatase Inhibitors",
        categorySlug: "aromatase-inhibitors",
        categoryIds: ["aromatase-inhibitors"]
      };
    }
    
    // Default to Anabolic Androgenic Steroids for oral steroids
    return {
      category: "Anabolic Androgenic Steroids",
      categorySlug: "aas",
      categoryIds: ["aas"]
    };
  }
  
  // Injectable oils - default to Anabolic Androgenic Steroids
  return {
    category: "Anabolic Androgenic Steroids", 
    categorySlug: "aas",
    categoryIds: ["aas"]
  };
}

// Generate products array (as strings that fit directly into products.ts array)
const productEntries = oilsData.map(item => {
  const price1 = parsePrice(item.price_1vial);
  const price10 = parsePrice(item.price_10vials_plus);
  const categoryInfo = determineCategory(item.name, item.quantity);
  const isAvailable = item.status === "available" || item.status === "avaliable";
  const concentration = item.quantity.includes(' x ') ? item.quantity.split(' x ')[1] : item.quantity;

  return (
`  {
    id: generateProductId("${item.code}"),
    name: "${cleanProductName(item.name)}",
    category: "${categoryInfo.category}",
    categorySlug: "${categoryInfo.categorySlug}",
    categoryIds: ["${categoryInfo.categoryIds.join('", "')}"] ,
    description: "${generateDescription(item.name, item.quantity)}",
    price: ${price1},
    sizeOptions: [
      { id: "single", name: "Single Vial", price: ${price1}, inStock: ${isAvailable} },
      { id: "bulk-10", name: "Bulk (10+ Vials)", price: ${price10}, inStock: ${isAvailable}, sizeInfo: "Minimum quantity: 10 vials, price per vial: $${price10}" }
    ],
    image: getProductImage("hormones-regulators"),
    quantity: "${item.quantity}",
    concentration: "${concentration}",
    purity: "≥98% (HPLC)",
    storage: "Store in a cool, dry place, protected from light"
  },\n`
  );
});

// Programmatically insert into lib/products.ts just BEFORE the '// END OF NEW PRODUCTS' marker
const productsTsPath = path.join('lib', 'products.ts');
let productsTs = fs.readFileSync(productsTsPath, 'utf8');

const primaryMarker = '// NEW OILS-TABLETS';
const endMarker = '// END OF NEW PRODUCTS';
const headerTag = '// --- AUTO-INSERTED OILS & TABLETS (Generated) ---';
const footerTag = '// --- END AUTO-INSERTED OILS & TABLETS ---';

// 1) Remove any previously auto-inserted block between our header/footer tags (to make re-runs clean)
const prevStart = productsTs.indexOf(headerTag);
const prevEnd = productsTs.indexOf(footerTag);
if (prevStart !== -1 && prevEnd !== -1) {
  const afterFooterNl = productsTs.indexOf('\n', prevEnd);
  const cutEnd = afterFooterNl === -1 ? prevEnd + footerTag.length : afterFooterNl + 1;
  productsTs = productsTs.slice(0, prevStart) + productsTs.slice(cutEnd);
  console.log('Previous auto-inserted block removed.');
}

// 2) Find insertion position: always place just BEFORE endMarker to stay inside products array
const endIdx = productsTs.indexOf(endMarker);
if (endIdx === -1) {
  console.error(`Marker '${endMarker}' not found in ${productsTsPath}. Aborting.`);
  process.exit(1);
}
const insertPos = endIdx; // insert right before the end marker line

// 3) Backup original (post-clean) file
const backupPath = productsTsPath + '.bak';
fs.writeFileSync(backupPath, productsTs, 'utf8');

// 4) Build insertion block
const header = `  ${headerTag}\n`;
const body = productEntries.join('');
const footer = `  ${footerTag}\n`;
const insertion = header + body + footer;

// 5) Insert and write back
const updated = productsTs.slice(0, insertPos) + insertion + productsTs.slice(insertPos);
fs.writeFileSync(productsTsPath, updated, 'utf8');

console.log(`Inserted ${productEntries.length} products into ${productsTsPath} before marker '${endMarker}'.`);
console.log(`Backup created at ${backupPath}`);
console.log('Done.');
