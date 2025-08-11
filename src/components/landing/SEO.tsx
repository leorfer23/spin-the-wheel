import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Rooleta para Tiendanube - Ruleta de Premios que Aumenta tus Ventas 35% | Gamificación E-commerce",
  description = "Incrementa las ventas de tu Tiendanube con Rooleta. Ruleta de la fortuna, juegos interactivos y gamificación para tiendas online. +35% conversión garantizada. Integración en 5 minutos.",
  keywords = "tiendanube ruleta, ruleta premios tiendanube, gamificación tiendanube, aumentar ventas tiendanube, juegos tiendanube, ruleta de la fortuna tiendanube, incrementar conversiones ecommerce, captación emails tiendanube, marketing gamificado, spin wheel tiendanube, aplicación ruleta tienda online, app ruleta premios, sorteos tiendanube, promociones interactivas tiendanube",
  canonicalUrl = "https://rooleta.com",
  ogImage = "/og-image-tiendanube.jpg"
}) => {
  useEffect(() => {
    document.title = title;

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attributeName = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const setLinkTag = (rel: string, href: string, hrefLang?: string) => {
      const selector = hrefLang 
        ? `link[rel="${rel}"][hrefLang="${hrefLang}"]`
        : `link[rel="${rel}"]`;
      let element = document.querySelector(selector) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        if (hrefLang) element.hreflang = hrefLang;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    setMetaTag('title', title);
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:locale', 'es_AR', true);
    setMetaTag('og:site_name', 'Rooleta para Tiendanube', true);
    
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:url', canonicalUrl, true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', ogImage, true);
    
    setMetaTag('robots', 'index, follow');
    setMetaTag('language', 'Spanish');
    setMetaTag('revisit-after', '7 days');
    setMetaTag('author', 'Rooleta');
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    setMetaTag('application-name', 'Rooleta para Tiendanube');
    setMetaTag('apple-mobile-web-app-title', 'Rooleta Tiendanube');
    
    setLinkTag('canonical', canonicalUrl);
    setLinkTag('alternate', 'https://rooleta.com/ar', 'es-AR');
    setLinkTag('alternate', 'https://rooleta.com/mx', 'es-MX');
    setLinkTag('alternate', 'https://rooleta.com/co', 'es-CO');
    setLinkTag('alternate', 'https://rooleta.com/cl', 'es-CL');
    setLinkTag('alternate', 'https://rooleta.com', 'es');
    setLinkTag('alternate', 'https://rooleta.com', 'x-default');

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Rooleta para Tiendanube",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "24900",
        "priceCurrency": "ARS",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "10000",
        "bestRating": "5",
        "worstRating": "1"
      },
      "description": "Aplicación de ruleta de premios para Tiendanube que aumenta las ventas hasta un 35% mediante gamificación",
      "screenshot": "https://rooleta.com/screenshot-tiendanube.jpg",
      "featureList": [
        "Integración nativa con Tiendanube",
        "Ruleta de premios personalizable",
        "Captura de emails automática",
        "Analytics en tiempo real",
        "Programación de campañas",
        "Soporte en español"
      ],
      "creator": {
        "@type": "Organization",
        "name": "Rooleta",
        "url": "https://rooleta.com"
      }
    };

    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Cómo instalo Rooleta en mi Tiendanube?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "La instalación es súper simple: 1) Crea tu cuenta en Rooleta, 2) Conecta tu Tiendanube con un click, 3) Personaliza tu ruleta y listo. Todo el proceso toma menos de 5 minutos."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cuánto aumentan las ventas con la ruleta de premios?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nuestros clientes de Tiendanube reportan un aumento promedio del 35% en sus conversiones. Algunas tiendas han llegado a incrementar sus ventas hasta un 42% en el primer mes."
          }
        },
        {
          "@type": "Question",
          "name": "¿Es compatible con todos los temas de Tiendanube?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí, Rooleta es 100% compatible con todos los temas de Tiendanube. Se adapta automáticamente al diseño de tu tienda sin necesidad de código."
          }
        },
        {
          "@type": "Question",
          "name": "¿Puedo personalizar los premios de la ruleta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Por supuesto! Puedes configurar descuentos, envío gratis, productos de regalo, y más. También puedes ajustar las probabilidades de cada premio según tu estrategia."
          }
        }
      ]
    };

    const localBusinessData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Rooleta - Ruleta de Premios para Tiendanube",
      "image": "https://rooleta.com/product-image.jpg",
      "description": "Aplicación de gamificación para tiendas Tiendanube. Aumenta tus ventas con ruletas interactivas.",
      "brand": {
        "@type": "Brand",
        "name": "Rooleta"
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "María González - Boutique María (Tiendanube)"
        },
        "reviewBody": "Incrementé mis ventas un 42% en el primer mes usando Rooleta en mi Tiendanube. La ruleta es adictiva y mis clientes la aman!"
      }
    };

    const addStructuredData = (data: any, id: string) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.innerHTML = JSON.stringify(data);
    };

    addStructuredData(structuredData, 'structured-data-app');
    addStructuredData(faqStructuredData, 'structured-data-faq');
    addStructuredData(localBusinessData, 'structured-data-product');

  }, [title, description, keywords, canonicalUrl, ogImage]);

  return null;
};