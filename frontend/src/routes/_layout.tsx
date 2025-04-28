import { Outlet } from 'react-router-dom';
import Footer from '../components/layouts/Footer';
import Logo from '../components/commons/Logo';

export default function Layout() {
  return (
    <div className='min-h-screen flex flex-col bg-[#F9F9F9]'>
      <header className='mb-8'>
        <Logo />
      </header>
      <main className='flex-grow flex items-center justify-center'>
        <Outlet />
      </main>
      <footer className='mt-auto'>
        <Footer />
      </footer>
    </div>
  );
}
