import React, { useState } from 'react';
import { useStudentDetails } from '../hooks/useStudentDetails';
import './studentprofile.css';

const StudentProfile = () => {
  const [inputId, setInputId] = useState('23');
  const [studentId, setStudentId] = useState(23);
  
  const { data: student, isLoading, isError, error } = useStudentDetails(studentId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputId && !isNaN(inputId)) {
      setStudentId(parseInt(inputId));
    }
  };

  if (isLoading) return <div className="loading">Loading student details...</div>;
  if (isError) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="student-profile-container">
      <div className="id-search-container">
        <form onSubmit={handleSubmit} className="id-search-form">
          <div className="search-input-group">
            <label htmlFor="studentId">Enter Student ID:</label>
            <input
              type="number"
              id="studentId"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Student ID"
              min="1"
            />
          </div>
          <button type="submit" className="search-button">
            <i className="fas fa-search"></i> Load Profile
          </button>
        </form>
      </div>

      {student && (
        <>
          <div className="profile-header">
            <h1>{student.studentName}'s Profile</h1>
            <div className={`status-badge ${student.addmissionStatus.toLowerCase()}`}>
              {student.addmissionStatus}
            </div>
          </div>

          <div className="profile-grid">
            {/* Basic Information Section */}
            <div className="profile-section basic-info">
              <h2>Basic Information</h2>
              <div className="info-grid">
                {[
                  { label: 'Student ID', value: student.studentId },
                  { label: 'Gender', value: student.gender },
                  { label: 'Date of Birth', value: new Date(student.dateOfBirth).toLocaleDateString() },
                  { label: 'Group', value: student.groupName },
                  { label: 'Course Track', value: student.courseTrack },
                  { label: 'Section', value: student.section },
                  { label: 'Admission Type', value: student.addmissionType },
                  { label: 'Student Type', value: student.studentType },
                  { label: 'Aadhar Number', value: student.aadharNumber }
                ].map((item, index) => (
                  <div key={index}>
                    <label>{item.label}</label>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Family Information */}
            <div className="profile-section family-info">
              <h2>Family Information</h2>
              <div className="info-grid">
                <div>
                  <label>Father's Name</label>
                  <p>{student.fatherName}</p>
                </div>
                <div>
                  <label>Mother's Name</label>
                  <p>{student.motherName}</p>
                </div>
                <div className="full-width">
                  <label>Address</label>
                  <p>{student.address}</p>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            {student.cards && (
              <div className="profile-section academic-cards">
                <h2>Academic Performance</h2>
                <div className="cards-grid">
                  {[
                    { label: 'IPE Marks', value: student.cards.ipeMarks },
                    { label: 'Recent Marks', value: student.cards.recentMarks },
                    { label: 'EMCET Mock Test', value: student.cards.emcetMockTest },
                    { label: 'Attendance', value: student.cards.attendence }
                  ].map((card, index) => (
                    <div className="card" key={index}>
                      <h3>{card.label}</h3>
                      <p className="value">{card.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fee Information */}
            {student.feeDetails && (
              <div className="profile-section fee-info">
                <h2>Fee Details</h2>
                <div className="info-grid">
                  {[
                    { label: 'Course Fee', value: `₹${student.feeDetails.courseFee}` },
                    { label: 'Additional Amount', value: `₹${student.feeDetails.addiAmount}` },
                    { label: 'Concession', value: `₹${student.feeDetails.concession}` },
                    { label: 'Net Fee', value: `₹${student.feeDetails.netFee}` },
                    { label: 'Fee Paid', value: `₹${student.feeDetails.feePaid}` },
                    { 
                      label: 'Overall Due', 
                      value: `₹${student.feeDetails.overAlldue}`,
                      className: student.feeDetails.overAlldue > 0 ? 'due' : '' 
                    }
                  ].map((item, index) => (
                    <div key={index}>
                      <label>{item.label}</label>
                      <p className={item.className || ''}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transport Information */}
            {student.transport && (
              <div className="profile-section transport-info">
                <h2>Transport Details</h2>
                <div className="info-grid">
                  {[
                    { label: 'Route No', value: student.transport.routeNo },
                    { label: 'Route', value: `${student.transport.startFrom} to ${student.transport.toDestination}` },
                    { label: 'Stage', value: student.transport.stage },
                    { label: 'Driver Name', value: student.transport.busDriverName },
                    { label: 'Driver Contact', value: student.transport.driverContactNo },
                    { label: 'Status', value: student.transport.transportStatus === "1" ? "Active" : "Inactive" }
                  ].map((item, index) => (
                    <div key={index}>
                      <label>{item.label}</label>
                      <p>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            {student.paymentHistory && student.paymentHistory.length > 0 && (
              <div className="profile-section payment-history">
                <h2>Payment History</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Class</th>
                        <th>Academic Year</th>
                        <th>Payment Head</th>
                        <th>Amount</th>
                        <th>Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.paymentHistory.map((payment, index) => (
                        <tr key={index}>
                          <td>{payment.date}</td>
                          <td>{payment.className}</td>
                          <td>{payment.acedemicYear}</td>
                          <td>{payment.paymentHead}</td>
                          <td>₹{payment.amount}</td>
                          <td>{payment.paymentMode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentProfile;