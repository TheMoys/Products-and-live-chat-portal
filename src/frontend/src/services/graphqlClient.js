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

  async requestWithAuth(query, variables = {}) {
    return this.request(query, variables);
  }
};

export default graphqlClient;