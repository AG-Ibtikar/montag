'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Copy, Download, FileSpreadsheet, Building2, User2, Mail, Lock, LogOut, Check, Save, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { auth, saveStory, StoryConfig } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface CustomFormData {
  focus: string;
  tone: string;
  format: string;
  length: string;
  industry: string;
  companySize: string;
  role: string;
  experience: string;
}

interface Story {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  negativeScenarios: string[];
  testCases?: {
    positive: string[];
    negative: string[];
  };
  platform: string;
  phase: string;
  asA?: string;
  iWantTo?: string;
  soThat?: string;
}

interface GenerateStoriesResponse {
  stories: Story[];
}

interface ApiError {
  message: string;
  status?: number;
}

const FEATURE_CATEGORIES = [
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

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[]>(['Web']);
  const [productPhase, setProductPhase] = useState<string[]>(['Design']);
  const [storyStyle, setStoryStyle] = useState('Scrum');
  const [acStyle, setAcStyle] = useState('Given-When-Then');
  const [includeTestCases, setIncludeTestCases] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<GenerateStoriesResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState<CustomFormData>({
    focus: 'User Experience',
    tone: 'Professional',
    format: 'Detailed',
    length: 'Short',
    industry: 'Technology',
    companySize: 'Startup',
    role: 'Product Manager',
    experience: 'Intermediate'
  });
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/sign-in');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      const newSelectedFeatures = prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId];
      
      // Update notes with selected features
      const selectedFeatureDescriptions = FEATURE_CATEGORIES
        .flatMap(category => category.features)
        .filter(feature => newSelectedFeatures.includes(feature.id))
        .map(feature => `- ${feature.title}: ${feature.description}`)
        .join('\n');

      // Keep any existing custom notes
      const customNotes = notes.split('\n\nSelected Features:')[0].trim();
      setNotes(customNotes + (newSelectedFeatures.length > 0 ? `\n\nSelected Features:\n${selectedFeatureDescriptions}` : ''));
      
      return newSelectedFeatures;
    });
  };

  const filteredFeatures = selectedCategory
    ? FEATURE_CATEGORIES.find(cat => cat.id === selectedCategory)?.features || []
    : FEATURE_CATEGORIES.flatMap(cat => cat.features);

  const searchFilteredFeatures = searchQuery
    ? filteredFeatures.filter(feature => 
        feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredFeatures;

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleProductPhase = (phase: string) => {
    setProductPhase(prev => 
      prev.includes(phase)
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    setIsGenerating(true);

    try {
      // Validate user authentication
      if (!user) {
        throw new Error('Please sign in to generate stories');
      }

      // Validate notes
      if (!notes.trim()) {
        throw new Error('Please add some feature notes before generating stories');
      }

      // Validate selected features
      if (selectedFeatures.length === 0) {
        throw new Error('Please select at least one feature');
      }

      // Simulate story generation
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          selectedFeatures,
          platforms,
          productPhase,
          storyStyle,
          acStyle,
          includeTestCases,
          // Include advanced config fields only if they are set
          ...(formData.focus && { focus: formData.focus }),
          ...(formData.tone && { tone: formData.tone }),
          ...(formData.format && { format: formData.format }),
          ...(formData.length && { length: formData.length })
        }),
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate story');
      }

      if (!data.story) {
        throw new Error('No story was generated');
      }

      setGeneratedStory(data.story);
    } catch (error) {
      console.error('Error generating story:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate story';
      setError({
        message: errorMessage,
        status: errorMessage.includes('quota') ? 429 : 500
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStory = async () => {
    if (!generatedStory) return;
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      if (!user) {
        throw new Error('Please sign in to save stories');
      }

      // Create a title based on the role and industry
      const title = `${formData.focus}`;

      // Save the story to Firestore
      const storyId = await saveStory({
        title,
        content: generatedStory,
        config: formData,
        userId: user.uid,
        status: 'completed'
      });

      setSaveSuccess(true);
      
      // Redirect to the story details page after a short delay
      setTimeout(() => {
        router.push(`/stories/${storyId}`);
      }, 2000);
    } catch (error) {
      console.error('Error saving story:', error);
      setError({
        message: error instanceof Error ? error.message : 'Failed to save story',
        status: 500
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (!generatedStory) return;
      
      await navigator.clipboard.writeText(generatedStory);
      toast.success('Story copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadAsText = () => {
    if (!generatedStory) return;

    const blob = new Blob([generatedStory], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-stories.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Story downloaded as text file');
  };

  const toggleAllFeaturesInCategory = (categoryId: string) => {
    const categoryFeatures = FEATURE_CATEGORIES
      .find(cat => cat.id === categoryId)
      ?.features.map(f => f.id) || [];

    const allSelected = categoryFeatures.every(id => selectedFeatures.includes(id));
    
    setSelectedFeatures(prev => {
      const newSelectedFeatures = allSelected
        ? prev.filter(id => !categoryFeatures.includes(id))
        : [...new Set([...prev, ...categoryFeatures])];
      
      // Update notes with selected features
      const selectedFeatureDescriptions = FEATURE_CATEGORIES
        .flatMap(category => category.features)
        .filter(feature => newSelectedFeatures.includes(feature.id))
        .map(feature => `- ${feature.title}: ${feature.description}`)
        .join('\n');

      // Keep any existing custom notes
      const customNotes = notes.split('\n\nSelected Features:')[0].trim();
      setNotes(customNotes + (newSelectedFeatures.length > 0 ? `\n\nSelected Features:\n${selectedFeatureDescriptions}` : ''));
      
      return newSelectedFeatures;
    });
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Close drawer with Escape key
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
      // Open drawer with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsDrawerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDrawerOpen]);

  const handleExportToExcel = () => {
    if (!result) return;

    // Format stories for Jira
    const jiraData = result.stories.map((story, index) => ({
      'Issue Type': 'Story',
      'Summary': story.title,
      'Description': `As a ${story.asA}\nI want to ${story.iWantTo}\nSo that ${story.soThat}\n\nAcceptance Criteria:\n${story.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}`,
      'Priority': 'Medium',
      'Story Points': '3',
      'Labels': 'AI-Generated',
      'Epic Link': 'AI-Generated Stories',
      'Sprint': 'Backlog'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(jiraData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'User Stories');

    // Generate Excel file
    XLSX.writeFile(wb, 'jira-user-stories.xlsx');
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Montaj</h1>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto px-4 py-16">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  What would u build with Montaj.ai
                </h1>
                <p className="text-gray-300 mt-2">
                  Transform your feature notes into comprehensive user stories
                </p>
              </div>
              <Link 
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Side Panel */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-2xl sticky top-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Configuration</h2>
                    <div className="relative group">
                      <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg p-2 text-sm text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="flex items-center justify-between mb-1">
                          <span>Keyboard Shortcuts:</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Open Features</span>
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Close Features</span>
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Platform Selection */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Platform</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Web', 'Mobile'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => togglePlatform(option)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              platforms.includes(option)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Product Phase Selection */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Product Phase</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Design', 'Development'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleProductPhase(option)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              productPhase.includes(option)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Story Style */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">User Story Style</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Scrum', 'BDD', 'Simple'].map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setStoryStyle(style)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                              storyStyle === style
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AC Style */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Acceptance Criteria Style</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Given-When-Then', 'Checklist'].map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setAcStyle(style)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                              acStyle === style
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test Cases Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="includeTestCases"
                            checked={includeTestCases}
                            onChange={(e) => setIncludeTestCases(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${includeTestCases ? 'bg-blue-600' : 'bg-gray-600'}`}>
                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${includeTestCases ? 'translate-x-6' : ''}`} />
                          </div>
                        </div>
                        <label htmlFor="includeTestCases" className="text-sm font-medium text-gray-300">
                          Include Test Cases
                        </label>
                      </div>
                    </div>

                    {/* Advanced Configuration Button */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setIsAdvancedConfigOpen(true)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Advanced Configuration
                      </button>
                    </div>

                    {/* Advanced Configuration Modal */}
                    {isAdvancedConfigOpen && (
                      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-white">Advanced Configuration</h3>
                            <button
                              onClick={() => setIsAdvancedConfigOpen(false)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Focus Area */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Focus Area
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { value: 'User Experience', tooltip: 'Focus on user interface, accessibility, and overall user satisfaction' },
                                  { value: 'Performance', tooltip: 'Optimize speed, efficiency, and resource utilization' },
                                  { value: 'Security', tooltip: 'Implement security measures and data protection' },
                                  { value: 'Scalability', tooltip: 'Ensure the system can handle growth and increased load' },
                                  { value: 'Integration', tooltip: 'Connect with other systems and services' },
                                  { value: 'Other', tooltip: 'Custom focus area not covered by other options' }
                                ].map(({ value, tooltip }) => (
                                  <div key={value} className="relative group">
                                    <button
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, focus: value }))}
                                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        formData.focus === value
                                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                                      {tooltip}
                                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Writing Tone */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Writing Tone
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { value: 'Professional', tooltip: 'Formal and business-oriented language' },
                                  { value: 'Technical', tooltip: 'Detailed technical specifications and terminology' },
                                  { value: 'Conversational', tooltip: 'Friendly and approachable communication style' },
                                  { value: 'Formal', tooltip: 'Strict and structured documentation style' },
                                  { value: 'Casual', tooltip: 'Relaxed and informal writing style' }
                                ].map(({ value, tooltip }) => (
                                  <div key={value} className="relative group">
                                    <button
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, tone: value }))}
                                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        formData.tone === value
                                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                                      {tooltip}
                                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Story Format */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Story Format
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { value: 'Detailed', tooltip: 'Comprehensive documentation with extensive details' },
                                  { value: 'Concise', tooltip: 'Brief and to-the-point documentation' },
                                  { value: 'Technical', tooltip: 'Focused on technical implementation details' },
                                  { value: 'User-Friendly', tooltip: 'Easy to understand for non-technical stakeholders' }
                                ].map(({ value, tooltip }) => (
                                  <div key={value} className="relative group">
                                    <button
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, format: value }))}
                                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        formData.format === value
                                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                                      {tooltip}
                                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Story Length */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Story Length
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { value: 'Short', tooltip: 'Brief story with essential information only' },
                                  { value: 'Medium', tooltip: 'Balanced detail level for most use cases' },
                                  { value: 'Long', tooltip: 'Extended story with additional context and details' },
                                  { value: 'Comprehensive', tooltip: 'Complete documentation with full context and all details' }
                                ].map(({ value, tooltip }) => (
                                  <div key={value} className="relative group">
                                    <button
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, length: value }))}
                                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        formData.length === value
                                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                                      {tooltip}
                                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setIsAdvancedConfigOpen(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAdvancedConfigOpen(false)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Apply Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Summary</h3>
                      <div className="text-sm text-gray-400 space-y-2">
                        <p>Generating stories for:</p>
                        <ul className="list-disc list-inside">
                          <li>Platforms: {platforms.join(', ')}</li>
                          <li>Phases: {productPhase.join(', ')}</li>
                          <li>Style: {storyStyle}</li>
                          <li>AC Format: {acStyle}</li>
                          <li>Test Cases: {includeTestCases ? 'Included' : 'Excluded'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Form */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Fields */}
                    <div className="space-y-6">
                      {/* Selected Features Summary */}
                      {selectedFeatures.length > 0 && (
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">
                              Selected Features ({selectedFeatures.length})
                            </h3>
                            <button
                              type="button"
                              onClick={() => setIsDrawerOpen(true)}
                              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Edit Features
                            </button>
                          </div>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {FEATURE_CATEGORIES
                              .flatMap(category => category.features)
                              .filter(feature => selectedFeatures.includes(feature.id))
                              .map(feature => (
                                <li key={feature.id} className="flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                  <span className="text-[#0f0] font-bold">{feature.title}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Feature Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                          Feature Notes
                        </label>
                        <textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full h-64 p-4 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                          placeholder="Add your custom feature notes here..."
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        'Generate Stories'
                      )}
                    </button>
                  </form>

                  {/* Generated Story Section */}
                  {generatedStory && (
                    <div className="mt-8 space-y-6">
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleSaveStory}
                          disabled={isSaving || saveSuccess}
                          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                            saveSuccess
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : isSaving
                              ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                          } transition-colors duration-200`}
                        >
                          {saveSuccess ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Saved
                            </>
                          ) : isSaving ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Story
                            </>
                          )}
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </button>
                        <button
                          onClick={downloadAsText}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export to TXT
                        </button>
                        <button
                          onClick={handleExportToExcel}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export to Jira
                        </button>
                      </div>

                      {/* Horizontal Line with Title */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-4 bg-gray-800 text-lg font-semibold text-white">
                            User Stories
                          </span>
                        </div>
                      </div>

                      {/* Story Content */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <div className="prose dark:prose-invert max-w-none">
                          {generatedStory.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400">{error.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features Drawer */}
            {isDrawerOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
                <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-800 shadow-xl">
                  <div className="h-full flex flex-col">
                    {/* Drawer Header */}
                    <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Common Features</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-gray-400">Press</p>
                          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd>
                          <p className="text-sm text-gray-400">to close</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search features..."
                            className="w-full px-4 py-2 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                          />
                          <div className="absolute right-3 top-2.5 flex items-center space-x-2">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd>
                            <svg
                              className="h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Category Filters */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(null)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            !selectedCategory
                              ? 'bg-gradient-to-r from-blue-500 to-[#a855f7] text-white shadow-lg shadow-blue-500/20'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                          }`}
                        >
                          All Categories
                        </button>
                        {FEATURE_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                              selectedCategory === category.id
                                ? 'bg-gradient-to-r from-blue-500 to-[#a855f7] text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            }`}
                          >
                            {category.title}
                          </button>
                        ))}
                      </div>

                      {/* Feature List */}
                      <div className="space-y-6">
                        {FEATURE_CATEGORIES.map((category) => {
                          const categoryFeatures = searchFilteredFeatures.filter(
                            feature => feature.id.startsWith(category.id)
                          );

                          if (categoryFeatures.length === 0) return null;

                          const allSelected = categoryFeatures.every(feature => 
                            selectedFeatures.includes(feature.id)
                          );

                          return (
                            <div key={category.id} className="space-y-2">
                              <div className="flex items-center justify-between px-2">
                                <h3 className="text-sm font-medium text-gray-300">
                                  {category.title}
                                </h3>
                                <button
                                  onClick={() => toggleAllFeaturesInCategory(category.id)}
                                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {allSelected ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>
                              <div className="space-y-2">
                                {categoryFeatures.map((feature) => (
                                  <div
                                    key={feature.id}
                                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h3 className="text-sm font-medium text-white">{feature.title}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                                      </div>
                                      <button
                                        onClick={() => toggleFeature(feature.id)}
                                        className={`ml-4 p-2 rounded-full transition-colors ${
                                          selectedFeatures.includes(feature.id)
                                            ? 'bg-gradient-to-r from-blue-500 to-[#a855f7] text-white'
                                            : 'bg-gray-600/50 text-gray-400 hover:bg-gray-600'
                                        }`}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="px-6 py-4 border-t border-gray-700">
                      <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 