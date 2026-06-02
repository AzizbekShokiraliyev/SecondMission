import { Button } from '@/components/ui/button'

const Hero = () => {
  return (
    <section className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tighter md:text-5xl">
          Yo'lingizni <span className="text-primary">osonlik</span> bilan <span className="text-primary">toping</span>
        </h1>
        
        <p className="text-lg text-muted-foreground md:text-xl">
          Eng qisqa marshrutlarni aniqlang, manzilni tanlang va 
          xaritada real vaqt rejimida kuzatib boring.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" className='px-8 py-4'>
            Xaritani boshlash
          </Button>
          <Button size="lg" variant="outline" className="px-8">
            Qanday ishlaydi?
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero