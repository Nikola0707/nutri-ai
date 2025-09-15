# 🥗 NutriAI - Elevate Your Nutrition. Simplify Your Meal Planning.

> **AI-powered nutrition platform that provides personalized meal recommendations, smart grocery lists, and comprehensive nutrition tracking to help you achieve your health goals.**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0+-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Features

### 🧠 AI-Powered Nutrition

- **Personalized Meal Planning**: AI-generated meal plans based on your health goals, dietary restrictions, and preferences
- **Smart Recipe Recommendations**: Discover recipes tailored to your nutritional needs and taste preferences
- **Nutrition Coaching**: AI chat assistant for personalized nutrition advice and guidance

### 📊 Comprehensive Tracking

- **Daily Nutrition Logging**: Track calories, macros, and micronutrients with intuitive logging tools
- **Progress Monitoring**: Visual charts and analytics to track your health journey
- **Goal Setting**: Set and monitor nutrition targets, weight goals, and fitness objectives

### 🛒 Smart Grocery Management

- **Auto-Generated Lists**: Grocery lists automatically created from your meal plans
- **Shopping Organization**: Categorized lists with smart grouping and prioritization
- **Budget Tracking**: Monitor spending and optimize your grocery shopping

### 🍽️ Recipe Management

- **Recipe Database**: Browse and save recipes with detailed nutritional information
- **Custom Recipes**: Create and share your own recipes with the community
- **Meal Prep Planning**: Plan and organize your weekly meal preparation

### 📱 Modern User Experience

- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Intuitive Navigation**: Clean, modern interface with bottom navigation
- **Real-time Updates**: Live data synchronization across all devices

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod validation

### Backend

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase REST API + Edge Functions
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS)

### Development Tools

- **Package Manager**: pnpm
- **Linting**: Next.js ESLint
- **Type Checking**: TypeScript
- **Database Migrations**: SQL scripts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/Nikola0707/nutriai.git
cd nutriai
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** to get your project credentials
3. Create `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For production
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the database setup scripts in order:
   - `scripts/01-create-tables.sql` - Core database schema
   - `scripts/02-add-chat-table.sql` - Chat functionality
   - `scripts/03-create-recipes-tables.sql` - Recipe management
   - `scripts/04-create-meal-plan-tables.sql` - Enhanced meal planning

### 5. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 📁 Project Structure

```
nutriai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # AI chat endpoints
│   │   └── meal-plans/    # Meal plan management
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── sign-up/       # Registration page
│   │   └── callback/      # Auth callback
│   ├── dashboard/         # Main application (protected)
│   │   ├── chat/          # AI nutrition coach
│   │   ├── meal-plans/    # Meal planning interface
│   │   ├── recipes/       # Recipe browser
│   │   ├── grocery-lists/ # Shopping list management
│   │   ├── progress/      # Progress tracking
│   │   └── settings/      # User preferences
│   ├── onboarding/        # User setup flow
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix UI)
│   ├── chat-interface.tsx
│   ├── meal-plan-creator.tsx
│   ├── recipe-card.tsx
│   └── ...
├── lib/                   # Core utilities
│   ├── supabase/         # Supabase configuration
│   ├── store.ts          # Zustand state management
│   ├── providers.tsx     # React Query provider
│   └── utils.ts          # Utility functions
├── scripts/              # Database migration scripts
│   ├── 01-create-tables.sql
│   ├── 02-add-chat-table.sql
│   ├── 03-create-recipes-tables.sql
│   └── 04-create-meal-plan-tables.sql
└── public/               # Static assets
```

## 🗄️ Database Schema

### Core Tables

- **`profiles`** - User profiles extending Supabase auth
- **`user_preferences`** - Dietary restrictions, goals, and targets
- **`meal_plans`** - User meal plans with nutrition targets
- **`meals`** - Individual meals within plans
- **`recipes`** - Recipe database with nutritional data
- **`grocery_lists`** - Shopping lists
- **`nutrition_logs`** - Daily food tracking
- **`progress_tracking`** - Weight and body metrics

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - users can only access their own data
- **Automatic profile creation** via database triggers
- **Secure API endpoints** with authentication

## 🔐 Security

### Authentication

- **Supabase Auth** for user management
- **JWT tokens** for session management
- **Automatic token refresh** and session handling
- **Protected routes** with middleware

### Data Protection

- **Row Level Security (RLS)** policies
- **User data isolation** at database level
- **Secure API endpoints** with proper validation
- **Environment variable protection**

## 🧪 Testing

### Database Security Test

```sql
-- Test RLS policies
SELECT
  'Total profiles:' as test,
  COUNT(*) as count
FROM profiles;

-- Should only show current user's data
SELECT * FROM profiles;
```

### Authentication Test

1. Create test users in Supabase Auth
2. Verify profile creation via triggers
3. Test protected route access
4. Verify data isolation between users

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service platform
- **Next.js** team for the excellent React framework
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Vercel** for seamless deployment and hosting

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/Nikola0707/nutriai/wiki)
- **Issues**: [GitHub Issues](https://github.com/Nikola0707/nutriai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Nikola0707/nutriai/discussions)

## 🎯 Roadmap

- [ ] **Mobile App** - React Native version
- [ ] **Social Features** - Share meal plans and recipes
- [ ] **Advanced Analytics** - Detailed nutrition insights
- [ ] **Meal Prep Integration** - Batch cooking planning
- [ ] **Restaurant Integration** - Find healthy options nearby
- [ ] **Wearable Integration** - Sync with fitness trackers
- [ ] **Family Planning** - Multi-user household management

---

**Built with ❤️ for better nutrition and healthier living**
