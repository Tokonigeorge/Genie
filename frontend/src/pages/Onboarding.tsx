import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/commons/Logo';
import Footer from '../components/layouts/Footer';
import Step1 from '../components/onboarding/Step1';
import Step2 from '../components/onboarding/Step2';
import Step3Success from '../components/onboarding/Step3Success';
const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 onNext={handleNext} />;
      case 2:
        return <Step2 onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return <Step3Success onComplete={handleComplete} />;
      default:
        return <Step1 onNext={handleNext} />;
    }
  };

  return (
    <div className='flex min-h-screen flex-col p-10 bg-[#F9F9F9]'>
      {/* Logo at the top */}
      <div className='mb-8'>
        <Logo />
      </div>

      {/* Main content container */}
      {currentStep === 3 ? (
        <div className='flex-grow flex items-center justify-center'>
          <div className='w-[70%]'>{renderStep()}</div>
        </div>
      ) : (
        <div className='flex-grow flex items-center justify-center '>
          <div className='w-[70%] flex overflow-hidden border border-[#EBEBEB] rounded-4xl'>
            {/* Left side with form */}
            <div className='w-1/2 p-10 bg-[#FCFCFC]'>
              <div className='mb-6'>
                <p className='text-sm font-medium text-[#949494]'>
                  0{currentStep}&nbsp;/&nbsp;02
                </p>
                <h1 className='text-2xl leading-8 font-medium mt-4 text-[#333333]'>
                  {currentStep === 1
                    ? `Let's get to know you.`
                    : `Let's make it official.`}
                </h1>
              </div>

              {renderStep()}
            </div>

            <div className='w-1/2 bg-[#F0F0F0]'></div>
          </div>
        </div>
      )}

      {/* Footer at the bottom */}
      <div className='mt-auto'>
        <Footer onboarding={true} />
      </div>
    </div>
  );
};

export default Onboarding;
