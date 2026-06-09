import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from "@spark-nest-ed/frontend-shared-components";
import { Trash2 } from "lucide-react";
import { VocabularySetFormValues } from "../../constants/editor";
import { PARTS_OF_SPEECH } from "../../types";

interface WordItemEditorProps {
  index: number;
  form: UseFormReturn<VocabularySetFormValues>;
  onRemove: (index: number) => void;
}

export const WordItemEditor: React.FC<WordItemEditorProps> = ({
  index,
  form,
  onRemove,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Word #{index + 1}
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name={`words.${index}.word`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter term" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name={`words.${index}.definition`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Definition</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter definition" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-4">
             <FormField
              control={form.control}
              name={`words.${index}.partOfSpeech`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part of Speech</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PARTS_OF_SPEECH.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos.charAt(0).toUpperCase() + pos.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <div className="md:col-span-6">
            <FormField
              control={form.control}
              name={`words.${index}.example`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Example (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Example sentence" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <div className="md:col-span-6">
            <FormField
              control={form.control}
              name={`words.${index}.notes`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Extra notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
