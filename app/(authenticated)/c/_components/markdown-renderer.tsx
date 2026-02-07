import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({content}: MarkdownRendererProps) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings - Improved spacing and typography
        h1: ({ children }) => <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl mt-6 mb-4 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="scroll-m-20 text-lg font-semibold tracking-tight mt-4 mb-2">{children}</h3>,
        h4: ({ children }) => <h4 className="scroll-m-20 text-base font-semibold tracking-tight mt-4 mb-2">{children}</h4>,
        
        // Paragraphs - Better readability and line height
        p: ({ children }) => <p className="leading-7 mb-0 last:mb-0 text-foreground/90">{children}</p>,
        
        // Lists - Compact with proper nesting handling
        ul: ({ children }) => <ul className="mt-1 mb-0 ml-5 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="mt-1 mb-0 ml-5 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="pl-1 leading-normal [&>p]:!my-0 [&>ul]:!mt-1 [&>ul]:!mb-0 [&>ol]:!mt-1 [&>ol]:!mb-0">{children}</li>,
        
        // Code with syntax highlighting
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const isInline = !className;
          
          return isInline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono text-foreground font-medium border border-border/50" {...props}>
              {children}
            </code>
          ) : (
            <div className="relative my-4 rounded-lg overflow-hidden border border-border/50 shadow-sm bg-zinc-950">
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: 0, background: 'transparent' }}
                showLineNumbers={true}
                lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#6c7280', textAlign: 'right' }}
                wrapLines={true}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          );
        },
        
        // Blockquote - Modern styling
        blockquote: ({ children }) => (
          <blockquote className="mt-4 border-l-4 border-primary pl-6 italic text-muted-foreground py-1 bg-muted/20 rounded-r-sm pr-4">
            {children}
          </blockquote>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            {children}
          </a>
        ),
        
        // Tables - Refined border and spacing
        table: ({ children }) => (
          <div className="my-6 w-full overflow-y-auto rounded-lg border border-border shadow-sm">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/50 border-b border-border text-left font-medium">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-border bg-card">{children}</tbody>,
        tr: ({ children }) => <tr className="m-0 border-t p-0 even:bg-muted/20 hover:bg-muted/40 transition-colors">{children}</tr>,
        th: ({ children }) => <th className="px-4 py-3 text-left font-semibold text-muted-foreground active:text-foreground">{children}</th>,
        td: ({ children }) => <td className="px-4 py-3 text-left align-top text-foreground/80">{children}</td>,
        
        // Horizontal rule
        hr: () => <hr className="my-6 border-border" />,
        
        // Strong & Emphasis
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
      }}
    >
      {content}
    </Markdown>
  )
}

export default MarkdownRenderer
