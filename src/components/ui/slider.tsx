"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  showValue?: boolean
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">{label}</label>
            {showValue && props.value && (
              <span className="text-sm text-muted-foreground">{props.value}</span>
            )}
          </div>
        )}
        <input
          type="range"
          className={cn(
            "w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
