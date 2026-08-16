from app.services.adaptive_quiz_service import get_next_adaptive_question

def test_get_next_adaptive_question_hard():
    # >= 80% should be hard
    result = get_next_adaptive_question(None, 1, 80.0)
    assert result["difficulty"] == "hard"
    assert result["question_id"] == 3

    result = get_next_adaptive_question(None, 1, 95.5)
    assert result["difficulty"] == "hard"
    assert result["question_id"] == 3

def test_get_next_adaptive_question_medium():
    # 50 - 79% should be medium
    result = get_next_adaptive_question(None, 1, 79.9)
    assert result["difficulty"] == "medium"
    assert result["question_id"] == 2
    
    result = get_next_adaptive_question(None, 1, 50.0)
    assert result["difficulty"] == "medium"
    assert result["question_id"] == 2

def test_get_next_adaptive_question_easy():
    # < 50% should be easy
    result = get_next_adaptive_question(None, 1, 49.9)
    assert result["difficulty"] == "easy"
    assert result["question_id"] == 1

    result = get_next_adaptive_question(None, 1, 0.0)
    assert result["difficulty"] == "easy"
    assert result["question_id"] == 1
