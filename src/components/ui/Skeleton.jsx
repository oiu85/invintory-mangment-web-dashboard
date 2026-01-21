const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    heading: 'h-6 w-3/4',
    title: 'h-8 w-1/2',
    avatar: 'h-12 w-12 rounded-full',
    image: 'h-48 w-full',
    card: 'h-64 w-full',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-10 w-full rounded-lg',
  };
  
  const style = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Skeleton;
