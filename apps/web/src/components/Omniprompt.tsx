import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { IconButton } from "@/components/Button";
import {
  AttachmentIcon,
  CompareIcon,
  MicrophoneIcon,
  PrepareIcon,
  SearchIcon,
} from "@/components/Icons";
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
    description: "Open normal web results.",
    icon: <SearchIcon />,
  },
  {
    id: "compare",
    label: "Compare options",
    description: "Review sources and explain the trade-offs.",
    icon: <CompareIcon />,
  },
  {
    id: "prepare",
    label: "Prepare this task",
    description: "Prepare the steps, then ask before anything important.",
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

  function submit(mode: IntentMode = selectedMode.id) {
    const query = value.trim();
    if (!query) return;

    if (mode === "prepare") {
      navigate(`/confirm?from=home&q=${encodeURIComponent(query)}`);
      return;
    }

    navigate(`/compare?mode=${mode}&q=${encodeURIComponent(query)}`);
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
          <IconButton label="Attach a file"><AttachmentIcon /></IconButton>
          <IconButton label="Use voice input"><MicrophoneIcon /></IconButton>
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
