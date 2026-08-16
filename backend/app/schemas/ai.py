from pydantic import BaseModel
from typing import List, Optional

class AITutorQueryRequest(BaseModel):
    session_id: int
    prompt: str
    history: Optional[List[dict]] = None

class AITutorResponse(BaseModel):
    response: str
    follow_up_suggestions: List[str]

class QuizExplanationRequest(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None

class QuizExplanationResponse(BaseModel):
    explanation: str

class AdaptiveQuizNextRequest(BaseModel):
    session_id: int
    current_score_percent: float

class AdaptiveQuizNextResponse(BaseModel):
    question_id: Optional[int] = None
    difficulty: str
