
import React from 'react';
import type { SearchResult } from '../types';
import Icon from './Icon';
import ReactMarkdown from 'react-markdown';
import TrendChart from './TrendChart';


interface ResultsDisplayProps {
  result: SearchResult;
  query: string;
  location: string;
  onAnalyze: (query: string, summary: string) => void;
  loadingAnalysis: boolean;
  t: (key: string) => string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, query, location, onAnalyze, loadingAnalysis, t }) => {
  const hasTrendData = result.historicalData && result.historicalData.length > 0;
  const hasSerpData = result.serp && (result.serp.ads.length > 0 || result.serp.organic.length > 0);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow space-y-6">
        <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('resultsDisplay.marketAnalysisTitle')} "{query}"</h2>
          <p className="text-md text-gray-500 dark:text-gray-400">{t('resultsDisplay.selectedMarket')}: <span className="font-semibold text-gray-700 dark:text-gray-300">{location}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl flex items-start space-x-4 ring-1 ring-blue-200 dark:ring-blue-800">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Icon icon="search" className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('resultsDisplay.searchVolumeLabel')}</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-white mt-1">{result.searchVolume || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/50 p-5 rounded-xl flex items-start space-x-4 ring-1 ring-green-200 dark:ring-green-800">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <Icon icon="dollar" className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">{t('resultsDisplay.cpcLabel')}</p>
              <p className="text-2xl font-bold text-green-900 dark:text-white mt-1">{result.cpc?.local || 'N/A'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">{result.cpc?.usd || ''}</p>
            </div>
          </div>
        </div>
        
        {hasSerpData ? (
          <div className="space-y-6">
            {result.serp!.ads.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('resultsDisplay.adsTitle')}</h3>
                <div className="space-y-4">
                  {result.serp!.ads.map((ad, index) => (
                    <div key={`ad-${index}`} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md ring-1 ring-gray-200 dark:ring-gray-700">
                      <div className="flex items-center text-sm">
                          <Icon icon="dollar" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                          <span className="font-bold mr-2">{t('resultsDisplay.adLabel')}</span>
                          <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 truncate hover:underline">
                              {ad.displayUrl}
                          </a>
                      </div>
                      <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer" className="block mt-1 text-lg text-blue-700 hover:underline dark:text-blue-400">
                          {ad.title}
                      </a>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{ad.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
             {result.serp!.organic.length > 0 && (
              <div className={result.serp!.ads.length > 0 ? "pt-6 border-t border-gray-200 dark:border-gray-700" : ""}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('resultsDisplay.organicResultsTitle')}</h3>
                <div className="space-y-5">
                  {result.serp!.organic.map((organic, index) => (
                    <div key={`organic-${index}`}>
                      <a href={organic.destinationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 dark:text-gray-300 truncate hover:underline flex items-center">
                        <Icon icon="globe" className="h-4 w-4 mr-2 flex-shrink-0" />
                        {organic.displayUrl}
                      </a>
                      <a href={organic.destinationUrl} target="_blank" rel="noopener noreferrer" className="block mt-1 text-xl text-blue-600 hover:underline dark:text-blue-400">
                        {organic.title}
                      </a>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{organic.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          result.summary && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('resultsDisplay.summaryTitle')}</h3>
              <div className="mt-2 prose prose-blue dark:prose-invert max-w-none prose-sm sm:prose-base bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            </div>
          )
        )}
        
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onAnalyze(query, result.summary)}
            disabled={loadingAnalysis}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-colors"
          >
            <Icon icon="analyze" className="mr-2 h-5 w-5" />
            {loadingAnalysis ? t('resultsDisplay.seoAnalysisButtonLoading') : t('resultsDisplay.seoAnalysisButton')}
          </button>
        </div>
      </div>
      {hasTrendData ? (
          <TrendChart data={result.historicalData!} t={t} />
      ) : result.historicalData && ( 
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('trendChart.title')}</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('trendChart.noData')}</p>
          </div>
      )}
    </>
  );
};

export default ResultsDisplay;
