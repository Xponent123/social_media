# Social Media App

A full-stack social media application built using **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **MongoDB**.  

## 🌟 Features

- User authentication and authorization (NextAuth.js)
- Create, read, update, and delete (CRUD) posts
- Follow/unfollow functionality
- Like and comment on posts
- Responsive UI built with Tailwind CSS
- API routes with full-stack logic using Next.js

## 🚀 Tech Stack

### Frontend:
- [Next.js 14](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend:
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [NextAuth.js](https://next-auth.js.org/)

## ⚙️ Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB database (local or hosted)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Xponent123/social_media.git
   cd social_media
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory and add:

   ```env
   MONGODB_URL=
   CLERK_SECRET_KEY=
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=
   NEXT_CLERK_WEBHOOK_SECRET=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

   
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### 🗂️ Project Structure

```
├── components           # Reusable UI components
├── constants            # Static values used throughout the app
├── lib                  # Utility functions and configurations
├── models               # Mongoose models
├── pages                # Next.js pages and API routes
├── public               # Public assets
├── styles               # Tailwind and global styles
├── .env.local           # Environment variables
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project metadata and scripts
```


> Inspired by [JavaScript Mastery](https://www.youtube.com/@javascriptmastery). Watch the full video [here](https://www.youtube.com/watch?v=O5cmLDVTgAs).
