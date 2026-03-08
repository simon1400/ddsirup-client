"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-left"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-coral group-[.toaster]:!text-white group-[.toaster]:!border-coral group-[.toaster]:shadow-lg",
          description: "group-[.toast]:!text-white/80",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-coral",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
