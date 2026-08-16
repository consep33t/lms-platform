from sqlalchemy.orm import Session

def get_next_adaptive_question(db: Session, session_id: int, current_score_percent: float):
    # Dummy implementation for adaptive difficulty calculation
    if current_score_percent >= 80:
        difficulty = "hard"
        # query hard question
        question_id = 3
    elif current_score_percent >= 50:
        difficulty = "medium"
        # query medium question
        question_id = 2
    else:
        difficulty = "easy"
        # query easy question
        question_id = 1
        
    return {"question_id": question_id, "difficulty": difficulty}
