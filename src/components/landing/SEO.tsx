import React from 'react';
import { Helmet } from 'react-helmet-async';

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

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:site_name" content="Rooleta para Tiendanube" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Rooleta" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Tiendanube specific */}
      <meta name="application-name" content="Rooleta para Tiendanube" />
      <meta name="apple-mobile-web-app-title" content="Rooleta Tiendanube" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessData)}
      </script>
      
      {/* Alternate languages for Latin America */}
      <link rel="alternate" hrefLang="es-AR" href="https://rooleta.com/ar" />
      <link rel="alternate" hrefLang="es-MX" href="https://rooleta.com/mx" />
      <link rel="alternate" hrefLang="es-CO" href="https://rooleta.com/co" />
      <link rel="alternate" hrefLang="es-CL" href="https://rooleta.com/cl" />
      <link rel="alternate" hrefLang="es" href="https://rooleta.com" />
      <link rel="alternate" hrefLang="x-default" href="https://rooleta.com" />
    </Helmet>
  );
};