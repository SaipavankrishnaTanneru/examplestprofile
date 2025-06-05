import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StudentSearch from './components/studentprofile';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <StudentSearch />
      </div>
    </QueryClientProvider>
  );
};

export default App;