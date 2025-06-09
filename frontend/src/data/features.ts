export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface FeatureCategory {
  id: string;
  title: string;
  description: string;
  features: Feature[];
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'User authentication and authorization features',
    features: [
      {
        id: 'user-registration',
        title: 'User Registration',
        description: 'Allow users to create new accounts with email and password',
        category: 'authentication'
      },
      {
        id: 'user-login',
        title: 'User Login',
        description: 'Allow users to log in with email and password',
        category: 'authentication'
      },
      {
        id: 'password-reset',
        title: 'Password Reset',
        description: 'Allow users to reset their password via email',
        category: 'authentication'
      },
      {
        id: 'social-auth',
        title: 'Social Authentication',
        description: 'Allow users to authenticate using social providers (Google, GitHub, etc.)',
        category: 'authentication'
      }
    ]
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'User profile and account management features',
    features: [
      {
        id: 'profile-management',
        title: 'Profile Management',
        description: 'Allow users to view and edit their profile information',
        category: 'user-management'
      },
      {
        id: 'account-settings',
        title: 'Account Settings',
        description: 'Allow users to manage their account settings and preferences',
        category: 'user-management'
      },
      {
        id: 'email-preferences',
        title: 'Email Preferences',
        description: 'Allow users to manage their email notification preferences',
        category: 'user-management'
      }
    ]
  },
  {
    id: 'content-management',
    title: 'Content Management',
    description: 'Content creation and management features',
    features: [
      {
        id: 'story-creation',
        title: 'Story Creation',
        description: 'Allow users to create and edit user stories',
        category: 'content-management'
      },
      {
        id: 'story-templates',
        title: 'Story Templates',
        description: 'Provide templates for different types of user stories',
        category: 'content-management'
      },
      {
        id: 'story-export',
        title: 'Story Export',
        description: 'Allow users to export stories in different formats',
        category: 'content-management'
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Team collaboration and sharing features',
    features: [
      {
        id: 'team-management',
        title: 'Team Management',
        description: 'Allow users to create and manage teams',
        category: 'collaboration'
      },
      {
        id: 'story-sharing',
        title: 'Story Sharing',
        description: 'Allow users to share stories with team members',
        category: 'collaboration'
      },
      {
        id: 'comments',
        title: 'Comments',
        description: 'Allow users to comment on stories',
        category: 'collaboration'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Usage and performance analytics features',
    features: [
      {
        id: 'usage-stats',
        title: 'Usage Statistics',
        description: 'Track and display usage statistics',
        category: 'analytics'
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics',
        description: 'Track and display performance metrics',
        category: 'analytics'
      },
      {
        id: 'export-reports',
        title: 'Export Reports',
        description: 'Allow users to export analytics reports',
        category: 'analytics'
      }
    ]
  }
]; 