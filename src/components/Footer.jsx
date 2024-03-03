import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 mt-10 text-white py-8">
      <div className="container mx-auto text-center">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
          <p>If you have any questions or inquiries, feel free to reach out to us.</p>
        </div>
        <div className="flex justify-center ml-5 items-center space-x-4">
          <p>Email: </p>
          <a href="mailto:founders.softvisions@outlook.com" className="text-blue-400 hover:underline">
            founders.softvisions@outlook.com
          </a>
        </div>
        <div className="mt-2 ml-[-40px]">
          <p>Contact Number: +93787232020</p>
        </div>
        <p className="mt-4">&copy; 2024 Softvisions. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
