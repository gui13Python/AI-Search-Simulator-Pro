import React, { useState } from 'react';
import { HOTMART_MARKETS, LANGUAGES, DEVICES } from '../constants';
import type { SearchParameters } from '../types';
import Icon from './Icon';

interface SearchFormProps {
  onSearch: (params: SearchParameters) => void;
  loading: boolean;
  t: (key: string) => string;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading, t }) => {
  const [params, setParams] = useState({
    query: '',
    location: 'Brasil',
    device: 'desktop', // Internal state uses key
    language: 'pt',
    country: 'br',
    googleDomain: 'google.com.br',
  });

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const selectedMarket = HOTMART_MARKETS.find(m => m.value === value);
    if (selectedMarket) {
      setParams(prev => ({
        ...prev,
        [name]: value,
        googleDomain: selectedMarket.domain,
        location: selectedMarket.label,
      }));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (params.query.trim()) {
      // Find the selected device object to get its translated label for the prompt
      const selectedDeviceObject = DEVICES.find(d => d.value === params.device);
      const translatedDevice = selectedDeviceObject ? t(selectedDeviceObject.labelKey) : params.device;

      onSearch({
        ...params,
        device: translatedDevice,
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('searchForm.queryLabel')}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon icon="search" className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="query"
            id="query"
            value={params.query}
            onChange={handleChange}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={t('searchForm.queryPlaceholder')}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('searchForm.marketLabel')}</label>
          <select
            id="country"
            name="country"
            value={params.country}
            onChange={handleCountryChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {HOTMART_MARKETS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="googleDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('searchForm.domainLabel')}</label>
           <input
            type="text"
            name="googleDomain"
            id="googleDomain"
            value={params.googleDomain}
            readOnly
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md bg-gray-100 dark:bg-gray-900 sm:text-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="device" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('searchForm.deviceLabel')}</label>
          <select
            id="device"
            name="device"
            value={params.device}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {DEVICES.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('searchForm.languageLabel')}</label>
          <select
            id="language"
            name="language"
            value={params.language}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {LANGUAGES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !params.query.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed dark:disabled:bg-blue-800 transition-colors"
      >
        {loading ? t('searchForm.submitButtonLoading') : t('searchForm.submitButton')}
        {!loading && <Icon icon="arrow" className="ml-2 w-5 h-5" />}
      </button>
    </form>
  );
};

export default SearchForm;