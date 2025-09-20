// Mock Supabase client for local development without Supabase account

export const supabase = {
  from: (table) => ({
    select: (columns) => ({
      eq: (column, value) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: (column, options) => Promise.resolve({ data: [], error: null })
      }),
      or: (condition) => ({
        order: (column, options) => Promise.resolve({ data: [], error: null })
      }),
      order: (column, options) => Promise.resolve({ data: [], error: null })
    }),
    insert: (data) => Promise.resolve({ data: null, error: null }),
    update: (updates) => ({
      eq: (column, value) => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: (column, value) => Promise.resolve({ data: null, error: null })
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: (callback) => {
      // Mock auth state change
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithOAuth: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
}
