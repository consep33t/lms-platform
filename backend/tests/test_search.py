try:
    import pytest
except ImportError:
    pytest = None

from app.schemas.search import SearchResultItem, GlobalSearchResponse



def test_search_schemas():
    item1 = SearchResultItem(
        id=1,
        type="module",
        title="Jaringan Komputer Dasar",
        description="Pengenalan TCP/IP dan OSI Layer",
        url="/modules/1",
        badge="Modul Kursus"
    )
    item2 = SearchResultItem(
        id=5,
        type="session",
        title="Konfigurasi VLAN",
        description="Simulasi switch port access",
        url="/sessions/5",
        badge="Sesi Pembelajaran #2"
    )
    response = GlobalSearchResponse(
        query="Jaringan",
        total_results=2,
        results=[item1, item2]
    )
    assert response.query == "Jaringan"
    assert response.total_results == 2
    assert response.results[0].type == "module"
    assert response.results[1].type == "session"
