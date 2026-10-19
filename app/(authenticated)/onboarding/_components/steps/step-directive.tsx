import React from 'react'
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { GraduationCap, Scale, FileText, Code, Globe } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { StepProps } from '../types'

const USE_CASES = [
  { id: "student", label: "The Tutor", icon: GraduationCap, desc: "Simple explanations & analogies." },
  { id: "legal", label: "The Paralegal", icon: Scale, desc: "Strict citation & verbatim quotes." },
  { id: "research", label: "The Analyst", icon: FileText, desc: "Methodology & data focus." },
  { id: "technical", label: "The Engineer", icon: Code, desc: "Code blocks & implementation." },
  { id: "general", label: "The Generalist", icon: Globe, desc: "Balanced for general tasks." },
]

const DirectiveForm = ({value, onChange}: StepProps) => {
  return (
    <div>
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {USE_CASES.map((item) => (
          <div key={item.id}>
            <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
            <Label
              htmlFor={item.id}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent/50",

                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="h-5 w-5" />
                <span className="font-semibold text-base">{item.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {item.desc}
              </p>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default DirectiveForm