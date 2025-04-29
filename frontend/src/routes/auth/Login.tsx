import { redirect, useSubmit } from 'react-router-dom';
import { authApi } from '../../services/auth';
import React, { useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import Footer from '../../components/layouts/Footer';
import Logo from '../../components/commons/Logo';
import { GoogleLogo } from '../../components/commons/GoogleLogo';
import { EyeIcon } from '../../components/commons/EyeIcon';

// Action to handle login form submission
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const userId = formData.get('userId') as string;

  try {
    const backendResponse = await authApi.login(email, userId);

    // Redirect based on onboarding status
    if (backendResponse.needs_onboarding) {
      return redirect('/onboarding');
    } else {
      return redirect('/');
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
}

const Login: React.FC = () => {
  const actionData = useActionData() as { error?: string };
  const navigation = useNavigation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();

  const submit = useSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: supabaseData, error: supabaseError } = await signIn(
        email,
        password
      );

      if (!supabaseData?.user || supabaseError) {
        throw new Error('An error occured, please try again.');
      }
      submit({ email, userId: supabaseData.user.id }, { method: 'post' });
    } catch (err: any) {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data: supabaseData, error: supabaseError } =
        await signInWithGoogle();
      if (supabaseError || !supabaseData.user) {
        throw new Error(
          supabaseError?.message || 'Google authentication failed'
        );
      }
      // Process login with backend
      await authApi.login(supabaseData.user.email, supabaseData.user.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen bg-[#FFFFFF]'>
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
              {actionData?.error && (
                <div className='text-red-500 mb-4'>{actionData.error}</div>
              )}
              <div className='mb-6 space-y-2'>
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
                      type={showPassword ? 'text' : 'password'}
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
                  ? 'Logging in...'
                  : 'Login'}
              </button>
            </Form>
            <p className='text-center text-[#140909] mt-6 text-base font-medium font-geist'>
              Don&apos;t have an account?{' '}
              <a
                href='/signup'
                className='text-[#1F90FF] font-medium font-geist hover:underline'
              >
                Sign up
              </a>
            </p>
            <div className='flex items-center my-6'>
              <div className='flex-grow border-t border-[#F5F5F5]'></div>
              <span className='px-4 text-[#777777] text-base font-medium font-geist'>
                Or
              </span>
              <div className='flex-grow border-t border-[#F5F5F5]'></div>
            </div>
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
      <div className='hidden md:flex md:w-1/2 md:flex-col md:justify-between '>
        <div className='flex-grow my-4 mx-4 bg-[#F9F9F9] rounded-3xl flex items-end'>
          <div className='p-12  w-full'>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
