import { Chip, Stack, Tooltip } from "@mui/material";
import parseCurie from "../../utils/parseCurie";
import { ReactNode, useId, useState } from "react";
import {
  CategoryRoot,
  DetailFieldRoot,
  DetailsRoot,
  DetailTerm,
  DetailValue,
  SourceChip,
} from "./ConceptCardDetails.styles";
import SourceVariablePopover from "./SourceVariablePopover";

// ----------------------------------------------------------------------

/* Prop Types */
interface Props {
  category?: string;
  description?: string | null;
  variableNames?: string[];
}

interface DetailFieldProps {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

const SOURCE_NAMES: Record<string, string> = {
  biolink: "Biolink Model",
};

// ----------------------------------------------------------------------

/** Must be rendered inside a <dl> (e.g. ConceptCardDetails). */
export function DetailField({ label, value, fullWidth }: DetailFieldProps) {
  return (
    <DetailFieldRoot fullWidth={fullWidth}>
      <DetailTerm component="dt" variant="overline" color="text.secondary">
        {label}
      </DetailTerm>
      <DetailValue>{value}</DetailValue>
    </DetailFieldRoot>
  );
}

export function CategoryValue({ value }: { value: string }) {
  const parsed = parseCurie(value);

  return (
    <CategoryRoot>
      <span>{parsed.label}</span>
      {parsed.source && (
        <Tooltip
          title={`${SOURCE_NAMES[parsed.source] ?? parsed.source} · ${parsed.raw}`}
        >
          <SourceChip label={parsed.source} size="small" variant="outlined" />
        </Tooltip>
      )}
    </CategoryRoot>
  );
}

export default function ConceptCardDetails({
  category,
  description,
  variableNames = [],
}: Props) {
  const popoverId = useId();
  const [selected, setSelected] = useState<{
    anchorEl: HTMLElement;
    name: string;
  } | null>(null);

  return (
    <>
      <DetailsRoot>
        {category && (
          <DetailField
            label="category"
            value={<CategoryValue value={category} />}
          />
        )}
        {variableNames.length > 0 && (
          <DetailField
            label="mapped / source variables"
            fullWidth
            value={
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {variableNames.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    variant="outlined"
                    onClick={(e) =>
                      setSelected({ anchorEl: e.currentTarget, name })
                    }
                    aria-haspopup="dialog"
                    aria-expanded={selected?.name === name}
                    aria-controls={
                      selected?.name === name ? popoverId : undefined
                    }
                  />
                ))}
              </Stack>
            }
          />
        )}
        {description && (
          <DetailField label="description" value={description} fullWidth />
        )}
      </DetailsRoot>
      <SourceVariablePopover
        id={popoverId}
        anchorEl={selected?.anchorEl ?? null}
        name={selected?.name ?? null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
