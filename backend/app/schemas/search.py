from pydantic import BaseModel


class SearchResultItem(BaseModel):
    id: int
    type: str  # "module" | "session"
    title: str
    description: str | None = None
    url: str
    badge: str | None = None


class GlobalSearchResponse(BaseModel):
    query: str
    total_results: int
    results: list[SearchResultItem]
