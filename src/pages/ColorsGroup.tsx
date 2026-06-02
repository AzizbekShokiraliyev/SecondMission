import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { RouteColorPickerProps } from '@/interface/Interface'
import { Button } from '@/components/ui/button'

const ROUTE_COLORS = [
  { hex: "#378ADD", name: "Ko'k" },
  { hex: "#1D9E75", name: "Yashil" },
  { hex: "#E24B4A", name: "Qizil" },
  { hex: "#EF9F27", name: "Sariq" },
  { hex: "#7F77DD", name: "Binafsha" },
]

const ColorsGroup = ({ value, onChange }: RouteColorPickerProps) => {
  return (
    <div className="flex items-center gap-2 p-3 m-2 rounded-xl border">
      {ROUTE_COLORS.map((color) => (
        <Button key={color.hex} title={color.name} onClick={() => onChange(color.hex)}
          className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform",
          value === color.hex ? "border-black scale-110" : "border-transparent hover:scale-105")} style={{ backgroundColor: color.hex }}>
          {value === color.hex && (
            <Check className="w-4 h-4 text-white stroke-[3]" />
          )}
        </Button>
      ))}
    </div>
  )
}

export default ColorsGroup