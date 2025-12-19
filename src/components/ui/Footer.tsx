'use client';

import Image from 'next/image';
import { QDS_LOGO_URL, QDS_CONTACT_URL } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src={QDS_LOGO_URL}
              alt="QDS Logo"
              width={32}
              height={32}
              className="rounded"
              unoptimized
            />
            <span className="text-sm font-semibold text-gray-700">
              Quality Data Systems
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={QDS_CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-brand-navy transition-colors"
            >
              Contact Us
            </a>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500">
              Serving financial institutions for 40+ years
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
