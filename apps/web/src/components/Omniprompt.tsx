import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Status } from "@/components/FormPrimitives";
import {
  CompareIcon,
  PrepareIcon,
  SearchIcon,
} from "@/components/Icons";
import { suggestIntent } from "@/lib/intent";
import type { IntentMode } from "@/types";

interface ModeOption {
  id: IntentMode;
  label: string;
  description: string;
  icon: ReactNode;
}

const modeOptions: ModeOption[] = [
  {
    id: "search",
    label: "Search the web",
    description: "Open normal web results without cross-site action.",
    icon: <SearchIcon />,
  },
  {
    id: "compare",
    label: "Compare options",
    description: "Review active provider evidence and explain the trade-offs.",
    icon: <CompareIcon />,
  },
  {
    id: "prepare",
    label: "Prepare this task",
    description: "Find an eligible provider result, then review the handoff before confirming.",
    icon: <PrepareIcon />,
  },
];

interface OmnipromptProps {
  initialValue?: string;
  compact?: boolean;
}

export function Omniprompt({ initialValue = "", compact = false }: OmnipromptProps) {
  const navigate = useNavigate();
  const listboxId = useId();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedMode = modeOptions[selectedIndex] ?? modeOptions[0]!;
  const suggestion = useMemo(() => suggestIntent(value), [value]);
  const suggestedOption = suggestion
    ? modeOptions.find((option) => option.id === suggestion.mode)
    : undefined;

  function selectMode(mode: IntentMode) {
    const index = modeOptions.findIndex((option) => option.id === mode);
    if (index >= 0) setSelectedIndex(index);
  }

  function submit(mode: IntentMode = selectedMode.id) {
    const query = value.trim();
    if (!query) return;

    if (mode === "search") {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      return;
    }

    navigate(`/${mode === "prepare" ? "compare?mode=prepare" : "compare?mode=compare"}&q=${encodeURIComponent(query)}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "ArrowDown" && open) {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % modeOptions.length);
      return;
    }

    if (event.key === "ArrowUp" && open) {
      event.preventDefault();
      setSelectedIndex((current) => (current - 1 + modeOptions.length) % modeOptions.length);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div
      className={`omniprompt ${compact ? "omniprompt--compact" : ""}`.trim()}
      data-mode={selectedMode.id}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div className="omniprompt__main">
        <div className="omniprompt__mode" aria-hidden="true">
          {selectedMode.icon}
          <span>{selectedMode.label.replace(" the web", "").replace(" options", "")}</span>
        </div>
        <textarea
          className="omniprompt__input"
          value={value}
          rows={compact ? 1 : 2}
          placeholder="Search, compare, or prepare something to get done…"
          aria-label="Search, compare, or prepare a task"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open ? `${listboxId}-${selectedMode.id}` : undefined}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="omniprompt__tools">
          <button
            type="button"
            className="omniprompt__submit"
            onClick={() => submit()}
            disabled={!value.trim()}
            aria-label={`Continue with ${selectedMode.label}`}
          >
            <PrepareIcon />
          </button>
        </div>
      </div>

      <div className="omniprompt__status" aria-live="polite">
        <span>{selectedMode.description}</span>
        <span className="omniprompt__hint">Enter to continue · Shift+Enter for a new line</span>
      </div>
      <div className="omniprompt__line" aria-hidden="true" />

      {open && suggestion && suggestedOption && suggestion.mode !== selectedMode.id && (
        <Status tone="info" className="intent-suggestion">
          <span><strong>Suggested: {suggestedOption.label}.</strong> {suggestion.reason}</span>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectMode(suggestion.mode)}>
            Use {suggestion.mode === "compare" ? "Compare" : "Prepare"}
          </button>
        </Status>
      )}

      {open && (
        <div id={listboxId} className="intent-menu" role="listbox" aria-label="Choose how to continue">
          {modeOptions.map((option, index) => (
            <button
              key={option.id}
              id={`${listboxId}-${option.id}`}
              type="button"
              role="option"
              aria-selected={selectedIndex === index}
              className="intent-menu__option"
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                setSelectedIndex(index);
                submit(option.id);
              }}
            >
              <span className="intent-menu__icon" aria-hidden="true">{option.icon}</span>
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
