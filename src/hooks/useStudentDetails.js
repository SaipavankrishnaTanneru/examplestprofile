import { useQueries } from '@tanstack/react-query';
import axios from 'axios';

// Base URL for the API, matching PaymentsController
const BASE_URL = 'http://localhost:8080/api/payments';

// Helper function to fetch data from an endpoint
const fetchFromEndpoint = async (endpoint, studentId) => {
  try {
    // Construct URL: special case for allDetails, others append their path
    const url = endpoint === 'details' 
      ? `${BASE_URL}/${studentId}/details`
      : `${BASE_URL}/${studentId}/${endpoint}`;
    console.log(`Fetching from: ${url}`); // Debug log
    const response = await axios.get(url);
    console.log(`Response for ${endpoint}:`, response.data); // Debug log
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching ${endpoint} for student ${studentId}:`, error.response?.status, error.message);
      if (error.response?.status === 404) {
        return null; // Return null for 404 to distinguish from other errors
      }
    }
    throw error; // Throw other errors for React Query to handle
  }
};

// Custom hook to fetch student data
const useStudentData = (studentId) => {
  const endpoints = [
    { key: 'allDetails', endpoint: 'details', queryKey: ['studentAllDetails', studentId] },
    { key: 'basic', endpoint: '', queryKey: ['studentBasic', studentId] },
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
    { key: 'additionalDetails', endpoint: 'additional-details', queryKey: ['studentAdditionalDetails', studentId] },
    { key: 'campusDetails', endpoint: 'campus-details', queryKey: ['studentCampusDetails', studentId] },
    { key: 'otherFeeHeads', endpoint: 'other-fee-heads', queryKey: ['studentOtherFeeHeads', studentId] },
    { key: 'pmIssues', endpoint: 'pm-issues', queryKey: ['studentPmIssues', studentId] },
    { key: 'selectClasses', endpoint: 'select-classes', queryKey: ['studentSelectClasses', studentId] },
    { key: 'uniformPrints', endpoint: 'uniform-prints', queryKey: ['studentUniformPrints', studentId] },
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
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
      // Handle null responses (e.g., 404) explicitly
      select: (data) => data ?? null,
    })),
  });

  // Build studentData object
  const studentData = endpoints.reduce((acc, { key }, index) => {
    const query = queries[index];
    
    const hasData = query.data !== undefined && query.data !== null;
    const isEmpty = Array.isArray(query.data) && query.data.length === 0;

    acc[key] = {
      data: query.data,
      isLoading: query.isLoading,
      error: query.error,
      isSuccess: query.isSuccess && hasData,
      isError: query.isError || (!query.isLoading && !hasData && query.data !== null),
      isEmpty: isEmpty,
      // Add status for easier debugging
      status: query.status,
    };
    return acc;
  }, {});

  // Overall states
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const isSuccess = queries.every((query) => query.isSuccess || !query.isEnabled);

  // Debug logging
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
      status: q.status,
      hasData: q.data !== undefined && q.data !== null,
      dataType: Array.isArray(q.data) ? 'array' : typeof q.data,
      dataLength: Array.isArray(q.data) ? q.data.length : 'N/A',
    })),
  });

  return { studentData, isLoading, isError, isSuccess };
};

export default useStudentData;