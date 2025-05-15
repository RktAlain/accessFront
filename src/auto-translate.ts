import { translationMap } from './language-context';

let currentObserver: MutationObserver | null = null;

export const setupAutoTranslate = (language: Language) => {
  // Nettoyer l'observeur existant
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }

  const translateTextNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
      const text = node.nodeValue.trim();
      
      // 1. Si le texte est une clé française directe
      if (translationMap[text as keyof typeof translationMap]) {
        const translated = translationMap[text as keyof typeof translationMap][language];
        if (translated) {
          node.nodeValue = node.nodeValue.replace(text, translated);
        }
        return;
      }

      // 2. Chercher dans toutes les traductions
      for (const [french, translations] of Object.entries(translationMap)) {
        if (translations.en === text || translations.mg === text) {
          const translated = language === 'fr' ? french : translations[language];
          if (translated) {
            node.nodeValue = node.nodeValue.replace(text, translated);
          }
          return;
        }
      }
    }
  };

  const translateElement = (element: HTMLElement | Document) => {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = walker.nextNode()) {
      translateTextNode(node);
    }
  };

  // Fonction pour retraduire tout le document
  const retranslate = () => {
    // Petit délai pour laisser le DOM s'initialiser
    setTimeout(() => {
      translateElement(document.body);
    }, 50);
  };

  // Traduction initiale
  retranslate();

  // Observer les nouveaux éléments ajoutés au DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          translateElement(node as HTMLElement);
        } else if (node.nodeType === Node.TEXT_NODE) {
          translateTextNode(node);
        }
      });
    });
  });

  currentObserver = observer;
  return () => {
    if (currentObserver) {
      currentObserver.disconnect();
      currentObserver = null;
    }
  };
};