import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, size = 24, className }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.Circle size={size} className={className} />;
  return <IconComponent size={size} className={className} />;
};
