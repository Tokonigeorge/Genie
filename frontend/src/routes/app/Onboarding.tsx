import { redirect } from 'react-router-dom';
import React, { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import Logo from '../../components/commons/Logo';
import Footer from '../../components/layouts/Footer';
import Step1 from '../../components/onboarding/Step1';
import Step2 from '../../components/onboarding/Step2';
import Step3Success from '../../components/onboarding/Step3Success';
import { authApi, OnboardingStatusResponse } from '../../services/auth';
import { step1Schema, step2Schema } from '../../utils/onboardingValidation';
import { z } from 'zod';
import AccessRequest from '../../components/onboarding/AccessRequest';
import { PUBLIC_EMAIL_DOMAINS } from '../../constants/emails';

// Loader to fetch onboarding status
export async function loader() {
  try {
    const data = await authApi.getOnboardingStatus();

    // if (data.membership_status === 'active') {
    //   return redirect('/');
    // }

    return { statusData: data };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch onboarding status',
    };
  }
}

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type OnboardingState =
  | 'loading'
  | 'newUser'
  | 'newUserWithOrg'
  | 'pendingAccess'
  | 'error'
  | 'success';

const Onboarding: React.FC = () => {
  const { statusData, error: loaderError } = useLoaderData() as {
    statusData: OnboardingStatusResponse;
    error?: string;
  };
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [onboardingState, setOnboardingState] =
    useState<OnboardingState>('success');
  const [error, setError] = useState<string | null>(loaderError || null);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (statusData) {
      const userDomain = statusData.domain || '';
      if (statusData.membership_status === 'invited') {
        setOnboardingState('pendingAccess');
      } else if (!statusData.membership_status) {
        if (
          statusData.domain_exists &&
          !PUBLIC_EMAIL_DOMAINS.includes(userDomain)
        ) {
          setOnboardingState('newUserWithOrg');
        } else {
          if (statusData.first_name && statusData.last_name) {
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
    }
  }, [statusData]);

  const handleStep1Complete = async (data: Step1Data) => {
    try {
      await authApi.updateUser({
        first_name: data.firstName,
        last_name: data.lastName,
      });
      setCurrentStep(2);
      setError(null);
    } catch (updateError) {
      console.error('Error updating user:', updateError);
      setError('Failed to save your name. Please try again.');
    }
  };

  const handleStep2Complete = async (data: Step2Data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.companyName);
      const userDomain = statusData?.email.split('@')[1] || '';
      formData.append('domain', userDomain);
      formData.append('workspace_url', data.workspaceUrl);
      if (data.companyLogo) {
        formData.append('logo', data.companyLogo);
      }
      await authApi.createOrganization(formData);
      setOnboardingState('success');
      setCurrentStep(3);
      setError(null);
    } catch (orgError) {
      console.error('Error creating organization:', orgError);
      setError(
        orgError instanceof Error
          ? orgError.message
          : 'Failed to create organization.'
      );
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1 && onboardingState === 'newUser') {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (onboardingState) {
      case 'loading':
        return (
          <div className='flex justify-center items-center h-64'>
            Loading...
          </div>
        );
      case 'pendingAccess':
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
        return (
          <div className='w-[70%] flex overflow-hidden border border-[#EBEBEB] rounded-4xl'>
            <div className='w-1/2 p-10 bg-white'>
              <div className='mb-6'>
                <p className='text-sm font-medium text-[#949494]'>
                  0{currentStep}&nbsp;/&nbsp;03
                </p>
                <h1 className='text-2xl leading-8 font-medium mt-4 text-[#333333]'>
                  {currentStep === 1
                    ? `Let's get to know you`
                    : `Let's make it official`}
                </h1>
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
            <div className='w-1/2 bg-[#F0F0F0]'></div>
          </div>
        );
      case 'success':
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
    <div className='flex min-h-screen flex-col p-10 bg-[#F9F9F9] font-geist'>
      <div className='mb-8'>
        <Logo />
      </div>
      <div className='flex-grow flex items-center justify-center'>
        {renderContent()}
      </div>
      <div className='mt-auto'>
        <Footer onboarding={true} />
      </div>
    </div>
  );
};

export default Onboarding;
