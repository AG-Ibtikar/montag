# Montag - User Story Generator

A Next.js application for generating and managing user stories with Firebase integration.

## Features

- Generate user stories with customizable parameters
- Save and manage stories in Firebase
- Real-time updates and offline support
- User authentication
- Story search and filtering
- Batch operations support
- Pagination for large datasets

## Tech Stack

- Next.js 14
- TypeScript
- Firebase (Authentication, Firestore)
- Tailwind CSS
- Lucide Icons

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Git

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/montag.git
cd montag
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project
2. Enable Authentication and Firestore
3. Set up Firestore security rules
4. Add your Firebase configuration to `.env.local`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 