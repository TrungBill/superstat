import { TaggedEvent } from "@/lib/types";
import { formatSeconds } from "@/lib/utils";

type EventListProps = {
  events: TaggedEvent[];
};

export function EventList({ events }: EventListProps) {
  return (
    <section className="card">
      <h2>Tagged events</h2>
      {events.length === 0 ? (
        <p className="muted">No events tagged yet.</p>
      ) : (
        <ul className="event-list">
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <div className="event-top-row">
                <strong>{event.event_type}</strong>
                <span>{formatSeconds(event.timestamp_seconds)}</span>
              </div>
              {event.players.length > 0 ? (
                <p className="muted">
                  Players:{" "}
                  {event.players
                    .map((player) =>
                      player.jersey_number !== null
                        ? `${player.name} (#${player.jersey_number})`
                        : player.name
                    )
                    .join(", ")}
                </p>
              ) : null}
              {event.notes ? <p>{event.notes}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
