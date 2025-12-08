-- ============================================================================
-- Migration 008: Update Assessment RPC Function
-- Created: 2025-12-03
-- Description: Creates/updates the create_assessment_with_responses RPC function
--              to accept facility_id parameter and link assessments to facilities
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_assessment_with_responses(text, text, jsonb);

-- Create updated function with facility_id parameter
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
    v_answer TEXT;
BEGIN
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
        v_answer := v_response->>'answer';

        INSERT INTO assessment_responses (
            assessment_id,
            question_id,
            answer
        )
        VALUES (
            v_assessment_id,
            v_question_id,
            v_answer
        );
    END LOOP;

    -- Return the assessment ID
    RETURN json_build_object('id', v_assessment_id);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_assessment_with_responses(UUID, TEXT, TEXT, JSONB) TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION create_assessment_with_responses IS 'Creates an assessment with responses, optionally linked to a facility';
