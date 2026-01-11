import React from 'react';
import type { ReactNode } from 'react';

interface ScrollLinkProps {
    href: string;
    children: ReactNode;
    mobile?: boolean;
    onClick?: () => void;
}

const ScrollLink: React.FC<ScrollLinkProps> = ({ href, children, mobile, onClick }) => (
    <a
        href={href}
        onClick={onClick}
        className={`${mobile ? 'block text-2xl py-4' : 'text-sm font-medium'} text-gray-200 hover:text-red-500 transition-colors uppercase tracking-wider`}
    >
        {children}
    </a>
);

export default ScrollLink;
