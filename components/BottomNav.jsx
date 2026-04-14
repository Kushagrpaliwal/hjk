'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, Home, Wallet, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: Home, path: '/game' },
    { name: 'Sports', icon: Dumbbell, path: '/sports' },
    { name: 'Transactions', icon: Wallet, path: '/transactions' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-black/70 backdrop-blur-lg border-t border-white/10">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link key={index} href={item.path}>
              <div className="flex flex-col items-center text-xs">
                <Icon
                  size={22}
                  className={`transition ${
                    isActive ? 'text-cyan-400 scale-110' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`mt-1 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
