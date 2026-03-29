import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  className?: string;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSendDisabled: boolean;
  isStreaming: boolean;
  onStop: () => void;
}

const ChatInput = ({
  className,
  input,
  handleInputChange,
  handleSubmit,
  isSendDisabled,
  isStreaming,
  onStop,
}: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSendDisabled) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <InputGroup className={cn(className)}>
        <InputGroupTextarea
          placeholder="Ask a question about your document…"
          className="min-w-full max-h-35"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon align="block-end">
          {!isStreaming ? (
            <InputGroupButton
              variant="default"
              className="px-2! py-4! ml-auto "
              type="submit"
              disabled={isSendDisabled}
            >
              <Send /> Send
            </InputGroupButton>
          ) : (
            <InputGroupButton
              variant="default"
              className="px-2! py-4! ml-auto "
              type="button"
              onClick={onStop}
            >
              <Square /> Stop
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
};

export default ChatInput;
