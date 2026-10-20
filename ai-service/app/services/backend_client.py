import httpx
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8081")


def appeler_backend(
    endpoint: str,
    token: str,
    params: dict = None,
    method: str = "GET",
    body: dict = None,
) -> dict:
    """Appel générique vers Spring Boot avec le token JWT de l'utilisateur."""
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{BACKEND_URL}{endpoint}"
    try:
        if method == "GET":
            res = httpx.get(url, headers=headers, params=params or {}, timeout=10)
        elif method == "POST":
            res = httpx.post(url, headers=headers, json=body or {}, timeout=10)
        elif method == "PUT":
            res = httpx.put(url, headers=headers, json=body or {}, timeout=10)
        elif method == "PATCH":
            res = httpx.patch(url, headers=headers, json=body or {}, timeout=10)
        elif method == "DELETE":
            res = httpx.delete(url, headers=headers, timeout=10)
        else:
            return {"error": f"Méthode HTTP non supportée: {method}"}
        res.raise_for_status()
        return res.json() if res.content else {}
    except Exception as e:
        return {"error": str(e)}
