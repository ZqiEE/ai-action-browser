import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { CompareIcon, PrepareIcon, SearchIcon } from "@/components/Icons";
import type { IntentMode } from "@/types";

interface ModeOption {
  id: IntentMode;
  label: string;
  icon: JSX.Element;
}

const modeOptions: ModeOption[] = [
  { id: "search", label: "Search", icon: <SearchIcon /> },
  { id: "compare", label: "Compare", icon: <CompareIcon /> },
  { id: "prepare", label: "Prepare", icon: <PrepareIcon /> },
];

interface OmnipromptProps {
  initialValue?: string;
  compact?: boolean;
}

export function Omniprompt({ initialValue = "", compact = false }: OmnipromptProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const [mode, setMode] = useState<IntentMode>("search");

  function submit(nextMode: IntentMode = mode) {
    const query = value.trim();
    if (!query) return;

    if (nextMode === "search") {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      return;
    }

    navigate(`/${nextMode === "prepare" ? "compare?mode=prepare" : "compare?mode=compare"}&q=${encodeURIComponent(query)}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      className={`omniprompt ${compact ? "omniprompt--compact" : ""}`.trim()}
      data-mode={mode}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="omniprompt__main">
        <textarea
          className="omniprompt__input"
          value={value}
          rows={compact ? 1 : 2}
          placeholder="Search the web or describe a task"
          aria-label="Search, compare, or prepare a task"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="omniprompt__submit"
          disabled={!value.trim()}
          aria-label={`Continue with ${mode}`}
        >
          Continue
        </button>
      </div>

      <div className="omniprompt__controls" aria-label="Browser behavior">
        <div className="mode-switch" role="group" aria-label="Choose browser behavior">
          {modeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className="mode-switch__option"
              aria-pressed={mode === option.id}
              onClick={() => setMode(option.id)}
            >
              <span aria-hidden="true">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
        <span className="omniprompt__hint">
          {mode === "search" && "Normal web search"}
          {mode === "compare" && "Compare independent provider evidence"}
          {mode === "prepare" && "Prepare a supported task, then review before handoff"}
        </span>
      </div>
    </form>
  );
}
