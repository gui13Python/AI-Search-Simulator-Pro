export const HOTMART_MARKETS = [
  { value: 'br', label: 'Brasil', domain: 'google.com.br' },
  { value: 'mx', label: 'México', domain: 'google.com.mx' },
  { value: 'co', label: 'Colômbia', domain: 'google.com.co' },
  { value: 'es', label: 'Espanha', domain: 'google.es' },
  { value: 'cl', label: 'Chile', domain: 'google.cl' },
  { value: 'pe', label: 'Peru', domain: 'google.com.pe' },
  { value: 'ar', label: 'Argentina', domain: 'google.com.ar' },
  { value: 'us', label: 'Estados Unidos', domain: 'google.com' },
  { value: 'pt', label: 'Portugal', domain: 'google.pt' },
  { value: 'ww', label: 'Mundo (Worldwide)', domain: 'google.com' },
];

export const CURRENCY_MAP: Record<string, { code: string, name: string }> = {
    br: { code: 'BRL', name: 'Real Brasileiro' },
    mx: { code: 'MXN', name: 'Peso Mexicano' },
    co: { code: 'COP', name: 'Peso Colombiano' },
    es: { code: 'EUR', name: 'Euro' },
    cl: { code: 'CLP', name: 'Peso Chileno' },
    pe: { code: 'PEN', name: 'Sol Peruano' },
    ar: { code: 'ARS', name: 'Peso Argentino' },
    us: { code: 'USD', name: 'Dólar Americano' },
    pt: { code: 'EUR', name: 'Euro' },
    ww: { code: 'USD', name: 'Dólar Americano' },
};

export const LANGUAGES = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
  { value: 'de', label: 'Alemão' },
  { value: 'fr', label: 'Francês' },
];

export const DEVICES = [
    { value: 'all', labelKey: 'device.all' },
    { value: 'desktop', labelKey: 'device.desktop' },
    { value: 'mobile', labelKey: 'device.mobile' },
    { value: 'tablet', labelKey: 'device.tablet' },
];