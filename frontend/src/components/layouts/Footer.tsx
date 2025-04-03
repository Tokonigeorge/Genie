const Footer: React.FC = ({ elements }: { elements?: string[] }) => {
  return (
    <div className='text-center text-[14px] font-medium text-[#777777]'>
      <div className='flex justify-between space-x-4'>
        {elements && elements.length > 0 ? (
          elements.map((element, index) => <span key={index}>{element}</span>)
        ) : (
          <>
            <span>© Genie Labs, 2023</span>
            <span>For Enterprises</span>
            <span>Terms of Service</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Footer;
