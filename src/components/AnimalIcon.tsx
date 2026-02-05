import React from 'react';

interface AnimalIconProps {
  type: string;
  className?: string;
}

export function AnimalIcon({ type, className = "" }: AnimalIconProps) {
  // Recognisable silhouettes / relief forms
  switch (type) {
    case 'eagle':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12,2L14.5,7L22,8L17,12L18,19.5L12,16L6,19.5L7,12L2,8L9.5,7L12,2Z" className="opacity-20" />
          <path d="M12 4L10 8H6L9 11L8 15L12 13L16 15L15 11L18 8H14L12 4Z" />
          <path d="M2 10C5 10 7 8 12 8C17 8 19 10 22 10L21 11C18 11 16 9 12 9C8 9 6 11 3 11L2 10Z" />
        </svg>
      );
    case 'tortoise':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 4C14.5 4 17 5 18 8C19 11 18 14 16 16C14 18 10 18 8 16C6 14 5 11 6 8C7 5 9.5 4 12 4Z" />
          <path d="M12 6C10 6 8 7 8 9C8 11 10 12 12 12C14 12 16 11 16 9C16 7 14 6 12 6Z" className="opacity-40" />
          <path d="M7 6L5 4M17 6L19 4M7 14L5 16M17 14L19 16M12 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'otter':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M18 4C16 4 15 5 15 7C15 9 17 10 19 10C21 10 22 8 22 6C22 4 20 4 18 4Z" />
          <path d="M15 8C12 8 10 10 10 13C10 16 12 18 15 18H18C20 18 22 16 22 14V12C22 10 20 8 18 8H15Z" />
          <path d="M10 14C8 14 2 16 2 20C2 22 4 22 6 22C10 22 12 18 12 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'dolphin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M2 12C2 12 5 11 9 11C13 11 18 13 22 13C22 13 20 10 16 8C12 6 7 7 5 9C3 11 2 12 2 12Z" />
          <path d="M12 9C12 9 13 6 15 5C13 6 12 9 12 9Z" />
          <path d="M9 11C9 11 8 15 10 18C12 21 16 22 16 22C16 22 14 20 13 17C12 14 13 11 13 11" />
        </svg>
      );
    case 'wombat':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M4 14C4 11 6 8 12 8C18 8 20 11 20 14V18C20 19 19 20 18 20H6C5 20 4 19 4 18V14Z" />
          <path d="M7 20V22H10V20H7ZM14 20V22H17V20H14Z" />
          <path d="M18 10C19 10 20 9 20 8C20 7 19 6 18 6C17 6 16 7 16 8C16 9 17 10 18 10Z" className="opacity-40" />
        </svg>
      );
    case 'kangaroo':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M17 4C17 3 18 2 20 2C22 2 22 4 21 5C20 6 18 6 18 8V10L14 12L12 16L14 20H6L4 16L6 14L10 12L12 8L14 6L17 4Z" />
          <path d="M6 20C4 20 2 21 2 22C2 23 4 23 10 23C16 23 22 21 22 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'bee':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <circle cx="12" cy="14" r="4" />
          <path d="M12 10C12 10 10 7 10 5C10 3 12 2 12 2C12 2 14 3 14 5C14 7 12 10 12 10Z" />
          <path d="M8 13C8 13 5 11 4 11C3 11 2 12 2 13C2 14 3 15 4 15C5 15 8 13 8 13Z" />
          <path d="M16 13C16 13 19 11 20 11C21 11 22 12 22 13C22 14 21 15 20 15C19 15 16 13 16 13Z" />
        </svg>
      );
    case 'swan':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M16 4C14 4 13 6 13 8C13 11 15 12 15 15V18C15 20 13 21 10 21C7 21 4 20 4 18V16C4 16 6 15 10 15C14 15 16 16 16 16V4Z" />
          <path d="M16 4C18 4 20 5 20 7C20 9 18 10 16 10C14 10 12 9 12 7C12 5 14 4 16 4Z" className="opacity-40" />
        </svg>
      );
    case 'bear':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M6 8C4 8 4 10 4 12V18C4 20 6 21 8 21H16C18 21 20 20 20 18V12C20 10 20 8 18 8H6Z" />
          <path d="M7 8V6C7 4 9 4 10 4C11 4 12 5 12 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 8V6C17 4 15 4 14 4C13 4 12 5 12 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'owl':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 4C9 4 7 6 7 10V14C7 18 9 20 12 20C15 20 17 18 17 14V10C17 6 15 4 12 4Z" />
          <path d="M9 10C9 11 10 12 11 12C12 12 13 11 13 10C13 9 12 8 11 8C10 8 9 9 9 10Z" className="opacity-40" />
          <path d="M13 10C13 11 14 12 15 12C16 12 17 11 17 10C17 9 16 8 15 8C14 8 13 9 13 10Z" className="opacity-40" />
          <path d="M7 6L5 4M17 6L19 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
