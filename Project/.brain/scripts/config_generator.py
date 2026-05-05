import json
import os
from datetime import datetime

def generate_config(json_path, template_path, output_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    with open(template_path, 'r') as f:
        template = f.read()
    
    # Process dynamic data
    replacements = {
        "{{DISPLAY_NAME}}": data.get("display_name", ""),
        "{{GEN_DATE}}": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "{{GEN_YEAR}}": datetime.now().strftime("%Y"),
        "{{WEB_URL}}": data.get("web_url", ""),
        "{{DOMAIN}}": data.get("domain", ""),
        "{{DB_HOST}}": data.get("db_host", "localhost"),
        "{{DB_USER}}": data.get("db_user", "root"),
        "{{DB_PASS}}": data.get("db_pass", ""),
        "{{DB_NAME}}": data.get("db_name", ""),
        "{{CLIENT_ID}}": data.get("client_id", ""),
        "{{NAMESPACE}}": data.get("namespace", data.get("client_id", "").upper()),
        "{{RATE_FEED_TYPE}}": str(data.get("rate_feed_type", 4)),
        "{{ENC_KEY}}": data.get("enc_key", "12@^tyh8901tt56789012345$y89012"),
        "{{ONESIGNAL_APP_ID}}": data.get("onesignal_app_id", ""),
        "{{ONESIGNAL_AUTH}}": data.get("onesignal_auth", ""),
        "{{COUNTRY_CODE}}": data.get("country_code", "91"),
        "{{TIMEZONE}}": data.get("timezone", "Asia/Kolkata"),
        "{{CURRENCY_SYMBOL}}": data.get("currency_symbol", "₹"),
        "{{CURRENCY_NAME}}": data.get("currency_name", "INR")
    }
    
    for placeholder, value in replacements.items():
        template = template.replace(placeholder, str(value))
    
    with open(output_path, 'w') as f:
        f.write(template)
    
    print(f"✅ Config generated successfully: {output_path}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print("Usage: python config_generator.py <json_path> <template_path> <output_path>")
    else:
        generate_config(sys.argv[1], sys.argv[2], sys.argv[3])
