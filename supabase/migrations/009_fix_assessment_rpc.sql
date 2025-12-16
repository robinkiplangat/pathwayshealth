-- ============================================================================
-- Migration 009: Fix Assessment RPC Answer Mapping
-- Created: 2025-12-09
-- Description: Updates the create_assessment_with_responses RPC function to
--              handle numeric-to-enum mapping for answers and populate answer_numeric
-- ============================================================================

CREATE OR REPLACE FUNCTION create_assessment_with_responses(
    p_facility_id UUID,
    p_facility_name TEXT,
    p_location TEXT,
    p_responses JSONB
)
RETURNS JSON AS $$
DECLARE
    v_assessment_id UUID;
    v_response JSONB;
    v_question_id UUID;
    v_answer_text TEXT;
    v_answer_enum vulnerability_answer_enum;
    v_answer_numeric INTEGER;
BEGIN
    -- Validate inputs
    IF p_facility_id IS NULL THEN
        RAISE EXCEPTION 'Facility ID is required';
    END IF;

    -- Create the assessment
    INSERT INTO assessments (
        facility_id,
        status,
        assessment_date,
        is_anonymous
    )
    VALUES (
        p_facility_id,
        'completed',
        CURRENT_DATE,
        p_facility_id IS NULL
    )
    RETURNING id INTO v_assessment_id;

    -- Insert responses
    FOR v_response IN SELECT * FROM jsonb_array_elements(p_responses)
    LOOP
        v_question_id := (v_response->>'questionId')::UUID;
        v_answer_text := v_response->>'answer';
        
        -- Map numeric string to enum and integer
        IF v_answer_text = '1' THEN
            v_answer_enum := 'low';
            v_answer_numeric := 1;
        ELSIF v_answer_text = '2' THEN
            v_answer_enum := 'medium';
            v_answer_numeric := 2;
        ELSIF v_answer_text = '3' THEN
            v_answer_enum := 'high';
            v_answer_numeric := 3;
        ELSE
            -- Reject invalid answers
            RAISE EXCEPTION 'Invalid answer value: %. Expected "1", "2", or "3"', v_answer_text;
        END IF;

        INSERT INTO assessment_responses (
            assessment_id,
            question_id,
            answer,
            answer_numeric
        )
        VALUES (
            v_assessment_id,
            v_question_id,
            v_answer_enum,
            v_answer_numeric
        );
    END LOOP;

    -- Return the assessment ID
    RETURN json_build_object('id', v_assessment_id);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_assessment_with_responses(UUID, TEXT, TEXT, JSONB) TO anon, authenticated;

COMMENT ON FUNCTION create_assessment_with_responses IS 'Creates an assessment with responses, mapping numeric inputs to enums';
