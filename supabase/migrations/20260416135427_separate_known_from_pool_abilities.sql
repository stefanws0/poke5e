-- ABILITIES ON POKEMON
CREATE OR REPLACE FUNCTION add_ability(
	_write_key VARCHAR(32),
	_pokemon_id INT,
	_ability_id VARCHAR(255),
	_custom_name VARCHAR(255),
	_description TEXT,
	_rank INT
) RETURNS BIGINT AS $$
DECLARE
	ret_id BIGINT;
BEGIN
	IF EXISTS (
		SELECT FROM private.pokemon p
			INNER JOIN private.trainers t
			ON p.trainer_id = t.id
			WHERE p.id = _pokemon_id AND t.write_key = _write_key
	) THEN
		INSERT INTO private.abilities (
			pokemon_id,
			ability_id,
			custom_name,
			description,
			rank
		) VALUES (
			_pokemon_id,
			_ability_id,
			_custom_name,
			_description,
			_rank
		) RETURNING id INTO ret_id;
	END IF;

	RETURN ret_id;
END $$ LANGUAGE PLPGSQL VOLATILE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_ability(
	_write_key VARCHAR(32),
	_id BIGINT,
	_ability_id VARCHAR(255),
	_custom_name VARCHAR(255),
	_description TEXT,
	_rank INT
) RETURNS INT AS $$
DECLARE affected_rows INT;
BEGIN
	UPDATE private.abilities a SET
		ability_id = _ability_id,
		custom_name = _custom_name,
		description = _description,
		rank = _rank
	FROM private.pokemon p
	INNER JOIN private.trainers t ON t.id = p.trainer_id
	WHERE
		a.id = _id
		AND a.pokemon_id = p.id
		AND t.write_key = _write_key;

	GET DIAGNOSTICS affected_rows := ROW_COUNT;

	RETURN affected_rows;
END $$ LANGUAGE PLPGSQL VOLATILE SECURITY DEFINER;


CREATE OR REPLACE FUNCTION remove_ability(
	_write_key VARCHAR(32),
	_id BIGINT
) RETURNS INT AS $$
DECLARE affected_rows INT;
BEGIN
	DELETE FROM private.abilities a
	USING private.pokemon p
	INNER JOIN private.trainers t ON t.id = p.trainer_id
	WHERE
		a.id = _id
		AND a.pokemon_id = p.id
		AND t.write_key = _write_key;

	GET DIAGNOSTICS affected_rows := ROW_COUNT;

	RETURN affected_rows;
END $$ LANGUAGE PLPGSQL VOLATILE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_abilities(
	_pokemon_id INT
) RETURNS SETOF private.abilities AS $$
BEGIN
	RETURN QUERY SELECT * FROM private.abilities a WHERE a.pokemon_id = _pokemon_id ORDER BY a.rank;
END $$ LANGUAGE PLPGSQL STABLE SECURITY DEFINER;
