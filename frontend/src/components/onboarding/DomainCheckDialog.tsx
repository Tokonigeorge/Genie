import React from 'react';

interface DomainCheckDialogProps {
  domain: string;
  onRequestAccess: () => void;
  onCreateNew: () => void;
}

const DomainCheckDialog: React.FC<DomainCheckDialogProps> = ({
  domain,
  onRequestAccess,
  onCreateNew,
}) => {
  return (
    <div className='p-6 bg-white rounded-xl shadow-lg'>
      <h2 className='text-xl font-medium mb-4'>
        We found an existing organization
      </h2>
      <p className='text-[#777777] mb-6'>
        We noticed that {domain} already has an organization. Would you like to:
      </p>

      <div className='space-y-4'>
        <button
          onClick={onRequestAccess}
          className='w-full p-4 border border-[#1F90FF] text-[#1F90FF] rounded-[90px] hover:bg-[#1F90FF] hover:text-white transition-colors'
        >
          Request to join existing organization
        </button>

        <button
          onClick={onCreateNew}
          className='w-full p-4 bg-[#292929] text-white rounded-[90px] hover:bg-gray-800'
        >
          Create new organization
        </button>
      </div>
    </div>
  );
};

export default DomainCheckDialog;
