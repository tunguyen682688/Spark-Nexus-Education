import React from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '../ui/drawer';

interface SettingsType {
  showPartOfSpeech: boolean;
  showPronunciation: boolean;
  showExamples: boolean;
  shuffleWords: boolean;
  autoPlay: boolean;
}

interface PracticeSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SettingsType;
  updateSetting: (key: string, value: boolean) => void;
  isMobile: boolean;
}

export const PracticeSettings: React.FC<PracticeSettingsProps> = ({
  open,
  onOpenChange,
  settings,
  updateSetting,
  isMobile,
}) => {
  const SettingsContent = () => (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-pronunciation">Show Pronunciation</Label>
        <Switch
          id="show-pronunciation"
          checked={settings.showPronunciation}
          onCheckedChange={(checked) =>
            updateSetting('showPronunciation', checked)
          }
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label htmlFor="show-part-of-speech">Show Part of Speech</Label>
        <Switch
          id="show-part-of-speech"
          checked={settings.showPartOfSpeech}
          onCheckedChange={(checked) =>
            updateSetting('showPartOfSpeech', checked)
          }
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label htmlFor="show-examples">Show Examples</Label>
        <Switch
          id="show-examples"
          checked={settings.showExamples}
          onCheckedChange={(checked) => updateSetting('showExamples', checked)}
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label htmlFor="shuffle-words">Shuffle Words</Label>
        <Switch
          id="shuffle-words"
          checked={settings.shuffleWords}
          onCheckedChange={(checked) => updateSetting('shuffleWords', checked)}
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-play">Auto Play</Label>
        <Switch
          id="auto-play"
          checked={settings.autoPlay}
          onCheckedChange={(checked) => updateSetting('autoPlay', checked)}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Practice Settings</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-4">
            <SettingsContent />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Save Changes</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Practice Settings</DialogTitle>
          <DialogDescription>
            Customize your practice experience
          </DialogDescription>
        </DialogHeader>

        <SettingsContent />

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
