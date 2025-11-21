"use client";

import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationBar({
  currentPage,
  totalPages,
}: PaginationBarProps) {
  const searchParams = useSearchParams();

  // generate the link for each button
  function getLink(page: number) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    return `?${newSearchParams.toString()}`;
  }

  // if there is only 1 page, do not show the pagination bar
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={getLink(currentPage - 1)}
            prefetch={false}
            className={cn(
              currentPage === 1 && "text-muted-foreground pointer-events-none",
            )}
          />
        </PaginationItem>

        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isEdgePage = page === 1 || page === totalPages;
          const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
          if (!isEdgePage && !isNearCurrentPage) {
            if (i === 1 || i === totalPages - 2) {
              return (
                <PaginationItem key={page} className="hidden md:block">
                  <PaginationEllipsis className="text-muted-foreground" />
                </PaginationItem>
              );
            }
            return null; // if the totalpages -2 cause only  1 elipsis to show
          }
          return (
            <PaginationItem
              key={page}
              className={cn(
                "hidden md:block",
                page === currentPage && "pointer-events-none block",
              )}
            >
              <PaginationLink
                href={getLink(page)}
                prefetch={false}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href={getLink(currentPage + 1)}
            prefetch={false}
            className={cn(
              currentPage >= totalPages &&
                "text-muted-foreground pointer-events-none",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

// searchparams put the url query params in the url, e.g. ?page=2
