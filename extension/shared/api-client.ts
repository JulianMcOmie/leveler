import { DefinitionRequest, DefinitionResponse } from './types';

// API URL - change to localhost for local development
// const API_URL = 'http://localhost:3000/api/chat';
const API_URL = 'https://leveler.dev/api/chat';

/**
 * Fetch definition from the Leveler API
 */
export async function fetchDefinition(
  request: DefinitionRequest
): Promise<DefinitionResponse> {
  try {
    const depth = request.history && request.history.length > 0 ? request.history.length : 0;
    const originalTopic = request.history && request.history.length > 0 ? request.history[0] : undefined;

    const requestBody = {
      message: request.selectedText,
      immediateContext: request.context,
      depth: depth,
      originalTopic: originalTopic,
      usedTerms: request.history || [],
    };

    console.log('🌐 API REQUEST:', {
      term: request.selectedText,
      contextLength: request.context.length,
      contextPreview: request.context.substring(0, 200) + '...'
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    // The API returns JSON with { response: string }
    const data = await response.json();

    return {
      definition: data.response || '',
    };
  } catch (error) {
    console.error('Error fetching definition:', error);
    return {
      definition: '',
      error: error instanceof Error ? error.message : 'Failed to fetch definition',
    };
  }
}
