import React, { useState, useRef } from 'react';
import { resizeImageForAi } from './utils/imageUtils';
import { analyzeFoodImage } from './services/aiService';
import { FoodAnalysisResult, LmStudioConfig } from './types';
import { NutrientChart } from './components/NutrientChart';
import { SettingsModal } from './components/SettingsModal';

// Default configuration based on user request
const DEFAULT_CONFIG: LmStudioConfig = {
  baseUrl: 'http://192.168.0.67:1234',
  model: 'google/gemma-3-12b'
};

const App: React.FC = () => {
  const [config, setConfig] = useState<LmStudioConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setResult(null);
    setIsAnalyzing(true);

    try {
      // 1. Resize locally (Client side optimization)
      const resizedBase64 = await resizeImageForAi(file, 896);
      setSelectedImage(resizedBase64);

      // 2. Send to AI
      const analysis = await analyzeFoodImage(resizedBase64, config);
      setResult(analysis);

    } catch (err: any) {
      setError(err.message || "Something went wrong processing the image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Gemma<span className="text-brand-400">NutriScan</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-3 text-red-200 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Analysis Failed</p>
              <p className="text-sm opacity-80">{error}</p>
              <p className="text-xs mt-2 text-red-400">Ensure your local AI server is running at {config.baseUrl} with CORS enabled.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input & Image */}
          <div className="space-y-6">
            <div 
              onClick={triggerFileInput}
              className={`
                relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group
                ${selectedImage ? 'border-brand-500/50 bg-slate-800' : 'border-slate-600 hover:border-brand-400 hover:bg-slate-800/50'}
              `}
            >
              {selectedImage ? (
                <>
                  <img src={selectedImage} alt="Analyzed Food" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium text-sm">
                       Click to change
                     </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-300 font-medium mb-1">Take a photo or upload</p>
                  <p className="text-slate-500 text-sm">Supports JPG, PNG (Normalized to 896px)</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-slate-800/80 backdrop-blur p-6 rounded-xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-brand-100 font-medium animate-pulse">Gemma is thinking...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-700 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-2 bg-slate-700 rounded-full w-1/2 animate-pulse delay-75"></div>
                  <div className="h-2 bg-slate-700 rounded-full w-5/6 animate-pulse delay-150"></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {!result && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-12 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Nutritional data will appear here</p>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="animate-fade-in-up">
                {/* Main Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl border border-slate-700 shadow-2xl mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-1">{result.foodName}</h2>
                    <p className="text-slate-400 text-sm mb-6">{result.description}</p>
                    
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Calories</p>
                        <p className="text-4xl font-bold text-brand-400">{result.calories}</p>
                      </div>
                      <div className="w-px h-12 bg-slate-700"></div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Weight (Est)</p>
                        <p className="text-2xl font-semibold text-white">{result.estimatedWeight}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Charts */}
                <NutrientChart data={result} />
              </div>
            )}
          </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config}
        onSave={setConfig}
      />
    </div>
  );
};

export default App;