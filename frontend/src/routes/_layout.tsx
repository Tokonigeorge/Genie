import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className='min-h-screen flex flex-col bg-[#F9F9F9]'>
      <main className='w-full h-full'>
        <Outlet />
      </main>
    </div>
  );
}
