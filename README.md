<div align="center">
  <img src="https://raw.githubusercontent.com/MohammedMateenuddin/FOODFLOW/master/public/logo.png" alt="FoodFlow Logo" width="100" height="100" />
  <h1>FoodFlow</h1>
  <p><strong>Save Food. Feed Hope.</strong></p>
  <p>The intelligent logistics backbone connecting restaurant surplus with NGOs in real-time. Eliminating waste, one meal at a time.</p>
  
  [![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://foodflow-fawn.vercel.app)
  [![Built with Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Powered by Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Styled with Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

<br />

## 🌍 Live Demo
**👉 [https://foodflow-fawn.vercel.app](https://foodflow-fawn.vercel.app)**

## 📖 About The Project

Food waste and food insecurity are massive global challenges. FoodFlow bridges this gap by acting as a real-time, smart logistics engine. It instantly connects businesses with surplus food (like restaurants, hotels, and grocery stores) to the NGOs, orphanages, and shelters that need it most, while coordinating drivers for immediate pickup and delivery.

### 🌟 Key Features

*   **⚡ Real-Time Matching Algorithm**: Instantly pairs food donations with the nearest NGOs that have the capacity to accept them.
*   **🚗 Smart Driver Routing**: Automatically alerts and assigns drivers based on proximity and vehicle capacity.
*   **♻️ Zero-Waste Valorization Engine**: If food is no longer fit for human consumption, the system automatically redirects it to composting facilities, biogas plants, or animal farms.
*   **📊 Corporate Social Responsibility (CSR) Dashboard**: Generates automated impact reports tracking CO2 emissions saved, meals delivered, and water footprint reduced for corporate donors.
*   **🔐 Seamless Authentication**: Role-based access control (Donor, Receiver, Driver, Admin, Valorization Partner) using Google OAuth and Supabase Auth.
*   **📡 Live Tracking**: Interactive maps and realtime database updates for live order tracking and logistics.

## 🛠️ Technology Stack

*   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
*   **Backend / Database**: Supabase (PostgreSQL), Supabase Realtime, Supabase Auth
*   **UI Components**: Lucide React (Icons), Lottie-React (Animations)
*   **Deployment**: Vercel

## 🚀 Getting Started Locally

To run this project on your local machine:

### 1. Clone the repository
```bash
git clone https://github.com/MohammedMateenuddin/FOODFLOW.git
cd foodflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is licensed under the MIT License.
