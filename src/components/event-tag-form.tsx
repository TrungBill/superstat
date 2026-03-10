"use client";

import { FormEvent, useMemo, useState } from "react";

import { EVENT_TYPES } from "@/lib/constants";
import { Player, TaggedEvent } from "@/lib/types";
import { formatSeconds } from "@/lib/utils";

type EventTagFormProps = {
  videoId: string;
  currentTime: number;
  players: Player[];
  onEventsUpdated: (events: TaggedEvent[]) => void;
};

export function EventTagForm({
  videoId,
  currentTime,
  players,
  onEventsUpdated,
}: EventTagFormProps) {
  const [eventType, setEventType] = useState<(typeof EVENT_TYPES)[number]>(
    EVENT_TYPES[0]
  );
  const [notes, setNotes] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roundedTime = useMemo(() => Math.floor(currentTime), [currentTime]);

  function togglePlayer(playerId: string) {
    setSelectedPlayers((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/videos/${videoId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp_seconds: roundedTime,
          event_type: eventType,
          notes,
          player_ids: selectedPlayers,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to tag event.");
      }

      onEventsUpdated(payload.events);
      setNotes("");
      setSelectedPlayers([]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to tag event."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h2>Tag event</h2>
      <p className="muted">Current timestamp: {formatSeconds(roundedTime)}</p>
      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Event type
          <select
            value={eventType}
            onChange={(event) =>
              setEventType(event.target.value as (typeof EVENT_TYPES)[number])
            }
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional context about this event"
          />
        </label>

        <div>
          <p className="label">Players involved</p>
          {players.length === 0 ? (
            <p className="muted">
              No players yet. Add players in the panel on the right, then select them here.
            </p>
          ) : (
            <div className="checkbox-grid">
              {players.map((player) => (
                <label key={player.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => togglePlayer(player.id)}
                  />
                  <span>
                    {player.name}
                    {player.jersey_number !== null
                      ? ` (#${player.jersey_number})`
                      : ""}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Save event"}
        </button>
      </form>
      {errorMessage ? <p className="error">{errorMessage}</p> : null}
    </section>
  );
}
