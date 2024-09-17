import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Timed Assessment Platform
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/admin" className="hover:text-gray-300">Admin</Link>
        </div>
      </div>
    </nav>
  );
}