import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { useChat } from "ai/react";
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { MemoizedReactMarkdown } from "./markdown"
import { Skeleton } from "./ui/skeleton"
import { ViewProfileForm } from "./view-profile-component"


export function ChatPanel({user, getToken, logout}) {
    const { messages, append, reload, stop, isLoading, input, setInput, setMessages } =
    useChat({
      id: "test",
      streamProtocol: "text",
      api: "/api/completion",
      headers: {
        "user-token": user?.active_token?.identity
      },
      async onResponse(response) {
        if (response.status === 401) {
          // toast.error(response.statusText)
          console.error(response.statusText);
        } 
        console.log(response.body)
      },
      onError(error) {
        console.log(error)
      },
      async onFinish(message) {
        // if (auditLogStatus) {
        //   await axios.post('/api/audit-log', {
        //     'user_id': 'openai',
        //     'session_id': id,
        //     message: message.content,
        //     actor: message.role
        //   })
        // }
      }
    })

    return (
        <div className="flex flex-col border-r bg-muted/40 overflow-auto">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            {/* <div className="font-medium">Secure RAG Chatbot</div> */}
            <div className="font-medium">User ID: {user?.active_token?.identity}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoveHorizontalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <Button onClick={() => {setMessages([])}}>Clear Chat</Button>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem>User ID: {user?.active_token?.identity}</DropdownMenuItem> */}
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {messages.length > 0 ? 
            (messages.map(message => (
              <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8 border">
                  <AvatarImage src={message.role === "user" && user?.profile?.image_url ? user?.profile?.image_url : "/placeholder-user.jpg"} alt="Avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1 text-sm">
                  <div className="font-medium">{message.role === "user" && user?.profile?.first_name ? user?.profile?.first_name : message.role}</div>
                  <div className="prose text-muted-foreground">
                    <p>
                    <MemoizedReactMarkdown
                        className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                        remarkPlugins={[remarkGfm, remarkMath]}
                        components={{
                          p({ children }) {
                            return <p className="mb-2 last:mb-0">{children}</p>
                          }
                        }}
                    >
                      {message.content}
                      </MemoizedReactMarkdown>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{message.createdAt?.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                </div>
              </div>
            ))) : <></> }
            {isLoading && (
              <div className="flex items-start gap-4">
              <Avatar className="w-8 h-8 border">
                <AvatarImage src={"/placeholder-user.jpg"} alt="Avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 text-sm">
                <div className="font-medium">assistant</div>
                <div className="prose text-muted-foreground">
                  <p>
                    <Skeleton className="h-4 w-[250px] mb-1" />
                    <Skeleton className="h-4 w-[200px]" />
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {/* <span>{message.createdAt?.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span> */}
                  <Skeleton className="h-2 w-[75px]" />
                </div>
              </div>
            </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="relative">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
                onChange={e => setInput(e.target.value)}
                value={input}
              />
              <Button type="submit" size="icon" onClick={() => {
                append({
                  content: input,
                  role: 'user',
                  createdAt: new Date()
                });
                setInput("");
              }} className="absolute w-8 h-8 top-3 right-3">
                <SendIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
          </div>
        </div>
      </div>
    )
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}


function MoveHorizontalIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  )
}

function SendIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
