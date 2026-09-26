"""
Seed VoiceDesk knowledge base.

Before running:

PowerShell:
    $env:VOICE_DESK_TOKEN="YOUR_TOKEN"

Then:
    python seed_knowledge_base.py
"""

import os
import requests


BASE_URL = "http://127.0.0.1:8000"

TOKEN = os.getenv("VOICE_DESK_TOKEN")

if not TOKEN:
    raise SystemExit(
        "VOICE_DESK_TOKEN is not set.\n\n"
        "PowerShell example:\n"
        '$env:VOICE_DESK_TOKEN="YOUR_TOKEN"\n'
    )


HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}


DOCUMENTS = [
    {
        "filename": "return-policy.txt",
        "content": (
            "Our return policy allows returns within 30 days of purchase "
            "with original receipt. Items must be unused and in original "
            "packaging to qualify for a refund."
        ),
    },
    {
        "filename": "shipping-policy.txt",
        "content": (
            "We offer free standard shipping on orders over $50. "
            "Standard delivery takes 3-5 business days. Express shipping "
            "is available for an additional $15 and takes 1-2 business days. "
            "We currently ship within Pakistan only."
        ),
    },
    {
        "filename": "warranty-info.txt",
        "content": (
            "All products come with a 1-year manufacturer warranty covering "
            "defects in materials and workmanship. Warranty does not cover "
            "accidental damage, water damage, or unauthorized repairs. "
            "To claim warranty, contact support with your order number "
            "and proof of purchase."
        ),
    },
    {
        "filename": "contact-info.txt",
        "content": (
            "You can reach our customer support team via email at "
            "support@acme.com, phone at +92-XXX-XXXXXXX "
            "(Mon-Fri, 9 AM to 6 PM), or live chat on our website. "
            "For urgent issues, please call our helpline."
        ),
    },
    {
        "filename": "payment-methods.txt",
        "content": (
            "We accept credit/debit cards (Visa, Mastercard), bank transfers, "
            "JazzCash, EasyPaisa, and cash on delivery (COD) for orders within "
            "Pakistan. All online payments are processed securely."
        ),
    },
    {
        "filename": "faq.txt",
        "content": (
            "We are serving customers since 2015, specializing in home "
            "appliances and consumer electronics. We have physical stores "
            "in Karachi, Lahore, and Islamabad, as well as an online store."
        ),
    },
]


def upload_document(doc: dict) -> bool:
    url = f"{BASE_URL}/documents/"

    response = requests.post(
        url,
        headers=HEADERS,
        json=doc,
        timeout=30,
    )

    if response.status_code in (200, 201):
        print(f"Uploaded: {doc['filename']}")
        return True

    print(
        f"FAILED: {doc['filename']} "
        f"[{response.status_code}] {response.text}"
    )
    return False


def main():
    print(
        f"Uploading {len(DOCUMENTS)} documents "
        f"to {BASE_URL}/documents/...\n"
    )

    successful = 0

    for doc in DOCUMENTS:
        if upload_document(doc):
            successful += 1

    print(
        f"\nDone: {successful}/{len(DOCUMENTS)} documents uploaded."
    )


if __name__ == "__main__":
    main()