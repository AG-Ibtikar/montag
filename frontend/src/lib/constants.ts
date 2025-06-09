export const FEATURE_CATEGORIES = [
  {
    id: 'auth',
    title: '🔐 Authentication & User Management',
    features: [
      { id: 'auth-register', title: 'User Registration / Login', description: 'Email/password registration with validation' },
      { id: 'auth-forgot', title: 'Forgot Password Flow', description: 'Secure password reset with email verification' },
      { id: 'auth-social', title: 'Social Login', description: 'Login with Google, Facebook, and Apple' },
      { id: 'auth-2fa', title: 'Multi-factor Authentication', description: '2FA using SMS or authenticator app' },
      { id: 'auth-rbac', title: 'Role-Based Access Control', description: 'User roles and permissions management' },
      { id: 'auth-invite', title: 'Invite Team Members', description: 'Team member invitation system' },
      { id: 'auth-profile', title: 'Profile Management', description: 'User profile and settings management' }
    ]
  },
  {
    id: 'notifications',
    title: '📢 Communication & Notifications',
    features: [
      { id: 'notif-inapp', title: 'In-App Notifications', description: 'Real-time in-app notification system' },
      { id: 'notif-email', title: 'Email Notifications', description: 'Automated email notifications' },
      { id: 'notif-push', title: 'Push Notifications', description: 'Mobile push notifications' },
      { id: 'notif-sms', title: 'SMS Alerts', description: 'SMS notifications via Twilio' },
      { id: 'notif-preferences', title: 'Notification Preferences', description: 'User notification settings' }
    ]
  },
  {
    id: 'payment',
    title: '💳 Payments & E-commerce',
    features: [
      { id: 'payment-stripe', title: 'Stripe Integration', description: 'Secure payment processing with Stripe' },
      { id: 'payment-paypal', title: 'PayPal Integration', description: 'PayPal payment processing' },
      { id: 'payment-wallet', title: 'Apple Pay / Google Pay', description: 'Mobile wallet integration' },
      { id: 'payment-subscription', title: 'Subscriptions & Plans', description: 'Recurring billing and subscription management' },
      { id: 'payment-invoice', title: 'Invoicing System', description: 'Automated invoice generation' },
      { id: 'payment-promo', title: 'Promo Code Engine', description: 'Discount and promotion system' }
    ]
  },
  {
    id: 'storage',
    title: '📦 Storage & File Management',
    features: [
      { id: 'storage-upload', title: 'File Upload', description: 'Upload images, PDFs, and other files' },
      { id: 'storage-compress', title: 'Image Compression', description: 'Automatic image optimization' },
      { id: 'storage-version', title: 'File Versioning', description: 'File version control system' },
      { id: 'storage-cloud', title: 'Cloud Storage', description: 'Integration with AWS S3 or Firebase Storage' },
      { id: 'storage-gallery', title: 'Media Gallery', description: 'Organized media management' }
    ]
  },
  {
    id: 'location',
    title: '🗺️ Location & Mapping',
    features: [
      { id: 'location-maps', title: 'Google Maps Integration', description: 'Interactive maps and location services' },
      { id: 'location-track', title: 'Location Tracking', description: 'Real-time location tracking' },
      { id: 'location-autofill', title: 'Address Autofill', description: 'Smart address suggestions' },
      { id: 'location-geofence', title: 'Geofencing', description: 'Location-based triggers and alerts' }
    ]
  },
  {
    id: 'search',
    title: '🔎 Search & Filtering',
    features: [
      { id: 'search-global', title: 'Global Search', description: 'Site-wide search functionality' },
      { id: 'search-filters', title: 'Advanced Filters', description: 'Category, tag, and date filtering' },
      { id: 'search-sort', title: 'Smart Sorting', description: 'Sort by relevance, date, or price' }
    ]
  },
  {
    id: 'analytics',
    title: '📈 Analytics & Reporting',
    features: [
      { id: 'analytics-dashboard', title: 'Dashboard Analytics', description: 'Interactive analytics widgets' },
      { id: 'analytics-export', title: 'Report Export', description: 'Export to CSV and PDF' },
      { id: 'analytics-google', title: 'Google Analytics', description: 'Integration with Google Analytics' },
      { id: 'analytics-kpi', title: 'Custom KPIs', description: 'Custom key performance indicators' }
    ]
  },
  {
    id: 'integrations',
    title: '🔗 Popular App Integrations',
    features: [
      { id: 'integ-slack', title: 'Slack Integration', description: 'Send notifications to Slack' },
      { id: 'integ-trello', title: 'Trello/Jira Sync', description: 'Task synchronization' },
      { id: 'integ-firebase', title: 'Firebase Integration', description: 'Auth, DB, and notifications' },
      { id: 'integ-zoom', title: 'Zoom Integration', description: 'Schedule and join meetings' },
      { id: 'integ-calendar', title: 'Google Calendar', description: 'Event synchronization' },
      { id: 'integ-crm', title: 'CRM Integration', description: 'Sync with Hubspot/Salesforce' },
      { id: 'integ-email', title: 'Email Service', description: 'Integration with SendGrid/Mailchimp' }
    ]
  },
  {
    id: 'ai',
    title: '🧠 AI-Driven Features',
    features: [
      { id: 'ai-suggest', title: 'Smart Suggestions', description: 'AI-powered content suggestions' },
      { id: 'ai-generate', title: 'Text Generation', description: 'OpenAI-powered text generation' },
      { id: 'ai-tag', title: 'Auto-Tagging', description: 'Automatic content categorization' },
      { id: 'ai-chatbot', title: 'Chatbot', description: 'AI-powered customer support' },
      { id: 'ai-sentiment', title: 'Sentiment Analysis', description: 'Content sentiment detection' }
    ]
  },
  {
    id: 'team',
    title: '👨‍💼 Team & Collaboration',
    features: [
      { id: 'team-tasks', title: 'Task Assignment', description: 'Assign and track tasks' },
      { id: 'team-comments', title: 'Comment Threads', description: 'Collaborative discussions' },
      { id: 'team-collab', title: 'Real-Time Collaboration', description: 'Live collaboration features' },
      { id: 'team-activity', title: 'Activity Log', description: 'Track team activities' }
    ]
  },
  {
    id: 'security',
    title: '🔐 Security Features',
    features: [
      { id: 'security-audit', title: 'Audit Logs', description: 'Comprehensive activity logging' },
      { id: 'security-ip', title: 'IP Whitelisting', description: 'Restrict access by IP' },
      { id: 'security-encrypt', title: 'Data Encryption', description: 'End-to-end encryption' },
      { id: 'security-gdpr', title: 'GDPR Compliance', description: 'Data privacy management' }
    ]
  },
  {
    id: 'settings',
    title: '⚙️ Settings & Config',
    features: [
      { id: 'settings-feature', title: 'Feature Toggles', description: 'Manage feature flags' },
      { id: 'settings-env', title: 'Environment Switching', description: 'Dev, staging, and prod environments' },
      { id: 'settings-i18n', title: 'Language Localization', description: 'Multi-language support' },
      { id: 'settings-theme', title: 'Dark Mode', description: 'Theme customization' }
    ]
  }
]; 