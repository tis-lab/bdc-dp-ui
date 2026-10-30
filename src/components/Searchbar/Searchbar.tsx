import { FormEvent, useState } from "react";
import {
  Autocomplete,
  AutocompleteInputChangeReason,
  InputAdornment,
  TextField,
} from "@mui/material";
import { InputBaseComponentProps } from "@mui/material/InputBase";
import { Search } from "@mui/icons-material";
import { SearchbarRoot } from "./Searchbar.styles";

// ----------------------------------------------------------------------

/* Prop Types */
export interface Props {
  id: string;
  value: string;
  /**
   * Called whenever the input text changes. `reason` is "input" when the user
   * typed, and "selectOption" when the text was replaced by a selected option.
   */
  onChange: (value: string, reason: AutocompleteInputChangeReason) => void;
  /** Called when the form is submitted (Search button or Enter). */
  onSearch?: (value: string) => void;
  /** Called when the user picks a suggestion. */
  onSelect?: (option: string) => void;
  /** Suggestions to show in the dropdown. */
  options?: string[];
  /** True while suggestions are loading. */
  loading?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  name?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  /** Extra attributes passed to the underlying <input>. */
  inputProps?: InputBaseComponentProps;
}

// ----------------------------------------------------------------------

export default function Searchbar({
  id,
  value,
  onChange,
  onSearch,
  onSelect,
  options = [],
  loading = false,
  placeholder,
  ariaLabel = "Search",
  name,
  autoFocus = false,
  disabled = false,
  inputProps,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
    onSearch?.(value.trim());
  };

  return (
    <SearchbarRoot id={id} role="search" onSubmit={handleSubmit} noValidate>
      <Autocomplete<string, false, true, true>
        freeSolo
        disableClearable
        fullWidth
        disabled={disabled}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        loading={loading}
        loadingText="Searching…"
        // Show the exact result coming from server, do not filter again on the client side
        filterOptions={(x) => x}
        inputValue={value}
        onInputChange={(_event, text, reason) => onChange(text, reason)}
        onChange={(_event, selected, reason) => {
          // Typed text + Enter arrives here as "createOption"; the form's
          // submit handler deals with it, so only react to picked options.
          if (reason === "selectOption" && selected) {
            setOpen(false);
            onSelect?.(selected);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            type="search"
            size="small"
            name={name}
            placeholder={placeholder}
            autoFocus={autoFocus}
            inputProps={{
              ...params.inputProps,
              "aria-label": ariaLabel,
              ...inputProps,
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </SearchbarRoot>
  );
}
