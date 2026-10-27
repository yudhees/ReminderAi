# ReminderAi (Reminza) - Repository Overview

## 🎯 Purpose
An AI-powered reminder application that lets users create reminders through natural language chat. The app uses AI to parse user input and extract reminder details like time and task description.

## 🛠 Tech Stack

### Frontend
- **Framework**: Nuxt 4 (Vue 3)
- **Styling**: TailwindCSS
- **State Management**: Pinia
- **PWA**: @vite-pwa/nuxt (offline support, installable as app)
- **UI Components**: Custom Vue components with Tippy.js for tooltips
- **Utilities**: VueUse, Lodash, Moment.js (timezone handling)

### Backend
- **Server**: Nuxt server routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth with Google OAuth (@sidebase/nuxt-auth)

### AI/LLM
- **Framework**: LangChain with LangGraph
- **Provider**: Groq API (using openai/gpt-oss-20b model)
- **Checkpointing**: MongoDB-based state persistence for agent conversations
- **Schema Validation**: Zod for structured outputs

### Notifications
- **Push Notifications**: Web Push API with VAPID keys
- **Email**: Gmail SMTP via Nodemailer
- **Scheduling**: Vercel cron jobs (runs every minute)

### Deployment
- **Platform**: Vercel
- **Cron**: Vercel cron jobs for automatic reminder checking

## 📁 Project Structure

```
ReminderAi/
├── app/                          # Frontend code
│   ├── pages/                    # Vue pages (index, dashboard, profile, chat)
│   ├── components/               # Reusable Vue components
│   ├── stores/                   # Pinia stores
│   ├── composables/              # Vue composables
│   └── assets/                   # CSS, images, fonts
├── server/                       # Backend code
│   ├── api/                      # API endpoints
│   │   ├── chat/                 # Chat interactions
│   │   ├── cron/                 # Cron job for reminders
│   │   ├── push/                 # Push notification endpoints
│   │   └── user/                 # User management
│   ├── models/                   # MongoDB schemas
│   │   ├── users.ts              # User model with preferences
│   │   ├── ChatSession.ts        # Reminder sessions
│   │   ├── ChatHistory.ts        # Chat messages
│   │   └── CheckPoints.ts        # LangGraph checkpointing
│   ├── service/                  # Business logic
│   │   ├── AgentService.ts       # LangChain AI agent
│   │   ├── ChatService.ts        # Chat interaction logic
│   │   ├── EmailService.ts       # Email sending
│   │   └── PromptService.ts      # AI prompts
│   └── utils/                    # Utilities (push notifications, etc.)
├── public/                       # Static assets, service worker
└── nuxt.config.ts               # Nuxt configuration
```

## 🔄 How It Works

### 1. User Flow
1. User signs in with Google OAuth
2. User types a natural language reminder (e.g., "Remind me to call mom at 5pm")
3. AI agent (LangChain + Groq) parses the input and extracts:
   - Task description (heading)
   - Reminder time
   - Timezone
4. Reminder is saved to MongoDB with UTC timestamp
5. User can view all reminders in dashboard

### 2. Notification System
- **Cron Job**: Runs every minute via Vercel cron (`/api/cron/check-reminders`)
- Checks for reminders where `remind_time <= now` and `notification_sent = false`
- Sends notifications based on user preferences:
  - Push notification (if `push_notification = true`)
  - Email (if `email_reminders = true`)
- Marks reminder as sent to prevent duplicates

### 3. AI Agent
- Uses LangChain with LangGraph for stateful conversations
- Checkpointing with MongoDB preserves conversation context
- Returns structured response with:
  - `isValidPrompt`: Whether input is a valid reminder
  - `textForChatResponse`: AI response text
  - `heading`: Extracted task description
  - `exact_remind_time`: Parsed reminder time

## 🎨 Key Features

✅ **Natural Language Processing**: Create reminders by chatting naturally
✅ **Multi-Device Support**: Push notifications to all devices
✅ **Email Reminders**: Gmail SMTP integration
✅ **User Preferences**: Toggle push/email, sound alerts, language settings
✅ **Timezone Support**: Automatic timezone conversion
✅ **PWA**: Installable as mobile/desktop app
✅ **Real-time Chat**: Streaming AI responses
✅ **Reminder History**: View all past reminders

## 📊 Database Models

### User Model
- `name`, `email`, `provider` (auth info)
- `push_notification`, `email_reminders`, `sound_alerts` (preferences)
- `default_daily_reminders_in_mins`, `ai_input_language`
- Index on `email` for fast lookups

### ChatSession Model
- `heading`: Reminder title
- `remind_time`: UTC timestamp
- `timezone`: User's timezone
- `userId`: User reference
- `notification_sent`, `notification_sent_at`, `notification_sent_via`
- Composite index on `userId` and `remind_time`

## ⚠️ Known Issues

**Auth Library Compatibility**: There's a version conflict between:
- `@sidebase/nuxt-auth@0.9.4`
- `next-auth@4.21.1`
- `@auth/core@0.34.3`

This may cause startup errors. Solutions are documented in DEPLOYMENT_NOTES.md.

## 🔐 Environment Variables Required

- `NUXT_MONGOOSE_URI`: MongoDB connection string
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `AUTH_SECRET`, `AUTH_ORIGIN`: Auth configuration
- `GROQ_API_KEY`: AI model access
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`: Push notifications
- `GMAIL_EMAIL`, `GMAIL_APP_PASSWORD`: Email sending
- `CRON_SECRET`: Optional cron job security

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs on `http://localhost:3000` in development.

## 📝 Key Files to Explore

- `server/service/AgentService.ts` - AI agent implementation
- `server/service/ChatService.ts` - Chat interaction logic
- `server/api/cron/check-reminders.ts` - Cron job for notifications
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation docs
- `DEPLOYMENT_NOTES.md` - Deployment guide

## 📦 Dependencies

### Main Dependencies
- nuxt: ^4.4.8
- vue: ^3.5.35
- @langchain/core, @langchain/groq, @langchain/langgraph
- mongodb: ^7.5.0
- @google/genai: ^2.10.0
- @sidebase/nuxt-auth: ^0.9.4
- @nuxtjs/tailwindcss: ^6.14.0
- @vite-pwa/nuxt: ^1.1.1
- web-push: ^3.6.7
- axios: ^1.15.2
- moment, moment-timezone
- zod: ^4.4.3

## 🌐 API Endpoints

### Chat
- `POST /api/chat/streamChat` - Send message to AI agent
- `POST /api/chat/loadChatSessions` - Load user's chat sessions
- `POST /api/chat/loadChats` - Load chat history for a session
- `PUT /api/chat/[chatId]` - Update chat session
- `DELETE /api/chat/[chatId]` - Delete chat session

### Notifications
- `POST /api/push/subscribe` - Subscribe to push notifications
- `POST /api/push/unsubscribe` - Unsubscribe from push notifications

### Cron
- `GET /api/cron/check-reminders` - Check and send due reminders (Vercel cron)

### Test Endpoints
- `POST /api/test-email` - Test email sending
- `POST /api/test-cron` - Manually trigger reminder notification

## 🔧 Configuration Files

- `nuxt.config.ts` - Nuxt framework configuration
- `vercel.json` - Vercel deployment and cron configuration
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template

## 📚 Additional Documentation

- `README.md` - Basic Nuxt starter documentation
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation of email/push/cron features
- `DEPLOYMENT_NOTES.md` - Deployment instructions and troubleshooting

## 🎯 Current Status

The application is fully functional with:
- ✅ AI-powered natural language reminder creation
- ✅ Push notification system
- ✅ Email reminder system
- ✅ Vercel cron job for automatic reminder checking
- ✅ User preferences management
- ⚠️ Known auth library compatibility issue (see DEPLOYMENT_NOTES.md)
