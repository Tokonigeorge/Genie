import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/commons/Logo';
import Footer from '../components/layouts/Footer';
import Step1 from '../components/onboarding/Step1';
import Step2 from '../components/onboarding/Step2';
import Step3Success from '../components/onboarding/Step3Success';
import { authApi, OnboardingStatusResponse } from '../services/auth';
import { step1Schema, step2Schema } from '../utils/onboardingValidation';
import { z } from 'zod';
import { useAuth } from '../contexts/useAuth';
import AccessRequest from '../components/onboarding/AccessRequest';

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type OnboardingState =
  | 'loading'
  | 'newUser'
  | 'newUserWithOrg' // Add this new state
  | 'pendingAccess'
  | 'error'
  | 'success';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [onboardingState, setOnboardingState] =
    useState<OnboardingState>('loading');
  const [statusData, setStatusData] = useState<OnboardingStatusResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  // const [formData, setFormData] = useState<{
  //   step1: Step1Data | null;
  //   step2: Step2Data | null;
  // }>({
  //   step1: null,
  //   step2: null,
  // });

  // const navigate = useNavigate();

  // const handleNext = () => {
  //   if (currentStep < 3) {
  //     setCurrentStep(currentStep + 1);
  //   } else {
  //     navigate('/');
  //   }
  // };

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      // Don't fetch if we already have status data
      if (statusData || !session) return;

      setOnboardingState('loading');
      setError(null);
      try {
        const data = await authApi.getOnboardingStatus();
        if (!mounted) return;

        setStatusData(data);
        if (data.membership_status === 'active') {
          navigate('/');
        } else if (data.membership_status === 'invited') {
          setOnboardingState('pendingAccess');
        } else if (!data.membership_status) {
          if (data.domain_exists) {
            // Domain exists but user isn't a member yet
            setOnboardingState('newUserWithOrg');
          } else {
            // Completely new user, no existing org
            if (data.first_name && data.last_name) {
              setCurrentStep(2);
            } else {
              setCurrentStep(1);
            }
            setOnboardingState('newUser');
          }
        } else {
          setOnboardingState('error');
          setError('Unexpected membership status received.');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching onboarding status:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch onboarding status.'
        );
        setOnboardingState('error');
      }
    };

    if (!authLoading && session) {
      fetchStatus();
    } else if (!authLoading && !session) {
      navigate('/login');
    }

    return () => {
      mounted = false;
    };
  }, [authLoading, session, navigate, statusData]);

  const handleStep1Complete = async (data: Step1Data) => {
    // Update user info via API
    try {
      await authApi.updateUser({
        first_name: data.firstName,
        last_name: data.lastName,
      });
      // Update local status data if needed, or rely on next step to use latest
      setStatusData((prev) =>
        prev
          ? { ...prev, first_name: data.firstName, last_name: data.lastName }
          : null
      );
      setCurrentStep(2);
      setError(null);
    } catch (updateError) {
      console.error('Error updating user:', updateError);
      // Show error to user on Step 1 form?
      setError('Failed to save your name. Please try again.');
    }
  };
  // const handleStep2Complete = async (data: Step2Data) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('name', data.companyName);
  //     formData.append('domain', data.domain);
  //     formData.append('workspace_url', data.workspaceUrl);
  //     if (data.companyLogo) {
  //       formData.append('logo', data.companyLogo);
  //     }

  //     await authApi.createOrganization(formData);
  //     setCurrentStep(3);
  //   } catch (error) {
  //     console.error('Error creating organization:', error);
  //   }
  // };

  const handleStep2Complete = async (data: Step2Data) => {
    // Create organization via API
    try {
      const formData = new FormData();
      formData.append('name', data.companyName);
      // Ensure domain is derived correctly (maybe from user email or input)
      // For now, assuming it's part of Step 2 data
      const userDomain = statusData?.email.split('@')[1] || '';
      formData.append('domain', userDomain);
      formData.append('workspace_url', data.workspaceUrl);
      if (data.companyLogo) {
        formData.append('logo', data.companyLogo);
      }
      console.log('Form data entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      await authApi.createOrganization(formData);
      setOnboardingState('success'); // Move to success state
      setCurrentStep(3); // Also update step number for consistency if needed
      setError(null);
    } catch (orgError) {
      console.error('Error creating organization:', orgError);
      // Show error on Step 2 form?
      setError(
        orgError instanceof Error
          ? orgError.message
          : 'Failed to create organization.'
      );
    }
  };

  // const handlePrevious = () => {
  //   if (currentStep > 1) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };
  const handlePrevious = () => {
    if (currentStep > 1 && onboardingState === 'newUser') {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  // const renderStep = () => {
  //   switch (currentStep) {
  //     case 1:
  //       return <Step1 onNext={handleStep1Complete} />;
  //     case 2:
  //       return (
  //         <Step2 onNext={handleStep2Complete} onPrevious={handlePrevious} />
  //       );
  //     case 3:
  //       return <Step3Success onComplete={handleComplete} />;
  //     default:
  //       return <Step1 onNext={handleStep1Complete} />;
  //   }
  // };
  const renderContent = () => {
    switch (onboardingState) {
      case 'loading':
        return (
          <div className='flex justify-center items-center h-64'>
            Loading...
          </div>
        );
      case 'pendingAccess':
        // Render AccessRequest component, passing the domain
        return (
          <AccessRequest
            domain={statusData?.organization_domain || 'your company'}
          />
        );
      case 'newUserWithOrg':
        return (
          <AccessRequest
            domain={
              statusData?.organization_domain ||
              statusData?.email.split('@')[1] ||
              'your company'
            }
            orgId={statusData?.organization_id || ''}
            isNewUser={true}
          />
        );
      case 'newUser':
        // Render the multi-step form container
        return (
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
                {/* Display API errors here */}
                {error && <p className='text-red-500 mt-2'>{error}</p>}
              </div>
              {currentStep === 1 && <Step1 onNext={handleStep1Complete} />}
              {currentStep === 2 && (
                <Step2
                  onNext={handleStep2Complete}
                  onPrevious={handlePrevious}
                />
              )}
            </div>
            {/* Right side image/placeholder */}
            <div className='w-1/2 bg-[#F0F0F0]'></div>
          </div>
        );
      case 'success':
        // Render the success component outside the two-column layout
        return (
          <div className='w-[70%]'>
            <Step3Success onComplete={handleComplete} />
          </div>
        );
      case 'error':
        return <div className='text-red-500 text-center'>Error: {error}</div>;
      default:
        return null;
    }
  };

  return (
    <div className='flex min-h-screen flex-col p-10 bg-[#F9F9F9]'>
      {/* Logo at the top */}
      <div className='mb-8'>
        <Logo />
      </div>
      <div className='flex-grow flex items-center justify-center'>
        {renderContent()}
      </div>
      {/* Main content container */}
      {/* {currentStep === 3 ? (
        <div className='flex-grow flex items-center justify-center'>
          <div className='w-[70%]'>{renderStep()}</div>
        </div>
      ) : (
        <div className='flex-grow flex items-center justify-center '>
          <div className='w-[70%] flex overflow-hidden border border-[#EBEBEB] rounded-4xl'> */}
      {/* Left side with form */}
      {/* <div className='w-1/2 p-10 bg-[#FCFCFC]'>
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
      )} */}

      {/* Footer at the bottom */}
      <div className='mt-auto'>
        <Footer onboarding={true} />
      </div>
    </div>
  );
};

export default Onboarding;
