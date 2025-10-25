
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Chatbot from './components/Chatbot';
import ImageEditor from './components/ImageEditor';
import { getSimulatedSearchResults, getSeoAnalysis } from './services/geminiService';
import type { SearchParameters, SearchResult, UserLocation, Language } from './types';
import { translations } from './translations';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Busca');
  const [uiLanguage, setUiLanguage] = useState<Language>('pt');
  const [loading, setLoading] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParameters | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const t = useCallback((key: string): string => {
    return translations[uiLanguage][key] || key;
  }, [uiLanguage]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Could not get user location:", error.message);
      }
    );
  }, []);

  const handleSearch = async (params: SearchParameters) => {
    setLoading(true);
    setError(null);
    setSearchResult(null);
    setAnalysisResult(null);
    setSearchParams(params);
    setActiveTab('Busca');

    try {
      const result = await getSimulatedSearchResults(params, userLocation);
      setSearchResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`${t('app.error.search')}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async (query: string, summary: string) => {
    setLoadingAnalysis(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await getSeoAnalysis(query, summary);
      setAnalysisResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`${t('app.error.analysis')}: ${errorMessage}`);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Busca':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SearchForm onSearch={handleSearch} loading={loading} t={t} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              {loading && <LoadingSpinner message={t('app.loading.search')} />}
              {error && <div className="text-red-500 text-sm p-3 bg-red-100 dark:bg-red-900/50 rounded-md">{error}</div>}
              {searchResult && searchParams && (
                <>
                  <ResultsDisplay 
                    result={searchResult} 
                    query={searchParams.query}
                    location={searchParams.location}
                    onAnalyze={handleAnalysis}
                    loadingAnalysis={loadingAnalysis}
                    t={t}
                  />
                  {loadingAnalysis && <LoadingSpinner message={t('app.loading.analysis')} />}
                  {analysisResult && (
                     <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
                       <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('seoAnalysis.title')}</h2>
                        <div className="prose prose-blue dark:prose-invert max-w-none prose-sm sm:prose-base">
                          <ReactMarkdown>{analysisResult}</ReactMarkdown>
                        </div>
                     </div>
                  )}
                </>
              )}
               {!loading && !searchResult && (
                 <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                   <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('app.welcome.title')}</h3>
                   <p className="mt-2 text-gray-500 dark:text-gray-400">{t('app.welcome.subtitle')}</p>
                 </div>
               )}
            </div>
          </div>
        );
      case 'Chat':
        return <Chatbot t={t} />;
      case 'Editor de Imagem':
        return <ImageEditor t={t} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        uiLanguage={uiLanguage}
        setUiLanguage={setUiLanguage}
        t={t}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 mb-16 md:mb-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;