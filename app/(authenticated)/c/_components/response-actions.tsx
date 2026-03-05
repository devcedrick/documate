"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Repeat, ChevronLeft, ChevronRight } from "lucide-react";
import { UIMessage } from "@ai-sdk/react";
import { ChatRequestOptions } from "ai";
import type { BranchMeta } from "./chat-split-view";

interface ResponseActionsProps {
  message: UIMessage;
  handleRegeneration: (
    options?: { messageId?: string } & ChatRequestOptions,
  ) => Promise<void>;
  branchMeta?: BranchMeta;
  onSwitchBranch?: (messageId: string) => Promise<void>;
}

const ResponseActions = ({
  message,
  handleRegeneration,
  branchMeta,
  onSwitchBranch,
}: ResponseActionsProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const textParts = message.parts.filter((part) => part.type === "text") as {
      text: string;
    }[];
    const fullText = textParts.map((part) => part.text).join("\n");
    await navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  console.log(branchMeta);

  const showBranchNav =
    branchMeta && branchMeta.sibling_count > 1 && onSwitchBranch;
  const prevId =
    showBranchNav && branchMeta.sibling_index > 1
      ? branchMeta.sibling_ids[branchMeta.sibling_index - 2]
      : null;
  const nextId =
    showBranchNav && branchMeta.sibling_index < branchMeta.sibling_count
      ? branchMeta.sibling_ids[branchMeta.sibling_index]
      : null;

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          {isCopied ? (
            <Check className="h-4 w-4 text-green-400" strokeWidth={3} />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () =>
            await handleRegeneration({ messageId: message.id })
          }
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>
      {showBranchNav && (
        <>
          <span className="text-muted-foreground/60 mx-0.5" aria-hidden>
            |
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => prevId && onSwitchBranch(prevId)}
              disabled={!prevId}
              aria-label="Previous response"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-10 text-center tabular-nums">
              {branchMeta.sibling_index} / {branchMeta.sibling_count}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => nextId && onSwitchBranch(nextId)}
              disabled={!nextId}
              aria-label="Next response"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResponseActions;
