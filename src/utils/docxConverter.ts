// Utilitaire pour convertir les fichiers .docx en HTML
// src/utils/docxConverter.ts

import mammoth from 'mammoth';

/**
 * Convertit un fichier .docx en HTML
 * @param file - File object ou URL du fichier .docx
 * @returns Promise<string> - Le contenu HTML
 */
export const convertDocxToHtml = async (file: File | string): Promise<string> => {
  try {
    let arrayBuffer: ArrayBuffer;

    if (typeof file === 'string') {
      // ✅ Construire l'URL complète si relative
      let url = file;
      if (url.startsWith('/api/')) {
        url = `${import.meta.env.VITE_API_URL}${url.replace('/api', '')}`;
      }
      
      console.log('🔗 Downloading from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📡 Status:', response.status);
      console.log('📡 Content-Type:', response.headers.get('content-type'));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      arrayBuffer = await response.arrayBuffer();
      console.log('📦 Size:', arrayBuffer.byteLength, 'bytes');
    } else {
      arrayBuffer = await file.arrayBuffer();
    }

    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error converting DOCX:', error);
    throw new Error('Impossible de convertir le document DOCX');
  }
};

/**
 * Convertit un fichier .docx en texte brut (sans HTML)
 * @param file - File object ou URL du fichier .docx
 * @returns Promise<string> - Le contenu en texte brut
 */
export const convertDocxToText = async (file: File | string): Promise<string> => {
  try {
    let arrayBuffer: ArrayBuffer;
    if (typeof file === 'string') {
      // ✅ Construire l'URL complète si relative
      let url = file;
      if (url.startsWith('/api/')) {
        url = `${import.meta.env.VITE_API_URL}${url.replace('/api', '')}`;
      }
      
      console.log('🔗 Downloading text from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      arrayBuffer = await response.arrayBuffer();
    } else {
      arrayBuffer = await file.arrayBuffer();
    }

    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error converting DOCX to text:', error);
    throw new Error('Impossible de convertir le document DOCX en texte');
  }
};

/**
 * Prévisualise un fichier .docx (retourne HTML formaté)
 * @param file - File object ou URL
 * @returns Promise<string> - HTML formaté pour preview
 */
export const previewDocx = async (file: File | string): Promise<string> => {
  const html = await convertDocxToHtml(file);
  
  // Ajouter des styles CSS pour une meilleure présentation
  return `
    <div style="
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
      color: #333;
    ">
      ${html}
    </div>
  `;
};

/**
 * Nettoie le HTML généré par mammoth (enlève les styles inline excessifs)
 * @param html - HTML à nettoyer
 * @returns string - HTML nettoyé
 */
export const cleanMammothHtml = (html: string): string => {
  // Supprimer les styles inline excessifs
  let cleaned = html.replace(/style="[^"]*"/g, '');
  
  // Supprimer les spans vides
  cleaned = cleaned.replace(/<span><\/span>/g, '');
  
  // Normaliser les espaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned;
};