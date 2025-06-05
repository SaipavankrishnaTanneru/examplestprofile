import React, { useState } from 'react';
import useStudentData from '../hooks/useStudentDetails';
import './studentprofile.css';

const StudentSearch = () => {
  const [studentId, setStudentId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedDataType, setSelectedDataType] = useState(null);
  const { studentData, isLoading, isError, isSuccess } = useStudentData(studentId);

  const handleSearch = () => {
    const id = parseInt(inputValue, 10);
    if (!isNaN(id) && id > 0) {
      setStudentId(id);
      setSelectedDataType(null); // Reset selected data type on new search
    } else {
      alert('Please enter a valid positive student ID');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Updated dataTypes to include all endpoints from the hook
  const dataTypes = [
    { key: 'allDetails', label: 'All Details' },
    { key: 'basic', label: 'Basic Details' },
    { key: 'payment', label: 'Payment' },
    { key: 'feeDetails', label: 'Fee Details' },
    { key: 'cards', label: 'Cards' },
    { key: 'feeInstallments', label: 'Fee Installments' },
    { key: 'paymentHistory', label: 'Payment History' },
    { key: 'concessions', label: 'Concessions' },
    { key: 'pocketMoney', label: 'Pocket Money' },
    { key: 'transport', label: 'Transport' },
    { key: 'books', label: 'Books' },
    { key: 'cancellations', label: 'Cancellations' },
    { key: 'additionalDetails', label: 'Additional Details' },
    { key: 'campusDetails', label: 'Campus Details' },
    { key: 'otherFeeHeads', label: 'Other Fee Heads' },
    { key: 'pmIssues', label: 'Pocket Money Issues' },
    { key: 'selectClasses', label: 'Selected Classes' },
    { key: 'uniformPrints', label: 'Uniform Prints' },
  ];

  // Helper to render data in a user-friendly format
  const renderData = (dataType, data) => {
    if (!data && data !== null) {
      return <div className="text-red-500">Data unavailable</div>;
    }

    if (data === null) {
      return <div className="text-red-500">No record found (404)</div>;
    }

    // Handle arrays (e.g., feeInstallments, paymentHistory, uniformPrints)
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <div className="text-yellow-500">No records found (empty)</div>;
      }
      return (
        <div>
          <div className="text-sm text-gray-600 mb-2">Found {data.length} record(s)</div>
          <ul className="list-disc pl-5">
            {data.map((item, index) => (
              <li key={index} className="mb-2">
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Handle single objects (e.g., basic, payment, campusDetails)
    return (
      <div className="bg-gray-100 p-4 rounded">
        <pre className="text-sm overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  };

  // Get the status for a specific data type
  const getDataTypeStatus = (dataType) => {
    if (!studentData || !studentData[dataType]) return 'unknown';

    const typeData = studentData[dataType];
    if (typeData.isLoading) return 'loading';
    if (typeData.isError) return 'error';
    if (typeData.isEmpty) return 'empty';
    if (typeData.isSuccess) return 'success';
    return 'unknown';
  };

  // Get button color based on data availability
  const getButtonColor = (dataType) => {
    const status = getDataTypeStatus(dataType);
    const isSelected = selectedDataType === dataType;

    if (isSelected) return 'bg-blue-500 text-white';

    switch (status) {
      case 'loading':
        return 'bg-yellow-200 text-gray-800';
      case 'error':
        return 'bg-red-200 text-gray-800';
      case 'empty':
        return 'bg-orange-200 text-gray-800';
      case 'success':
        return 'bg-green-200 text-gray-800 hover:bg-green-300';
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Data Search</h1>

      {/* Search Bar */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter Student ID (e.g., 123)"
          className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Debug Info */}
      {studentId && (
        <div className="mb-6 p-4 bg-gray-50 rounded text-sm shadow-sm">
          <strong>Debug Info:</strong> Student ID: {studentId} | Overall Status:{' '}
          {isLoading ? 'Loading' : isError ? 'Error' : isSuccess ? 'Success' : 'Idle'}
        </div>
      )}

      {/* Buttons for Data Types */}
      {studentId && (
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {dataTypes.map(({ key, label }) => {
              const status = getDataTypeStatus(key);
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDataType(key)}
                  className={`px-4 py-2 rounded text-sm font-medium ${getButtonColor(
                    key
                  )} transition-colors`}
                  title={`Status: ${status}`}
                >
                  {label}
                  {status === 'loading' && ' ⏳'}
                  {status === 'error' && ' ❌'}
                  {status === 'empty' && ' ⚪'}
                  {status === 'success' && ' ✅'}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Legend: ⏳ Loading | ❌ Error | ⚪ Empty | ✅ Has Data
          </div>
        </div>
      )}

      {/* Data Display */}
      {isLoading && !studentData && (
        <div className="text-blue-500">Loading student data...</div>
      )}

      {studentId && selectedDataType && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">
            {dataTypes.find((dt) => dt.key === selectedDataType)?.label || 'Selected Data'}
          </h2>

          {studentData && studentData[selectedDataType] ? (
            <div>
              {studentData[selectedDataType].isLoading ? (
                <div className="text-blue-500">Loading {selectedDataType}...</div>
              ) : studentData[selectedDataType].isSuccess ? (
                renderData(selectedDataType, studentData[selectedDataType].data)
              ) : studentData[selectedDataType].isError ? (
                <div className="text-red-500">
                  <div>
                    No data available for{' '}
                    {dataTypes.find((dt) => dt.key === selectedDataType)?.label}
                  </div>
                  {studentData[selectedDataType].error && (
                    <div className="text-sm mt-1">
                      Error: {studentData[selectedDataType].error.message || 'Unknown error'}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Debug: Status={studentData[selectedDataType].status}, isError=
                    {String(studentData[selectedDataType].isError)}, isEmpty=
                    {String(studentData[selectedDataType].isEmpty)}, hasData=
                    {String(
                      studentData[selectedDataType].data !== null &&
                        studentData[selectedDataType].data !== undefined
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-yellow-500">No data (empty or unavailable)</div>
              )}
            </div>
          ) : (
            <div className="text-red-500">Selected data type not found in studentData</div>
          )}
        </div>
      )}

      {!studentId && (
        <div className="text-gray-500">Please enter a student ID to fetch data.</div>
      )}
    </div>
  );
};

export default StudentSearch;