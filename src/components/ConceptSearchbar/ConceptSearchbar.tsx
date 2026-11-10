import { useId, useMemo, useState } from "react";
import { Link, Stack, Typography } from "@mui/material";
import Searchbar from "../Searchbar";
import Notification from "../Notification/Notification";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConceptSuggestions } from "../../hooks/useConceptSuggestions";
import { uniqueLabels } from "../../utils/uniqueLabels";
import { SearchButton, SearchRow } from "./ConceptSearchbar.styles";

// ----------------------------------------------------------------------

const SUGGESTION_LIMIT = 10; // how many names the dropdown shows
const SUGGESTION_DELAY_MS = 300;
const EXAMPLE_SEARCHES = ["type 2 diabetes", "heart failure"];

interface Props {
  /** Show example searches under the searchbar. */
  showExamples?: boolean;
  /** The query currently being searched.*/
  query?: string;
  /** Called with the submitted text, or a selected suggestion. */
  onSearch: (text: string) => void;
  placeholder?: string;
}

/**
 * Search input with autocomplete and a Search button. It owns only what the
 * user is typing. What to do with a submitted query is up to the parent.
 */
export default function ConceptSearchbar({
  showExamples = false,
  query = "",
  onSearch,
  placeholder = "Search concepts…",
}: Props) {
  // Unique per instance, so it can't collide with ids in the app
  const searchId = useId();
  const [value, setValue] = useState(query);
  // Text the user typed. Kept apart from `value` so that filling the input
  // with a selected option's label doesn't fetch suggestions for that label.
  const [typed, setTyped] = useState("");

  // Follow outside changes to `query` (adjusting state during render,
  // rather than in an effect, avoids a render with the stale value)
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setValue(query);
  }

  // Stays closed until suggestions fail again with a new error
  const [dismissedSuggestionError, setDismissedSuggestionError] =
    useState<Error | null>(null);

  const suggestionText = useDebouncedValue(typed, SUGGESTION_DELAY_MS);
  const {
    data: suggestionData,
    isFetching: isFetchingSuggestions,
    isError: isSuggestionError,
    error: suggestionError,
  } = useConceptSuggestions(suggestionText);

  // The hook is disabled for empty text; ignore any data kept from the
  // previous query so the dropdown clears with the input
  const hasSuggestionQuery = suggestionText.trim() !== "";
  const suggestionItems = hasSuggestionQuery
    ? suggestionData?.items
    : undefined;
  // de-duplicate and use the first distinct terms
  const suggestedNames = useMemo(
    () =>
      uniqueLabels(
        (suggestionItems ?? []).map((term) => term.label),
        SUGGESTION_LIMIT,
      ),
    [suggestionItems],
  );

  const handleChange = (text: string, reason: string) => {
    setValue(text);
    if (reason === "input") setTyped(text);
  };

  return (
    <Stack spacing={1}>
      {/* Autocomplete error: search still works, so this is a warning */}
      <Notification
        open={isSuggestionError && suggestionError !== dismissedSuggestionError}
        onClose={() => setDismissedSuggestionError(suggestionError)}
        severity="warning"
        message="Suggestions are unavailable right now. You can still search."
      />

      <SearchRow>
        <Searchbar
          id={searchId}
          name="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onSearch={onSearch}
          onSelect={onSearch}
          options={suggestedNames}
          loading={hasSuggestionQuery && isFetchingSuggestions}
        />
        <SearchButton type="submit" form={searchId} variant="contained">
          Search
        </SearchButton>
      </SearchRow>

      {showExamples && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="baseline"
        >
          <Typography variant="body2" color="text.secondary">
            Search for a concept above, or try:
          </Typography>
          {EXAMPLE_SEARCHES.map((term) => (
            <Link
              key={term}
              component="button"
              variant="body2"
              underline="none"
              onClick={() => onSearch(term)}
            >
              {term}
            </Link>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
