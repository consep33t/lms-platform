from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.ai import (
    AITutorQueryRequest, AITutorResponse,
    QuizExplanationRequest, QuizExplanationResponse,
    AdaptiveQuizNextRequest, AdaptiveQuizNextResponse
)
from app.services import ai_tutor_service, adaptive_quiz_service

router = APIRouter()

@router.post("/tutor", response_model=AITutorResponse)
def ask_tutor(request: AITutorQueryRequest, db: Session = Depends(get_db)):
    return ai_tutor_service.ask_tutor(db, request.session_id, request.prompt, request.history)

@router.post("/quiz-explanation", response_model=QuizExplanationResponse)
def generate_quiz_explanation(request: QuizExplanationRequest, db: Session = Depends(get_db)):
    return ai_tutor_service.generate_quiz_explanation(db, request.question_id, request.selected_option_id)

@router.post("/adaptive-quiz/next", response_model=AdaptiveQuizNextResponse)
def get_next_adaptive_question(request: AdaptiveQuizNextRequest, db: Session = Depends(get_db)):
    return adaptive_quiz_service.get_next_adaptive_question(db, request.session_id, request.current_score_percent)
