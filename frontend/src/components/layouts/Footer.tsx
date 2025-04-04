interface FooterProps {
  elements?: string[];
  onboarding?: boolean;
}

const Footer: React.FC<FooterProps> = ({ elements, onboarding }) => {
  return (
    <div className='text-center text-sm font-medium text-[#777777] font-geist'>
      <div className='flex justify-between items-center space-x-4'>
        {onboarding ? (
          <>
            <span className=' font-semibold flex flex-col items-start'>
              Logged in as:{' '}
              <span className='text-[#333333]'>david@geniestudio.ai</span>
            </span>
            <span>Pro . Enterprises</span>
            <button className='text-[#333333]font-semibold bg-[#EDEDED] rounded-4xl py-2 px-5'>
              Log Out
            </button>
          </>
        ) : elements && elements.length > 0 ? (
          elements.map((element, index) => <span key={index}>{element}</span>)
        ) : (
          <>
            <span>© Genie Labs, 2023</span>
            <span>Pro . Enterprises</span>
            <span>Terms of Service</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Footer;
