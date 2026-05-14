#!/usr/bin/env python3
import markdown
from weasyprint import HTML

# Read the markdown file
with open('AWS_EC2_Nginx_Deployment_Guide.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert markdown to HTML with extensions for better formatting
html_content = markdown.markdown(
    md_content,
    extensions=['extra', 'tables', 'codehilite', 'toc']
)

# Wrap in a full HTML document with styling
full_html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AWS EC2 Nginx Deployment Guide</title>
    <style>
        @page {{ margin: 1cm; size: A4; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1 {{
            color: #1a365d;
            border-bottom: 2px solid #2c5282;
            padding-bottom: 10px;
            font-size: 24pt;
            margin-top: 30px;
        }}
        h2 {{
            color: #2c5282;
            border-bottom: 1px solid #cbd5e0;
            padding-bottom: 5px;
            font-size: 18pt;
            margin-top: 25px;
        }}
        h3 {{ color: #2b6cb0; font-size: 14pt; margin-top: 20px; }}
        h4 {{ color: #3182ce; font-size: 12pt; margin-top: 15px; }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }}
        th, td {{
            border: 1px solid #cbd5e0;
            padding: 8px 12px;
            text-align: left;
        }}
        th {{
            background-color: #edf2f7;
            font-weight: bold;
        }}
        tr:nth-child(even) {{ background-color: #f7fafc; }}
        code {{
            background-color: #edf2f7;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 10pt;
        }}
        pre {{
            background-color: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: 'Courier New', Courier, monospace;
            font-size: 9pt;
            line-height: 1.4;
        }}
        pre code {{
            background-color: transparent;
            padding: 0;
            color: #e2e8f0;
        }}
        blockquote {{
            border-left: 4px solid #4299e1;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #ebf8ff;
            color: #2c5282;
        }}
        ul, ol {{
            margin: 10px 0;
            padding-left: 25px;
        }}
        li {{
            margin: 5px 0;
        }}
        hr {{
            border: none;
            border-top: 1px solid #cbd5e0;
            margin: 20px 0;
        }}
        .tip {{
            background-color: #c6f6d5;
            border-left: 4px solid #48bb78;
            padding: 10px 15px;
            margin: 10px 0;
        }}
        .warning {{
            background-color: #feebc8;
            border-left: 4px solid #ed8936;
            padding: 10px 15px;
            margin: 10px 0;
        }}
        .note {{
            background-color: #bee3f8;
            border-left: 4px solid #4299e1;
            padding: 10px 15px;
            margin: 10px 0;
        }}
        a {{ color: #3182ce; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
{html_content}
</body>
</html>'''

# Convert to PDF
HTML(string=full_html).write_pdf('AWS_EC2_Nginx_Deployment_Guide.pdf')
print("PDF created successfully: AWS_EC2_Nginx_Deployment_Guide.pdf")