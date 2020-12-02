BEGIN;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION date_in_time_zone(tz TEXT)
RETURNS DATE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE tz)::DATE;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION date_in_time_zone(u users)
RETURNS DATE AS $$
BEGIN
  RETURN date_in_time_zone(u.time_zone);
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION next_rehearsal(u users)
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN ((date_in_time_zone(u) + INTERVAL '1 DAY')::TIMESTAMP AT TIME ZONE u.time_zone) + u.rehearsal_time;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION schedule_user_rehearsal()
RETURNS TRIGGER AS $$
BEGIN
  IF ((NEW.scheduled AND NOT OLD.scheduled)
    OR (NEW.rehearsal_time != OLD.rehearsal_time)
    OR (NEW.time_zone != OLD.time_zone)) THEN
    NEW.rehearsal = next_rehearsal(NEW);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION scheduled_card_for_user(id INTEGER)
RETURNS SETOF cards AS $$
  SELECT
    c.*
  FROM cards c
  INNER JOIN decks d ON c.deck_id = d.id
  INNER JOIN users u ON d.user_id = u.id
  WHERE
   d.user_id=$1 AND
   d.scheduled AND
   c.next_repetition <= u.date_in_time_zone
  ORDER BY
   c.repetition_today ASC,
   c.next_repetition ASC,
   c.random_order ASC
  LIMIT 1;
$$ LANGUAGE SQL;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER schedule_user_rehearsal_on_enable BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE schedule_user_rehearsal();

END;
