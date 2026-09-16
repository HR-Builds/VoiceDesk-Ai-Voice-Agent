"""
Bulk upload documents to the VoiceDesk knowledge base.

Usage:
    1. Update TOKEN below with your access_token from /auth/login
    2. Update BASE_URL if your server runs on a different host/port
    3. Add/edit documents in the DOCUMENTS list
    4. Run: python seed_knowledge_base.py
"""

import requests

BASE_URL = "http://127.0.0.1:8000"

# Paste your access_token here (WITHOUT "Bearer " prefix)
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZWE1MWUxMy04MjIxLTQ3NTQtOTYyZS1jMGFhYjI3YWRjZmMiLCJleHAiOjE3ODkxMzI4MTN9.7Q-phsVu2_C0H1PXYrCtxL3lply56Y9cowpYhpodkfE"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

# Add as many documents as you want here
DOCUMENTS = [
    {
        "filename": "return-policy.txt",
        "content": "Our return policy allows returns within 30 days of purchase with original receipt. Items must be unused and in original packaging to qualify for a refund.",
    },
    {
        "filename": "shipping-policy.txt",
        "content": "We offer free standard shipping on orders over $50. Standard delivery takes 3-5 business days. Express shipping is available for an additional $15 and takes 1-2 business days. We currently ship within Pakistan only.",
    },
    {
        "filename": "warranty-info.txt",
        "content": "All  products come with a 1-year manufacturer warranty covering defects in materials and workmanship. Warranty does not cover accidental damage, water damage, or unauthorized repairs. To claim warranty, contact support with your order number and proof of purchase.",
    },
    {
        "filename": "contact-info.txt",
        "content": "You can reach our customer support team via email at support@acme.com, phone at +92-XXX-XXXXXXX (Mon-Fri, 9 AM to 6 PM), or live chat on our website. For urgent issues, please call our helpline.",
    },
    {
        "filename": "payment-methods.txt",
        "content": "We accept credit/debit cards (Visa, Mastercard), bank transfers, JazzCash, EasyPaisa, and cash on delivery (COD) for orders within Pakistan. All online payments are processed securely.",
    },
    {
        "filename": "faq.txt",
        "content": "we are serving customers since 2015, specializing in home appliances and consumer electronics. We have physical stores in Karachi, Lahore, and Islamabad, as well as an online store.",
    },
]


def upload_document(doc: dict) -> None:
    url = f"{BASE_URL}/documents/"
    response = requests.post(url, headers=HEADERS, json=doc)

    if response.status_code in (200, 201):
        print(f"✅ Uploaded: {doc['filename']}")
    else:
        print(f"❌ Failed: {doc['filename']} — Status {response.status_code}")
        print(f"   Response: {response.text}")


def main():
    if TOKEN == "PASTE_YOUR_TOKEN_HERE":
        print("⚠️  Please set your TOKEN at the top of this script before running.")
        return

    print(f"Uploading {len(DOCUMENTS)} documents to {BASE_URL}/documents/ ...\n")

    for doc in DOCUMENTS:
        upload_document(doc)

    print("\nDone. Check Qdrant dashboard to confirm points were added:")
    print("http://localhost:6333/dashboard")


if __name__ == "__main__":
    main()