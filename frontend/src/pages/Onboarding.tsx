import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/commons/Logo';
import Footer from '../components/layouts/Footer';
import Step1 from '../components/onboarding/Step1';
import Step2 from '../components/onboarding/Step2';
import Step3 from '../components/onboarding/Step3';
import Step4 from '../components/onboarding/step4';
const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 4) {
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 onNext={handleNext} />;
      case 2:
        return <Step2 onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return (
          <Step3 onComplete={() => navigate('/')} onPrevious={handlePrevious} />
        );
      case 4:
        return (
          <Step4 onComplete={() => navigate('/')} onPrevious={handlePrevious} />
        );
      default:
        return <Step1 onNext={handleNext} />;
    }
  };

  return (
    <div className='flex min-h-screen flex-col p-10'>
      {/* Logo at the top */}
      <div className='mb-8'>
        <Logo />
      </div>

      {/* Main content container */}
      <div className='flex-grow flex items-center justify-center'>
        <div className='w-[70%] flex rounded-3xl overflow-hidden'>
          {/* Left side with form */}
          <div className='w-1/2 p-8 bg-white'>
            <div className='mb-6'>
              <p className='text-sm font-medium text-[#949494]'>
                STEP {currentStep}/04
              </p>
              <h1 className='text-3xl font-medium mt-2'>
                {currentStep === 1
                  ? 'Welcome to Genie'
                  : currentStep === 2
                  ? 'Tell us about yourself'
                  : currentStep === 3
                  ? 'Set your preferences'
                  : 'Complete your setup'}
              </h1>
            </div>

            {renderStep()}
          </div>

          <div className='w-1/2 bg-[#F9F9F9]'></div>
        </div>
      </div>

      {/* Footer at the bottom */}
      <div className='mt-auto'>
        <Footer onboarding={true} />
      </div>
    </div>
  );
};

export default Onboarding;
