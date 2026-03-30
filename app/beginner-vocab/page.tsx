import { beginnerVocab } from '@/lib/beginner-vocab';
import { BeginnerVocabContent } from './beginner-vocab-content';

export default function Page() {
    return (
        <div>
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Beginner Vocabulary
            </h1>
            <p className="leading-7 not-first:mt-6">
                Start your Japanese learning journey with essential vocabulary that will help you
                communicate in everyday situations. This section covers basic words and phrases that
                form the foundation of Japanese conversation.
            </p>
            <BeginnerVocabContent vocabItems={beginnerVocab} />
        </div>
    );
}
