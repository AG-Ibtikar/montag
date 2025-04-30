'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Building2, 
  CreditCard, 
  Receipt, 
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Camera,
  Check,
  X,
  Globe,
  Users,
  Factory,
  Link as LinkIcon,
  CreditCard as CardIcon,
  FileText,
  Plus,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  profileImage?: string;
}

interface OrganizationData {
  name: string;
  size?: string;
  industry?: string;
  website?: string;
}

export default function ProfilePage() {
  const { user, userData, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: user?.email || '',
    phone: userData?.phone || '',
    role: userData?.role || '',
    profileImage: userData?.profileImage || '',
  });
  const [orgData, setOrgData] = useState<OrganizationData>({
    name: userData?.organization?.name || '',
    size: userData?.organization?.size || '',
    industry: userData?.organization?.industry || '',
    website: userData?.organization?.website || '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        role: profileData.role,
        profileImage: profileData.profileImage,
      });
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrgUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile({
        organization: {
          name: orgData.name,
          size: orgData.size,
          industry: orgData.industry,
          website: orgData.website,
        },
      });
      setSuccess('Organization details updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update organization details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    setError(null);

    try {
      // TODO: Implement image upload to Firebase Storage
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
      await updateUserProfile({ profileImage: imageUrl });
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Add success/error notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                  M
                </div>
                <span className="ml-2 text-xl font-bold text-white">Montaj</span>
              </Link>
              <Link
                href="/"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">
              Hey {profileData.firstName || 'there'}!
            </h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-700 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`${
                    activeTab === 'personal'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <User className="inline-block w-5 h-5 mr-2" />
                  Personal Details
                </button>
                <button
                  onClick={() => setActiveTab('organization')}
                  className={`${
                    activeTab === 'organization'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Building2 className="inline-block w-5 h-5 mr-2" />
                  Organization
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`${
                    activeTab === 'subscription'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <CreditCard className="inline-block w-5 h-5 mr-2" />
                  Subscription
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`${
                    activeTab === 'billing'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Receipt className="inline-block w-5 h-5 mr-2" />
                  Billing
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
              {activeTab === 'personal' && (
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full bg-gray-700 overflow-hidden">
                        {profileData.profileImage ? (
                          <Image
                            src={profileData.profileImage}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-4xl text-gray-400">
                            {profileData.firstName?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                      >
                        <Camera className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          id="profile-image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      Click the camera icon to change your profile picture
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="relative">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your first name"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="relative">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your last name"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={profileData.email}
                        disabled
                        className="block w-full rounded-lg bg-gray-700 border-gray-600 text-gray-400 pl-10 pr-4 py-2.5 cursor-not-allowed"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                      Role
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="role"
                        value={profileData.role}
                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your role"
                      />
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'organization' && (
                <form onSubmit={handleOrgUpdate} className="space-y-8">
                  <div className="relative">
                    <label htmlFor="orgName" className="block text-sm font-medium text-gray-300 mb-1">
                      Organization Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="orgName"
                        value={orgData.name}
                        onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                        className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter organization name"
                      />
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="orgSize" className="block text-sm font-medium text-gray-300 mb-1">
                      Organization Size
                    </label>
                    <div className="relative">
                      <select
                        id="orgSize"
                        value={orgData.size}
                        onChange={(e) => setOrgData({ ...orgData, size: e.target.value })}
                        className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-1">
                      Industry
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="industry"
                        value={orgData.industry}
                        onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                        className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter industry"
                      />
                      <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                      Website
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        id="website"
                        value={orgData.website}
                        onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                        className="block w-full rounded-lg bg-gray-700 border-gray-600 text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter website URL"
                      />
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-8">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">Current Plan</h3>
                        <p className="text-gray-300 mt-1">Standard Plan</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Unlimited user stories</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Basic analytics</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Email support</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-medium text-white">Payment Methods</h3>
                        <p className="text-gray-300 mt-1">Manage your payment methods</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <CardIcon className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                            <CardIcon className="h-5 w-5 text-gray-300" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-white">Visa ending in 4242</p>
                            <p className="text-sm text-gray-400">Expires 12/2024</p>
                          </div>
                        </div>
                        <button className="text-sm text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-medium text-white">Invoices</h3>
                        <p className="text-gray-300 mt-1">View and download your invoices</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No invoices available</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add notifications */}
      {(error || success) && (
        <div className="fixed bottom-4 right-4 z-50">
          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
              <X className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
              <Check className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 