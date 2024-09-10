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


export function ViewProfileForm() {
  const [categoryList, setCategoryList] = useState([]);
  const [value, setValue] = useState([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filename: "",
      text: "",
      category: []
    }
  })

  useEffect(() => {
    console.log(value);
  }, [value])

  // Fetch document categories from Pangea AuthZ
  const getCategories = async () => {
    const resp = await axios.get("/api/get-categories");
    const categories = resp.data;

    setCategoryList(categories);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {

    values.category = value;
    console.log(values);

    const resp = await axios.post("/api/add-doc", values);

    if (resp.status === 200) {
      console.log(resp.data);
      toast({
        title: "Document Successfully Added",
        description: "success"
      })
      form.reset();
      setValue([]);
      getDocs();
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild onClick={getCategories}>
          <Button variant="outline">
            <PlusIcon className="w-4 h-4 mr-2" />
            View Profile
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>New Document</DialogTitle>
              <DialogDescription>
                Add a new document. Click Save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">

            <FormField control={form.control} name="filename" render={({field}) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filename" className="text-right">
                    Filename
                  </Label>
                  <FormControl>
                    <Input
                      id="filename"
                      placeholder="john-medical-records.md"
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )} />
            <FormField control={form.control} name="text" render={({field}) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="text" className="text-right">
                    Document Contents
                  </Label>
                  <FormControl>
                    <Textarea
                      id="text"
                      placeholder={`# Medical History - John Doe \n\n Chronic Conditions:\n ....`}
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )} />

            <FormField control={form.control} name="category" render={({field}) => (
              <FormItem className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="text" className="text-right">
                  Document Contents
                </Label>
                <FormControl>

                <MultiSelector
                    values={value}
                    onValuesChange={setValue}
                    loop
                    className="col-span-3"
                    // {...field}
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select categories" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent 
                    >
                      <MultiSelectorList>
                        {categoryList.map(category => (
                          <MultiSelectorItem value={category}>{category}</MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                </MultiSelector>
              </FormControl>
            </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="submit">Add Document</Button>
            </DialogFooter>
          </form>
        </Form>
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