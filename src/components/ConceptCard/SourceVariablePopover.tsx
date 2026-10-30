import { useId } from "react";
import { Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  PopoverActions,
  PopoverBody,
  PopoverHeader,
  PopoverRoot,
  PopoverTitle,
  VariableChip,
} from "./SourceVariablePopover.styles";

// ----------------------------------------------------------------------

/* Prop Types */
export interface Props {
  id?: string;
  anchorEl: HTMLElement | null;
  name: string | null;
  onClose: () => void;
}

// ----------------------------------------------------------------------

export default function SourceVariablePopover({
  id,
  anchorEl,
  name,
  onClose,
}: Props) {
  const titleId = useId();
  const open = Boolean(anchorEl && name);

  return (
    <PopoverRoot
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: { role: "dialog", "aria-labelledby": titleId },
      }}
      disableScrollLock
    >
      <PopoverHeader>
        <PopoverTitle id={titleId} component="h3" variant="subtitle1">
          Source Variable Details
        </PopoverTitle>
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </PopoverHeader>

      {name && (
        <VariableChip
          label={name}
          size="small"
          variant="outlined"
          color="primary"
        />
      )}

      <PopoverBody variant="body2">
        Selecting a mapped variable will display additional information sourced
        from the BDC Variable library providing more details and describing the
        provenance chain.
      </PopoverBody>

      <PopoverActions>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </PopoverActions>
    </PopoverRoot>
  );
}
