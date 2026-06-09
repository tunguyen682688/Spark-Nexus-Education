import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useEditorController } from '../hooks/useEditorController';
import { VocabularySetInfoForm } from '../components/editor/VocabularySetInfoForm';
import { WordListEditor } from '../components/editor/WordListEditor';
import { AutoSaveIndicator } from '../components/editor/AutoSaveIndicator';
import { Button, Badge, useToast } from "@spark-nest-ed/frontend-shared-components";
import { VocabularySetFormValues } from '../constants/editor';
import { EDITOR_UI } from '../constants/ui';
import { ArrowLeft, Globe, Lock, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EditorVocabularySetContainerProps {
    setId?: string;
    initialData?: VocabularySetFormValues;
}

const EditorVocabularySetContainer: React.FC<EditorVocabularySetContainerProps> = ({ setId, initialData }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { 
        form, 
        fields, 
        append, 
        remove, 
        bulkAddWords, 
        saveStatus, 
        lastSavedAt, 
        handlePublish, 
        saveDraft,
        loadMore,
        hasMore,
        isLoadingMore,
        isLoadingWords,
        totalServerItems
    } = useEditorController(setId, initialData);

    // Watch form fields to reactively check checklist status
    const title = form.watch("title") || "";
    const description = form.watch("description") || "";
    const tags = form.watch("tags") || [];
    const visibility = form.watch("visibility") || "PRIVATE";

    const wordCount = Math.max(fields.length, totalServerItems);
    const hasTitle = title.trim().length >= 3;
    const hasDescription = description.trim().length > 0;
    const hasCategory = tags.length > 0;
    const hasMinWords = wordCount >= 10;
    const canPublish = hasTitle && hasDescription && hasCategory && hasMinWords;

    const stats = {
        total: fields.length,
        serverTotal: totalServerItems,
        withDefinition: fields.filter(f => f.definition).length,
        withExample: fields.filter(f => f.example).length
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleSaveDraft = async () => {
        const result = await saveDraft(form.getValues(), false);
        if (result.success) {
            toast({
                title: "Đã lưu bản nháp",
                description: "Các thay đổi của bạn đã được lưu thành công.",
                variant: "default"
            });
        }
    };

    const handleUnpublish = async () => {
        form.setValue("visibility", "PRIVATE", { shouldDirty: true });
        const result = await saveDraft(form.getValues(), false);
        if (result.success) {
            toast({
                title: "Đã chuyển về riêng tư",
                description: "Bộ từ vựng đã được chuyển thành chế độ riêng tư thành công.",
                variant: "default"
            });
        }
    };
    
    return (
        <FormProvider {...form}>
            <div className="w-full max-w-none mx-0 px-2 sm:px-4 lg:px-6 p-4 space-y-8">
                <div className="flex flex-col sticky top-0 bg-background z-10 border-b pb-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" onClick={handleBack}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <span>{EDITOR_UI.CONTAINER.TITLE}</span>
                                {visibility === "PUBLIC" ? (
                                    <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/15 border border-green-500/20 px-2 py-0.5 text-xs font-semibold flex items-center space-x-1 shrink-0">
                                        <Globe className="h-3 w-3 shrink-0" />
                                        <span>Công khai</span>
                                    </Badge>
                                ) : (
                                    <Badge className="bg-muted text-muted-foreground hover:bg-muted border px-2 py-0.5 text-xs font-semibold flex items-center space-x-1 shrink-0">
                                        <Lock className="h-3 w-3 shrink-0" />
                                        <span>Bản nháp riêng tư</span>
                                    </Badge>
                                )}
                            </h1>
                            <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
                        </div>
                        <div className="flex space-x-2">
                            {visibility === "PUBLIC" ? (
                                <Button 
                                    variant="outline" 
                                    onClick={handleUnpublish} 
                                    disabled={saveStatus === 'saving'}
                                    className="flex items-center space-x-1.5"
                                >
                                    <Lock className="h-4 w-4" />
                                    <span>Đặt làm riêng tư</span>
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleSaveDraft} 
                                        disabled={saveStatus === 'saving'}
                                        className="flex items-center space-x-1.5"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>Lưu bản nháp</span>
                                    </Button>
                                    <Button 
                                        onClick={handlePublish} 
                                        disabled={!canPublish || saveStatus === 'saving'}
                                        className="flex items-center space-x-1.5"
                                    >
                                        <span>Xuất bản cộng đồng</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-6 text-sm text-muted-foreground">
                        <span>{EDITOR_UI.CONTAINER.STATS.TOTAL}: <span className="font-medium text-foreground">{stats.serverTotal > 0 ? `${stats.total} / ${stats.serverTotal}` : stats.total}</span></span>
                        <span>{EDITOR_UI.CONTAINER.STATS.WITH_DEF}: <span className="font-medium text-foreground">{stats.withDefinition}</span></span>
                        <span>{EDITOR_UI.CONTAINER.STATS.WITH_EX}: <span className="font-medium text-foreground">{stats.withExample}</span></span>
                    </div>
                </div>

                <div className="space-y-8">
                    <VocabularySetInfoForm form={form} totalWords={wordCount} />
                    <WordListEditor 
                        form={form} 
                        fields={fields} 
                        append={append} 
                        remove={remove} 
                        onBulkAdd={bulkAddWords}
                        loadMore={loadMore}
                        hasMore={hasMore}
                        isLoadingMore={isLoadingMore}
                        isLoadingWords={isLoadingWords}
                    />
                </div>
            </div>
        </FormProvider>
    );
};

export default EditorVocabularySetContainer;