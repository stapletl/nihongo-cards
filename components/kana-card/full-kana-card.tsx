import { KanaItem } from '@/lib/hiragana';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import React, { useState } from 'react';
import { SpeechButton } from '@/components/speech-button';
import { ShowRomanjiButton } from '../show-romanji-button';

type FullKanaCardProps = {
    kanaItem: KanaItem;
};

export const FullKanaCard: React.FC<FullKanaCardProps> = ({ kanaItem }) => {
    const [showRomanji, setShowRomanji] = useState(false);

    const renderExampleWithBoldKana = (example: string, kana: string): React.ReactNode[] =>
        example.split(kana).reduce<React.ReactNode[]>((acc, part, index) => {
            if (index > 0) acc.push(<strong key={index}>{kana}</strong>);
            if (part) acc.push(part);
            return acc;
        }, []);

    return (
        <Card className="gap-0">
            <CardHeader className="">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="mb-1 text-4xl">{kanaItem.character}</CardTitle>
                        <CardDescription className="text-foreground text-lg">
                            {kanaItem.romaji}
                        </CardDescription>
                    </div>
                    <CardAction>
                        <SpeechButton text={kanaItem.character} variant="ghost" size="xs" />
                    </CardAction>
                </div>
            </CardHeader>
            <CardContent className="px-6">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Example word:</span>
                            <span className="text-2xl">
                                {renderExampleWithBoldKana(kanaItem.example, kanaItem.character)}
                            </span>
                            <CardAction>
                                <SpeechButton text={kanaItem.example} variant="ghost" size="xs" />
                            </CardAction>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShowRomanjiButton
                                showRomanji={showRomanji}
                                setShowRomanji={setShowRomanji}
                            />
                            {showRomanji && (
                                <span className="text-muted-foreground text-sm italic">
                                    {kanaItem.exampleRomaji}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Translation:</span>
                    <span className="text-2xl">{kanaItem.emoji}</span>
                    <span className="text-lg">{kanaItem.exampleTranslation}</span>
                </div>
            </CardContent>
        </Card>
    );
};
