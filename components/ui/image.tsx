'use client';

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useState } from 'react';

interface ImageProps extends NextImageProps {
  fallbackSrc?: string;
}

export function Image({ fallbackSrc = '/images/default-avatar.png', alt, ...props }: ImageProps) {
  const [error, setError] = useState(false);

  return (
    <NextImage
      {...props}
      src={error ? fallbackSrc : props.src}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}
