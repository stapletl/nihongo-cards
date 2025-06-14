'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { VoiceDropdown } from '@/components/voice-dropdown';
import { useSpeech } from '@/hooks/use-speech';
import { Separator } from '@/components/ui/separator';
import { SpeechButton } from '@/components/speech-button';
import { Input } from '@/components/ui/input';

export const VoiceSettingsContent: React.FC = () => {
    const { settings, updateSettings } = useSpeech();
    const [customText, setCustomText] = useState('おはようございます。お元気ですか？');

    return (
        <>
            <div className="space-y-2">
                <Label>Voice Selection</Label>
                <VoiceDropdown />
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Speech Rate</Label>
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[settings.rate]}
                            onValueChange={(value: number[]) => updateSettings({ rate: value[0] })}
                            min={0.1}
                            max={2}
                            step={0.1}
                            className="flex-1"
                        />
                        <span className="w-12 text-sm">{settings.rate}x</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Pitch</Label>
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[settings.pitch]}
                            onValueChange={(value: number[]) => updateSettings({ pitch: value[0] })}
                            min={0.1}
                            max={2}
                            step={0.1}
                            className="flex-1"
                        />
                        <span className="w-12 text-sm">{settings.pitch}x</span>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-2">
                <Label>Test Voice Settings</Label>
                <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-sm">
                        Enter text and click play to hear it with the current voice settings:
                    </p>
                    <div className="flex items-center gap-4">
                        <Input
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Enter text to speak..."
                            className="flex-1"
                        />
                        <SpeechButton text={customText} />
                    </div>
                </div>
            </div>
        </>
    );
};
