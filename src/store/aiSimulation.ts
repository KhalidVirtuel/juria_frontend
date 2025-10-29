
// Simulate AI responses for the chat

// Function to simulate the response of the AI with a delay
export async function simulateAIResponse(userMessage: string): Promise<string> {
  // Simulate a delay of response between 1 and 3 seconds
  const responseTime = 1000 + Math.random() * 2000;
  
  await new Promise(resolve => setTimeout(resolve, responseTime));
  
  // Examples of legal responses
  const responses = [
    "D'après le Code civil marocain (Dahir des obligations et contrats), cette situation relève de l'article 78 concernant la responsabilité contractuelle. Je vous conseille d'examiner les termes exacts du contrat pour déterminer les recours possibles.",
    
    "Dans le contexte du droit marocain, cette affaire pourrait être résolue par médiation conformément à la loi 08-05 relative à l'arbitrage et à la médiation conventionnelle. Cela permettrait potentiellement d'éviter un long processus judiciaire.",
    
    "La jurisprudence récente de la Cour de cassation marocaine suggère une interprétation favorable à votre client dans ce type de litige. L'arrêt n°1234 du 15 mars 2022 établit un précédent pertinent que nous pourrions utiliser.",
    
    "Cette situation implique plusieurs aspects du Code du travail marocain, notamment les articles 39 à 45 relatifs à la rupture du contrat. Les indemnités potentielles dépendront de l'ancienneté du salarié et des circonstances précises du licenciement.",
    
    "Je vous recommande de préparer une mise en demeure formelle selon les dispositions de l'article 254 du DOC (Dahir des Obligations et des Contrats). Cela constituerait une première étape prudente avant d'entamer une action en justice."
  ];
  
  // Select a random response
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return randomResponse;
}
