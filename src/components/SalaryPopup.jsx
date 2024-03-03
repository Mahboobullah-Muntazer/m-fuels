import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

const SalaryPopup = ({ salaryData, onSaveAndExit, onClose }) => {
    const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
    const navigate = useNavigate(); 
  console.log("model:", salaryData);
  const { user } = useAuthContext();



  const [fullSalaryData, setFullSalaryData] = useState(null);

  useEffect(() => {
    
    const fetchSalaryData = async () => {
        const id = salaryData;
        if (salaryData) {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': user.token,
          },
        };

      try { 
          // Make a request to the server to get salary details along with employee information
           const res = await axios.get(
        `${SERVER_PATH}api/actions/getSalaryRecord/${id}`,
        config
      );

      console.log("responsePopup",res.data)
      setFullSalaryData(res.data);
  
        
      } catch (error) {
        console.error('Error fetching salary data:', error);
        // Handle error appropriately (e.g., show an error message to the user)
      }
    }
    };

    fetchSalaryData();
  }, [salaryData]);


  const handlePrint = () => {
     window.print();
 
  };
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };
  return (
    <Modal
      isOpen={!!salaryData} // Display the modal only if salaryData is available
      onRequestClose={onClose}
      // Apply an overlay class for styling
    >
      <div className="text-center p-4 border rounded-lg">
        <h2 className="text-2xl mb-4">ملګرو مشرقیوال شرکت</h2>
        <h3 className="text-lg mb-4">Salary Information</h3>

        {/* Salary Information Table */}
        <table className="border-collapse border w-full mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Position</th>
              <th className="border p-2">NIC</th>
              <th className="border p-2">Base Salary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{fullSalaryData?.employee.name}</td>
              <td className="border p-2">{fullSalaryData?.employee.position}</td>
              <td className="border p-2">{fullSalaryData?.employee.NIC}</td>
              <td className="border p-2">{fullSalaryData?.employee.salary}</td>
            </tr>
          </tbody>
        </table>

        <table className="border-collapse border w-full mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Invoice</th>
              <th className="border p-2">Salary Month</th>
              <th className="border p-2">Salary Year</th>
              <th className="border p-2">Salary Date</th>
              <th className="border p-2">Salary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
                
              <td className="border p-2">{fullSalaryData?.invoiceNumber}</td>
              <td className="border p-2">{fullSalaryData?.salaryMonth}</td>
              <td className="border p-2">{fullSalaryData?.salaryYear}</td>
              <td className="border p-2">{fullSalaryData ? formatDate(fullSalaryData.salaryDate) : ''}</td>
              <td className="border p-2">{fullSalaryData?.salaryAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Received By and Paid By Labels */}
        <div className="flex justify-between mb-4">
          <div className="w-1/2 pr-2">
            <label className="block mb-2">Received By:</label>
            {/* You can add an input field or signature component here for "Received By" */}
          </div>
          <div className="w-1/2 pl-2">
            <label className="block mb-2">Paid By:</label>
            {/* You can add an input field or signature component here for "Paid By" */}
          </div>
        </div>

        {/* Print button */}
       <div>
       <button className="bg-blue-500 text-white px-4 py-2 mr-2 rounded-md" onClick={handlePrint}>
    Print
  </button>
  <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={()=>{ navigate('/salaries');}}>
    Exit
  </button>
       </div>
      </div>

    </Modal>
  );
};

export default SalaryPopup;
