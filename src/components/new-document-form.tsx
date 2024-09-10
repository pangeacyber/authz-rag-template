import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';

import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { useEffect, useState } from "react"
import axios from "axios"
import { useToast } from "./ui/use-toast"

const formSchema = z.object({
  filename: z.string(),
  text: z.string(),
  category: z.array(z.string())
})


export function NewDocumentForm({getDocs}) {

  return (
    <Dialog>
      <DialogTrigger asChild>
          <Button variant="outline">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Document
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        
      </DialogContent>
    </Dialog>
  )
}

function PlusIcon(props) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}