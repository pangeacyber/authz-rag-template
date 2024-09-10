import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { NewDocumentForm } from "./new-document-form"
import { useEffect, useState } from "react"
import axios from "axios"
import { MemoizedReactMarkdown } from "./markdown"
import remarkGfm from "remark-gfm"
import { Badge } from "@/components/ui/badge"

export function DocumentSection() {

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    getDocs();
  }, [])

  const getDocs = async () => {
    const resp = await axios.get("/api/get-docs");

    if(resp.status === 200) {
      setDocuments(resp.data);
    }
  }

    return (
        <div className="flex flex-col overflow-hidden">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Documents</h2>
          <NewDocumentForm getDocs={getDocs} />
        </div>
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {documents.map(doc => (
              <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileIcon className="w-4 h-4" />
                      <div>{doc.filename}</div>
                    </div>
                    <div className="flex gap-2">
                      {doc.category.map(cat => (
                        <Badge variant="secondary">{cat}</Badge>
                      ))}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm]}>
                    {doc.text}
                  </MemoizedReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
}

function ChevronDownIcon(props) {
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
        <path d="m6 9 6 6 6-6" />
      </svg>
    )
  }
  

function FileIcon(props) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}