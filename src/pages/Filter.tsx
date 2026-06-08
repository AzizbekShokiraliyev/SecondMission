import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { FilterProps } from '@/interface/Interface';
import { Check, Funnel } from 'lucide-react';
import { useState } from 'react';

const Filter = ({ sortBy, onSort }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStyle = (currentSort: string) => sortBy === currentSort ? "bg-accent text-accent-foreground font-bold" : "";


  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={sortBy ? 'secondary' : 'outline'} size="icon">
          <Funnel />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSort('area-asc')} className={getStyle('area-asc')}>
            Maydon: Kattadan kichikga 📉
            {sortBy === 'area-asc' && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort('area-desc')} className={getStyle('area-desc')}>
            Maydon: Kichikdan kattaga 📈
            {sortBy === 'area-desc' && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filter;

