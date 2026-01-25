"use client"

const Page = () => {

return (
  <div className='flex flex-col items-start justify-start w-full gap-2 mb-5'>
    <h1 className="text-3xl font-semibold">Ready to chat with your doc!</h1>
    <h2 className="text-base text-muted-foreground ">
      {`Feel free to ask for a summary, specific details, or just start a conversation about the content. What’s on your mind?`}
    </h2>
  </div>
)
}

export default Page