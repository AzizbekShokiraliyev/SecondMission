import { useForm } from "react-hook-form" // MUHIM: Bu yetishmayotgan edi
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react'
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useDispatch } from "react-redux"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/fairBase"
import { setUser } from "../store/authSlice"
import { toast } from "sonner"

const loginScheme = z.object({
  email: z.string().email({ message: "Iltimos, to'g'ri email manzilini kiriting" }),
  password: z.string().min(8, { message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" }),
})
type LoginValues = z.infer<typeof loginScheme>

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginScheme),
    defaultValues: { email: "", password: "" }
  })

  const onSubmit = async (data: LoginValues) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName 
      }))

      navigate("/dashboard")

    } catch (error: unknown) {
      if (error === "auth/wrong-password") {
        toast("Email yoki parol noto'g'ri!")
      } else {
        toast("Xatolik yuz berdi: " + error)
      }
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/20 px-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl text-center'>Login</CardTitle>
          <CardDescription className='text-center'>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type='email' placeholder='example@gmail.com' {...register("email")}/>
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <InputGroup>
                    <InputGroupInput 
                        type={showPassword ? "text" : "password"} 
                        placeholder='Enter password' 
                        {...register("password")}
                    />
                    <InputGroupAddon align="inline-end">
                        <Button size={"icon-xs"} type="button" variant={'ghost'} onClick={() => setShowPassword(!showPassword)} >
                           {showPassword ? <EyeIcon /> : <EyeOffIcon/>}
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
              </Field>
            </FieldGroup>
            
            <Button type="submit">Sign In</Button>
          </form>
        </CardContent>

        <CardFooter className='justify-center text-sm'>
          <p className='text-muted-foreground'>
            Don't have an account?{' '}
            <Link to="/register" className='text-primary underline font-medium'>
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login