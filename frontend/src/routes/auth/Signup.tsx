import {
  Form,
  useActionData,
  useNavigation,
  redirect,
  useSubmit,
} from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import Footer from '../../components/layouts/Footer';
import Logo from '../../components/commons/Logo';
import { authApi } from '../../services/auth';
import AccessRequest from '../../components/onboarding/AccessRequest';
import DomainCheckDialog from '../../components/onboarding/DomainCheckDialog';
import { EyeIcon } from '../../components/commons/EyeIcon';
import { GoogleLogo } from '../../components/commons/GoogleLogo';

// Action handles form POST
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const userId = formData.get('userId') as string;

  try {
    //register with backend
    await authApi.signup(email, null, userId);

    // Redirect to email verification page
    return redirect('/email-sent?email=' + encodeURIComponent(email));
  } catch (error: any) {
    return { error: error.message || 'Signup failed' };
  }
}

export default function Signup() {
  const actionData = useActionData() as { error?: string };
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDomainCheck, setShowDomainCheck] = useState(false);
  const [showAccessRequest, setShowAccessRequest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [domainInfo, setDomainInfo] = useState<{
    domain: string;
    orgId?: string;
  } | null>(null);

  const { signUp, signInWithGoogle } = useAuth();
  const submit = useSubmit();

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) setError(error.message);
  };

  // Domain check and access request logic
  const handleRequestAccess = async () => {
    if (!domainInfo) return;
    try {
      await authApi.requestAccess(domainInfo.orgId!);
      setShowDomainCheck(false);
      setShowAccessRequest(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  };

  const handleCreateNew = () => {
    setShowDomainCheck(false);
    window.location.href = '/onboarding';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      //signup with supabase
      const { data: supabaseData, error: supabaseError } = await signUp(
        email,
        password
      );

      if (!supabaseData?.user || supabaseError) {
        throw new Error('An error occured, please try again.');
      }
      submit({ email, userId: supabaseData.user.id }, { method: 'post' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen bg-[#FFFFFF]'>
      {showDomainCheck && domainInfo && (
        <DomainCheckDialog
          domain={domainInfo.domain}
          onRequestAccess={handleRequestAccess}
          onCreateNew={handleCreateNew}
        />
      )}
      {showAccessRequest && domainInfo && (
        <AccessRequest domain={domainInfo.domain} />
      )}
      {/* Left side with form */}
      <div className='w-full md:w-1/2 flex flex-col p-10'>
        <div className='mb-8 flex justify-center'>
          <Logo />
        </div>
        <div className='flex-grow flex items-center justify-center'>
          <div className='w-full max-w-md'>
            <h1 className='text-6xl font-medium mb-2 leading-tight text-center'>
              Create Like
              <br />
              Magic
            </h1>
            <p className='text-secondary mb-8 text-center font-geist text-[#777777]'>
              No Three Wishes Needed.
            </p>
            <Form method='post' onSubmit={handleSubmit}>
              {error && <div className='text-red-500 mb-4'>{error}</div>}
              {actionData?.error && (
                <div className='text-red-500 mb-4'>{actionData.error}</div>
              )}
              <div className='mb-6 flex flex-col gap-2'>
                <div className='group w-full border border-[#F5F5F5] rounded-2xl p-3'>
                  <label
                    htmlFor='email'
                    className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
                  >
                    Email address
                  </label>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='Yourname@example.com'
                    className='w-full text-[#CFCFCF] text-sm font-geist border-none outline-none'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='group w-full border border-[#F5F5F5] rounded-2xl p-3'>
                  <label
                    htmlFor='password'
                    className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
                  >
                    Password
                  </label>
                  <div className='relative'>
                    <input
                      id='password'
                      name='password'
                      type='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='Enter your password'
                      className='w-full text-[#CFCFCF] text-sm font-geist border-none outline-none'
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-[#CFCFCF] cursor-pointer  '
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>
              </div>
              <button
                type='submit'
                disabled={loading || navigation.state === 'submitting'}
                className='w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button'
              >
                {loading || navigation.state === 'submitting'
                  ? 'Creating account...'
                  : 'Create an Account'}
              </button>
            </Form>
            <p className='text-center text-[#777777] mt-6 text-base font-medium font-geist'>
              Already have an account?{' '}
              <a
                href='/login'
                className='text-[#1F90FF] font-medium font-geist hover:underline'
              >
                Login
              </a>
            </p>
            {/* Divider */}
            <div className='flex items-center my-6'>
              <div className='flex-grow border-t border-[#F5F5F5]'></div>
              <span className='px-4 text-[#777777] text-base font-medium font-geist'>
                Or
              </span>
              <div className='flex-grow border-t border-[#F5F5F5]'></div>
            </div>
            {/* Google login */}
            <button
              disabled={loading}
              onClick={handleGoogleSignIn}
              className='w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-[#333333] text-base justify-center p-3 border border-[#8080801F] rounded-[90px] font-geist'
              type='button'
            >
              <GoogleLogo />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
      {/* Right side with background */}
      <div className='hidden md:flex md:w-1/2 md:flex-col md:justify-between'>
        <div className='flex-grow my-4 mx-4 bg-[#F9F9F9] rounded-3xl flex items-end'>
          <div className='p-12  w-full'>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
