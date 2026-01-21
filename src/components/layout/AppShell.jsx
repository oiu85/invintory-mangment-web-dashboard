const AppShell = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex h-screen bg-neutral-50 dark:bg-neutral-900 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default AppShell;
