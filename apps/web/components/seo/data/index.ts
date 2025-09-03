export const siteConfig = {
  name: 'Orange Board',
  creator: 'Vinesh Raj',
  url: process.env.NEXT_PUBLIC_SITE_URL,
  ogImage: '/images/ogimage.png',
  twitterHandle: '@VineshRaj239',
  description:
    'Orange Board is a free collaborative online whiteboard that lets teams, students, and creators brainstorm, draw, and share ideas in real time. Simple, fast, and built for productivity.',

  authors: [
    {
      name: 'Vinesh Rajkumar',
      url: 'https://github.com/VineshRajkumar',
    },
  ],
};

export const keywords = {
  homepage: [
    'online whiteboard free',
    'collaboration tool for teams',
    'digital whiteboard app',
    'real-time brainstorming board',
    'virtual classroom whiteboard',
    'Excalidraw alternative',
    'remote team collaboration',
    'draw online with friends',
    'free brainstorming tool',
    'mind mapping online',
    'Orange Board app',
    'interactive teaching whiteboard',
    'design collaboration tool',
    'real-time drawing app',
    'visual collaboration software',
  ],

  privacyPolicy: [
    'Orange Board privacy policy',
    'online whiteboard data security',
    'collaborative whiteboard privacy',
    'GDPR compliant whiteboard app',
    'real-time collaboration data protection',
    'secure brainstorming tool',
    'guest mode privacy',
    'online drawing app safety',
    'Orange Board terms and privacy',
  ],

  loginPage: [
    'Orange Board login',
    'sign in online whiteboard',
    'collaboration tool login',
    'real-time drawing app sign in',
    'team whiteboard login',
    'brainstorming app login',
    'digital whiteboard account access',
    'Orange Board sign in page',
  ],

  signupPage: [
    'Orange Board sign up',
    'create Orange Board account',
    'register online whiteboard',
    'free digital whiteboard signup',
    'collaboration tool registration',
    'real-time brainstorming signup',
    'team whiteboard sign up',
    'drawing app account create',
  ],

  dashboard: [
    'Orange Board dashboard',
    'manage online whiteboards',
    'team collaboration dashboard',
    'real-time brainstorming workspace',
    'digital whiteboard project management',
    'collaboration app dashboard',
    'interactive drawing boards management',
    'Orange Board workspace',
  ],

  canvasPage: [
    'online collaborative canvas',
    'real-time drawing board',
    'freehand sketch online',
    'digital brainstorming canvas',
    'team whiteboard collaboration',
    'live diagram maker',
    'virtual design canvas',
    'shared drawing workspace',
    'remote sketch collaboration',
    'interactive whiteboard app',
    'online flowchart canvas',
    'mind mapping board online',
    'collaborative sketch tool',
    'Orange Board canvas',
    'draw shapes online',
  ],

  notfound: [
    'Orange Board',
    '404',
    'Not Found',
    'Page Missing',
    'Error',
    'Broken Link',
    'Page Not Found',
    'Website Error',
    'Lost Page',
    'Orange Board 404',
    'Orange Board Error',
    'Orange Board Page Missing',
    'Webpage Not Found',
    'Site Error',
    'Missing Page',
  ],
};

export const seo = {
  defaultTitle: siteConfig.name,
  titleTemplate: '%s | ' + siteConfig.name,
  description: siteConfig.description,
  keywords: keywords.homepage,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Online Collaborative Whiteboard`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: [
      { url: '/icons/favicon.ico' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon0.svg', type: 'image/svg+xml' },
      { url: '/icons/icon1.png', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-icon.png' }, { url: '/icons/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
};
