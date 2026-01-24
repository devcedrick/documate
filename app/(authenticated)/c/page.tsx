"use client"

import React from 'react'
import UploadZone from './_components/upload-zone'
import DocumentPreview from './_components/document-preview'
import { useState } from 'react'

const page = () => {
  const [uploadedDoc, setUploadedDoc] = useState(null)

return (
  <div className='flex items-center justify-center w-full h-full'>
    {uploadedDoc ? (
      <DocumentPreview 
        doc={uploadedDoc} 
        onDelete={() => setUploadedDoc(null)} 
      />
    ) : (
      <UploadZone onUploadComplete={setUploadedDoc} />
    )}
  </div>
)
}

export default page
