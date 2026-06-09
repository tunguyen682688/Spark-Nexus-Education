import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Checkbox,
  Progress,
  Input,
} from "@spark-nest-ed/frontend-shared-components";
import { Upload, AlertCircle, Check, Ban, Loader2, FileText, Download } from "lucide-react";
import { WordItemFormValues } from "../../constants/editor";
import { PARTS_OF_SPEECH } from "../../types";

interface BulkImportDialogProps {
  onImport: (words: WordItemFormValues[], onProgress?: (percent: number) => void) => Promise<{ success: number; failed: number; failedItems: WordItemFormValues[] }> | Promise<void> | void;
  existingWords?: string[];
}

export const BulkImportDialog: React.FC<BulkImportDialogProps> = ({
  onImport,
  existingWords = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState("tab"); // 'tab' | 'comma' | 'dash' | 'pipe'
  const [preview, setPreview] = useState<WordItemFormValues[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; failedItems: WordItemFormValues[] } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const getSeparatorChar = (sep: string) => {
      if (sep === 'tab') return '\t';
      if (sep === 'comma') return ',';
      if (sep === 'pipe') return '|';
      return '-';
  }

  const handleDownloadTemplate = () => {
    const sepChar = getSeparatorChar(separator);
    // For CSV, we might want to quote fields if they contain the separator, 
    // but for a simple template, we'll keep it simple.
    const headers = ["Word", "Definition", "Type", "Example", "Notes"];
    const sampleRow1 = ["Apple", "A round fruit with red or green skin", "noun", "I ate an apple for lunch.", "Common fruit"];
    const sampleRow2 = ["Run", "To move at a speed faster than a walk", "verb", "She runs every morning.", "Physical activity"];
    
    const content = [
      headers.join(sepChar),
      sampleRow1.join(sepChar),
      sampleRow2.join(sepChar)
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocabulary_template.${separator === 'comma' ? 'csv' : separator === 'tab' ? 'tsv' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      // Auto-detect separator if possible
      if (file.name.endsWith('.csv')) {
        setSeparator('comma');
      } else if (file.name.endsWith('.tsv')) {
        setSeparator('tab');
      }
    };
    reader.readAsText(file);
  };


  const parseText = (inputText: string, sep: string) => {
    const lines = inputText.split("\n").filter((line) => line.trim() !== "");
    const parsed: WordItemFormValues[] = lines.map((line) => {
      let parts: string[] = [];
      if (sep === "tab") parts = line.split("\t");
      else if (sep === "comma") parts = line.split(",");
      else if (sep === "dash") parts = line.split("-");
      else if (sep === "pipe") parts = line.split("|");

      const rawPos = parts[2]?.trim().toLowerCase();
      // Validate POS or default to noun
      const pos = PARTS_OF_SPEECH.find(p => p === rawPos) || "noun";

      return {
        word: parts[0]?.trim() || "",
        definition: parts[1]?.trim() || "",
        partOfSpeech: pos,
        example: parts[3]?.trim() || "",
        notes: parts[4]?.trim() || "",
      };
    });
    return parsed;
  };

  const isDuplicate = (word: string) => {
    return existingWords.some((w) => w.toLowerCase() === word.toLowerCase());
  };

  const handlePreview = () => {
    const parsed = parseText(text, separator);
    setPreview(parsed);
    
    // Select all non-duplicate words by default
    const newSelected = new Set<number>();
    parsed.forEach((item, index) => {
      if (item.word && !isDuplicate(item.word)) {
        newSelected.add(index);
      }
    });
    setSelectedIndices(newSelected);
  };

  const handleImport = async () => {
    const selectedWords = preview.filter((_, index) => selectedIndices.has(index));
    if (selectedWords.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);
    setShowSuccess(false);

    try {
      // Pass all words to onImport and let it handle chunking/progress
      const result = await onImport(selectedWords, (percent) => {
        setImportProgress(percent);
      });

      if (result) {
          setImportResult(result);
      } else {
          // Fallback if no result returned (legacy support)
          setImportResult({ success: selectedWords.length, failed: 0, failedItems: [] });
      }
      
      setShowSuccess(true);
      
      // Clear form data but keep dialog open
      setText("");
      setPreview([]);
      setSelectedIndices(new Set());
      
    } catch (error) {
      console.error("Import failed in dialog", error);
      // Error handling is mostly done in onImport (useEditorController), 
      // but we should ensure the modal doesn't get stuck if something unexpected happens
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
      setIsOpen(false);
      setShowSuccess(false);
      setImportProgress(0);
      setImportResult(null);
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const toggleSelectAll = () => {
    const nonDuplicateIndices = preview
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.word && !isDuplicate(item.word))
      .map(({ index }) => index);

    const allSelected = nonDuplicateIndices.every((index) => selectedIndices.has(index));

    if (allSelected) {
      // Deselect all
      setSelectedIndices(new Set());
    } else {
      // Select all valid
      setSelectedIndices(new Set(nonDuplicateIndices));
    }
  };

  const sepChar = getSeparatorChar(separator);

  const nonDuplicateIndices = preview
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.word && !isDuplicate(item.word))
    .map(({ index }) => index);
  const allSelected =
    nonDuplicateIndices.length > 0 &&
    nonDuplicateIndices.every((index) => selectedIndices.has(index));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            // Reset state when dialog is closed
            setTimeout(() => {
                setShowSuccess(false);
                setImportProgress(0);
                setImportResult(null);
            }, 300);
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{showSuccess ? "Import Complete" : "Import Words"}</DialogTitle>
          {!showSuccess && !isImporting && (
            <DialogDescription>
                Paste your word list or upload a file. Format: <strong>Word {sepChar} Definition {sepChar} Type {sepChar} Example {sepChar} Notes</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        {showSuccess ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center space-y-6">
                <div className="rounded-full bg-green-100 p-3">
                    <Check className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Import Successful!</h3>
                    <p className="text-muted-foreground">
                        Processed {importResult?.success || 0} words successfully.
                        {importResult?.failed ? ` Failed to import ${importResult.failed} words.` : ""}
                    </p>
                    {importResult?.failedItems && importResult.failedItems.length > 0 && (
                        <div className="mt-4 text-left w-full max-w-md bg-red-50 p-4 rounded-md border border-red-100">
                            <h4 className="text-sm font-semibold text-red-800 mb-2">Failed Items:</h4>
                            <ScrollArea className="h-[100px]">
                                <ul className="text-xs text-red-700 space-y-1">
                                    {importResult.failedItems.map((item, idx) => (
                                        <li key={idx}>• {item.word}</li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                    )}
                </div>
                <Button onClick={handleClose} className="min-w-[120px]">
                    Close
                </Button>
            </div>
        ) : isImporting ? (
          <div className="py-12 px-4 space-y-6 flex flex-col items-center justify-center min-h-[300px]">
             <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
             <div className="space-y-2 w-full max-w-md text-center">
                <h3 className="font-medium text-lg">
                    {importProgress === 100 ? "Finalizing..." : "Importing Vocabulary..."}
                </h3>
                <Progress value={importProgress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground">
                  {importProgress === 100 
                    ? "Syncing with server..." 
                    : `Processed ${Math.round((importProgress / 100) * selectedIndices.size)} of ${selectedIndices.size} words`
                  }
                </p>
             </div>
          </div>
        ) : (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-muted-foreground">Separator:</span>
                <div className="flex space-x-2">
                   <Button 
                    variant={separator === 'tab' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setSeparator('tab')}
                    className="h-7 text-xs"
                   >
                     Tab
                   </Button>
                   <Button 
                    variant={separator === 'comma' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setSeparator('comma')}
                    className="h-7 text-xs"
                   >
                     Comma
                   </Button>
                   <Button 
                    variant={separator === 'dash' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setSeparator('dash')}
                    className="h-7 text-xs"
                   >
                     Dash (-)
                   </Button>
                   <Button 
                    variant={separator === 'pipe' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setSeparator('pipe')}
                    className="h-7 text-xs"
                   >
                     Pipe (|)
                   </Button>
                </div>
            </div>

            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="preview" onClick={handlePreview}>
                  Preview ({preview.length > 0 ? preview.length : parseText(text, separator).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste" className="space-y-4">
                <Textarea
                  placeholder={`Word 1${sepChar}Definition 1${sepChar}noun${sepChar}Example 1${sepChar}Note 1\nWord 2${sepChar}Definition 2${sepChar}verb${sepChar}Example 2${sepChar}Note 2`}
                  className="min-h-[300px] font-mono text-sm whitespace-pre"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                 <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4 min-h-[300px] bg-muted/10">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center space-y-1">
                        <h4 className="text-lg font-medium">Select a file to import</h4>
                        <p className="text-sm text-muted-foreground">Supported formats: .txt, .csv, .tsv</p>
                    </div>
                    <div className="w-full max-w-xs">
                        <Input 
                            type="file" 
                            accept=".txt,.csv,.tsv" 
                            onChange={handleFileUpload}
                            className="cursor-pointer"
                        />
                    </div>
                    {fileName && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 px-3 py-1 rounded-full">
                            <FileText className="h-4 w-4" />
                            {fileName}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-4 max-w-md text-center">
                        The file should contain one word per line. 
                        You can select the separator (Tab, Comma, etc.) above or it will be auto-detected.
                    </div>
                    <Button variant="link" size="sm" onClick={handleDownloadTemplate} className="mt-2 h-auto p-0 text-xs">
                        <Download className="mr-1 h-3 w-3" />
                        Download Sample Template ({separator === 'comma' ? '.csv' : separator === 'tab' ? '.tsv' : '.txt'})
                    </Button>
                 </div>
              </TabsContent>

          <TabsContent value="preview">
            <div className="flex items-center space-x-2 mb-2 px-1">
              <Checkbox 
                id="select-all" 
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                disabled={nonDuplicateIndices.length === 0}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All Valid ({selectedIndices.size} selected)
              </label>
            </div>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {preview.length === 0 && text.length > 0 && (
                 <div className="text-center text-muted-foreground py-8">
                    Click preview to parse text
                 </div>
              )}
              {preview.length === 0 && text.length === 0 && (
                 <div className="text-center text-muted-foreground py-8">
                    No text to parse
                 </div>
              )}
              <div className="space-y-2">
                {preview.map((item, idx) => {
                  const isDup = isDuplicate(item.word);
                  const isSelected = selectedIndices.has(idx);
                  
                  return (
                  <div key={idx} className={`flex items-center justify-between p-2 border rounded ${isDup ? 'bg-muted/50 opacity-70' : 'bg-card'}`}>
                    <div className="flex items-center space-x-3 w-full">
                        <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(idx)}
                            disabled={isDup}
                        />
                        <div className="grid grid-cols-12 gap-2 w-full items-center">
                            <div className="col-span-3 font-medium truncate flex items-center gap-2" title={item.word}>
                                {item.word || <span className="text-destructive italic">Missing term</span>}
                                {isDup && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded border border-yellow-200">Exists</span>}
                            </div>
                            <div className="col-span-3 text-muted-foreground truncate" title={item.definition}>{item.definition || <span className="text-destructive italic">Missing definition</span>}</div>
                            <div className="col-span-2 text-xs text-muted-foreground border px-1 rounded text-center">{item.partOfSpeech}</div>
                            <div className="col-span-2 text-xs text-muted-foreground truncate" title={item.example}>{item.example || '-'}</div>
                            <div className="col-span-2 text-xs text-muted-foreground truncate" title={item.notes}>{item.notes || '-'}</div>
                        </div>
                    </div>
                    {(!item.word || !item.definition) && <AlertCircle className="h-4 w-4 text-destructive ml-2 flex-shrink-0" />}
                    {(item.word && item.definition && !isDup) && <Check className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />}
                    {isDup && <Ban className="h-4 w-4 text-yellow-500 ml-2 flex-shrink-0" />}
                  </div>
                )})}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        </div>
        )}

        <DialogFooter>
          {!isImporting && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={selectedIndices.size === 0}>
                Import {selectedIndices.size > 0 ? `${selectedIndices.size} words` : ''}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
