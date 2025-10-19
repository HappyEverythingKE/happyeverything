import { useState } from 'react'

interface ShimmerImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  rounded?: boolean
  alt: string
  width: number
  height: number
}

export function ShimmerImage({
  className = '',
  rounded = true,
  alt,
  width,
  height,
  ...props
}: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={`relative overflow-hidden ${
        rounded ? 'rounded-2xl' : ''
      } ${className}`}
    >
      {!loaded && (
        <div className="from-dusk/10 via-dusk/20 to-dusk/10 absolute inset-0 animate-pulse bg-gradient-to-r" />
      )}
      <img
        {...props}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
