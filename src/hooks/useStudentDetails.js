import { useQueries } from '@tanstack/react-query';
import axios from 'axios';

// Base URL for the API, matching PaymentsController
const BASE_URL = 'http://localhost:8080/api/payments';

// Helper function to fetch data from an endpoint
const fetchFromEndpoint = async (endpoint, studentId) => {
  try {
    // Construct URL: empty endpoint for allDetails, others append their path
    const url = endpoint ? `${BASE_URL}/students/${studentId}/${endpoint}` : `${BASE_URL}/students/${studentId}`;
    console.log(`Fetching from: ${url}`); // Debug log
    const response = await axios.get(url);
    console.log(`Response for ${endpoint || 'allDetails'}:`, response.data); // Debug log
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching ${endpoint || 'allDetails'} for student ${studentId}:`, error.response?.status, error.message);
      // Don't return null for 404, let the component handle it
    }
    throw error; // Always throw the error to let React Query handle it
  }
};

// Custom hook to fetch student data
const useStudentData = (studentId) => {
  const endpoints = [
    { key: 'allDetails', endpoint: '', queryKey: ['studentAllDetails', studentId] },
    { key: 'basic', endpoint: 'basic', queryKey: ['studentBasic', studentId] },
    { key: 'payment', endpoint: 'payment', queryKey: ['studentPayment', studentId] },
    { key: 'feeDetails', endpoint: 'fee-details', queryKey: ['studentFeeDetails', studentId] },
    { key: 'cards', endpoint: 'cards', queryKey: ['studentCards', studentId] },
    { key: 'feeInstallments', endpoint: 'fee-installments', queryKey: ['studentFeeInstallments', studentId] },
    { key: 'paymentHistory', endpoint: 'payment-history', queryKey: ['studentPaymentHistory', studentId] },
    { key: 'concessions', endpoint: 'concessions', queryKey: ['studentConcessions', studentId] },
    { key: 'pocketMoney', endpoint: 'pocket-money', queryKey: ['studentPocketMoney', studentId] },
    { key: 'transport', endpoint: 'transport', queryKey: ['studentTransport', studentId] },
    { key: 'books', endpoint: 'books', queryKey: ['studentBooks', studentId] },
    { key: 'cancellations', endpoint: 'cancellations', queryKey: ['studentCancellations', studentId] },
  ];

  const queries = useQueries({
    queries: endpoints.map(({ key, endpoint, queryKey }) => ({
      queryKey,
      queryFn: () => fetchFromEndpoint(endpoint, studentId),
      enabled: !!studentId, // Only run if studentId is provided
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) return false; // Don't retry on 404
        return failureCount < 3; // Retry up to 3 times for other errors
      },
      // Add staleTime to prevent unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Build studentData object with simplified success/error logic
  const studentData = endpoints.reduce((acc, { key }, index) => {
    const query = queries[index];
    
    // Simplified logic: if query succeeded and has data, it's successful
    const hasData = query.data !== undefined && query.data !== null;
    const isEmpty = Array.isArray(query.data) && query.data.length === 0;
    
    acc[key] = {
      data: query.data,
      isLoading: query.isLoading,
      error: query.error,
      // Success if query succeeded and has non-null data (empty arrays are still considered successful)
      isSuccess: query.isSuccess && hasData,
      // Error if query failed OR returned null/undefined (but not empty arrays)
      isError: query.isError || (!query.isLoading && !hasData),
      isEmpty: isEmpty, // Add this to distinguish between error and empty data
    };
    return acc;
  }, {});

  // Overall loading state
  const isLoading = queries.some((query) => query.isLoading);
  
  // Overall error state (at least one query failed)
  const isError = queries.some((query) => query.isError);
  
  // Overall success state (all enabled queries succeeded)
  const isSuccess = queries.every((query) => query.isSuccess || query.isLoading);

  console.log('Student Data Debug:', {
    studentId,
    isLoading,
    isError,
    isSuccess,
    individualQueries: queries.map((q, i) => ({
      key: endpoints[i].key,
      isLoading: q.isLoading,
      isSuccess: q.isSuccess,
      isError: q.isError,
      hasData: q.data !== undefined && q.data !== null,
      dataType: Array.isArray(q.data) ? 'array' : typeof q.data,
      dataLength: Array.isArray(q.data) ? q.data.length : 'N/A'
    }))
  });
  
  return { studentData, isLoading, isError, isSuccess };
};

export default useStudentData;