try:
    import pytest
except ImportError:
    pytest = None

import io
import csv
from app.schemas.question import QuestionCreate, QuestionOptionCreate



def test_question_create_schema():
    opt_a = QuestionOptionCreate(option_text="docker ps", is_correct=True, order=0)
    opt_b = QuestionOptionCreate(option_text="docker run", is_correct=False, order=1)
    q = QuestionCreate(
        session_id=1,
        question_text="Perintah container aktif?",
        points=10,
        order=1,
        options=[opt_a, opt_b]
    )
    assert q.points == 10
    assert len(q.options) == 2
    assert q.options[0].is_correct is True


def test_csv_parser_logic():
    sample_csv = (
        'question_text,points,option_a,option_b,option_c,option_d,correct_option,explanation\n'
        '"Perintah docker?",10,"docker ps","docker run","docker logs","docker stop","A","Penjelasan"\n'
        '"Port HTTPS?",15,"80","443","22","8080","B","Penjelasan"\n'
    )
    reader = csv.reader(io.StringIO(sample_csv))
    rows = list(reader)
    assert len(rows) == 3
    header = rows[0]
    assert header[0] == "question_text"
    assert rows[1][0] == "Perintah docker?"
    assert rows[1][6] == "A"
    assert rows[2][6] == "B"
