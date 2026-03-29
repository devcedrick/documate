"use client";

import { BranchMessage } from "@/app/(authenticated)/c/[chatId]/page";
import { BranchMeta } from "@/app/(authenticated)/c/_components/chat-split-view";
import { useEffect, useMemo, useState } from "react";

interface MessageTreeNode {
  message: BranchMessage;
  children: MessageTreeNode[];
  activeChildIndex: number;
}

interface MessageTree {
  root: MessageTreeNode;
  node: Map<string, MessageTreeNode>;
}

export function useMessageTree() {
  const [messageTree, setMessageTree] = useState<MessageTree | null>(null);

  // Builds the message tree (LOCAL FUNCTION only)
  const buildTreeFromDatabase = (
    allMessages: BranchMessage[],
    headMessageId: string,
  ) => {
    if (allMessages.length === 0) return;

    const nodes = new Map<string, MessageTreeNode>();

    for (const msg of allMessages) {
      nodes.set(msg.id, {
        message: msg,
        children: [],
        activeChildIndex: 0,
      });
    }

    let rootNode: MessageTreeNode | null = null;
    for (const msg of allMessages) {
      if (msg.parent_id === null) {
        rootNode = nodes.get(msg.id)!;
      } else {
        const parentNode = nodes.get(msg.parent_id);
        if (parentNode) {
          parentNode.children.push(nodes.get(msg.id)!);
        }
      }
    }

    for (const node of nodes.values()) {
      node.children.sort(
        (a, b) =>
          new Date(a.message.created_at).getTime() -
          new Date(b.message.created_at).getTime(),
      );
    }

    setMessageTree({
      root: rootNode!,
      node: nodes,
    });

    setActivePath(headMessageId);
  };

  // Re-calculates BRANCH META when there is mutation from MESSAGE TREE
  const branchMeta = useMemo(() => {
    if (!messageTree) return null;

    const metaMap = new Map<string, BranchMeta>();
    for (const node of messageTree.node.values()) {
      if (node.children.length > 1) {
        const siblingIds = node.children.map((c) => c.message.id);
        for (let i = 0; i < node.children.length; i++) {
          metaMap.set(node.children[i].message.id, {
            sibling_count: node.children.length,
            sibling_index: i + 1,
            sibling_ids: siblingIds,
          });
        }
      }
    }

    return metaMap;
  }, [messageTree]);

  // Insert a new node of message into the tree
  const insertMessage = (message: BranchMessage) => {
    setMessageTree((prev) => {
      const newNode = {
        message: message,
        children: [],
        activeChildIndex: 0,
      };

      if (!prev) {
        const newNodes = new Map<string, MessageTreeNode>();
        newNodes.set(message.id, newNode);
        return {
          root: newNode,
          node: newNodes,
        };
      }

      const newNodes = new Map(prev.node);
      newNodes.set(message.id, newNode);

      if (message.parent_id) {
        const parentNode = newNodes.get(message.parent_id);
        if (parentNode) {
          const alreadyChild = parentNode.children.some(
            (c) => c.message.id === message.id,
          );
          if (!alreadyChild) {
            parentNode.children = [...parentNode.children, newNode];
            parentNode.activeChildIndex = parentNode.children.length - 1;
          }
        }
      }

      return {
        ...prev,
        node: newNodes,
      };
    });
  };

  const activeBranch = useMemo(() => {
    if (!messageTree) return [];

    const branch: BranchMessage[] = [];
    let current: MessageTreeNode | undefined = messageTree.root;
    while (current) {
      branch.push(current.message);
      if (current.children.length === 0) break;
      current = current.children[current.activeChildIndex];
    }

    return branch;
  }, [messageTree]);

  const setActivePath = (headMessageId: string) => {
    setMessageTree((prev) => {
      if (!prev) return prev;
      let current = prev.node.get(headMessageId);
      while (current?.message.parent_id) {
        const parent = prev.node.get(current.message.parent_id);
        if (!parent) break;
        const idx = parent.children.findIndex(
          (c) => c.message.id === current!.message.id,
        );
        if (idx !== -1) parent.activeChildIndex = idx;
        current = parent;
      }
      return { ...prev };
    });
  };

  const switchBranch = (targetMessageId: string) => {
    setMessageTree((prev) => {
      if (!prev) return prev;

      const targetNode = prev.node.get(targetMessageId);
      if (!targetNode?.message.parent_id) return prev;
      const parentNode = prev.node.get(targetNode.message.parent_id);
      if (!parentNode) return prev;

      const childIndex = parentNode.children.findIndex(
        (c) => c.message.id === targetMessageId,
      );

      if (childIndex === -1) return prev;

      parentNode.activeChildIndex = childIndex;
      return { ...prev };
    });
  };

  const reconcileIds = (tempId: string, realId: string) => {
    setMessageTree((prev) => {
      if (!prev) return prev;
      const node = prev.node.get(tempId);
      if (!node) return prev;

      node.message = { ...node.message, id: realId };

      const newNodes = new Map(prev.node);
      newNodes.delete(tempId);
      newNodes.set(realId, node);

      for (const child of node.children) {
        child.message = { ...child.message, parent_id: realId };
      }

      return { ...prev, node: newNodes };
    });
  };

  return {
    messageTree,
    buildTreeFromDatabase,
    branchMeta,
    insertMessage,
    activeBranch,
    switchBranch,
    reconcileIds,
  };
}
