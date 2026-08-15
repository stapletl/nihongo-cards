import { InfoIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export function KanaStrokeOrderInfo() {
    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <Button
                    aria-label="Show stroke order help"
                    size="icon-sm"
                    title="Stroke order help"
                    variant="ghost">
                    <InfoIcon className="text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-4" sideOffset={8}>
                <PopoverHeader>
                    <PopoverTitle>Stroke order</PopoverTitle>
                    <PopoverDescription>How the character is written by hand.</PopoverDescription>
                </PopoverHeader>
                <div className="flex flex-col gap-3">
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Handwritten vs. typed</h3>
                        <p className="text-muted-foreground text-sm">
                            Same character, different look, like a handwritten{' '}
                            <span className="text-foreground font-bold">ɑ</span> vs. the{' '}
                            <span className="text-foreground font-medium">a</span> in most fonts.
                        </p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Why it matters</h3>
                        <p className="text-muted-foreground text-sm">
                            Order and direction shape the result, similar to how writing a{' '}
                            <span className="text-foreground font-medium">B</span> from the bottom
                            would likely appear different.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
