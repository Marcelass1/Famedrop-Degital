# FameDrop Digital 🚀

FameDrop Digital is a sleek, modern, and high-converting e-commerce storefront designed specifically for the digital software licensing niche in Morocco. It offers a fully functional frontend shopping experience with cart management and seamless checkout integration via WhatsApp.

## ✨ Features

- **Modern UI/UX:** Built with a clean, professional "corporate blue and crisp white" aesthetic to inspire trust.
- **Lightning Fast:** 100% Vanilla HTML, CSS, and JavaScript. No heavy frameworks means zero load time and instant interactions.
- **Fully Responsive:** Perfectly optimized for mobile, tablet, and desktop views.
- **Dynamic Shopping Cart:** Persistent cart state using `localStorage`. Users can add multiple products, adjust quantities, and checkout simultaneously.
- **Moroccan Payment Integration:** Pre-configured with localized Moroccan payment instructions:
  - Virement Bancaire (Attijariwafa, CIH)
  - Cash Plus / Wafa Cash
- **WhatsApp Checkout Flow:** Instead of a complex backend payment gateway, the checkout form generates a beautifully formatted WhatsApp message containing the order reference, customer details, exact products, total price, and selected payment method, sending it directly to the business owner.
- **Localized "Social Proof":** Authentic reviews styled in Moroccan French/Darija for maximum local conversion rates.

## 🛠️ Technology Stack

- **HTML5:** Semantic structure with accessible modal dialogs and forms.
- **CSS3:** Custom CSS variables, flexbox/grid layouts, smooth transitions, and glassmorphism effects.
- **Vanilla JavaScript:** Event delegation, DOM manipulation, state management, and WhatsApp URL encoding.
- **Phosphor Icons:** Premium, consistent iconography throughout the design.
- **Google Fonts:** Inter & Plus Jakarta Sans for high legibility and modern typography.

## ⚙️ How to Customize

The storefront is designed to be easily configurable without touching complex code. All main configurations are at the top of `js/script.js`.

### 1. Update Contact & Bank Info
Open `js/script.js` and modify the config block at the very top:

```javascript
// -- Config --
const WHATSAPP_NUMBER = '212649831937'; // Your business WhatsApp number (include country code, no '+')
const STORE_EMAIL     = 'support@famedrop.online'; // Your support email

// -- Bank Details --
const BANK_INFO = {
  owner : 'M ISMAIL DRIOUCH',
  bank  : 'Attijariwafa Bank',
  rib   : '007 480 0000402300401019 02',
  swift : 'BCMAMAMC',
  ville : 'Meknes (480)'
};
```

### 2. Add or Edit Products
To add a new product or change pricing, simply edit the HTML product cards in `index.html`. The JavaScript automatically reads the data attributes:

```html
<div class="product-card" 
     data-cat="windows"                     <!-- Category filter -->
     data-name="Windows 11 Pro"             <!-- Product Name -->
     data-price="129"                       <!-- Price in DH -->
     data-desc="Lifetime License &middot; 1 PC"> <!-- Short Description -->
    <!-- Card content here -->
</div>
```

## 🚀 Deployment

Since this project consists entirely of static files (HTML, CSS, JS), it can be hosted for **free** on almost any static hosting platform.

### Deploying to GitHub Pages
1. Push this repository to GitHub.
2. Go to your repository **Settings** > **Pages**.
3. Under "Build and deployment", set the **Source** to `Deploy from a branch`.
4. Select the `main` branch and `/root` folder, then click **Save**.
5. Your site will be live in a few minutes!

### Deploying to Vercel or Netlify
1. Create a free account on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Click **New Project** and import your GitHub repository.
3. Leave the build settings blank (as it's a static site).
4. Click **Deploy**.

## 📝 License

Copyright &copy; 2026 FameDrop Digital. All Rights Reserved.
