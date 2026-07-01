# ecomwebsite
# StyleHub 🛍️

**A Multi-Seller E-Commerce Clothing Marketplace with AI-Powered Shopping Features**

StyleHub is a full-stack marketplace platform where multiple independent sellers list and manage their own clothing products, customers shop across all of them in one place, and a platform admin oversees seller approvals, orders, categories, and disputes — modeled after real marketplaces like Etsy or Daraz rather than a single-vendor store.

---

## ✨ Features

### 👤 Customer
- Browse products by category (Men, Women, Kids) with search and filters (size, color, price, sort)
- Product detail pages with image gallery, size/color selection, reviews & ratings
- Shopping cart, wishlist, and order checkout (Cash on Delivery or Online payment selection)
- Order tracking with delivery status and estimated delivery time
- Returns & refunds request flow for delivered orders
- Loyalty points — earn on every order, redeemable at checkout
- Community Fashion Feed — share outfit photos, tag products, like and comment
- AI Outfit Stylist — get outfit pairing suggestions for any product
- Smart Size Predictor — get a size recommendation from your measurements
- AI Chatbot — ask about sizing, orders, or styling, available site-wide
- Visual Search — upload a photo and find similar items in the catalog

### 🏪 Seller Panel
- Apply to sell (requires admin approval before going live)
- Dashboard with product, order, and revenue stats
- Add/edit/delete products with multi-image upload
- Restock alerts — automatically emails customers waiting on out-of-stock items
- Order management with status updates and printable shipping address labels
- Shop profile management

### 🛠️ Admin Panel
- Platform-wide dashboard with revenue chart and key stats
- Approve or reject seller applications
- Manage customers (including banning)
- Oversee all orders platform-wide
- Manage categories and discount coupons
- Review and resolve return/refund requests
- Cross-seller inventory overview

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router v6, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcryptjs |
| Image Storage | Cloudinary |
| AI Features | Anthropic Claude API (`claude-sonnet-4-6`) |
| Email | Nodemailer (Gmail SMTP) |
| Notifications | react-hot-toast |
| Icons | react-icons (Feather) |
| File Uploads | Multer (backend), FormData (frontend) |

---

## 📁 Project Structure

```
stylehub/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Navbar, Footer, ProductCard, ChatBot, etc.
│       ├── pages/           # Home, Products, Cart, Checkout, etc.
│       │   ├── seller/      # Seller panel pages
│       │   └── admin/       # Admin panel pages
│       ├── context/         # Auth, Cart, Wishlist global state
│       ├── services/        # API call functions
│       ├── App.jsx
│       └── index.js
│
└── server/                 # Node.js backend
    ├── models/              # Mongoose schemas (15 collections)
    ├── routes/              # Express route handlers
    ├── middleware/           # JWT auth, role guards
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS version)
- A [MongoDB Atlas](https://mongodb.com/atlas) account (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- An [Anthropic API key](https://console.anthropic.com)
- A Gmail account with an App Password (for restock email alerts)

### 1. Clone or download the project
```bash
git clone <your-repo-url>
cd stylehub
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file inside `server/` with:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ANTHROPIC_API_KEY=your_anthropic_key
```

Run the backend:
```bash
node server.js
```
You should see:
```
MongoDB Connected ✅
Server running on port 5000 ✅
```

### 3. Frontend setup
```bash
cd ../client
npm install
```

Create a `.env` file inside `client/` with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Run the frontend:
```bash
npm start
```
Opens automatically at `http://localhost:3000`

---

## 🔑 Creating Your First Admin Account

There is no public sign-up for admin accounts (by design, for security). To create one:

1. Register a normal account at `/register`
2. Open MongoDB Compass, connect to your Atlas cluster
3. In the `users` collection, find your account and change `role` from `"customer"` to `"admin"`
4. Log out and log back in on the site
5. Your name dropdown (top-right) will now show **Admin panel**

---

## 🌐 Deployment

| Part | Recommended host |
|---|---|
| Frontend (React) | GitHub Pages (static hosting) |
| Backend (Node/Express) | Render |
| Database | MongoDB Atlas |
| Images | Cloudinary |

> GitHub Pages only serves static files, so the frontend must point `REACT_APP_API_URL` to your deployed backend URL on Render before running `npm run build`.

```bash
# Inside client/
npm run build
npm run deploy
```

---

## ⚠️ Known Limitations

- No real payment gateway integration — "Online Payment" is a selectable option but not connected to a processor like Stripe
- AI Try-On was planned but not implemented (requires a paid third-party API)
- Recommendation engine is category-similarity based, not full collaborative filtering

## 🔭 Future Scope

- Real payment gateway integration
- AI Try-On using a virtual fitting API
- Personalized recommendation engine using collected user activity data
- Real-time chat between buyers and sellers
- Push notifications
- Multi-language support

---

## 📄 License

This project was built for educational/internship purposes.
