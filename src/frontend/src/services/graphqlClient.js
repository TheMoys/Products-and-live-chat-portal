const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

console.log('🔗 GraphQL Endpoint:', GRAPHQL_ENDPOINT);

const graphqlClient = {
  async request(query, variables = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📤 GraphQL Request:', { 
      endpoint: GRAPHQL_ENDPOINT, 
      hasToken: !!token,
      variables,
      query: query.substring(0, 150) + '...'
    });
    
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      console.log('📥 Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const result = await response.json();
      console.log('📦 Result:', result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.errors?.[0]?.message || response.statusText}`);
      }
      
      if (result.errors) {
        console.error('❌ GraphQL Errors:', result.errors);
        throw new Error(result.errors[0]?.message || 'GraphQL Error');
      }
      
      return result.data;
    } catch (error) {
      console.error('💥 GraphQL Request Error:', error);
      throw error;
    }
  },

  // ✅ Método para mutations (compatible con Apollo Client)
  async mutate({ mutation, variables = {} }) {
    // Extraer el string de la query si es un objeto gql
    const queryString = typeof mutation === 'string' 
      ? mutation 
      : mutation.loc?.source?.body || mutation.toString();
    
    const data = await this.request(queryString, variables);
    return { data };
  },

  // ✅ Método para queries (compatible con Apollo Client)
  async query({ query, variables = {} }) {
    // Extraer el string de la query si es un objeto gql
    const queryString = typeof query === 'string' 
      ? query 
      : query.loc?.source?.body || query.toString();
    
    const data = await this.request(queryString, variables);
    return { data };
  },

  async requestWithAuth(query, variables = {}) {
    return this.request(query, variables);
  }
};

export default graphqlClient;