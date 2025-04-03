import { useAuth } from '../contexts/useAuth';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className='flex h-screen'>
      <div className='w-1/6 bg-[#F0F0F0]'>
        {/* Navigation content will go here */}
      </div>

      <div className='w-5/6 p-8 rouned-l-xl'>
        <div className='flex h-full'>
          {/* Left side of main container */}
          <div className='w-1/2 space-y-6 pr-6 flex flex-col h-full'>
            {/* First container */}
            <div className='bg-[#F5F5F5] rounded-xl p-6 flex-grow'>
              <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
              <p className='mb-4'>Welcome to your dashboard!</p>
            </div>

            {/* Second container */}
            <div className='border border-[#F5F5F5] rounded-xl p-6 flex-grow'>
              <button
                onClick={logout}
                className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
              >
                Logout
              </button>
            </div>
          </div>

          {/* Right side of main container */}
          <div className='w-1/2 flex flex-col h-full'>
            {/* Header with icon button */}
            <div className='mb-6 flex justify-end'>
              <button className='p-2 rounded-full bg-gray-100 hover:bg-gray-200'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                  />
                </svg>
              </button>
            </div>

            {/* 2x2 Grid */}
            <div className='grid grid-cols-2 grid-rows-2 gap-4 flex-grow'>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className='bg-[#FAFAFA] rounded-xl p-4 h-full'
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
