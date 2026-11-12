import { useRef, useState } from "react";
import { Box, Pagination, Stack, Typography } from "@mui/material";
import { useSearchParams } from "react-router";
import { SkeletonRows } from "../LoadingSkeleton";
import ConceptCard, { type ConceptAction } from "../ConceptCard";
import Notification from "../Notification/Notification";
import ConceptSearchbar from "../ConceptSearchbar";
import { useConceptSearch } from "../../hooks/useConceptSearch";
import { ResultList, Results } from "./ConceptSearch.styles";
import {
  getSearchItemKey,
  type SearchItem,
} from "../../api/graphql/queries/resolveTerms";
import type { Criteria, CriteriaKind } from "../../hooks/useCohortSummary";

// ----------------------------------------------------------------------

const PAGE_SIZE = 20;

const CRITERIA_LABELS = [
  { kind: "include", add: "+ Include", added: "✓ Included" },
  { kind: "exclude", add: "+ Exclude", added: "✓ Excluded" },
] as const;

interface Props {
  onInclude?: (item: SearchItem) => void;
  onExclude?: (item: SearchItem) => void;
  /** Results already in a list show it, and clicking that button again takes them out. */
  criteria?: Criteria;
  onRemove?: (kind: CriteriaKind) => (item: SearchItem) => void;
}

export default function ConceptSearch({
  onInclude,
  onExclude,
  criteria,
  onRemove,
}: Props) {
  const onAdd = { include: onInclude, exclude: onExclude };
  const resultActions = (item: SearchItem): ConceptAction[] =>
    CRITERIA_LABELS.flatMap<ConceptAction>(({ kind, add, added }) => {
      const onClick = onAdd[kind];
      if (!onClick) return [];
      const key = getSearchItemKey(item);
      const selected = !!criteria?.[kind].some(
        (i) => getSearchItemKey(i) === key,
      );
      return selected
        ? [{ label: added, onClick: onRemove?.(kind) ?? onClick, selected }]
        : [{ label: add, onClick }];
    });

  const listRef = useRef<HTMLDivElement>(null);

  // The URL is the source of truth for the query and page, so a search
  // started on the landing page, a refresh, a shared link and the back
  // button all land on the same results
  const [params, setParams] = useSearchParams();
  const submitted = params.get("q") ?? "";
  const page = Math.max(1, Math.floor(Number(params.get("page"))) || 1);

  const [dismissedSearchError, setDismissedSearchError] =
    useState<Error | null>(null);

  // Fetches only when the query or page in the URL changes
  const {
    data: searchData,
    isLoading: isLoadingSearchResult,
    isPlaceholderData: isLoadingPage,
    isError: isSearchError,
    error: searchError,
  } = useConceptSearch(submitted, {
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const searchItems = searchData?.items ?? [];
  const showSummary =
    submitted !== "" && !isLoadingSearchResult && !isSearchError;
  const pageCount = searchData
    ? Math.ceil(searchData.total / searchData.limit)
    : 0;

  const start = searchData && searchData.offset + 1;
  const end = searchData && searchData.offset + searchData.items.length;

  // A new query is a new history entry and always starts at page 1
  const handleSearch = (text: string) => {
    const q = text.trim();
    setParams(q ? { q } : {});
  };

  // Paging replaces the entry, so Back leaves the search instead of
  // stepping back through every page
  const handlePageChange = (value: number) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value > 1) next.set("page", String(value));
        else next.delete("page");
        return next;
      },
      { replace: true },
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (listRef.current) listRef.current.scrollTop = 0;
  };

  return (
    <Stack spacing={1}>
      {/* Search error */}
      <Notification
        open={isSearchError && searchError !== dismissedSearchError}
        onClose={() => setDismissedSearchError(searchError)}
        severity="error"
        message={searchError?.message}
      />

      {/* Searchbar with button; follows the URL query. Examples only
          until the first search */}
      <ConceptSearchbar
        query={submitted}
        onSearch={handleSearch}
        showExamples={submitted === ""}
      />

      {/* Search Result */}
      {isLoadingSearchResult ? (
        // Rows about one result card tall
        <SkeletonRows count={3} height={96} label="Searching concepts" />
      ) : (
        <>
          {/* Search Summary */}
          {showSummary && (
            <Box role="status" aria-live="polite">
              <Typography variant="body2" color="text.secondary">
                {searchItems.length > 0 ? (
                  <>
                    Showing {start?.toLocaleString()}–{end?.toLocaleString()} of{" "}
                    {searchData?.total.toLocaleString()}{" "}
                    {searchData?.total === 1 ? "concept" : "concepts"} matching{" "}
                    <strong>"{submitted}"</strong>
                  </>
                ) : (
                  <>
                    No concepts match <strong>"{submitted}"</strong>. Try a
                    different term.
                  </>
                )}
              </Typography>
            </Box>
          )}

          {searchItems.length > 0 && (
            <Results>
              {/* Result Cards */}
              <ResultList ref={listRef}>
                {isLoadingPage ? (
                  <SkeletonRows count={5} height={96} label="Loading page" />
                ) : (
                  searchItems.map((c, i) => (
                    <ConceptCard
                      key={getSearchItemKey(c)}
                      concept={c}
                      isFirst={i === 0}
                      isLast={i === searchItems.length - 1}
                      actions={resultActions(c)}
                    />
                  ))
                )}
              </ResultList>

              {/* Pagination */}
              {pageCount > 1 && (
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, value) => handlePageChange(value)}
                  color="primary"
                />
              )}
            </Results>
          )}
        </>
      )}
    </Stack>
  );
}
