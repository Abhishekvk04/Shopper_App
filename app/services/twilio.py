from twilio.rest import Client
from app.core.config import settings

def send_whatsapp_message(to_number: str, body_text: str):
    """
    Sends a WhatsApp message using Twilio.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print(f"Mock Send to {to_number}: {body_text}")
        return

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    # Twilio whatsapp numbers are formatted as 'whatsapp:+1234567890'
    from_number = f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}" if not settings.TWILIO_WHATSAPP_NUMBER.startswith("whatsapp:") else settings.TWILIO_WHATSAPP_NUMBER
    to_number = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number

    try:
        message = client.messages.create(
            from_=from_number,
            body=body_text,
            to=to_number
        )
        return message.sid
    except Exception as e:
        print(f"Error sending message: {e}")
        return None
