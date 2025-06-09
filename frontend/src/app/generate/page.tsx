'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Check, AlertCircle, Menu, X, Save, FileText, Download, Settings, Search, ChevronDown, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { FEATURE_CATEGORIES } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Web']);
  const [selectedPhase, setSelectedPhase] = useState<string>('MVP');
  const [storyStyle, setStoryStyle] = useState<string>('As a [user], I want to [action] so that [benefit]');
  const [acStyle, setAcStyle] = useState<string>('Given/When/Then');
  const [featureNotes, setFeatureNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [includeTestCases, setIncludeTestCases] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState({
    storyPriority: 'medium',
    storyPoints: '3',
    includeDependencies: false,
    includeTechnicalNotes: false,
    includeMockups: false,
    language: 'en',
    maxStories: '5',
    storyFormat: 'detailed'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    features: [] as string[],
    platforms: [] as string[],
    phase: 'development',
    storyStyle: 'detailed',
    acStyle: 'detailed',
    notes: '',
    includeTestCases: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedFeatures.length === 0) {
      toast.error('Please select at least one feature');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    if (!selectedPhase) {
      toast.error('Please select a product phase');
      return;
    }

    if (!storyStyle) {
      toast.error('Please select a user story style');
      return;
    }

    if (!acStyle) {
      toast.error('Please select an acceptance criteria style');
      return;
    }

    if (!featureNotes.trim()) {
      toast.error('Please add feature notes');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedStory('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: selectedFeatures,
          platforms: selectedPlatforms,
          phase: selectedPhase,
          storyStyle,
          acStyle,
          notes: featureNotes,
          includeTestCases,
          ...advancedConfig
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      setGeneratedStory(data.story);
      toast.success('Story generated successfully!');
    } catch (err) {
      console.error('Error generating story:', err);
      setError('Failed to generate story. Please try again.');
      toast.error('Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedStory('');
    setError('');
    handleSubmit(new Event('submit') as any);
  };

  const handleSave = async () => {
    if (!generatedStory) {
      toast.error('No story to save');
      return;
    }

    if (!user?.uid) {
      toast.error('You must be logged in to save stories');
      return;
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Generated Story - ${new Date().toLocaleString()}`,
          content: generatedStory,
          configuration: {
            features: selectedFeatures,
            platforms: selectedPlatforms,
            phase: selectedPhase,
            storyStyle,
            acStyle,
            notes: featureNotes,
            includeTestCases,
            ...advancedConfig
          },
          userId: user.uid,
          email: user.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save story');
      }

      toast.success('Story saved successfully!');
      router.push('/stories');
    } catch (err) {
      console.error('Error saving story:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save story');
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      const newFeatures = prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId];
      
      // Update feature notes with selected features
      const selectedFeatureTitles = newFeatures.map(id => {
        const feature = FEATURE_CATEGORIES.flatMap(cat => cat.features).find(f => f.id === id);
        return feature ? `- ${feature.title}\n  Implement ${feature.title.toLowerCase()} with ${feature.description.toLowerCase()}` : '';
      }).filter(Boolean);
      
      setFeatureNotes(selectedFeatureTitles.join('\n\n'));
      return newFeatures;
    });
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Filter features based on search query
  const filteredCategories = FEATURE_CATEGORIES.map(category => ({
    ...category,
    features: category.features.filter(feature =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.features.length > 0);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Configuration */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Configuration</h2>
            <button
              onClick={() => setIsAdvancedOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Advanced Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          {/* Platform Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-200">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {['Web', 'Mobile', 'Desktop', 'API'].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                    selectedPlatforms.includes(platform)
                      ? 'border-indigo-500 bg-indigo-900/20 text-white'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Product Phase */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-200">Product Phase</h3>
            <div className="flex flex-wrap gap-2">
              {['MVP', 'Beta', 'Production', 'Maintenance'].map((phase) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => setSelectedPhase(phase)}
                  className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                    selectedPhase === phase
                      ? 'border-indigo-500 bg-indigo-900/20 text-white'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>

          {/* Acceptance Criteria Style */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-200">Acceptance Criteria</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Given/When/Then',
                'Scenario-based',
                'Checklist',
                'Behavior-driven'
              ].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setAcStyle(style)}
                  className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                    acStyle === style
                      ? 'border-indigo-500 bg-indigo-900/20 text-white'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Test Cases Toggle */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-200">Include Test Cases</h3>
              <button
                type="button"
                onClick={() => setIncludeTestCases(!includeTestCases)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  includeTestCases ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeTestCases ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-gray-400">
              When enabled, test cases will be generated for each user story
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">Generate Stories</h1>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Features</span>
            </button>
          </div>

          {/* Configuration Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedPlatforms.map((platform) => (
              <div
                key={platform}
                className="px-3 py-1 bg-indigo-900/20 border border-indigo-500 rounded-full text-white text-sm flex items-center space-x-2"
              >
                <span>Platform: {platform}</span>
                <button
                  onClick={() => togglePlatform(platform)}
                  className="text-indigo-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {selectedPhase && (
              <div className="px-3 py-1 bg-indigo-900/20 border border-indigo-500 rounded-full text-white text-sm flex items-center space-x-2">
                <span>Phase: {selectedPhase}</span>
                <button
                  onClick={() => setSelectedPhase('')}
                  className="text-indigo-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {storyStyle && (
              <div className="px-3 py-1 bg-indigo-900/20 border border-indigo-500 rounded-full text-white text-sm flex items-center space-x-2">
                <span>Style: {storyStyle.split('[')[0].trim()}</span>
                <button
                  onClick={() => setStoryStyle('')}
                  className="text-indigo-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {acStyle && (
              <div className="px-3 py-1 bg-indigo-900/20 border border-indigo-500 rounded-full text-white text-sm flex items-center space-x-2">
                <span>AC: {acStyle}</span>
                <button
                  onClick={() => setAcStyle('')}
                  className="text-indigo-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {includeTestCases && (
              <div className="px-3 py-1 bg-indigo-900/20 border border-indigo-500 rounded-full text-white text-sm flex items-center space-x-2">
                <span>Test Cases: Enabled</span>
                <button
                  onClick={() => setIncludeTestCases(false)}
                  className="text-indigo-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Feature Notes */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Feature Notes</h2>
            <textarea
              value={featureNotes}
              onChange={(e) => setFeatureNotes(e.target.value)}
              placeholder="Enter additional details about the features..."
              className="w-full h-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={handleSubmit}
              disabled={isGenerating}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
                isGenerating
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Generate Story</span>
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={!generatedStory}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
                !generatedStory
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Save className="h-5 w-5" />
              <span>Save Story</span>
            </button>
            <button
              onClick={() => {/* TODO: Implement export functionality */}}
              disabled={!generatedStory}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
                !generatedStory
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>

          {/* Generated Story */}
          {generatedStory && (
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Generated Story</h2>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-200">Generated User Stories</h3>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300">{generatedStory}</pre>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Advanced Configuration Popup */}
        {isAdvancedOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Advanced Configuration</h2>
                <button
                  onClick={() => setIsAdvancedOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Story Style */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Story Style</label>
                  <div className="space-y-2">
                    {[
                      'As a [user], I want to [action] so that [benefit]',
                      'Given [context], when [action], then [outcome]',
                      'I want to [action] so that [benefit]',
                      'In order to [benefit], as a [user], I want to [action]'
                    ].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setStoryStyle(style)}
                        className={`w-full p-2 rounded-lg border transition-all duration-200 ${
                          storyStyle === style
                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Priority */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Story Priority</label>
                  <div className="flex flex-wrap gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, storyPriority: priority.toLowerCase() }))}
                        className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                          advancedConfig.storyPriority === priority.toLowerCase()
                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Points */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Story Points</label>
                  <div className="flex flex-wrap gap-2">
                    {['1', '2', '3', '5', '8', '13'].map((points) => (
                      <button
                        key={points}
                        type="button"
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, storyPoints: points }))}
                        className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                          advancedConfig.storyPoints === points
                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {points}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Format */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Story Format</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'simple', label: 'Simple' },
                      { value: 'detailed', label: 'Detailed' },
                      { value: 'technical', label: 'Technical' }
                    ].map((format) => (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, storyFormat: format.value }))}
                        className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                          advancedConfig.storyFormat === format.value
                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Maximum Stories */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Maximum Stories</label>
                  <div className="flex flex-wrap gap-2">
                    {['3', '5', '8', '10', '15', '20'].map((max) => (
                      <button
                        key={max}
                        type="button"
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, maxStories: max }))}
                        className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                          advancedConfig.maxStories === max
                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {max}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Language</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'fr', label: 'French' },
                      { value: 'de', label: 'German' }
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, language: lang.value }))}
                        className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                          advancedConfig.language === lang.value
                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-200">Additional Options</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'dependencies', label: 'Include Dependencies', value: advancedConfig.includeDependencies },
                      { id: 'technicalNotes', label: 'Include Technical Notes', value: advancedConfig.includeTechnicalNotes },
                      { id: 'mockups', label: 'Include Mockup Suggestions', value: advancedConfig.includeMockups }
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setAdvancedConfig(prev => ({
                          ...prev,
                          [option.id === 'dependencies' ? 'includeDependencies' :
                           option.id === 'technicalNotes' ? 'includeTechnicalNotes' : 'includeMockups']: !option.value
                        }))}
                        className={`px-3 py-1 rounded-full border transition-all duration-200 ${
                          option.value
                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsAdvancedOpen(false)}
                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsAdvancedOpen(false);
                      toast.success('Advanced settings saved');
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Selection Drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 bg-black/50 z-50">
            <div className="absolute right-0 top-0 h-full w-[600px] bg-gray-800 shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Select Features</h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Feature Categories */}
              <div className="overflow-y-auto h-[calc(100vh-8rem)]">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="border-b border-gray-700">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-white font-medium">{category.title}</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {category.features.length} features
                      </span>
                    </button>
                    
                    {expandedCategories.includes(category.id) && (
                      <div className="px-4 py-2 space-y-2">
                        {category.features.map((feature) => (
                          <button
                            key={feature.id}
                            onClick={() => toggleFeature(feature.id)}
                            className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                              selectedFeatures.includes(feature.id)
                                ? 'bg-indigo-900/20 border border-indigo-500 text-white'
                                : 'text-gray-300 hover:bg-gray-700/50 border border-transparent'
                            }`}
                          >
                            <div>
                              <div className="font-medium">{feature.title}</div>
                              <div className="text-sm text-gray-400">{feature.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Selected Features Summary */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    {selectedFeatures.length} features selected
                  </span>
                  {selectedFeatures.length > 0 && (
                    <button
                      onClick={() => setSelectedFeatures([])}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 