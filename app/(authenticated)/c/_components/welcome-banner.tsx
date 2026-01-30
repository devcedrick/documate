import { useChatContext } from "@/hooks/use-chat-context";

export function WelcomeBanner() {
  const user = useChatContext();
  if (!user) return <div>Loading user...</div>;
  return (
    <div className="flex flex-col items-start justify-center w-xl h-full p-8 gap-3">
      <h1 className='text-left font-semibold text-3xl'>
        Welcome back, <br />
        <span className='text-5xl text-primary font-bold'>
          {user.firstName}!
        </span>
      </h1>
      <p className='text-sm text-muted-foreground'>
        Ready to dive into your documents? Just drag and drop a file to get started.
      </p>
    </div>
  );
}