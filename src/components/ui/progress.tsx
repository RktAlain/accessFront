
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  thickness?: 'thin' | 'default' | 'thick';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value, 
  indicatorClassName, 
  variant = 'default', 
  showValue = false,
  thickness = 'default',
  ...props 
}, ref) => {
  // Déterminer la classe à appliquer en fonction de la variante
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';  
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  // Déterminer la classe à appliquer en fonction de l'épaisseur
  const getThicknessClass = () => {
    switch (thickness) {
      case 'thin':
        return 'h-1.5';
      case 'thick':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  return (
    <div className={showValue ? "relative" : ""}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-secondary",
          getThicknessClass(),
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all", 
            getVariantClass(),
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      
      {showValue && (
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-white z-10">
          {value}%
        </span>
      )}
    </div>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
