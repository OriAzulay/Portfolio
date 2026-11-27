import { cn } from "@/lib/utils";
import typo from "./Typography.module.css";

/** Section heading with the gradient underline. */
export function ArticleTitle({ children, compact }: { children: string; compact?: boolean }) {
  return (
    <header>
      <h2 className={cn(typo.h2, typo.articleTitle, compact && typo.compact)}>{children}</h2>
    </header>
  );
}
