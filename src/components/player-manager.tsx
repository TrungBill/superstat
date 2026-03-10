"use client";

import { FormEvent, useState } from "react";

import { Player } from "@/lib/types";

type PlayerManagerProps = {
  players: Player[];
  onPlayersUpdated: (players: Player[]) => void;
};

export function PlayerManager({ players, onPlayersUpdated }: PlayerManagerProps) {
  const [name, setName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const numericJersey = jerseyNumber.trim() ? Number(jerseyNumber) : null;
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          jersey_number: Number.isFinite(numericJersey) ? numericJersey : null,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create player.");
      }

      onPlayersUpdated(payload.players);
      setName("");
      setJerseyNumber("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create player."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h2>Players</h2>
      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Player name"
        />
        <input
          value={jerseyNumber}
          onChange={(event) => setJerseyNumber(event.target.value)}
          placeholder="Jersey #"
          inputMode="numeric"
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Add player"}
        </button>
      </form>
      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      <ul className="list">
        {players.map((player) => (
          <li key={player.id}>
            {player.name}
            {player.jersey_number !== null ? ` (#${player.jersey_number})` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
