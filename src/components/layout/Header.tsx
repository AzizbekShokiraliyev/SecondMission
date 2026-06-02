import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Header = () => {


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">M</div>
          <span className="text-xl font-bold tracking-tight">MapFlow</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size='lg' asChild><Link to='/login'>Login</Link></Button>
          <Button size="lg" className="rounded-full px-5" asChild><Link to='/register'>Register</Link></Button>
        </div>
      </div>
    </header>
  )
}

export default Header