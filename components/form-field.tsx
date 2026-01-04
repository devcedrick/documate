import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type FormFieldProps = {
  id: string
  name: string
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  defaultValue?: string
  children?: React.ReactNode 
}

export const FormField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  className,
  defaultValue,
  children,
}: FormFieldProps) => (
  <div className={cn('grid gap-2', className)}>
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-destructive font-bold">*</span>}
    </Label>
    <Input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={defaultValue}
      className={cn(error && 'border-destructive')}
    />
    {error && <p className="text-destructive text-xs leading-tight -mt-1">{error}</p>}
    {children}
  </div>
)
