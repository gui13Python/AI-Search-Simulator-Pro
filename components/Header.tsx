import React from 'react';
import Icon from './Icon';
import type { Language } from '../types';

interface HeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    uiLanguage: Language;
    setUiLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LANGUAGE_OPTIONS: { id: Language, label: string }[] = [
    { id: 'pt', label: '🇧🇷 PT' },
    { id: 'en', label: '🇺🇸 EN' },
    { id: 'es', label: '🇪🇸 ES' },
];

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, uiLanguage, setUiLanguage, t }) => {
    
    const TABS = [
        { name: t('header.searchTab'), key: 'Busca', icon: 'search' as const },
        { name: t('header.chatTab'), key: 'Chat', icon: 'chat' as const },
        { name: t('header.imageEditorTab'), key: 'Editor de Imagem', icon: 'edit' as const },
    ];

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Icon icon="globe" className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">{t('header.title')}</h1>
                    </div>
                    <div className="flex items-center">
                        <nav className="hidden md:flex space-x-2 mr-4">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${
                                        activeTab === tab.key
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon icon={tab.icon} className="mr-2 h-5 w-5" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                            {LANGUAGE_OPTIONS.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setUiLanguage(opt.id)}
                                className={`px-2 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                                  uiLanguage === opt.id 
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Mobile Tab Bar */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-1">
                     {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex flex-col items-center justify-center w-full py-2 rounded-md text-xs font-medium transition-colors duration-200 ease-in-out ${
                                activeTab === tab.key
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <Icon icon={tab.icon} className="h-6 w-6 mb-1" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;