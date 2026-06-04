import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import { useDispatch } from "react-redux"
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/fairBase'
import { setUser } from '../store/authSlice'
import { toast } from 'sonner'

const loginScheme = z.object({
  fullName: z.string().min(2, { message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" }),
  email: z.string().email({ message: "Iltimos, to'g'ri email manzilini kiriting" }),
  password: z.string().min(8, { message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" })
})
type RegisterValues = z.infer<typeof loginScheme>

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
      resolver: zodResolver(loginScheme),
      defaultValues: {fullName: "", email: "", password: "" }
    })

  const onSubmit = async (data: RegisterValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      await updateProfile(user, {displayName: data.fullName})

      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: data.fullName,
      }))

      navigate("/dashboard")

    } catch (error: unknown){
      if (error === "auth/email-already-in-use") {
        toast("Bu email allaqachon ro'yxatdan o'tgan!")
      } else {
        toast("Xatolik yuz berdi: " + error)
      }
      }
  }
  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/20 p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create new account for you</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>

              <Field>
                <FieldLabel>FullName</FieldLabel>
                <Input placeholder='Full name' type='text' {...register("fullName")}/>
                {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input placeholder='email@gmail.com' type='text' {...register("email")}/>
                {errors.email && <p className='text-destructive text-xm mt-1'>{errors.email.message}</p>}
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

            <Button>Register</Button>
            <Button>Register with Browser</Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className='justify-center text-sm'>
          <p className='text-muted-foreground'>
            Do you have account{' '}
            <Link to="/login" className='text-primary underline font-medium'>
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Register
