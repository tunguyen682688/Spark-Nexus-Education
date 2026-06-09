import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Textarea,
} from "@spark-nest-ed/frontend-shared-components";
import { VocabularySetFormValues } from "../../constants/editor";
import { EDITOR_UI } from "../../constants/ui";
import { DifficultyLevel, VocabularySetType } from "../../types";
import { CATEGORY_LIST } from "@spark-nest-ed/frontend-core-constants";
import { CheckCircle2, XCircle, Globe, Lock } from "lucide-react";

interface VocabularySetInfoFormProps {
  form: UseFormReturn<VocabularySetFormValues>;
  totalWords?: number;
}

export const VocabularySetInfoForm: React.FC<VocabularySetInfoFormProps> = ({
  form,
  totalWords = 0,
}) => {
  const title = form.watch("title") || "";
  const description = form.watch("description") || "";
  const tags = form.watch("tags") || [];
  const watchedWords = form.watch("words") || [];
  
  const wordCount = Math.max(watchedWords.length, totalWords);
  const hasTitle = title.trim().length >= 3;
  const hasDescription = description.trim().length > 0;
  const hasCategory = tags.length > 0;
  const hasMinWords = wordCount >= 10;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{EDITOR_UI.INFO_FORM.TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{EDITOR_UI.INFO_FORM.FIELDS.TITLE.LABEL}</FormLabel>
              <FormControl>
                <Input placeholder={EDITOR_UI.INFO_FORM.FIELDS.TITLE.PLACEHOLDER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{EDITOR_UI.INFO_FORM.FIELDS.DESCRIPTION.LABEL}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={EDITOR_UI.INFO_FORM.FIELDS.DESCRIPTION.PLACEHOLDER}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => {
              const currentCategory = field.value?.find((t) =>
                CATEGORY_LIST.some((c) => c.value === t)
              );

              return (
                <FormItem>
                  <FormLabel>{EDITOR_UI.INFO_FORM.FIELDS.CATEGORY.LABEL}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const currentTags = field.value || [];
                      // Remove old category tag if exists
                      const otherTags = currentTags.filter(
                        (t) => !CATEGORY_LIST.some((c) => c.value === t)
                      );
                      field.onChange([value, ...otherTags]);
                    }}
                    value={currentCategory}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={EDITOR_UI.INFO_FORM.FIELDS.CATEGORY.PLACEHOLDER} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_LIST.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormItem>
            <FormLabel>{EDITOR_UI.INFO_FORM.FIELDS.VISIBILITY.LABEL}</FormLabel>
            <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md bg-muted/30">
              {form.watch("visibility") === "PUBLIC" ? (
                <>
                  <Globe className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Public (Published to Community)
                  </span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Private Draft
                  </span>
                </>
              )}
            </div>
          </FormItem>

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{EDITOR_UI.INFO_FORM.FIELDS.DIFFICULTY.LABEL}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={EDITOR_UI.INFO_FORM.FIELDS.DIFFICULTY.PLACEHOLDER} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(DifficultyLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
           <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{EDITOR_UI.INFO_FORM.FIELDS.TYPE.LABEL}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={EDITOR_UI.INFO_FORM.FIELDS.TYPE.PLACEHOLDER} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(VocabularySetType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Publication Checklist Panel */}
        <div className="pt-6 mt-4 border-t space-y-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center space-x-2 text-foreground">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <span>Community Publication Checklist</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              To publish this vocabulary set to the community library, please ensure it meets the following requirements:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Title Check */}
            <div className={`flex items-start space-x-2.5 p-3 rounded-lg border text-sm transition-all duration-200 ${hasTitle ? 'bg-green-500/5 border-green-500/20' : 'bg-destructive/5 border-destructive/10'}`}>
              {hasTitle ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${hasTitle ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>Title Status</p>
                <p className="text-xs text-muted-foreground mt-0.5">Must be at least 3 characters</p>
              </div>
            </div>

            {/* Description Check */}
            <div className={`flex items-start space-x-2.5 p-3 rounded-lg border text-sm transition-all duration-200 ${hasDescription ? 'bg-green-500/5 border-green-500/20' : 'bg-destructive/5 border-destructive/10'}`}>
              {hasDescription ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${hasDescription ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>Description Status</p>
                <p className="text-xs text-muted-foreground mt-0.5">A description is required for public sets</p>
              </div>
            </div>

            {/* Category Check */}
            <div className={`flex items-start space-x-2.5 p-3 rounded-lg border text-sm transition-all duration-200 ${hasCategory ? 'bg-green-500/5 border-green-500/20' : 'bg-destructive/5 border-destructive/10'}`}>
              {hasCategory ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${hasCategory ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>Category Status</p>
                <p className="text-xs text-muted-foreground mt-0.5">At least one category is required</p>
              </div>
            </div>

            {/* Word Count Check */}
            <div className={`flex items-start space-x-2.5 p-3 rounded-lg border text-sm transition-all duration-200 ${hasMinWords ? 'bg-green-500/5 border-green-500/20' : 'bg-destructive/5 border-destructive/10'}`}>
              {hasMinWords ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${hasMinWords ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>Word Count ({wordCount}/10)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Must contain at least 10 words</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
