import requests
from app.config import settings

def get_line_profile(user_id: str, group_id: str = None) -> str:
    """
    ดึงชื่อโปรไฟล์ของลูกค้า ถ้าอยู่ใน Group จะดึงผ่าน Group Member Profile API
    """
    headers = {"Authorization": f"Bearer {settings.LINE_CHANNEL_ACCESS_TOKEN}"}
    
    if group_id:
        url = f"https://api.line.me/v2/bot/group/{group_id}/member/{user_id}"
    else:
        url = f"https://api.line.me/v2/bot/profile/{user_id}"
        
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json().get("displayName", "LINE User")
    except Exception as e:
        print(f"Error fetching LINE profile: {e}")
    return "LINE User"

def send_line_message(target_id: str, text: str, is_group: bool = False):
    """
    ส่งข้อความกลับไปหาลูกค้า (Push Message) รองรับทั้ง User ID และ Group ID
    """
    url = "https://api.line.me/v2/bot/message/push"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.LINE_CHANNEL_ACCESS_TOKEN}"
    }
    payload = {
        "to": target_id,
        "messages": [{"type": "text", "text": text}]
    }
    try:
        res = requests.post(url, json=payload, headers=headers)
        return res.status_code == 200
    except Exception as e:
        print(f"Error sending LINE message: {e}")
        return False