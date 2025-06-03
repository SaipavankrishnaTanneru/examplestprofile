import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// API function to fetch student details
const fetchStudentDetails = async (studentId) => {
  const response = await axios.get(`http://localhost:8080/api/students/${studentId}`);
  return response.data;
};

// Custom hook for fetching student details
export const useStudentDetails = (studentId) => {
  return useQuery({
    queryKey: ['studentDetails', studentId],
    queryFn: () => fetchStudentDetails(studentId),
    // staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    // retry: 2, // Retry failed requests twice
    // refetchOnWindowFocus: false, // Disable refetch on window focus
    enabled: !!studentId, // Only fetch if studentId is provided
  });
};
