type BrandLoaderProps = {
  size?: number
  className?: string
}

export function BrandLoader({ size = 48, className }: BrandLoaderProps) {
  return (
    <img
      src="/favicon.svg"
      width={size}
      height={size}
      alt="Loading"
      className={`animate-bounce drop-shadow-sm [animation-duration:2.5s] ${className || ''}`}
      decoding="async"
      loading="eager"
    />
  )
}

export default BrandLoader
