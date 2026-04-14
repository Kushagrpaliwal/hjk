import React from "react";
import Image from "next/image";
import useLoaderStore from "../store/loaderStore";

/**
 * Loader component
 * @param {Object} props
 * @param {string} [props.message] - Optional loading message
 * @param {boolean} [props.fullscreen] - If true, covers the whole screen
 * @param {boolean} [props.useGlobalState] - If true, uses global loader state from store
 * @param {string} [props.size] - Size of the loader: 'sm', 'md', 'lg', 'xl'
 * @param {string} [props.variant] - Variant of the loader: 'spinner', 'dots', 'pulse'
 */
const Loader = ({ 
  message = "Loading...", 
  fullscreen = false, 
  useGlobalState = false,
  size = 'md',
  variant = 'spinner'
}) => {
  const { isLoading: globalIsLoading } = useLoaderStore();
  
  // Determine if loader should be shown
  const shouldShow = useGlobalState ? globalIsLoading : true;
  
  if (!shouldShow) return null;

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Variant components
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-current rounded-full animate-pulse`}></div>
        );
      case 'spinner':
      default:
        return (
          <Image
            width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
            height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
            src="/loader2.gif"
            alt="Loading..."
            className="object-contain"
          />
        );
    }
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="text-white">
          {/* Using regular img tag for better GIF support */}
          <img
            width={120}
            height={120}
            src="/loader2.gif"
            alt="Loading..."
            className="object-contain"
          />
        </div>
        {/* Removed text message, now using only image */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-gray-700">
        {renderVariant()}
      </div>
      {message && <div className="mt-2 text-gray-700 text-base font-medium">{message}</div>}
    </div>
  );
};

export default Loader; 