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
                    <InfoIcon className='text-muted-foreground'/>
                    <span className="sr-only">Show stroke order help</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-4" sideOffset={8}>
                <PopoverHeader>
                    <PopoverTitle>Stroke Order</PopoverTitle>
                    <PopoverDescription>How the character is written by hand.</PopoverDescription>
                </PopoverHeader>
                <div className="flex flex-col gap-3">
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Handwritten vs. typed</h3>
                        <p className="text-muted-foreground text-sm">
                            The handwritten character can look slightly different from the typed one
                            above. It is the same character, much like a handwritten{' '}
                            <span className="text-foreground font-bold">ɑ</span> looks different
                            from the <span className="text-foreground font-medium">a</span> in most
                            fonts.
                        </p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Why stroke order matters</h3>
                        <p className="text-muted-foreground text-sm">
                            The order and direction of strokes shape how the character looks — the
                            same way writing an{' '}
                            <span className="text-foreground font-medium">H</span> backwards would
                            look off, even if the finished letter is recognizable.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
