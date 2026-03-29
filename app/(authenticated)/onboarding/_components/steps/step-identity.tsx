import React from 'react'
import { FormField } from '@/components/form-field'

interface IdentityProtocolFormProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

const IdentityProtocolForm = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange
}: IdentityProtocolFormProps) => {
  return (
    <div className='flex gap-6'>
      <FormField 
        id='firstname'
        name='firstname'
        label='First Name'
        placeholder='John'
        value={firstName}
        onChange={(e) => onFirstNameChange(e.target.value)}
        className='flex-1'
        required
      />

      <FormField 
        id='lastname'
        name='lastname'
        label='Last Name'
        placeholder='Doe'
        value={lastName}
        onChange={(e) => onLastNameChange(e.target.value)}
        className='flex-1'
        required
      />
      
    </div>
  )
}

export default IdentityProtocolForm
