import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { FilterProps } from '@/interface/Interface'
import { Funnel } from 'lucide-react'
import { useState } from 'react'

const Filter = ({ sortBy, onSort }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={sortBy ? "secondary" : "outline"} size="icon">
                    <span><Funnel/></span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onSort("asc")}>A-Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("desc")}>Z-A</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
  )
}

export default Filter