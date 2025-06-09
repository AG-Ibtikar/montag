'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { 
  ClipboardList, 
  Layers, 
  FileText, 
  Sparkles,
  ArrowRight,
  Code,
  Smartphone,
  Zap,
  Shield
} from 'lucide-react';
import UserProfileMenu from '@/components/UserProfileMenu';
import SignInModal from '@/components/auth/SignInModal';
import { useRouter } from 'next/navigation';

export default function Home(): React.JSX.Element {
  const router = useRouter();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleGetStarted = () => {
    setIsSignInModalOpen(true);
  };

  const handleSignUpClick = () => {
    setIsSignInModalOpen(false);
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                montaj.ai
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/generate"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors duration-200"
              >
                Generate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:from-purple-500 group-hover:to-blue-400">
                montaj.ai
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-2 max-w-3xl mx-auto animate-fade-in-up">
              Transform your Idea to Comprehensive Userstories
            </p>
            <p className="text-2xl sm:text-4xl font-bold mb-8 max-w-3xl mx-auto animate-fade-in-up delay-100">
              <span className="text-[#c8f31d] animate-typing overflow-hidden whitespace-nowrap border-r-2 border-r-[#c8f31d] inline-block">
                The 1st AI Product Manager
              </span>
            </p>
          </div>

          <div className="animate-fade-in-up delay-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <Link
                href="#how-it-works"
                className="group inline-flex items-center justify-center px-8 py-3 border border-gray-700 text-base font-medium rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/20"
              >
                Learn More
                <span className="ml-2 transform transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </Link>
            </div>
          </div>

          <div className="animate-fade-in-up delay-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="group bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                  <Sparkles className="h-6 w-6 text-blue-400 transform transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">Smart Generation</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">AI-powered story generation with comprehensive acceptance criteria</p>
              </div>

              <div className="group bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                  <Zap className="h-6 w-6 text-purple-400 transform transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">Multiple Formats</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Support for various story formats and export options</p>
              </div>

              <div className="group bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-1">
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-pink-500/20">
                  <Shield className="h-6 w-6 text-pink-400 transform transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors duration-300">Test Cases</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Automatically generate test cases for your user stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignUpClick={handleSignUpClick}
      />

      {/* Rest of the content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* How It Works Section */}
        <section id="how-it-works" className="bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-gray-200 max-w-2xl mx-auto text-lg">
                Transform your ideas into comprehensive user stories in four simple steps
              </p>
            </div>

            {/* Flowchart */}
            <div className="relative">
              {/* Desktop Flow */}
              <div className="hidden md:flex items-center justify-center space-x-12">
                {[
                  {
                    icon: <ClipboardList className="w-6 h-6 text-blue-300" />,
                    title: "Select Project Type",
                    description: "Choose platform and phase"
                  },
                  {
                    icon: <Layers className="w-6 h-6 text-purple-300" />,
                    title: "Choose Features",
                    description: "Select from common features"
                  },
                  {
                    icon: <FileText className="w-6 h-6 text-pink-300" />,
                    title: "Add Notes",
                    description: "Include custom requirements"
                  },
                  {
                    icon: <Sparkles className="w-6 h-6 text-indigo-300" />,
                    title: "Generate Stories",
                    description: "Get user stories and ACs"
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="group relative">
                      <div className="w-56 h-56 rounded-xl shadow-lg border border-gray-600 p-6 bg-gray-800 flex flex-col items-center justify-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-400/30 hover:border-blue-400">
                        <div className="mb-6 p-4 bg-gray-700 rounded-full group-hover:bg-blue-400/20 transition-colors duration-300">
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-200">
                          {step.description}
                        </p>
                      </div>
                      {index < 3 && (
                        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                          <div className="w-12 h-1 bg-gradient-to-r from-blue-400/40 to-purple-400/40 mx-2"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Flow */}
              <div className="md:hidden space-y-6">
                {[
                  {
                    icon: <ClipboardList className="w-6 h-6 text-blue-300" />,
                    title: "Select Project Type",
                    description: "Choose platform and phase"
                  },
                  {
                    icon: <Layers className="w-6 h-6 text-purple-300" />,
                    title: "Choose Features",
                    description: "Select from common features"
                  },
                  {
                    icon: <FileText className="w-6 h-6 text-pink-300" />,
                    title: "Add Notes",
                    description: "Include custom requirements"
                  },
                  {
                    icon: <Sparkles className="w-6 h-6 text-indigo-300" />,
                    title: "Generate Stories",
                    description: "Get user stories and ACs"
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full rounded-xl shadow-lg border border-gray-600 p-6 bg-gray-800 flex items-center space-x-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-400/30 hover:border-blue-400">
                      <div className="p-4 bg-gray-700 rounded-full group-hover:bg-blue-400/20 transition-colors duration-300">
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-200">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="mt-24">
              <h3 className="text-3xl font-semibold text-white text-center mb-12">
                Use Cases
              </h3>
              <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                <div className="rounded-xl shadow-lg border border-gray-600 p-6 bg-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-400/30 hover:border-blue-400">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="p-4 bg-gray-700 rounded-full group-hover:bg-blue-400/20 transition-colors duration-300">
                      <Code className="w-6 h-6 text-blue-300" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">
                      Web Development
                    </h4>
                  </div>
                  <p className="text-gray-200 text-lg">
                    Quickly create user stories for a web development project, including authentication, payment integration, and more.
                  </p>
                </div>
                <div className="rounded-xl shadow-lg border border-gray-600 p-6 bg-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-400/30 hover:border-blue-400">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="p-4 bg-gray-700 rounded-full group-hover:bg-blue-400/20 transition-colors duration-300">
                      <Smartphone className="w-6 h-6 text-purple-300" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">
                      Mobile Apps
                    </h4>
                  </div>
                  <p className="text-gray-200 text-lg">
                    Generate acceptance criteria for a new mobile app feature, with platform-specific considerations and test cases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>Powered by OpenAI GPT-4</p>
          <p className="mt-2">Transform your feature notes into comprehensive user stories</p>
        </div>
      </div>
    </div>
  );
} 