import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterProps } from '@/interface/Interface';
import { Funnel } from 'lucide-react';
import { useState } from 'react';

const Filter = ({ sortBy, onSort }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={sortBy ? 'secondary' : 'outline'} size="icon">
          <Funnel />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSort('area-asc')}>
            Maydon: Kichikdan kattaga 📈
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort('area-desc')}>
            Maydon: Kattadan kichikga 📉
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filter;