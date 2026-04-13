import re
from io import BytesIO
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK

def txt_to_docx_bytes(text: str) -> bytes:
    doc = Document()
    
    # Set professional margins (0.75 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Define default style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    lines = [line.strip() for line in text.splitlines()]
    if not lines:
        return b""

    # 1. Candidate Name (First non-empty line)
    name_line = ""
    for i, line in enumerate(lines):
        if line:
            name_line = line
            lines = lines[i+1:]
            break
    
    if name_line:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(name_line)
        run.bold = True
        run.font.size = Pt(22)
        run.font.name = 'Calibri'

    # 2. Process remaining lines
    for line in lines:
        if not line:
            # Maintain some spacing but not too much
            doc.add_paragraph()
            continue

        # Detect Section Headers (All Caps, typically short)
        is_header = line.isupper() and len(line) < 40 and not any(c in line for c in ['|', '@', ':', '/'])
        
        if is_header:
            p = doc.add_paragraph()
            p.space_before = Pt(12)
            p.space_after = Pt(3)
            run = p.add_run(line)
            run.bold = True
            run.font.size = Pt(13)
            # Add a bottom border effectively by drawing a line? 
            # python-docx doesn't have a simple border-bottom, so we just use bold/size.
            continue

        # Detect Job Titles / Experience lines (Often contain | or Date ranges)
        is_exp_line = '|' in line or re.search(r'\b(19|20)\d{2}\b', line)
        
        if is_exp_line and not line.startswith(('-', '•')):
            p = doc.add_paragraph()
            run = p.add_run(line)
            run.bold = True
            continue

        # Detect Bullet points
        if line.startswith(('-', '•', '*')):
            p = doc.add_paragraph(style='List Bullet')
            # Clean up the bullet char
            clean_line = re.sub(r'^[-•*]\s*', '', line)
            p.add_run(clean_line)
        else:
            p = doc.add_paragraph(line)

    # Save to buffer
    out = BytesIO()
    doc.save(out)
    return out.getvalue()
