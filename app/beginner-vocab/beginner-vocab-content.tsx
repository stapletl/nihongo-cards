'use client';

import React, { useState } from 'react';
import { VocabItem } from '@/lib/beginner-vocab';
import { SimpleVocabCard } from '@/components/vocab-card/simple-vocab-card';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { VocabCarousel } from '@/components/vocab-card/vocab-carousel';

type BeginnerVocabContentProps = {
    vocabItems: VocabItem[];
};

export const BeginnerVocabContent: React.FC<BeginnerVocabContentProps> = ({ vocabItems }) => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const selectedVocabItem = selectedIndex !== null ? vocabItems[selectedIndex] : null;

    return (
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {vocabItems.map((item, index) => (
                <SimpleVocabCard
                    key={index}
                    vocabItem={item}
                    onActionClick={() => {
                        setSelectedIndex(index);
                        setDialogVisible(true);
                    }}
                />
            ))}
            {typeof selectedIndex === 'number' && selectedVocabItem && (
                <ResponsiveDialog
                    className="min-h-1/2 min-w-1/2"
                    open={dialogVisible}
                    title="Vocab Details"
                    onOpenChange={(open) => setDialogVisible(open)}>
                    <div className="flex flex-col items-center justify-center">
                        <VocabCarousel items={vocabItems} activeIndex={selectedIndex} />
                    </div>
                </ResponsiveDialog>
            )}
        </section>
    );
};
