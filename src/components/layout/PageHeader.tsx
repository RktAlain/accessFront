
import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, children }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
};

export default PageHeader;
