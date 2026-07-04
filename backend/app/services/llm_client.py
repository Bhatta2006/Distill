"""
Thin wrapper around the Anthropic client.
The API key is provided per-request from the user's browser (X-API-Key header).
"""
from __future__ import annotations
import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential


def get_client(api_key: str) -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=api_key)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def chat_completion(
    api_key: str,
    messages: list[dict],
    system: str = "",
    model: str = "claude-sonnet-4-6",
    max_tokens: int = 2048,
) -> str:
    client = get_client(api_key)
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=messages,
    )
    return response.content[0].text


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def structured_completion(
    api_key: str,
    messages: list[dict],
    system: str = "",
    model: str = "claude-haiku-4-5-20251001",
    max_tokens: int = 4096,
) -> str:
    """Use a cheaper/faster model for structured extraction tasks."""
    client = get_client(api_key)
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=messages,
    )
    return response.content[0].text
