import pytest
from pydantic import ValidationError
from app.schemas.ai import AITutorQueryRequest, QuizExplanationRequest

def test_ai_tutor_query_request_valid():
    req = AITutorQueryRequest(session_id=1, prompt="Explain gravity")
    assert req.session_id == 1
    assert req.prompt == "Explain gravity"
    assert req.history is None

    req_with_history = AITutorQueryRequest(
        session_id=1, 
        prompt="Tell me more", 
        history=[{"role": "user", "content": "Explain gravity"}]
    )
    assert req_with_history.history == [{"role": "user", "content": "Explain gravity"}]

def test_ai_tutor_query_request_invalid():
    with pytest.raises(ValidationError):
        AITutorQueryRequest(session_id="not_an_int", prompt="Explain gravity")
        
    with pytest.raises(ValidationError):
        AITutorQueryRequest(session_id=1) # Missing prompt

def test_quiz_explanation_request_valid():
    req = QuizExplanationRequest(question_id=10, selected_option_id=2)
    assert req.question_id == 10
    assert req.selected_option_id == 2

    req2 = QuizExplanationRequest(question_id=11)
    assert req2.question_id == 11
    assert req2.selected_option_id is None

def test_quiz_explanation_request_invalid():
    with pytest.raises(ValidationError):
        QuizExplanationRequest() # Missing question_id
