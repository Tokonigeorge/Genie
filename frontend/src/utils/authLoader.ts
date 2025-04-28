import { redirect } from 'react-router-dom';
import { requireAuth } from '../services/auth';

// Loader function to protect routes
export async function protectedLoader() {
  // Option 1: Simple check
  // const isAuthenticated = await checkAuth();
  // if (!isAuthenticated) {
  //   const currentPath = window.location.pathname + window.location.search;
  //   sessionStorage.setItem('redirectPath', currentPath);
  //   return redirect('/login');
  // }
  // return null; // Or fetch data for the route

  // Option 2: Use requireAuth utility which throws redirect
  try {
    const user = await requireAuth();
    return { user }; // Pass user data to the route component if needed
  } catch (error) {
    // If requireAuth throws a redirect, re-throw it
    if (error instanceof Response && error.status === 302) {
      throw error;
    }
    // Handle other potential errors if necessary
    console.error('Authentication check failed:', error);
    // Fallback redirect if something else went wrong
    throw redirect('/login');
  }
}
