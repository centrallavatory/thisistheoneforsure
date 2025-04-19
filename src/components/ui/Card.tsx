import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = ({ className, children, ...props }: CardProps) => (
  <div 
    className={cn(
      "rounded-lg border border-background-lighter bg-background-light p-4 shadow-sm", 
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = ({ className, children, ...props }: CardHeaderProps) => (
  <div 
    className={cn("mb-3 flex items-center justify-between", className)} 
    {...props}
  >
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const CardTitle = ({ className, children, ...props }: CardTitleProps) => (
  <h3 
    className={cn("text-lg font-medium text-gray-100", className)} 
    {...props}
  >
    {children}
  </h3>
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardDescription = ({ className, children, ...props }: CardDescriptionProps) => (
  <p 
    className={cn("text-sm text-gray-400", className)} 
    {...props}
  >
    {children}
  </p>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = ({ className, children, ...props }: CardContentProps) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter = ({ className, children, ...props }: CardFooterProps) => (
  <div 
    className={cn("mt-4 flex items-center justify-between", className)} 
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };