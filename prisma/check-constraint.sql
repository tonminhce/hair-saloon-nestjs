ALTER TABLE "Survey" ADD CONSTRAINT "check_start_date_before_end_date" CHECK ("start_date" < "end_date");
-- @@@
ALTER TABLE "Survey" ADD CONSTRAINT "check_default_survey_no_store_id" CHECK (NOT (id = 1
    AND (store_id IS NOT NULL
        OR start_date IS NOT NULL
        OR end_date IS NOT NULL)));
-- @@@
CREATE OR REPLACE FUNCTION check_working_stylist()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stylist_id IS NOT NULL AND NEW.stylist_id IS DISTINCT FROM OLD.stylist_id THEN
        IF NOT EXISTS(
            SELECT 1 FROM "StylistStore" a WHERE a.working_store_id = NEW.store_id
                                             AND a.stylist_id = NEW.stylist_id
        ) THEN
            RAISE EXCEPTION 'Stylist is not working at the given store_id';
        END IF;
    END IF;
    RETURN NEW;
END;
    $$ LANGUAGE plpgsql;
-- @@@
CREATE TRIGGER "ticket_stylist_working"
    BEFORE
        UPDATE OF "stylist_id" ON "Ticket"
    FOR EACH ROW EXECUTE FUNCTION check_working_stylist();
-- @@@
CREATE OR REPLACE FUNCTION check_tokens_exist()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'access_token' THEN
        IF NOT EXISTS (SELECT 1 FROM "Token" WHERE type = 'refresh_token') THEN
            RAISE EXCEPTION 'Missing corresponding refresh_token for access_token';
        END IF;
    ELSIF NEW.type = 'refresh_token' THEN
        IF NOT EXISTS (SELECT 1 FROM "Token" WHERE type = 'access_token') THEN
            RAISE EXCEPTION 'Missing corresponding access_token for refresh_token';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- @@@
CREATE TRIGGER token_check_trigger
    BEFORE INSERT OR UPDATE ON "Token"
    FOR EACH STATEMENT
EXECUTE FUNCTION check_tokens_exist();
-- @@@
CREATE OR REPLACE FUNCTION check_token_row_count()
    RETURNS TRIGGER AS $$
BEGIN
    -- Check if row count is either 0 or 2
    IF (SELECT COUNT(*) FROM "Token") != 0 AND (SELECT COUNT(*) FROM "Token") != 2 THEN
        RAISE EXCEPTION 'Token table must have 0 or 2 rows';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- @@@
CREATE TRIGGER token_row_count_trigger
    AFTER INSERT OR DELETE ON "Token"
    FOR EACH STATEMENT
EXECUTE FUNCTION check_token_row_count();


